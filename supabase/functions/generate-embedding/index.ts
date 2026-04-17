import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user?.id) throw new Error("Não autorizado");

    const { record_id, content, org_id } = await req.json();
    if (!record_id || !content || !org_id) {
      throw new Error("record_id, content e org_id são obrigatórios");
    }

    // 1. Obter chave de IA da organização
    const { data: keys } = await supabaseClient
      .from("ai_keys_pool")
      .select("provider, api_key")
      .eq("org_id", org_id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1);

    const key = keys?.[0];
    if (!key) {
      // Sem chave: salvar sem embedding (RAG por texto vai funcionar como fallback)
      console.warn("[generate-embedding] Sem chave de IA — kb salva sem vetor");
      return new Response(JSON.stringify({ success: true, embedding: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const provider = key.provider?.toLowerCase();
    let embedding: number[] | null = null;

    // 2. Gerar embedding conforme provedor
    if (provider === "gemini" || provider === "google") {
      // Google Embedding API — text-embedding-004 (768 dimensões)
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${key.api_key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: { parts: [{ text: content }] } }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        embedding = data.embedding?.values ?? null;
      } else {
        console.error("[generate-embedding] Google Embedding error:", await res.text());
      }
    } else if (provider === "openai") {
      // OpenAI Embedding — text-embedding-3-small (1536 dimensões)
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key.api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: content,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        embedding = data.data?.[0]?.embedding ?? null;
      } else {
        console.error("[generate-embedding] OpenAI Embedding error:", await res.text());
      }
    } else if (provider === "openrouter") {
      // OpenRouter usa API OpenAI-compatible
      const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key.api_key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://viaja.app",
          "X-Title": "Turis Agências",
        },
        body: JSON.stringify({
          model: "openai/text-embedding-3-small",
          input: content,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        embedding = data.data?.[0]?.embedding ?? null;
      } else {
        console.warn("[generate-embedding] OpenRouter embedding failed — salvando sem vetor");
      }
    }

    // 3. Atualizar o registro no banco com o embedding gerado
    if (embedding && embedding.length > 0) {
      const { error: updateError } = await supabaseClient
        .from("ai_knowledge_base")
        .update({ embedding })
        .eq("id", record_id)
        .eq("org_id", org_id);

      if (updateError) {
        console.error("[generate-embedding] Erro ao salvar embedding:", updateError.message);
        throw new Error("Falha ao salvar embedding no banco: " + updateError.message);
      }
      console.log(`[generate-embedding] Embedding salvo: ${embedding.length} dimensões para record ${record_id}`);
    } else {
      console.warn(`[generate-embedding] Embedding null para provider ${provider} — vetor não salvo`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        embedding: embedding ? { dimensions: embedding.length } : null,
        provider,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[generate-embedding] Erro:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
