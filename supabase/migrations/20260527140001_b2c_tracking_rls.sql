-- Restrict tracking events to super_admin only
DROP POLICY IF EXISTS "Users can view tracking events in own org" ON public.b2c_tracking_events;

CREATE POLICY "Super admin can view all tracking events" 
  ON public.b2c_tracking_events 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

-- Also protect shadow profiles just in case, or leave them for org agents so they can see "who converted". 
-- The user said "não podemos rastrear interações dos clientes... e mostrar..". The interactions are tracking_events.
-- Shadow profiles themselves just hold device_info and geo_location. Let's keep shadow profiles readable by the org so the funnel logic works?
-- Wait, the funnel logic (Analytics.tsx) queries b2c_tracking_events. If I restrict it, the funnel will fail for normal agents.
-- That's exactly what the user wants: "Logs de rastreio devem aparecer somente para o admin master".
