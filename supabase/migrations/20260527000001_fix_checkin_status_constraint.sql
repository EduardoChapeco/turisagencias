-- Add unique constraint to trip_checkin_status to support upsert on (trip_id, airline_iata)
alter table trip_checkin_status 
  add constraint trip_checkin_status_trip_airline_key unique (trip_id, airline_iata);
