import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SignPayload = {
  booking_id?: string;
  booking_token?: string;
  signer_name?: string;
  signer_cpf?: string | null;
  signer_email?: string | null;
  facial_photo_url?: string | null;
  geolocation?: Record<string, unknown> | null;
  selected_seats?: string[] | null;
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderDefaultContract({
  booking,
  trip,
  signerName,
  seats,
}: {
  booking: Record<string, unknown>;
  trip: Record<string, unknown>;
  signerName: string;
  seats: string[];
}) {
  const money = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: String(trip.currency ?? "BRL"),
  }).format(Number(booking.total_amount ?? 0));

  return `
    <article>
      <h1>Contrato de Prestacao de Servicos Turisticos</h1>
      <p><strong>Pacote:</strong> ${escapeHtml(trip.title)}</p>
      <p><strong>Destino:</strong> ${escapeHtml(trip.destination)}</p>
      <p><strong>Periodo:</strong> ${escapeHtml(trip.departure_date)} a ${escapeHtml(trip.return_date)}</p>
      <p><strong>Contratante:</strong> ${escapeHtml(signerName)}</p>
      <p><strong>Passageiros:</strong> ${escapeHtml(booking.pax_count)}</p>
      <p><strong>Valor total:</strong> ${escapeHtml(money)}</p>
      <p><strong>Assentos:</strong> ${escapeHtml(seats.length ? seats.join(", ") : "Nao selecionado")}</p>
      <p>O contratante declara ciencia das condicoes comerciais, politica de cancelamento e regras operacionais do pacote.</p>
    </article>
  `;
}

function fillTemplate(template: string, values: Record<string, unknown>) {
  return Object.entries(values).reduce((html, [key, value]) => {
    const escaped = escapeHtml(value);
    return html
      .replaceAll(`{{${key}}}`, escaped)
      .replaceAll(`{{ ${key} }}`, escaped);
  }, template);
}

async function sha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeSeats(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value
      .map((seat) => String(seat ?? "").trim().toUpperCase())
      .filter(Boolean),
  )];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json() as SignPayload;
    const bookingId = payload.booking_id;
    const bookingToken = payload.booking_token;
    const signerName = String(payload.signer_name ?? "").trim();

    if (!bookingId || !bookingToken || !signerName) {
      return jsonResponse(400, {
        success: false,
        error: "booking_id, booking_token e signer_name sao obrigatorios",
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(500, { success: false, error: "Supabase env ausente" });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: booking, error: bookingError } = await supabase
      .from("group_bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError) throw bookingError;
    if (!booking) return jsonResponse(404, { success: false, error: "Booking nao encontrada" });
    if (String(booking.public_token) !== bookingToken) {
      return jsonResponse(403, { success: false, error: "Token publico invalido" });
    }

    const { data: trip, error: tripError } = await supabase
      .from("group_trips")
      .select("id, org_id, title, destination, origin_city, departure_date, return_date, price_per_pax, currency, contract_template_id")
      .eq("id", booking.group_trip_id)
      .maybeSingle();

    if (tripError) throw tripError;
    if (!trip) return jsonResponse(404, { success: false, error: "Pacote nao encontrado" });

    let templateHtml: string | null = null;
    if (trip.contract_template_id) {
      const { data: template } = await supabase
        .from("contract_templates")
        .select("content_html")
        .eq("id", trip.contract_template_id)
        .maybeSingle();
      templateHtml = template?.content_html ?? null;
    }

    const seats = normalizeSeats(payload.selected_seats);
    const templateValues = {
      BOOKING_ID: booking.id,
      BOOKING_TOKEN: booking.public_token,
      TRIP_TITLE: trip.title,
      DESTINATION: trip.destination,
      ORIGIN_CITY: trip.origin_city,
      DEPARTURE_DATE: trip.departure_date,
      RETURN_DATE: trip.return_date,
      SIGNER_NAME: signerName,
      SIGNER_CPF: payload.signer_cpf ?? "",
      SIGNER_EMAIL: payload.signer_email ?? "",
      PAX_COUNT: booking.pax_count,
      TOTAL_AMOUNT: booking.total_amount,
      SELECTED_SEATS: seats.join(", "),
    };

    const contractHtml = templateHtml
      ? fillTemplate(templateHtml, templateValues)
      : renderDefaultContract({ booking, trip, signerName, seats });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || "";
    const userAgent = req.headers.get("user-agent") || "";
    const signedAt = new Date().toISOString();
    const hash = await sha256Hex(JSON.stringify({
      contractHtml,
      bookingId,
      bookingToken,
      signerName,
      signerCpf: payload.signer_cpf ?? null,
      signerEmail: payload.signer_email ?? null,
      seats,
      ip,
      userAgent,
      geolocation: payload.geolocation ?? null,
      signedAt,
    }));

    const { data: result, error: finalizeError } = await supabase.rpc(
      "finalize_group_booking_signature",
      {
        _booking_id: bookingId,
        _booking_token: bookingToken,
        _signer_name: signerName,
        _signer_cpf: payload.signer_cpf ?? null,
        _signer_email: payload.signer_email ?? null,
        _signer_ip: ip,
        _user_agent: userAgent,
        _geolocation: payload.geolocation ?? null,
        _facial_photo_url: payload.facial_photo_url ?? null,
        _selected_seats: seats,
        _contract_html: contractHtml,
        _signed_at: signedAt,
        _hash_sha256: hash,
      },
    );

    if (finalizeError) throw finalizeError;

    return jsonResponse(200, {
      success: true,
      ...(result as Record<string, unknown>),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return jsonResponse(500, { success: false, error: message });
  }
});
