-- Migration: wipe_eduardo_legacy_data
-- Propósito: Apagar a organização "Excelência Tour" antiga e limpar os papéis do Eduardo
-- para que ele possa passar pelo Onboarding limpo.

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- 1. Buscar o ID do Eduardo
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower('eusoueduoficial@gmail.com') LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- 2. Limpar os papéis para forçar o Onboarding normal (manter apenas 'agent')
    DELETE FROM public.user_roles WHERE user_id = v_user_id AND role IN ('super_admin', 'org_admin');
    
    -- Garantir que ele pelo menos tem o papel base
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'agent') ON CONFLICT DO NOTHING;

    -- 3. Desvincular do profile
    UPDATE public.profiles SET org_id = NULL WHERE user_id = v_user_id;
  END IF;

  -- 4. Apagar as organizações que tenham 'Excelência Tour' no nome (para limpar a base)
  -- Como o ON DELETE é SET NULL nos profiles, os profiles não serão apagados.
  -- Outras tabelas podem ter CASCADE, o que apagará cotações/roteiros antigos dessa org.
  DELETE FROM public.organizations WHERE name ILIKE '%Excelência%';

END $$;
