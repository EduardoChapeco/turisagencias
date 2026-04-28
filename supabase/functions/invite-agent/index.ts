import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const allowedRoles = new Set(["super_admin", "org_admin", "support"]);
const assignableRoles = new Set(["agent", "support", "org_admin", "client"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user },
      error: userError,
    } = await callerClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const role = String(body?.role ?? "");
    const orgId = String(body?.org_id ?? "");

    if (!email || !orgId || !assignableRoles.has(role)) {
      return new Response(JSON.stringify({ error: "Invalid invite payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: callerProfile, error: callerProfileError }, { data: callerRoles, error: callerRolesError }] = await Promise.all([
      adminClient.from("profiles").select("id, org_id").eq("user_id", user.id).maybeSingle(),
      adminClient.from("user_roles").select("role").eq("user_id", user.id),
    ]);

    if (callerProfileError || callerRolesError) {
      throw callerProfileError ?? callerRolesError;
    }

    const canInvite = (callerRoles ?? []).some((item) => allowedRoles.has(item.role));
    if (!canInvite || callerProfile?.org_id !== orgId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingProfile, error: existingProfileError } = await adminClient
      .from("profiles")
      .select("id, user_id, org_id, email")
      .ilike("email", email)
      .maybeSingle();

    if (existingProfileError) throw existingProfileError;

    let invitedUserId = existingProfile?.user_id ?? null;
    let invited = false;

    if (!invitedUserId) {
      const redirectTo = `${req.headers.get("origin") ?? supabaseUrl}/login`;
      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
        data: { org_id: orgId, invited_role: role },
        redirectTo,
      });

      if (inviteError) throw inviteError;

      invitedUserId = inviteData.user?.id ?? null;
      invited = true;
    }

    if (!invitedUserId) {
      throw new Error("Unable to resolve invited user id");
    }

    const { error: profileUpsertError } = await adminClient.from("profiles").upsert(
      {
        user_id: invitedUserId,
        email,
        org_id: orgId,
        is_active: true,
      },
      { onConflict: "user_id" },
    );
    if (profileUpsertError) throw profileUpsertError;

    const { error: deleteRolesError } = await adminClient.from("user_roles").delete().eq("user_id", invitedUserId);
    if (deleteRolesError) throw deleteRolesError;

    const { error: insertRoleError } = await adminClient.from("user_roles").insert({ user_id: invitedUserId, role });
    if (insertRoleError) throw insertRoleError;

    return new Response(
      JSON.stringify({
        success: true,
        invited,
        user_id: invitedUserId,
        org_id: orgId,
        role,
        email,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
