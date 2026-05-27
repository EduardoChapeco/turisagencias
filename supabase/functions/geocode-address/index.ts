import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { address } = await req.json();

    if (!address) {
      throw new Error("Endereço é obrigatório");
    }

    // Call Nominatim API (OpenStreetMap)
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.append("q", address);
    url.searchParams.append("format", "json");
    url.searchParams.append("limit", "1");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "TurisAgencias/1.0 (admin@turisagencias.com)",
      },
    });

    if (!res.ok) {
      throw new Error(`Erro na API Nominatim: ${res.status}`);
    }

    const data = await res.json();

    if (data && data.length > 0) {
      return new Response(
        JSON.stringify({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ lat: null, lng: null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[geocode-address] Erro:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
