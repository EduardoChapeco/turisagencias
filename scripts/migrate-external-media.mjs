import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const APPLY = process.argv.includes('--apply');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : 500;
const DEFAULT_BUCKET = 'media';

function loadEnvFile(fileName) {
  const filePath = path.join(root, fileName);
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const clean = line.trim();
    if (!clean || clean.startsWith('#') || !clean.includes('=')) continue;
    const [key, ...rawValue] = clean.split('=');
    if (process.env[key]) continue;
    process.env[key] = rawValue.join('=').replace(/^["']|["']$/g, '');
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL/VITE_SUPABASE_URL and a Supabase key.');
  process.exit(1);
}

if (APPLY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Refusing --apply without SUPABASE_SERVICE_ROLE_KEY. Dry-run can use the anon/publishable key.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const supabaseHost = new URL(supabaseUrl).host;
const allowedMime = /^(image\/|video\/|application\/pdf$)/i;
const stats = { scanned: 0, candidates: 0, migrated: 0, failed: 0, updatedRows: 0, skippedTables: 0 };

const targets = [
  {
    table: 'group_trips',
    bucket: 'group-trip-media',
    folder: 'migrated/group-trips',
    fields: ['cover_image_url'],
    arrays: ['gallery_urls'],
  },
  {
    table: 'group_trip_days',
    bucket: 'group-trip-media',
    folder: 'migrated/group-trip-days',
    json: [{ column: 'media', kind: 'media-array' }],
  },
  {
    table: 'traveler_info_pages',
    folder: 'migrated/traveler-info',
    fields: ['cover_image_url'],
    json: [{ column: 'content_blocks', kind: 'traveler-blocks' }],
  },
  {
    table: 'destination_guides',
    folder: 'migrated/guides',
    fields: ['cover_image_url'],
    arrays: ['gallery_urls'],
    json: [{ column: 'sections', kind: 'section-galleries' }],
  },
  {
    table: 'hotels_bank',
    folder: 'migrated/hotels',
    fields: ['photo_url', 'cover_photo_url'],
    arrays: ['gallery_urls'],
    json: [{ column: 'sections', kind: 'section-galleries' }],
  },
  {
    table: 'clients',
    bucket: 'client-media',
    folder: 'migrated/clients',
    fields: ['photo_url'],
    arrays: ['media_urls'],
  },
  {
    table: 'quotations',
    folder: 'migrated/quotations',
    fields: ['hotel_photo_url', 'cover_image_url'],
  },
  {
    table: 'itineraries',
    folder: 'migrated/itineraries',
    fields: ['cover_image_url'],
  },
  {
    table: 'itinerary_days',
    folder: 'migrated/itinerary-days',
    fields: ['image_url'],
  },
  {
    table: 'itinerary_items',
    folder: 'migrated/itinerary-items',
    fields: ['image_url'],
  },
  {
    table: 'experiences_bank',
    folder: 'migrated/experiences',
    fields: ['photo_url', 'cover_photo_url', 'image_url'],
    arrays: ['media_urls', 'gallery_urls'],
  },
];

function isExternalMediaUrl(value) {
  if (typeof value !== 'string') return false;
  if (!/^https?:\/\//i.test(value.trim())) return false;
  try {
    const url = new URL(value.trim());
    if (url.host === supabaseHost && url.pathname.includes('/storage/v1/object/')) return false;
    return true;
  } catch {
    return false;
  }
}

function extFromMime(mimeType, sourceUrl) {
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'video/mp4': 'mp4',
    'application/pdf': 'pdf',
  };
  if (map[mimeType]) return map[mimeType];
  try {
    const ext = path.extname(new URL(sourceUrl).pathname).replace('.', '').toLowerCase();
    return ext || 'bin';
  } catch {
    return 'bin';
  }
}

async function insertAsset({ row, target, ownerType, fieldName, sourceUrl, publicUrl, filePath, mimeType, sizeBytes, status, error }) {
  if (!row.org_id) return;
  const { error: insertError } = await supabase.from('media_assets').insert({
    org_id: row.org_id,
    owner_type: ownerType,
    owner_id: row.id,
    field_name: fieldName,
    bucket: target.bucket || DEFAULT_BUCKET,
    path: filePath ?? null,
    public_url: publicUrl || sourceUrl,
    source_url: sourceUrl,
    mime_type: mimeType ?? null,
    size_bytes: sizeBytes ?? null,
    visibility: 'public',
    migration_status: status,
    migration_error: error ?? null,
  });
  if (insertError) {
    console.warn(`  metadata skipped: ${insertError.message}`);
  }
}

async function migrateUrl(sourceUrl, row, target, fieldName) {
  stats.candidates += 1;
  const ownerType = target.table.replace(/s$/, '');

  if (!APPLY) {
    console.log(`  dry-run: ${target.table}.${fieldName} ${row.id} -> ${sourceUrl}`);
    return sourceUrl;
  }

  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const mimeType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!allowedMime.test(mimeType)) throw new Error(`Unsupported MIME ${mimeType || 'unknown'}`);

    const bytes = Buffer.from(await response.arrayBuffer());
    const ext = extFromMime(mimeType, sourceUrl);
    const safeField = fieldName.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
    const filePath = `${target.folder}/${row.id}/${safeField}-${crypto.randomUUID()}.${ext}`;
    const bucket = target.bucket || DEFAULT_BUCKET;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, bytes, {
      contentType: mimeType,
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    await insertAsset({
      row,
      target,
      ownerType,
      fieldName,
      sourceUrl,
      publicUrl,
      filePath,
      mimeType,
      sizeBytes: bytes.byteLength,
      status: 'migrated',
    });
    stats.migrated += 1;
    console.log(`  migrated: ${target.table}.${fieldName} ${row.id}`);
    return publicUrl;
  } catch (error) {
    stats.failed += 1;
    console.warn(`  failed: ${target.table}.${fieldName} ${row.id}: ${error.message}`);
    await insertAsset({
      row,
      target,
      ownerType,
      fieldName,
      sourceUrl,
      publicUrl: sourceUrl,
      status: 'failed',
      error: error.message,
    });
    return sourceUrl;
  }
}

async function migrateArray(values, row, target, fieldName) {
  if (!Array.isArray(values)) return { value: values, changed: false };
  let changed = false;
  const next = [];
  for (const item of values) {
    if (isExternalMediaUrl(item)) {
      const migrated = await migrateUrl(item, row, target, fieldName);
      next.push(migrated);
      changed ||= migrated !== item;
    } else {
      next.push(item);
    }
  }
  return { value: next, changed };
}

async function migrateJson(value, row, target, config) {
  if (!Array.isArray(value)) return { value, changed: false };
  let changed = false;
  const next = [];

  for (const item of value) {
    if (!item || typeof item !== 'object') {
      next.push(item);
      continue;
    }

    if (config.kind === 'media-array' && isExternalMediaUrl(item.url)) {
      const url = await migrateUrl(item.url, row, target, `${config.column}.url`);
      next.push({ ...item, url });
      changed ||= url !== item.url;
      continue;
    }

    if (config.kind === 'traveler-blocks' && item.type === 'image' && isExternalMediaUrl(item.content)) {
      const content = await migrateUrl(item.content, row, target, `${config.column}.image`);
      next.push({ ...item, content });
      changed ||= content !== item.content;
      continue;
    }

    if (config.kind === 'section-galleries' && Array.isArray(item.items)) {
      const result = await migrateArray(item.items, row, target, `${config.column}.items`);
      next.push({ ...item, items: result.value });
      changed ||= result.changed;
      continue;
    }

    next.push(item);
  }

  return { value: next, changed };
}

async function processTarget(target) {
  const { data, error } = await supabase.from(target.table).select('*').limit(LIMIT);
  if (error) {
    stats.skippedTables += 1;
    console.warn(`skip ${target.table}: ${error.message}`);
    return;
  }

  for (const row of data || []) {
    stats.scanned += 1;
    const patch = {};

    for (const fieldName of target.fields || []) {
      const sourceUrl = row[fieldName];
      if (!isExternalMediaUrl(sourceUrl)) continue;
      const migrated = await migrateUrl(sourceUrl, row, target, fieldName);
      if (migrated !== sourceUrl) patch[fieldName] = migrated;
    }

    for (const fieldName of target.arrays || []) {
      const result = await migrateArray(row[fieldName], row, target, fieldName);
      if (result.changed) patch[fieldName] = result.value;
    }

    for (const config of target.json || []) {
      const result = await migrateJson(row[config.column], row, target, config);
      if (result.changed) patch[config.column] = result.value;
    }

    if (APPLY && Object.keys(patch).length > 0) {
      const { error: updateError } = await supabase.from(target.table).update(patch).eq('id', row.id);
      if (updateError) {
        stats.failed += 1;
        console.warn(`  update failed: ${target.table} ${row.id}: ${updateError.message}`);
      } else {
        stats.updatedRows += 1;
      }
    }
  }
}

console.log(APPLY ? 'Applying external media migration.' : 'Dry-run only. Use --apply to migrate and update rows.');
for (const target of targets) {
  console.log(`\n${target.table}`);
  await processTarget(target);
}

console.log('\nSummary');
console.table(stats);
