-- Incremento registrado: pagina publica de grupos com mapa de assentos,
-- contratos assinados e contadores recalculaveis.

drop function if exists public.get_public_group_trip(text);

create or replace function public.get_public_group_trip(_slug text)
returns table(
  id uuid,
  org_id uuid,
  title text,
  subtitle text,
  slug text,
  cover_image_url text,
  gallery_urls text[],
  destination text,
  origin_city text,
  departure_date date,
  return_date date,
  num_days integer,
  num_nights integer,
  price_per_pax numeric,
  currency text,
  max_pax integer,
  current_pax integer,
  description_md text,
  includes text[],
  excludes text[],
  important_notes text,
  transport_type text,
  bus_layout_id uuid,
  installments_count integer,
  bus_layout jsonb,
  occupied_seats text[],
  org_name text,
  org_logo text,
  org_whatsapp text,
  org_primary_color text
)
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  update public.group_trips
  set view_count = view_count + 1
  where group_trips.slug = _slug
    and is_public = true
    and status = 'published';

  return query
  select
    gt.id,
    gt.org_id,
    gt.title,
    gt.subtitle,
    gt.slug,
    gt.cover_image_url,
    gt.gallery_urls,
    gt.destination,
    gt.origin_city,
    gt.departure_date,
    gt.return_date,
    gt.num_days,
    gt.num_nights,
    gt.price_per_pax,
    gt.currency,
    gt.max_pax,
    gt.current_pax,
    gt.description_md,
    gt.includes,
    gt.excludes,
    gt.important_notes,
    gt.transport_type,
    gt.bus_layout_id,
    gt.installments_count,
    case
      when bl.id is null then null
      else jsonb_build_object(
        'rows', bl.rows,
        'cols', bl.cols,
        'seat_map', bl.seat_map
      )
    end as bus_layout,
    coalesce((
      select array_agg(bsa.seat_label order by bsa.seat_label)
      from public.bus_seat_assignments bsa
      where bsa.group_trip_id = gt.id
        and (bsa.is_blocked = true or bsa.booking_id is not null)
    ), '{}'::text[]) as occupied_seats,
    o.name,
    o.logo_url,
    o.whatsapp,
    o.primary_color
  from public.group_trips gt
  join public.organizations o on o.id = gt.org_id
  left join public.bus_layouts bl on bl.id = gt.bus_layout_id and bl.org_id = gt.org_id
  where gt.slug = _slug
    and gt.is_public = true
    and gt.status = 'published';
end;
$function$;

grant execute on function public.get_public_group_trip(text) to anon, authenticated;

create or replace function public.recalculate_group_trip_counts(_trip_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  update public.group_trips gt
  set
    current_pax = coalesce((
      select sum(gb.pax_count)::integer
      from public.group_bookings gb
      where gb.group_trip_id = _trip_id
        and gb.status in ('confirmed', 'signed', 'paid')
    ), 0),
    booking_count = coalesce((
      select count(*)::integer
      from public.group_bookings gb
      where gb.group_trip_id = _trip_id
        and gb.status in ('confirmed', 'signed', 'paid')
    ), 0)
  where gt.id = _trip_id;
end;
$function$;

grant execute on function public.recalculate_group_trip_counts(uuid) to service_role;

create or replace function public.finalize_group_booking_signature(
  _booking_id uuid,
  _booking_token uuid,
  _signer_name text,
  _signer_cpf text,
  _signer_email text,
  _signer_ip text,
  _user_agent text,
  _geolocation jsonb,
  _facial_photo_url text,
  _selected_seats text[],
  _contract_html text,
  _signed_at timestamptz,
  _hash_sha256 text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_booking record;
  v_conflict text[];
  v_seat text;
  v_voucher_code text;
  v_voucher_url text;
  v_selected_seats text[] := coalesce(_selected_seats, '{}'::text[]);
begin
  select *
  into v_booking
  from public.group_bookings
  where id = _booking_id
  for update;

  if v_booking is null then
    raise exception 'Booking nao encontrada';
  end if;

  if v_booking.public_token <> _booking_token then
    raise exception 'Token publico invalido';
  end if;

  if v_booking.status = 'cancelled' then
    raise exception 'Booking cancelada';
  end if;

  if coalesce(cardinality(v_selected_seats), 0) > 0
     and coalesce(cardinality(v_selected_seats), 0) <> v_booking.pax_count then
    raise exception 'Quantidade de assentos diferente do numero de passageiros';
  end if;

  select array_agg(bsa.seat_label order by bsa.seat_label)
  into v_conflict
  from public.bus_seat_assignments bsa
  where bsa.group_trip_id = v_booking.group_trip_id
    and bsa.seat_label = any(v_selected_seats)
    and (
      bsa.is_blocked = true
      or (bsa.booking_id is not null and bsa.booking_id <> _booking_id)
    );

  if coalesce(cardinality(v_conflict), 0) > 0 then
    raise exception 'Assentos indisponiveis: %', array_to_string(v_conflict, ', ');
  end if;

  v_voucher_code := coalesce(
    v_booking.voucher_code,
    'GB-' || upper(substr(replace(v_booking.id::text, '-', ''), 1, 8))
  );
  v_voucher_url := '/voucher/' || v_booking.public_token::text;

  insert into public.contract_signatures (
    booking_id,
    org_id,
    contract_html,
    signer_name,
    signer_cpf,
    signer_email,
    signer_ip,
    user_agent,
    geolocation,
    facial_photo_url,
    signed_at,
    hash_sha256
  ) values (
    _booking_id,
    v_booking.org_id,
    _contract_html,
    _signer_name,
    nullif(_signer_cpf, ''),
    nullif(_signer_email, ''),
    nullif(_signer_ip, ''),
    nullif(_user_agent, ''),
    _geolocation,
    nullif(_facial_photo_url, ''),
    _signed_at,
    _hash_sha256
  );

  if coalesce(cardinality(v_selected_seats), 0) > 0 then
    delete from public.bus_seat_assignments
    where booking_id = _booking_id;

    foreach v_seat in array v_selected_seats loop
      insert into public.bus_seat_assignments (
        group_trip_id,
        seat_label,
        booking_id,
        traveler_name,
        is_blocked
      ) values (
        v_booking.group_trip_id,
        v_seat,
        _booking_id,
        v_booking.lead_name,
        false
      );
    end loop;
  end if;

  update public.group_bookings
  set
    status = 'confirmed',
    seat_numbers = case
      when coalesce(cardinality(v_selected_seats), 0) > 0 then v_selected_seats
      else coalesce(seat_numbers, '{}'::text[])
    end,
    voucher_code = v_voucher_code,
    voucher_url = v_voucher_url
  where id = _booking_id;

  perform public.recalculate_group_trip_counts(v_booking.group_trip_id);

  return jsonb_build_object(
    'success', true,
    'voucher_code', v_voucher_code,
    'voucher_url', v_voucher_url,
    'hash_sha256', _hash_sha256
  );
end;
$function$;

grant execute on function public.finalize_group_booking_signature(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  text,
  text[],
  text,
  timestamptz,
  text
) to service_role;
