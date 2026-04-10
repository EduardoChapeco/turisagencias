import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if(!authHeader) {
      throw new Error("Missing Authorization header. Requisição bloqueada.");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error("Acesso não autorizado ou token inválido: " + (authError?.message || "User not found"));
    }

    const { imageBase64, text, client_id, org_id, agent_id, source_file_url } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert travel quotation data extractor. Extract structured data from travel quotation images or text.

Return a JSON object with these fields (use null for missing data):
{
  "destination": "city/country",
  "hotel_name": "hotel name",
  "hotel_stars": 5,
  "check_in": "YYYY-MM-DD",
  "check_out": "YYYY-MM-DD", 
  "num_nights": 7,
  "meal_plan": "all_inclusive|half_board|bed_breakfast|room_only",
  "room_type": "standard|superior|deluxe|suite",
  "total_value": 15000.00,
  "currency": "BRL",
  "installments": [
    {"type": "pix", "value": 15000, "installment_count": 1},
    {"type": "credit_10x", "value": 1500, "installment_count": 10},
    {"type": "credit_12x", "value": 1250, "installment_count": 12}
  ],
  "whatsapp_text": "formatted WhatsApp message in Portuguese with emojis"
}

For the whatsapp_text, create an attractive message in Portuguese with:
- ✈️ Destination
- 🏨 Hotel name and stars
- 📅 Dates and nights
- 🍽️ Meal plan
- 💰 Price and installment options
- A friendly CTA`;

    const messages: any[] = [{ role: "system", content: systemPrompt }];

    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Extract quotation data from this image:" },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ],
      });
    } else if (text) {
      messages.push({ role: "user", content: `Extract quotation data from this text:\n\n${text}` });
    } else {
      return new Response(JSON.stringify({ error: "No image or text provided" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: [{
          type: "function",
          function: {
            name: "extract_quotation",
            description: "Extract structured quotation data from travel quotation image or text",
            parameters: {
              type: "object",
              properties: {
                destination: { type: "string" },
                hotel_name: { type: "string" },
                hotel_stars: { type: "number" },
                check_in: { type: "string" },
                check_out: { type: "string" },
                num_nights: { type: "number" },
                meal_plan: { type: "string", enum: ["all_inclusive", "half_board", "bed_breakfast", "room_only"] },
                room_type: { type: "string" },
                total_value: { type: "number" },
                currency: { type: "string" },
                installments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      value: { type: "number" },
                      installment_count: { type: "number" },
                    },
                    required: ["type", "value", "installment_count"],
                  },
                },
                whatsapp_text: { type: "string" },
              },
              required: ["destination", "hotel_name", "total_value", "whatsapp_text"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_quotation" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured data");
    }

    const extracted = JSON.parse(toolCall.function.arguments);

    // Contrato garantido: sempre persiste se org_id for passado
    if (org_id) {
      const { error: insertError } = await supabaseClient
        .from('quotations')
        .insert({
          org_id,
          client_id: client_id || null,
          agent_id: agent_id || user.id,
          status: 'draft',
          ai_extracted: true,
          ai_raw_response: extracted,
          destination: extracted.destination,
          hotel_name: extracted.hotel_name,
          hotel_stars: extracted.hotel_stars,
          check_in: extracted.check_in,
          check_out: extracted.check_out,
          num_nights: extracted.num_nights,
          meal_plan: extracted.meal_plan,
          room_type: extracted.room_type,
          total_value: extracted.total_value,
          currency: extracted.currency,
          installments: extracted.installments,
          whatsapp_text: extracted.whatsapp_text,
          source_file_url: source_file_url || null,
        });

      if (insertError) {
        console.error("Erro ao persistir a cotacao (FALHA DE CONTRATO):", insertError);
        throw new Error("Erro Crítico: A API IA obteve os dados, mas falhou ao persistir no Supabase: " + insertError.message);
      }
    }

    return new Response(JSON.stringify({ data: extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-quotation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
