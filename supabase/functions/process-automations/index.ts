import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TripClient {
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface TripData {
  id: string;
  title: string | null;
  destination_city: string | null;
  departure_date?: string | null;
  return_date?: string | null;
  primary_client_id: string | null;
  clients: TripClient | null;
}

interface DecisionLog {
  org_id: string;
  agent_name: string;
  action_type: string;
  target_type: string;
  target_id: string;
  confidence_score: number;
  metadata: {
    event_type: string;
    client_name: string;
    sent_method: string;
    subject?: string;
    body_preview: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const incomingSecret = req.headers.get("X-Cron-Secret") || req.headers.get("Authorization")?.replace("Bearer ", "");

    if (cronSecret && incomingSecret !== cronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid Cron Secret" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch all active communication rules for all orgs
    const { data: rules, error: rulesError } = await supabase
      .from("communication_rules")
      .select("*")
      .eq("is_active", true);

    if (rulesError) throw new Error("Failed to fetch communication rules");
    if (!rules || rules.length === 0) {
      return new Response(JSON.stringify({ message: "No active rules" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const today = new Date();
    today.setUTCHours(0,0,0,0);

    const in7Days = new Date(today);
    in7Days.setUTCDate(today.getUTCDate() + 7);
    const in7DaysStr = in7Days.toISOString().split("T")[0];

    const minus2Days = new Date(today);
    minus2Days.setUTCDate(today.getUTCDate() - 2);
    const minus2DaysStr = minus2Days.toISOString().split("T")[0];

    const logsToInsert: DecisionLog[] = [];
    let countTriggered = 0;

    for (const rule of rules) {
      const orgId = rule.org_id;

      let matchingTrips: TripData[] = [];

      if (rule.event_type === "1_week_before_travel") {
        // departure_date == in7DaysStr
        const { data: trips } = await supabase
          .from("trips")
          .select("id, title, destination_city, departure_date, primary_client_id, clients:primary_client_id(name, email, phone)")
          .eq("org_id", orgId)
          .eq("departure_date", in7DaysStr)
          .neq("status", "cancelled");
        matchingTrips = (trips || []) as unknown as TripData[];
      } else if (rule.event_type === "welcome_back") {
        // check_out/return_date == minus2DaysStr
        const { data: trips } = await supabase
          .from("trips")
          .select("id, title, destination_city, return_date, primary_client_id, clients:primary_client_id(name, email, phone)")
          .eq("org_id", orgId)
          .eq("return_date", minus2DaysStr)
          .neq("status", "cancelled");
        matchingTrips = (trips || []) as unknown as TripData[];
      } else if (rule.event_type === "trip_created") {
        // We'd ideally hook this up directly on row insert, but skipping for cron processing
      } else if (rule.event_type === "payment_due") {
        // Process payments due
      }

      for (const trip of matchingTrips) {
        // Prevent duplicate processing
        const logMetadataKey = `automation_${rule.event_type}_${trip.id}`;
        const { data: existingLog } = await supabase
          .from("ai_decision_logs")
          .select("id")
          .eq("org_id", orgId)
          .eq("target_type", "trip")
          .eq("target_id", trip.id)
          .eq("action_type", "automation_trigger")
          .contains("metadata", { event_type: rule.event_type })
          .limit(1);

        if (existingLog && existingLog.length > 0) {
          continue; // Already processed
        }

        // We can integrate an AI pass here to personalize the template_body. For now, simple replace:
        const clientName = trip.clients?.name || "Cliente";
        let body = rule.template_body || "";
        body = body.replace(/{{nome_cliente}}/g, clientName);
        body = body.replace(/{{destino}}/g, trip.destination_city || "seu destino");
        
        let sentMethod = "queued_no_provider_configured";

        logsToInsert.push({
          org_id: orgId,
          agent_name: "Agent 2 (Notifier / Operation)",
          action_type: "automation_trigger",
          target_type: "trip",
          target_id: trip.id,
          confidence_score: 1.0,
          metadata: {
            event_type: rule.event_type,
            client_name: clientName,
            sent_method: sentMethod,
            subject: rule.template_subject,
            body_preview: body.slice(0, 50) + "..."
          }
        });
        
        countTriggered++;
        // Provider dispatch must be implemented by a registered email/WhatsApp adapter.
      }
    }

    if (logsToInsert.length > 0) {
      await supabase.from("ai_decision_logs").insert(logsToInsert);
    }

    return new Response(JSON.stringify({ success: true, processed: countTriggered, message: "Automations executed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Process Automations Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
