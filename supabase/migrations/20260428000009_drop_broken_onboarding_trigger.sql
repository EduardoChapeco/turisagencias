-- Fix: The system_notifications table does not exist, causing the profile update to fail during onboarding.
-- This drops the broken trigger and function so the onboarding can complete successfully.

DROP TRIGGER IF EXISTS trg_notify_onboarding_completed ON public.profiles;
DROP FUNCTION IF EXISTS public.notify_onboarding_completed() CASCADE;
