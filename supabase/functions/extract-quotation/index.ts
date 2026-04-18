import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { resolveExtensionContext } from "../_shared/extension.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-extension-session, x-extension-id",
};

// ─── Orchestrador de chaves por round-robin ────────────────────────────────
async function getAiKey(supabaseClient: any, orgId: string): Promise<{ key: string; provider: string; baseUrl: string; model: string } | null> {
  // 1. Prioridade: chaves cadastradas no pool da organização
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

    if (provider === 'openrouter') {
      return { key: keyEntry.api_key, provider: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'google/gemini-2.5-flash' };
    }
    if (provider === 'gemini' || provider === 'google') {
      return { key: keyEntry.api_key, provider: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.5-flash' };
    }
    if (provider === 'groq') {
      return { key: keyEntry.api_key, provider: 'groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama3-70b-8192' };
    }
    if (provider === 'openai') {
      return { key: keyEntry.api_key, provider: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' };
    }
    // Provider desconhecido: usa a chave com OpenRouter (mais permissivo)
    return { key: keyEntry.api_key, provider: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'google/gemini-2.5-flash' };
  }

  // 2. Fallback final: Lovable Gateway (chave de plataforma — apenas se org não tem pool)
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (lovableKey) {
    return { key: lovableKey, provider: 'lovable', baseUrl: 'https://ai.gateway.lovable.dev/v1', model: 'google/gemini-2.5-flash' };
  }

  return null;
}

// ─── Schema de extração completo conforme PRD ─────────────────────────────
const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    // Metadados
    id_operadora: { type: "string", description: "ID único do orçamento na operadora (ex: 12320155)" },
    operadora: { type: "string", description: "Nome da operadora detectada (ex: Orinter, CVC, Decolar)" },
    confianca_operadora: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
    agencia_nome: { type: "string" },
    agencia_agente: { type: "string" },
    // Financeiro
    destination: { type: "string", description: "Destino principal da viagem" },
    hotel_name: { type: "string" },
    hotel_stars: { type: "number" },
    check_in: { type: "string", description: "YYYY-MM-DD" },
    check_out: { type: "string", description: "YYYY-MM-DD" },
    num_nights: { type: "number" },
    meal_plan: { type: "string", enum: ["all_inclusive", "half_board", "bed_breakfast", "room_only", "ultra_all_inclusive", "full_board"] },
    room_type: { type: "string" },
    tarifa_base: { type: "number" },
    taxas: { type: "number" },
    impostos: { type: "number" },
    total_value: { type: "number" },
    currency: { type: "string", default: "BRL" },
    // PAX
    pax_adultos: { type: "number" },
    pax_criancas: { type: "number" },
    pax_infantil: { type: "number" },
    pax_seniores: { type: "number" },
    // Cancelamento
    cancelamento_data_limite: { type: "string", description: "ISO datetime da data/hora limite para cancelamento sem multa total" },
    cancelamento_valor_multa: { type: "number" },
    cancelamento_texto_raw: { type: "string", description: "Texto original da política de cancelamento extraído do documento" },
    // Pagamento
    installments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", description: "Forma de pagamento: cartao_credito, boleto, pix, vale_presente" },
          value: { type: "number", description: "Valor de cada parcela" },
          installment_count: { type: "number" },
        },
        required: ["type", "value", "installment_count"],
      },
    },
    // Voos
    flights: {
      type: "array",
      items: {
        type: "object",
        properties: {
          direction: { type: "string", enum: ["outbound", "return"] },
          airline_name: { type: "string" },
          cabin_class: { type: "string", enum: ["economy", "premium_economy", "business", "first"] },
          inclui_bagagem: { type: "boolean" },
          total_price: { type: "number" },
          segments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                origem_iata: { type: "string" },
                origem_cidade: { type: "string" },
                destino_iata: { type: "string" },
                destino_cidade: { type: "string" },
                numero_voo: { type: "string" },
                partida_datetime: { type: "string", description: "ISO datetime" },
                chegada_datetime: { type: "string", description: "ISO datetime" },
                duracao_minutos: { type: "number" },
              },
            },
          },
        },
      },
    },
    // Transfers e Serviços
    transfers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tipo: { type: "string", enum: ["in", "out", "round", "privativo", "regular"] },
          nome: { type: "string" },
          fornecedor: { type: "string" },
          data_inicio: { type: "string" },
          data_fim: { type: "string" },
          instrucoes: { type: "string" },
          ponto_encontro: { type: "string" },
          limite_bagagem_kg: { type: "number" },
          adultos: { type: "number" },
          criancas: { type: "number" },
        },
      },
    },
    // Roteiro
    itinerary: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day_number: { type: "number" },
          city: { type: "string" },
          label: { type: "string" },
          description: { type: "string" },
        },
      },
    },
    // Condições gerais (se presentes no doc)
    condicoes_pagamento_texto: { type: "string" },
    taxas_locais_aviso: { type: "string" },
    // Texto gerado para WhatsApp
    whatsapp_text: {
      type: "string",
      description: "Texto formatado para WhatsApp em português BR com emojis e negrito (*texto*). Persuasivo e profissional."
    },
    // Confiança geral da extração
    confianca_geral: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
    campos_ambiguos: {
      type: "array",
      items: { type: "string" },
      description: "Lista de campos com ambiguidade ou baixa confiança"
    },
  },
  required: ["destination", "hotel_name", "total_value", "whatsapp_text"],
};

const SYSTEM_PROMPT = `Você é um especialista sênior em extração de cotações de viagem para o sistema Turis Agências (antigo VoyageOS).

MISSÃO: Extraia TODOS os dados com máxima precisão do documento de cotação fornecido.

REGRAS OBRIGATÓRIAS:
1. Datas SEMPRE em formato YYYY-MM-DD (ou ISO datetime YYYY-MM-DDTHH:MM:SS para cancelamentos)
2. Valores monetários SEMPRE como número puro sem símbolo (ex: 55003.46, não "R$ 55.003,46")
3. IATA codes em MAIÚSCULAS (XAP, GRU, REC)
4. Se um campo não existir no documento, retorne null (não invente)
5. Para múltiplos voos com conexão, inclua TODOS os trechos no array segments
6. Identifique a operadora pelo rodapé, logo ou ID do documento
7. Extraia TODAS as formas de pagamento disponíveis com valores por parcela

WHATSAPP_TEXT: Gere em português BR, usando:
- Negrito: *texto*
- Emojis relevantes: ✈️ 🏨 📅 🌊 💰 💳 🚗 🧳
- Parágrafos curtos (máx 3 linhas)
- Tom: amigável, profissional, vendedor
- Inclua: destino, hotel, datas, regime, valor total, principais condições

CONFIANÇA:
- HIGH: informação clara e inequívoca no documento
- MEDIUM: inferida por contexto ou parcialmente visível
- LOW: estimada, não estava explícita — marque em campos_ambiguos`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    let supabaseClient: any;
    let userId = '';

    if (authHeader?.startsWith("Bearer ")) {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError || !userData?.user?.id) throw new Error("Unauthorized");
      userId = userData.user.id;
    } else {
      const extensionContext = await resolveExtensionContext(req);
      supabaseClient = extensionContext.supabase;
      userId = extensionContext.userId;
    }

    // Service-role key available for future sub-table writes
    const _serviceKey = supabaseServiceKey;

    const { imageBase64, mimeType, text, client_id, org_id, agent_id, source_file_url } = await req.json();

    if (!imageBase64 && !text) {
      return new Response(JSON.stringify({ error: "No image or text provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Obtém chave disponível via pool
    const aiConfig = org_id ? await getAiKey(supabaseClient, org_id) : null;
    if (!aiConfig) throw new Error("Nenhuma chave de IA configurada. Acesse Configurações → Pool de IA para adicionar uma chave.");

    console.log(`[extract-quotation] Using provider: ${aiConfig.provider} | model: ${aiConfig.model}`);

    // 2. Monta mensagens para a API
    const messages: any[] = [{ role: "system", content: SYSTEM_PROMPT }];

    if (imageBase64) {
      // Detect MIME type: use provided mimeType, or infer from base64 header
      const detectedMime = mimeType || (
        imageBase64.startsWith('JVBERi0') ? 'application/pdf' :
        imageBase64.startsWith('/9j/') ? 'image/jpeg' : 
        imageBase64.startsWith('iVBOR') ? 'image/png' : 'image/jpeg'
      );
      
      const isPdf = detectedMime === 'application/pdf';
      console.log(`[extract-quotation] File type: ${detectedMime}, isPdf: ${isPdf}, base64 length: ${imageBase64.length}`);

      messages.push({
        role: "user",
        content: [
          { type: "text", text: text 
            ? `${text}\n\nExtract ALL quotation data from this ${isPdf ? 'PDF' : 'image'} document. Analyze every page carefully:` 
            : `Extract ALL quotation data from this ${isPdf ? 'PDF' : 'image'} document. Analyze every page carefully:` },
          { type: "image_url", image_url: { url: `data:${detectedMime};base64,${imageBase64}`, detail: "high" } },
        ],
      });
    } else {
      messages.push({ role: "user", content: `Extract all quotation data from this text:\n\n${text}` });
    }

    // 3. Chama a API de IA
    const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.key}`,
        "Content-Type": "application/json",
        ...(aiConfig.provider === 'openrouter' ? {
          "HTTP-Referer": "https://viaja.app",
          "X-Title": "Viaja CRM"
        } : {}),
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages,
        max_tokens: 8192,
        tools: [{
          type: "function",
          function: {
            name: "extract_quotation",
            description: "Extract complete structured quotation data from a travel quotation document",
            parameters: EXTRACTION_SCHEMA,
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_quotation" } },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`AI API error (${aiConfig.provider}):`, response.status, errorBody);
      
      if (response.status === 400) {
        return new Response(JSON.stringify({ error: "Não foi possível processar o arquivo enviado. Tente com uma imagem mais nítida, em formato JPEG/PNG, ou cole o texto manualmente." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes na chave de IA configurada. Verifique seu saldo no provedor ou adicione outra chave no Pool de IA." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit atingido. Tente novamente em instantes ou cadastre mais chaves no Pool de IA." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Erro da IA (${response.status}): ${errorBody.slice(0, 200)}`);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("IA não retornou dados estruturados. Tente com uma imagem mais nítida ou cole o texto manualmente.");
    }

    const extracted = JSON.parse(toolCall.function.arguments);

    // 4. Persiste no banco se org_id disponível (MODELO RELACIONAL - ZERO TEATRO)
    if (org_id) {
      console.log(`[extract-quotation] Persisting relational data for quote in org: ${org_id}`);
      
      const { data: qData, error: insertError } = await supabaseClient
        .from('quotations')
        .insert({
          org_id,
          client_id: client_id || null,
          agent_id: agent_id || userId,
          status: 'draft',
          ai_extracted: true,
          ai_raw_response: extracted,
          destination: extracted.destination,
          hotel_name: extracted.hotel_name,
          hotel_stars: extracted.hotel_stars || null,
          check_in: extracted.check_in || null,
          check_out: extracted.check_out || null,
          num_nights: extracted.num_nights || null,
          num_adults: extracted.pax_adultos || 2,
          num_children: extracted.pax_criancas || 0,
          meal_plan: extracted.meal_plan || null,
          room_type: extracted.room_type || null,
          total_value: extracted.total_value,
          currency: extracted.currency || 'BRL',
          installments: extracted.installments || null,
          whatsapp_text: extracted.whatsapp_text,
          source_file_url: source_file_url || null,
          // Novos campos mapeados do PRD
          id_operadora: extracted.id_operadora || null,
          operadora_nome: extracted.operadora || null,
          tarifa_base: extracted.tarifa_base || null,
          taxas: extracted.taxas || null,
          impostos: extracted.impostos || null,
          cancelamento_data_limite: extracted.cancelamento_data_limite || null,
          cancelamento_valor_multa: extracted.cancelamento_valor_multa || null,
          cancelamento_texto_raw: extracted.cancelamento_texto_raw || null,
        })
        .select('id')
        .single();

      if (insertError) throw new Error("Erro ao salvar cotação: " + insertError.message);
      const quoteId = qData.id;
      extracted.id = quoteId;

      // 4.1 Persiste Voos e Trechos (Segments)
      if (extracted.flights && Array.isArray(extracted.flights)) {
        for (const flight of extracted.flights) {
          const { data: fData, error: fError } = await supabaseClient
            .from('flights')
            .insert({
              quote_id: quoteId,
              airline_name: flight.airline_name,
              cabin_class: flight.cabin_class,
              direction: flight.direction, // "outbound" | "return"
              total_price: flight.total_price || null,
            })
            .select('id')
            .single();
          
          if (!fError && fData && flight.segments && Array.isArray(flight.segments)) {
             const segments = flight.segments.map((s: any, idx: number) => ({
                flight_id: fData.id,
                departure_airport_code: s.origem_iata,
                departure_airport_city: s.origem_cidade,
                arrival_airport_code: s.destino_iata,
                arrival_airport_city: s.destino_cidade,
                departure_datetime: s.partida_datetime,
                arrival_datetime: s.chegada_datetime,
                duration_minutes: s.duracao_minutos,
                segment_order: idx + 1
             }));
             await supabaseClient.from('flight_segments').insert(segments);
          }
        }
      }

      // 4.2 Persiste Roteiro (Days and Items)
      if (extracted.itinerary && Array.isArray(extracted.itinerary)) {
        for (const day of extracted.itinerary) {
          const { data: dData, error: dError } = await supabaseClient
            .from('itinerary_days')
            .insert({
              quote_id: quoteId,
              day_number: day.day_number,
              city: day.city,
              label: day.label
            })
            .select('id')
            .single();
          
          if (!dError && dData && day.description) {
            await supabaseClient.from('itinerary_items').insert({
              itinerary_day_id: dData.id,
              description: day.description as string,
              order_position: 1
            });
          }
        }
      }

      // 4.3 Persiste Transfers
      if (extracted.transfers && Array.isArray(extracted.transfers)) {
         const transfers = extracted.transfers.map((t: any, idx: number) => ({
            quote_id: quoteId,
            tipo: t.tipo,
            nome: t.nome,
            fornecedor: t.fornecedor,
            data_inicio: t.data_inicio,
            data_fim: t.data_fim,
            instrucoes: t.instrucoes,
            ponto_encontro: t.ponto_encontro,
            limite_bagagem_kg: t.limite_bagagem_kg,
            adultos: t.adultos,
            criancas: t.criancas,
            order_position: idx + 1
         }));
         await supabaseClient.from('quote_transfers').insert(transfers);
      }
    }

    return new Response(JSON.stringify({ data: extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[extract-quotation] error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
