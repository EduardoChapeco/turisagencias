import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const SECRET = Deno.env.get('B2B_VAULT_SECRET') || '';

function assertSecret() {
  if (!SECRET) {
    throw new Error('B2B_VAULT_SECRET não configurado.');
  }
}

function toBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function getCryptoKey() {
  assertSecret();
  const material = await crypto.subtle.digest('SHA-256', encoder.encode(SECRET));
  return crypto.subtle.importKey('raw', material, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export async function encryptSecret(plainText: string) {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuffer = await crypto.subtle.encrypt('AES-GCM', key, encoder.encode(plainText));
  return `v1:${toBase64(iv)}:${toBase64(new Uint8Array(cipherBuffer))}`;
}

export async function decryptSecret(payload: string) {
  const [version, ivBase64, cipherBase64] = String(payload || '').split(':');
  if (version !== 'v1' || !ivBase64 || !cipherBase64) {
    throw new Error('Segredo B2B inválido.');
  }
  const key = await getCryptoKey();
  const plainBuffer = await crypto.subtle.decrypt(
    'AES-GCM',
    key,
    fromBase64(ivBase64),
    fromBase64(cipherBase64),
  );
  return decoder.decode(plainBuffer);
}

export async function resolveB2bCredential(
  serviceClient: ReturnType<typeof createClient>,
  orgId: string,
  portalName: string,
) {
  const { data, error } = await serviceClient
    .from('b2b_credentials')
    .select('portal_name, username, encrypted_password, is_active')
    .eq('org_id', orgId)
    .eq('portal_name', portalName)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.encrypted_password) {
    throw new Error(`Credencial B2B não encontrada para o portal ${portalName}.`);
  }

  const password = await decryptSecret(data.encrypted_password);

  await serviceClient
    .from('b2b_credentials')
    .update({ last_used_at: new Date().toISOString() })
    .eq('org_id', orgId)
    .eq('portal_name', portalName);

  return {
    portal_name: data.portal_name,
    username: data.username,
    password,
  };
}
