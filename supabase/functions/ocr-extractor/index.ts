import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Pagante {
  nome: string;
  cpf: string;
  nascimento: string;
  telefone: string;
  email: string;
  endereco: string;
  cep: string;
  rg: string;
  passaporte: string;
  profissao: string;
}

interface Viajante {
  nome: string;
  cpf: string;
  nascimento: string;
  rg: string;
  passaporte: string;
}

interface OcrExtractedData {
  pagantes: Pagante[];
  viajantes: Viajante[];
}

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: string } };

// ── Obtém chave de IA da org ──────────────────────────────────────────────────
async function getAiKey(supabaseClient: SupabaseClient, orgId: string): Promise<{ key: string; provider: string; baseUrl: string; model: string } | null> {
  if (orgId) {
    const { data: keys } = await supabaseClient
      .from('ai_keys_pool')
      .select('id, provider, api_key')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (keys && keys.length > 0) {
      const idx = Math.floor(Date.now() / 1000) % keys.length;
      const keyEntry = keys[idx];
      const provider = keyEntry.provider?.toLowerCase();
      if (provider === 'openrouter') return { key: keyEntry.api_key, provider: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'google/gemini-2.5-flash' };
      if (provider === 'gemini' || provider === 'google') return { key: keyEntry.api_key, provider: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash' };
      if (provider === 'groq') return { key: keyEntry.api_key, provider: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama3-70b-8192' };
      if (provider === 'openai') return { key: keyEntry.api_key, provider: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' };
      return { key: keyEntry.api_key, provider: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'google/gemini-2.5-flash' };
    }
  }

  // Fallback: Chaves globais (usando service role client)
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (supabaseUrl && supabaseServiceKey) {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.3");
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: globalKeys } = await serviceClient
      .from('global_keys')
      .select('id, provider, api_key')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (globalKeys && globalKeys.length > 0) {
      const idx = Math.floor(Date.now() / 1000) % globalKeys.length;
      const keyEntry = globalKeys[idx];
      const provider = keyEntry.provider?.toLowerCase();
      if (provider === 'openrouter') return { key: keyEntry.api_key, provider: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'google/gemini-2.5-flash' };
      if (provider === 'gemini' || provider === 'google') return { key: keyEntry.api_key, provider: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash' };
      if (provider === 'groq') return { key: keyEntry.api_key, provider: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama3-70b-8192' };
      if (provider === 'openai') return { key: keyEntry.api_key, provider: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' };
      return { key: keyEntry.api_key, provider: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'google/gemini-2.5-flash' };
    }
  }

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (lovableKey) return { key: lovableKey, provider: 'lovable', baseUrl: 'https://ai.gateway.lovable.dev/v1', model: 'google/gemini-2.5-flash' };

  return null;
}

// ── Prompt de Extração de Ficha de Cliente (Anti-Agência) ─────────────────────
const SYSTEM_PROMPT = `Você é o Auditor Especialista em OCR da Excelência Tour.
Sua função é analisar Contratos de Viagem (Orinter, FRT, CVC, etc), Recibos e Vouchers de operadora e extrair APENAS os dados dos CLIENTES.

REGRAS DE EXTRAÇÃO CIRÚRGICAS (INVIOLÁVEIS):
1. HIGIENE DE NOMES: O OCR cola palavras. Se ler "VALDECIRONIOMOSKI", corrija para "VALDECIRIO NIOMOSKI". Raciocine com bom senso.
2. REGRA ANTI-AGÊNCIA (CRÍTICA): Você NUNCA deve extrair a agência como cliente. IGNORE COMPLETAMENTE os seguintes nomes e CNPJ:
   - "Evellyn dos Santos", "Evelyn dos Santos" (nome da agente/proprietária)
   - "Excelência Tour", "Excelencia Tur", "Excelencia Tour Chapeco"
   - CNPJ: 36.620.341/0001-07
   - Qualquer nome seguido de "FATURADO" ou "Faturado para"
3. PAGANTES: Mapeie na array "pagantes" apenas os CLIENTES REAIS que compraram o pacote (quem paga a conta).
4. VIAJANTES/ACOMPANHANTES: Mapeie TODOS os passageiros que vão viajar (incluindo os pagantes) na array "viajantes".
5. SANITIZAÇÃO TOTAL: NUNCA retorne as palavras "null", "undefined", "N/A" ou similares. Se não encontrou, retorne string vazia "".
6. CPFs: Extraia com exatidão. Formate como "000.000.000-00".
7. Datas de nascimento: Formate como "DD/MM/AAAA".

Retorne ESTRITAMENTE este JSON (sem texto adicional):
{
  "pagantes": [
    {
      "nome": "",
      "cpf": "",
      "nascimento": "",
      "telefone": "",
      "email": "",
      "endereco": "",
      "cep": "",
      "rg": "",
      "passaporte": "",
      "profissao": ""
    }
  ],
  "viajantes": [
    {
      "nome": "",
      "cpf": "",
      "nascimento": "",
      "rg": "",
      "passaporte": ""
    }
  ]
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Obtém org_id do perfil
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('org_id')
      .eq('user_id', userData.user.id)
      .single();

    // Recebe FormData com os arquivos
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const customPrompt = formData.get('prompt') as string | null;

    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum arquivo enviado." }), { status: 400, headers: corsHeaders });
    }

    // Obtém chave de IA
    const aiConfig = profile?.org_id ? await getAiKey(supabaseClient, profile.org_id) : null;
    if (!aiConfig) {
      return new Response(JSON.stringify({ error: "Nenhuma chave de IA configurada. Acesse Configurações → Pool de IA." }), { status: 402, headers: corsHeaders });
    }

    console.log(`[ocr-extractor] Provider: ${aiConfig.provider} | Files: ${files.length}`);

    // Converte todos os arquivos para base64 e monta partes da mensagem
    const contentParts: ContentPart[] = [{ type: "text", text: "Analise os documentos a seguir e extraia os dados dos clientes conforme as instruções. Pode haver múltiplos arquivos que fazem parte do mesmo pacote de viagem." }];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      contentParts.push({
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" }
      });
    }

    const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.key}`,
        "Content-Type": "application/json",
        ...(aiConfig.provider === 'openrouter' ? {
          "HTTP-Referer": "https://turis.app",
          "X-Title": "Turis Agências — OCR Extractor"
        } : {}),
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          { role: "system", content: customPrompt || SYSTEM_PROMPT },
          { role: "user", content: contentParts }
        ],
        max_tokens: 4096,
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[ocr-extractor] AI error: ${response.status}`, errorBody);
      throw new Error(`Falha na IA (${response.status}). Verifique sua chave no Pool de IA.`);
    }

    const aiResult = await response.json();
    const rawText = aiResult.choices?.[0]?.message?.content || "{}";

    let extracted: Partial<OcrExtractedData> = {};
    try {
      extracted = JSON.parse(rawText) as Partial<OcrExtractedData>;
    } catch {
      // Tenta extrair JSON de dentro de blocos de código
      const match = rawText.match(/```json?\s*([\s\S]*?)```/);
      if (match) extracted = JSON.parse(match[1]) as Partial<OcrExtractedData>;
      else throw new Error("IA não retornou JSON válido. Tente com uma imagem mais nítida.");
    }

    let result: Partial<OcrExtractedData> | OcrExtractedData = extracted;
    if (!customPrompt) {
        const sanitizeStr = (v: unknown): string => (!v || v === 'null' || v === 'undefined' ? '' : String(v).trim());
        const sanitizeObj = (obj: Record<string, unknown>): Record<string, string> => 
          Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, sanitizeStr(v)]));

        result = {
          pagantes: (extracted.pagantes || []).map((p) => sanitizeObj(p as Record<string, unknown>) as unknown as Pagante),
          viajantes: (extracted.viajantes || []).map((v) => sanitizeObj(v as Record<string, unknown>) as unknown as Viajante),
        };
    }

    console.log(`[ocr-extractor] Success.`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    console.error("[ocr-extractor] error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
