CREATE OR REPLACE FUNCTION public.get_group_trip_financial_summary(_trip_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH booking_payment AS (
    SELECT
      bi.booking_id,
      COALESCE(SUM(bi.amount) FILTER (WHERE bi.status = 'paid'), 0) AS paid_amount
    FROM public.booking_installments bi
    GROUP BY bi.booking_id
  )
  SELECT jsonb_build_object(
    'total_bookings', COUNT(DISTINCT b.id),
    'total_pax', COALESCE(SUM(b.pax_count), 0),
    'total_expected', COALESCE(SUM(b.total_amount) FILTER (WHERE b.status != 'cancelled'), 0),
    'total_received', COALESCE((
      SELECT SUM(bi.amount)
      FROM public.booking_installments bi
      JOIN public.group_bookings gb ON gb.id = bi.booking_id
      WHERE gb.group_trip_id = _trip_id
        AND bi.status = 'paid'
    ), 0),
    'total_pending', COALESCE((
      SELECT SUM(bi.amount)
      FROM public.booking_installments bi
      JOIN public.group_bookings gb ON gb.id = bi.booking_id
      WHERE gb.group_trip_id = _trip_id
        AND bi.status = 'pending'
        AND bi.due_date >= CURRENT_DATE
    ), 0),
    'total_late', COALESCE((
      SELECT SUM(bi.amount)
      FROM public.booking_installments bi
      JOIN public.group_bookings gb ON gb.id = bi.booking_id
      WHERE gb.group_trip_id = _trip_id
        AND bi.status IN ('pending', 'late')
        AND bi.due_date < CURRENT_DATE
    ), 0),
    'bookings_paid', COUNT(DISTINCT b.id) FILTER (
      WHERE b.status != 'cancelled'
        AND b.total_amount > 0
        AND COALESCE(bp.paid_amount, 0) >= b.total_amount
    ),
    'bookings_partial', COUNT(DISTINCT b.id) FILTER (
      WHERE b.status != 'cancelled'
        AND COALESCE(bp.paid_amount, 0) > 0
        AND COALESCE(bp.paid_amount, 0) < b.total_amount
    ),
    'bookings_pending', COUNT(DISTINCT b.id) FILTER (
      WHERE b.status != 'cancelled'
        AND COALESCE(bp.paid_amount, 0) = 0
    ),
    'proofs_pending', COALESCE((
      SELECT COUNT(*)
      FROM public.booking_payment_proofs bp2
      JOIN public.group_bookings gb2 ON gb2.id = bp2.booking_id
      WHERE gb2.group_trip_id = _trip_id
        AND bp2.status = 'pending_review'
    ), 0),
    'cancellations', COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'cancelled')
  )
  INTO result
  FROM public.group_bookings b
  LEFT JOIN booking_payment bp ON bp.booking_id = b.id
  WHERE b.group_trip_id = _trip_id;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_group_trip_financial_summary(uuid) TO authenticated;
