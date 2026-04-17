import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Missing or invalid Authorization header");
    }

    const { quotation_id, org_id, status } = await req.json();
    if (!quotation_id || !org_id || !status) {
      throw new Error("Missing required parameters: quotation_id, org_id, status");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Get quotation data
    const { data: quotation, error: qError } = await supabase
      .from("quotations")
      .select("*, clients(name, profile_tags), quotation_scenarios(*)")
      .eq("id", quotation_id)
      .single();

    if (qError || !quotation) {
      throw new Error(`Quotation not found: ${qError?.message}`);
    }

    // 2. Get active AI Key
    const { data: keys } = await supabase
      .from("ai_keys_pool")
      .select("provider, api_key")
      .eq("org_id", org_id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1);

    const apiKeyData = keys?.[0];
    if (!apiKeyData) {
      throw new Error("No active AI key found for organization");
    }

    // 3. AI Analysis Prompt
    const systemPrompt = `You are an expert sales analyst for a travel agency.
Analyze the following travel quotation that was marked as '${status}' (accepted = WON, lost = LOST).
Extract key reasons why this deal might have been won or lost based on the client profile, price, location, and the AI scenarios generated.
Keep it strictly under 500 characters, summarizing the actionable insight in Portuguese.`;

    const payloadText = `Quotation ID: ${quotation.id}
Destination: ${quotation.destination}
Total Value: ${quotation.currency} ${quotation.total_value}
Client Tags: ${quotation.clients?.profile_tags?.join(", ") || "None"}
Scenarios Generated: ${quotation.quotation_scenarios?.length || 0}
Outcome: ${status.toUpperCase()}`;

    let aiAnalysis = "";

    // 4. Call AI API
    if (apiKeyData.provider === "openai" || apiKeyData.provider === "openrouter") {
      const endpoint = apiKeyData.provider === "openai" 
        ? "https://api.openai.com/v1/chat/completions" 
        : "https://openrouter.ai/api/v1/chat/completions";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKeyData.api_key}`,
          "Content-Type": "application/json",
          ...(apiKeyData.provider === "openrouter" && {
            "HTTP-Referer": "https://agencia-app.viaja.app",
            "X-Title": "Turis Agências"
          })
        },
        body: JSON.stringify({
          model: apiKeyData.provider === "openai" ? "gpt-4o-mini" : "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: payloadText }
          ],
          temperature: 0.3,
          max_tokens: 150
        })
      });

      if (!res.ok) {
        throw new Error(`AI API Error: ${await res.text()}`);
      }
      
      const data = await res.json();
      aiAnalysis = data.choices[0].message.content;
    } else if (apiKeyData.provider === "gemini" || apiKeyData.provider === "google") {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKeyData.api_key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n" + payloadText }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 150 }
        })
      });

      if (!res.ok) {
        throw new Error(`Google API Error: ${await res.text()}`);
      }

      const data = await res.json();
      aiAnalysis = data.candidates[0].content.parts[0].text;
    } else {
       aiAnalysis = `Registro manual: Cotação marcada como ${status}`;
    }

    // 5. Store in ai_knowledge_base
    const insightTitle = `[Analysis] Quotation ${status.toUpperCase()} - ${quotation.destination}`;
    
    // Check if it already exists to avoid duplicates
    const { data: existingKB } = await supabase
      .from('ai_knowledge_base')
      .select('id')
      .eq('org_id', org_id)
      .eq('title', insightTitle)
      .single();

    let kbRecordId;

    if (!existingKB) {
      const { data: kbInsert, error: kbError } = await supabase
        .from("ai_knowledge_base")
        .insert({
          org_id: org_id,
          title: insightTitle,
          content: aiAnalysis,
          source_type: "quotation_feedback",
          tags: [status, quotation.destination].filter(Boolean),
        })
        .select('id')
        .single();
        
      if (kbError) throw new Error(`Knowledge Base Insert Error: ${kbError.message}`);
      kbRecordId = kbInsert.id;
    } else {
      kbRecordId = existingKB.id;
    }

    // 6. Trigger generate-embedding synchronously or asynchronously
    // Because edge functions cannot invoke other functions as fire-and-forget easily without blocking,
    // we use fetch to call the public/internal endpoint of generate-embedding.
    if (kbRecordId) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const funcUrl = `${supabaseUrl}/functions/v1/generate-embedding`;
        
        // Don't wait for embedding to complete, just trigger it and swallow failure if any
        fetch(funcUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            record_id: kbRecordId,
            content: aiAnalysis,
            org_id: org_id
          })
        }).catch(e => console.error("Async embedding trigger failed", e));
        
      } catch (embErr) {
        console.error("Embedding invocation failed:", embErr);
      }
    }

    // 7. Log decision
    await supabase.from("ai_decision_logs").insert({
      org_id: org_id,
      agent_name: "Agent 7 (Feedback Loop)",
      action_type: "generate_insight",
      target_type: "quotation",
      target_id: quotation_id,
      confidence_score: 0.95,
      metadata: { 
        status, 
        insight: aiAnalysis, 
        destination: quotation.destination 
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      insight: aiAnalysis,
      kb_id: kbRecordId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Feedback Extract Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
