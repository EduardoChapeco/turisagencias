-- Migration: setup_initial_admin_pin
-- Sets up the initial PIN for Eduardo

-- 1. Ensure pgcrypto is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- 1. Fetch Eduardo's user id
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower('eusoueduoficial@gmail.com') LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- 2. Insert the hashed PIN (88776655)
    INSERT INTO public.admin_pins (user_id, hashed_pin)
    VALUES (v_user_id, crypt('88776655', gen_salt('bf')))
    ON CONFLICT (id) DO NOTHING; -- No unique constraint on user_id yet, but id is primary key

    -- Let's make sure there's only one pin per user
    -- Delete any old pins for this user if we are replacing
    DELETE FROM public.admin_pins WHERE user_id = v_user_id;

    -- Insert fresh
    INSERT INTO public.admin_pins (user_id, hashed_pin)
    VALUES (v_user_id, crypt('88776655', gen_salt('bf')));
    
    RAISE NOTICE 'Admin PIN setup successfully for %', v_user_id;
  ELSE
    RAISE NOTICE 'User eusoueduoficial@gmail.com not found. Skipping PIN setup.';
  END IF;
END $$;

-- Let's also add the unique constraint since we missed it
ALTER TABLE public.admin_pins ADD CONSTRAINT admin_pins_user_id_key UNIQUE (user_id);
