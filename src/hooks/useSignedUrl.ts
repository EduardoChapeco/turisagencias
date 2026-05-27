import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSignedUrl(url: string | null | undefined) {
 const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 if (!url) {
 setResolvedUrl(null);
 setLoading(false);
 return;
 }

 // Check if the URL points to our Supabase Storage private buckets
 const privateBuckets = ['client-media', 'finance-docs', 'contracts'];
 const bucketMatch = privateBuckets.find(bucket => url.includes(`/storage/v1/object/public/${bucket}/`));

 if (bucketMatch) {
 setLoading(true);
 // Extract the path after the bucket name
 const prefix = `/storage/v1/object/public/${bucketMatch}/`;
 const index = url.indexOf(prefix);
 if (index !== -1) {
 const filePath = decodeURIComponent(url.substring(index + prefix.length));
 
 supabase.storage
 .from(bucketMatch)
 .createSignedUrl(filePath, 300) // 5 minutes TTL
 .then(({ data, error }) => {
 if (!error && data?.signedUrl) {
 setResolvedUrl(data.signedUrl);
 } else {
 setResolvedUrl(url); // fallback to original
 }
 })
 .catch(() => {
 setResolvedUrl(url); // fallback
 })
 .finally(() => {
 setLoading(false);
 });
 return;
 }
 }

 setResolvedUrl(url);
 setLoading(false);
 }, [url]);

 return { url: resolvedUrl, loading };
}
