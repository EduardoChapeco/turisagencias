import { useState } from 'react';

export interface AccommodationRoom {
  id: string;
  room_type: string;
  occupancy_type: string;
  num_rooms: number;
  adults_per_room: number;
  children_per_room: number;
  children_ages: string; // CSV "3,7" for easy editing
  meal_plan: string;
  price_per_room_night_cost: number; // custo agência
  price_per_room_night_sale: number; // preço venda
}

export interface AccommodationItem {
  id: string;
  hotel_name: string;
  hotel_stars: number;
  destination: string;
  check_in: string;
  check_out: string;
  num_nights: number;
  rooms: AccommodationRoom[];
  notes: string;
}

export interface ItineraryActivity {
  id: string;
  time: string;
  title: string;
  included: boolean;
}

export interface DayItem {
  id: string;
  day: number;
  date: string;
  title: string;
  description: string;
  location: string;
  accommodation_id: string;
  image_url: string;
  activities: ItineraryActivity[];
  meals_breakfast: boolean;
  meals_lunch: boolean;
  meals_dinner: boolean;
  transport_day: string;
}

export interface TransportItem {
  id: string;
  type: string;
  from: string;
  to: string;
  operator: string;
  departure: string;
  arrival: string;
  flight_number: string;
  class: string;
  price_per_pax: number;
}

export interface ExcursionItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  price_per_person: number;
  price_per_couple: number;
  price_per_family: number;
  included: boolean;
}

export interface InstallmentOption {
  type: string;
  installment_count: number;
  value: number;
}

const makeId = () => Math.random().toString(36).substring(2, 9);

const makeDefaultRoom = (): AccommodationRoom => ({
  id: makeId(),
  room_type: 'standard',
  occupancy_type: 'double',
  num_rooms: 1,
  adults_per_room: 2,
  children_per_room: 0,
  children_ages: '',
  meal_plan: 'bed_breakfast',
  price_per_room_night_cost: 0,
  price_per_room_night_sale: 0,
});

const makeDefaultAccommodation = (): AccommodationItem => ({
  id: makeId(),
  hotel_name: '',
  hotel_stars: 4,
  destination: '',
  check_in: '',
  check_out: '',
  num_nights: 0,
  rooms: [makeDefaultRoom()],
  notes: '',
});

export function useQuotationForm(initialClientId?: string) {
  const [form, setForm] = useState({
    client_id: initialClientId ?? '',
    destination: '',
    valid_until: '',
    currency: 'BRL',
    pricing_mode: 'per_person' as 'per_person' | 'per_couple' | 'total',
    total_value: '',
    notes_internal: '',
    whatsapp_text: '',
    cover_image_url: '',
    media_urls: [] as string[],
    included_items: [] as string[],
    excluded_items: [] as string[],
  });

  // Multi-accommodation
  const [accommodations, setAccommodations] = useState<AccommodationItem[]>([makeDefaultAccommodation()]);

  // Itinerary
  const [itinerary, setItinerary] = useState<DayItem[]>([]);

  // Transports
  const [transports, setTransports] = useState<TransportItem[]>([]);

  // Excursions
  const [excursions, setExcursions] = useState<ExcursionItem[]>([]);

  // Installments
  const [installments, setInstallments] = useState<InstallmentOption[]>([]);

  // AI state
  const [aiExtracted, setAiExtracted] = useState(false);
  const [aiRawResponse, setAiRawResponse] = useState<any>(null);

  /* ── Derived calculations ── */
  const totalPax = accommodations.reduce((sum, acc) =>
    sum + acc.rooms.reduce((rSum, r) =>
      rSum + (r.adults_per_room + r.children_per_room) * r.num_rooms, 0
    ), 0
  );

  const totalCost = accommodations.reduce((sum, acc) =>
    sum + acc.rooms.reduce((rSum, r) =>
      rSum + r.price_per_room_night_cost * r.num_rooms * Math.max(acc.num_nights, 1), 0
    ), 0
  );

  const totalSale = accommodations.reduce((sum, acc) =>
    sum + acc.rooms.reduce((rSum, r) =>
      rSum + r.price_per_room_night_sale * r.num_rooms * Math.max(acc.num_nights, 1), 0
    ), 0
  );

  const marginPercent = totalSale > 0 ? ((totalSale - totalCost) / totalSale) * 100 : 0;

  /* ── Form update ── */
  const updateForm = (field: string, value: any) =>
    setForm(p => ({ ...p, [field]: value }));

  /* ── Accommodations ── */
  const addAccommodation = () => setAccommodations(p => [...p, makeDefaultAccommodation()]);
  const removeAccommodation = (id: string) => setAccommodations(p => p.filter(a => a.id !== id));

  const updateAccommodation = (id: string, data: Partial<AccommodationItem>) =>
    setAccommodations(p => p.map(a => {
      if (a.id !== id) return a;
      const updated = { ...a, ...data };
      // Auto-calculate num_nights from dates
      if (updated.check_in && updated.check_out) {
        const diff = (new Date(updated.check_out).getTime() - new Date(updated.check_in).getTime()) / 86400000;
        updated.num_nights = Math.max(0, Math.round(diff));
      }
      return updated;
    }));

  /* ── Rooms (within an accommodation) ── */
  const addRoom = (accId: string) =>
    setAccommodations(p => p.map(a =>
      a.id === accId ? { ...a, rooms: [...a.rooms, makeDefaultRoom()] } : a
    ));

  const removeRoom = (accId: string, roomId: string) =>
    setAccommodations(p => p.map(a =>
      a.id === accId ? { ...a, rooms: a.rooms.filter(r => r.id !== roomId) } : a
    ));

  const updateRoom = (accId: string, roomId: string, data: Partial<AccommodationRoom>) =>
    setAccommodations(p => p.map(a =>
      a.id === accId
        ? { ...a, rooms: a.rooms.map(r => r.id === roomId ? { ...r, ...data } : r) }
        : a
    ));

  /* ── Itinerary ── */
  const addDay = () => setItinerary(p => [...p, {
    id: makeId(), day: p.length + 1, date: '', title: `Dia ${p.length + 1}`,
    description: '', location: '', accommodation_id: '',
    image_url: '', activities: [], meals_breakfast: true, meals_lunch: false,
    meals_dinner: false, transport_day: '',
  }]);

  const updateDay = (id: string, data: Partial<DayItem>) =>
    setItinerary(p => p.map(d => d.id === id ? { ...d, ...data } : d));

  const removeDay = (id: string) => setItinerary(p => p.filter(d => d.id !== id));

  const addActivity = (dayId: string) =>
    setItinerary(p => p.map(d =>
      d.id === dayId
        ? { ...d, activities: [...d.activities, { id: makeId(), time: '', title: '', included: true }] }
        : d
    ));

  const updateActivity = (dayId: string, actId: string, data: Partial<ItineraryActivity>) =>
    setItinerary(p => p.map(d =>
      d.id === dayId
        ? { ...d, activities: d.activities.map(a => a.id === actId ? { ...a, ...data } : a) }
        : d
    ));

  const removeActivity = (dayId: string, actId: string) =>
    setItinerary(p => p.map(d =>
      d.id === dayId ? { ...d, activities: d.activities.filter(a => a.id !== actId) } : d
    ));

  /* ── Transports ── */
  const addTransport = () => setTransports(p => [...p, {
    id: makeId(), type: 'aereo', from: '', to: '', operator: '',
    departure: '', arrival: '', flight_number: '', class: 'economy', price_per_pax: 0,
  }]);
  const updateTransport = (id: string, data: Partial<TransportItem>) =>
    setTransports(p => p.map(t => t.id === id ? { ...t, ...data } : t));
  const removeTransport = (id: string) => setTransports(p => p.filter(t => t.id !== id));

  /* ── Excursions ── */
  const addExcursion = () => setExcursions(p => [...p, {
    id: makeId(), title: '', description: '', duration: '',
    price_per_person: 0, price_per_couple: 0, price_per_family: 0, included: true,
  }]);
  const updateExcursion = (id: string, data: Partial<ExcursionItem>) =>
    setExcursions(p => p.map(e => e.id === id ? { ...e, ...data } : e));
  const removeExcursion = (id: string) => setExcursions(p => p.filter(e => e.id !== id));

  /* ── Installments ── */
  const addInstallment = (type: string, count: number, val: number) =>
    setInstallments(p => [...p, { type, installment_count: count, value: val }]);
  const removeInstallment = (idx: number) =>
    setInstallments(p => p.filter((_, i) => i !== idx));

  const reset = () => {
    setForm({ client_id: initialClientId ?? '', destination: '', valid_until: '', currency: 'BRL', pricing_mode: 'per_person', total_value: '', notes_internal: '', whatsapp_text: '', cover_image_url: '', media_urls: [], included_items: [], excluded_items: [] });
    setAccommodations([makeDefaultAccommodation()]);
    setItinerary([]); setTransports([]); setExcursions([]); setInstallments([]);
    setAiExtracted(false); setAiRawResponse(null);
  };

  return {
    form, updateForm,
    accommodations, addAccommodation, removeAccommodation, updateAccommodation,
    addRoom, removeRoom, updateRoom,
    itinerary, addDay, updateDay, removeDay, addActivity, updateActivity, removeActivity, setItinerary,
    transports, addTransport, updateTransport, removeTransport, setTransports,
    excursions, addExcursion, updateExcursion, removeExcursion, setExcursions,
    installments, addInstallment, removeInstallment, setInstallments,
    aiExtracted, setAiExtracted, aiRawResponse, setAiRawResponse,
    totalPax, totalCost, totalSale, marginPercent,
    reset,
  };
}
