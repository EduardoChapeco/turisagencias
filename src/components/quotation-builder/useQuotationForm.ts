import { useState } from 'react';

export interface DayItem {
  id: string; day: number; date: string;
  title: string; description: string; location: string;
  accommodation?: string; hotel_id?: string;
}

export interface TransportItem {
  id: string; type: string;
  from: string; to: string; operator: string; departure: string; arrival: string; notes: string;
}

export interface ExcursionItem {
  id: string; title: string; description: string; duration: string;
  price_per_person: string; price_per_couple: string; price_per_family: string;
  included: boolean; media_url: string;
}

export interface InstallmentOption {
  type: string; installment_count: number; value: number;
}

export function useQuotationForm(initialClientId?: string) {
  const makeId = () => Math.random().toString(36).substring(2, 9);

  const [form, setForm] = useState({
    client_id: initialClientId || '',
    destination: '',
    hotel_name: '',
    hotel_stars: '',
    hotel_id: '',
    check_in: '',
    check_out: '',
    num_nights: '',
    num_adults: '2',
    num_children: '0',
    meal_plan: '',
    room_type: '',
    total_value: '',
    currency: 'BRL',
    pricing_mode: 'per_person',
    valid_until: '',
    notes_internal: '',
    whatsapp_text: '',
    cover_image_url: '',
    media_urls: [] as string[],
    included_items: [] as string[],
    excluded_items: [] as string[],
  });

  const [itinerary, setItinerary] = useState<DayItem[]>([]);
  const [transports, setTransports] = useState<TransportItem[]>([]);
  const [excursions, setExcursions] = useState<ExcursionItem[]>([]);
  const [installments, setInstallments] = useState<InstallmentOption[]>([]);

  const [aiExtracted, setAiExtracted] = useState(false);
  const [aiRawResponse, setAiRawResponse] = useState<any>(null);

  const updateForm = (field: string, value: any) => setForm(p => ({ ...p, [field]: value }));

  // Itinerary
  const addDay = () => setItinerary(p => [...p, { id: makeId(), day: p.length + 1, date: '', title: `Dia ${p.length + 1}`, description: '', location: '', accommodation: '', hotel_id: '' }]);
  const updateDay = (id: string, data: Partial<DayItem>) => setItinerary(p => p.map(d => d.id === id ? { ...d, ...data } : d));
  const removeDay = (id: string) => setItinerary(p => p.filter(d => d.id !== id));

  // Transports
  const addTransport = () => setTransports(p => [...p, { id: makeId(), type: 'aereo', from: '', to: '', operator: '', departure: '', arrival: '', notes: '' }]);
  const updateTransport = (id: string, data: Partial<TransportItem>) => setTransports(p => p.map(t => t.id === id ? { ...t, ...data } : t));
  const removeTransport = (id: string) => setTransports(p => p.filter(t => t.id !== id));

  // Excursions
  const addExcursion = () => setExcursions(p => [...p, { id: makeId(), title: '', description: '', duration: '', price_per_person: '', price_per_couple: '', price_per_family: '', included: true, media_url: '' }]);
  const updateExcursion = (id: string, data: Partial<ExcursionItem>) => setExcursions(p => p.map(e => e.id === id ? { ...e, ...data } : e));
  const removeExcursion = (id: string) => setExcursions(p => p.filter(e => e.id !== id));

  const addInstallment = (type: string, count: number, val: number) => setInstallments(p => [...p, { type, installment_count: count, value: val }]);
  const removeInstallment = (idx: number) => setInstallments(p => p.filter((_, i) => i !== idx));

  const reset = () => {
    setForm({
      client_id: initialClientId || '', destination: '', hotel_name: '', hotel_stars: '', hotel_id: '',
      check_in: '', check_out: '', num_nights: '', num_adults: '2', num_children: '0', meal_plan: '', room_type: '',
      total_value: '', currency: 'BRL', pricing_mode: 'per_person', valid_until: '', notes_internal: '', whatsapp_text: '',
      cover_image_url: '', media_urls: [], included_items: [], excluded_items: [],
    });
    setItinerary([]); setTransports([]); setExcursions([]); setInstallments([]);
    setAiExtracted(false); setAiRawResponse(null);
  };

  return {
    form, setForm, updateForm,
    itinerary, addDay, updateDay, removeDay, setItinerary,
    transports, addTransport, updateTransport, removeTransport, setTransports,
    excursions, addExcursion, updateExcursion, removeExcursion, setExcursions,
    installments, addInstallment, removeInstallment, setInstallments,
    aiExtracted, setAiExtracted, aiRawResponse, setAiRawResponse,
    reset
  };
}
