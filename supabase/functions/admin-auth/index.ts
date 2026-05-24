import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6"
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Falta cabeçalho de autorização ou formato inválido' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { pin } = await req.json()

    if (!pin) {
      return new Response(JSON.stringify({ error: 'Missing pin' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Instanciar cliente autenticado do usuário para validação do JWT
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    // 1. Validar o token do usuário logado
    const { data: { user }, error: userError } = await userSupabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Token inválido ou sessão expirada' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const userId = user.id

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 2. Verify user is super_admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'super_admin')
      .single()

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Not a Super Admin' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // 3. Fetch hashed PIN and rate limit fields
    const { data: pinData, error: pinError } = await supabaseAdmin
      .from('admin_pins')
      .select('id, hashed_pin, failed_attempts, locked_until')
      .eq('user_id', userId)
      .single()

    if (pinError || !pinData) {
      return new Response(JSON.stringify({ error: 'PIN not configured for this admin' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // 4. Check if temporarily locked
    if (pinData.locked_until) {
      const lockedUntilDate = new Date(pinData.locked_until)
      const now = new Date()
      if (lockedUntilDate > now) {
        const remainingMs = lockedUntilDate.getTime() - now.getTime()
        const remainingMin = Math.ceil(remainingMs / 60000)
        return new Response(
          JSON.stringify({
            error: `Conta bloqueada temporariamente. Tente novamente em ${remainingMin} minuto(s).`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          }
        )
      }
    }

    // 5. Verify PIN using bcrypt
    const isValid = await bcrypt.compare(pin, pinData.hashed_pin)

    if (!isValid) {
      const failedAttempts = (pinData.failed_attempts || 0) + 1
      const updatePayload: Record<string, any> = {
        failed_attempts: failedAttempts,
        last_attempt_at: new Date().toISOString()
      }

      let errorMsg = 'PIN inválido.'
      let isLocked = false

      if (failedAttempts >= 5) {
        // Bloquear por 15 minutos
        const lockedUntil = new Date()
        lockedUntil.setMinutes(lockedUntil.getMinutes() + 15)
        updatePayload.locked_until = lockedUntil.toISOString()
        errorMsg = 'PIN inválido. Muitas tentativas malsucedidas. Conta bloqueada por 15 minutos.'
        isLocked = true
      } else {
        errorMsg = `PIN inválido. Você tem mais ${5 - failedAttempts} tentativa(s) antes do bloqueio.`
      }

      await supabaseAdmin
        .from('admin_pins')
        .update(updatePayload)
        .eq('id', pinData.id)

      return new Response(JSON.stringify({ error: errorMsg, isLocked }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 6. Reset rate limit fields on successful PIN authentication
    await supabaseAdmin
      .from('admin_pins')
      .update({
        failed_attempts: 0,
        locked_until: null,
        last_attempt_at: new Date().toISOString()
      })
      .eq('id', pinData.id)

    // Return success
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
