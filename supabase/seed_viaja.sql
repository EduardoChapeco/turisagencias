-- Seed data for Viaja Design System Testing
-- Destino: Bali & Tailândia

DO $$ 
DECLARE
  v_org_id uuid;
  v_dest_bali uuid;
  v_quote_id uuid;
  v_flight_id uuid;
  v_hotel_id uuid;
  v_day_1 uuid;
  v_day_2 uuid;
BEGIN
  -- 1. Pegar a primeira org disponível ou criar uma stub
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  IF v_org_id IS NULL THEN
    INSERT INTO organizations (name, slug, whatsapp) VALUES ('Viaja Premium', 'viajapremium', '5511999999999') RETURNING id INTO v_org_id;
  END IF;

  -- 2. Inserir Destino
  v_dest_bali := gen_random_uuid();
  INSERT INTO destinations (id, name, slug, country, region, currency_code, cover_emoji, description)
  VALUES (v_dest_bali, 'Bali', 'bali-id', 'Indonésia', 'Sudeste Asiático', 'IDR', '🌿', 'A Ilha dos Deuses possui praias incríveis, templos antigos e retiros espirituais.');

  -- 3. Inserir Quotation
  v_quote_id := gen_random_uuid();
  INSERT INTO quotations (
    id, org_id, destination, hotel_name, hotel_stars, check_in, check_out, num_nights, 
    meal_plan, room_type, total_value, currency, status, public_token, cover_title, cover_subtitle
  ) VALUES (
    v_quote_id, v_org_id, 'Bali, Indonésia', 'Ayana Resort and Spa', 5, CURRENT_DATE + 30, CURRENT_DATE + 37, 7, 
    'bed_breakfast', 'Ocean View Villa', 18500.00, 'BRL', 'sent', 'seed-quote-bali-01', 'Retiro de Luxo em Bali', 'Uma experiência inesquecível de 7 dias pelas maravilhas da Indonésia.'
  );

  -- 4. Inserir Itinerary Days
  v_day_1 := gen_random_uuid();
  INSERT INTO itinerary_days (id, quote_id, day_number, date, city, label)
  VALUES (v_day_1, v_quote_id, 1, CURRENT_DATE + 30, 'Ubud', 'Chegada e Imersão Cultural');
  
  INSERT INTO itinerary_items (itinerary_day_id, order_position, description) VALUES
  (v_day_1, 1, 'Recepção no pátio do aeroporto internacional (Ngurah Rai) por nosso guia licenciado.'),
  (v_day_1, 2, 'Transfer privativo em veículo executivo até o luxuoso Ayana Resort em Ubud.'),
  (v_day_1, 3, 'Tarde livre para descansar e explorar os jardins incríveis do hotel, jantando no clássico restaurante Rock Bar (reserva incluída).');

  v_day_2 := gen_random_uuid();
  INSERT INTO itinerary_days (id, quote_id, day_number, date, city, label)
  VALUES (v_day_2, v_quote_id, 2, CURRENT_DATE + 31, 'Ubud', 'Templos e Cachoeiras');

  INSERT INTO itinerary_items (itinerary_day_id, order_position, description) VALUES
  (v_day_2, 1, 'Passeio matinal pela Floresta dos Macacos Sagrados de Ubud.'),
  (v_day_2, 2, 'Visitação aos tradicionais Terraços de Arroz Tegalalang com guia fotógrafo privativo.'),
  (v_day_2, 3, 'Banho nas águas cristalinas da cachoeira Tegenungan ao pôr do sol.');

  -- 5. Inserir Flight
  v_flight_id := gen_random_uuid();
  INSERT INTO flights (id, quote_id, direction, airline_name, airline_code, cabin_class, is_recommended)
  VALUES (v_flight_id, v_quote_id, 'outbound', 'Emirates', 'EK', 'Executiva', true);

  INSERT INTO flight_segments (flight_id, segment_order, departure_airport_code, arrival_airport_code, departure_datetime, arrival_datetime, connection_info)
  VALUES 
  (v_flight_id, 1, 'GRU', 'DXB', CURRENT_DATE + 28 + interval '23 hours', CURRENT_DATE + 29 + interval '14 hours', 'Conexão longa (Lounges inclusos)'),
  (v_flight_id, 2, 'DXB', 'DPS', CURRENT_DATE + 29 + interval '18 hours', CURRENT_DATE + 30 + interval '7 hours', NULL);

  -- 6. Insert Quote Hotels
  v_hotel_id := gen_random_uuid();
  -- create hotel_bank ref
  INSERT INTO hotels_bank (id, org_id, name, city, country, category_label)
  VALUES (v_hotel_id, v_org_id, 'Ayana Resort and Spa, Bali', 'Jimbaran', 'Indonésia', 'Luxo 5 Estrelas');

  INSERT INTO quote_hotels (quote_id, hotel_id, destination_id, check_in, check_out, nights, room_type, is_included)
  VALUES (v_quote_id, v_hotel_id, v_dest_bali, CURRENT_DATE + 30, CURRENT_DATE + 37, 7, 'Ocean View Villa Privativy', true);

END $$;
