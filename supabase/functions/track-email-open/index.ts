import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 1x1 Transparent GIF
const PIXEL_BIN = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 
  0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 
  0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 
  0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b
]);

serve(async (req) => {
  // Always return the pixel as fast as possible, even on errors
  const sendPixel = () => new Response(PIXEL_BIN, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (id) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      // Get requester info
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      const ua = req.headers.get('user-agent') || 'unknown';

      // Update the tracking log
      const { error } = await supabase.rpc('increment_email_open', {
        _log_id: id,
        _ip: ip,
        _ua: ua
      });

      if (error) {
        // Fallback to direct update if RPC is missing
        await supabase
          .from('email_tracking_logs')
          .update({
            opened_at: new Date().toISOString(),
            last_ip: ip,
            last_user_agent: ua,
            open_count: 1 // We'll handle increment in a better way if possible, but let's stick to basics for now
          })
          .eq('id', id)
          .is('opened_at', null);

        // If already opened, just increment count
        await supabase.rpc('increment_email_open_simple', { _log_id: id });
      }
    }

    return sendPixel();
  } catch (err) {
    console.error('Tracking Error:', err);
    return sendPixel();
  }
});
