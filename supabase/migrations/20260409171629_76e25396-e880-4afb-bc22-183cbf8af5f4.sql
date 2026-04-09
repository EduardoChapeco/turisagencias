
-- Clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  birth_date DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'Brasil',
  origin TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_clients_org ON public.clients(org_id);
CREATE INDEX idx_clients_name ON public.clients USING gin(to_tsvector('portuguese', name));

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can view clients in own org"
  ON public.clients FOR SELECT USING (org_id = public.get_my_org_id());
CREATE POLICY "Users can create clients in own org"
  ON public.clients FOR INSERT WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "Users can update clients in own org"
  ON public.clients FOR UPDATE USING (org_id = public.get_my_org_id());
CREATE POLICY "Users can delete clients in own org"
  ON public.clients FOR DELETE USING (org_id = public.get_my_org_id());

-- Travelers table
CREATE TABLE public.travelers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  cpf TEXT,
  birth_date DATE,
  gender TEXT,
  nationality TEXT DEFAULT 'Brasileira',
  phone TEXT,
  email TEXT,
  relation TEXT,
  form_token UUID DEFAULT gen_random_uuid() UNIQUE,
  form_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_travelers_org ON public.travelers(org_id);
CREATE INDEX idx_travelers_client ON public.travelers(client_id);

CREATE TRIGGER update_travelers_updated_at
  BEFORE UPDATE ON public.travelers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can view travelers in own org"
  ON public.travelers FOR SELECT USING (org_id = public.get_my_org_id());
CREATE POLICY "Users can create travelers in own org"
  ON public.travelers FOR INSERT WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "Users can update travelers in own org"
  ON public.travelers FOR UPDATE USING (org_id = public.get_my_org_id());
CREATE POLICY "Users can delete travelers in own org"
  ON public.travelers FOR DELETE USING (org_id = public.get_my_org_id());

-- Public form: allow anonymous update by form_token (via function)
CREATE OR REPLACE FUNCTION public.submit_traveler_form(
  _token UUID,
  _full_name TEXT,
  _cpf TEXT DEFAULT NULL,
  _birth_date DATE DEFAULT NULL,
  _gender TEXT DEFAULT NULL,
  _nationality TEXT DEFAULT NULL,
  _phone TEXT DEFAULT NULL,
  _email TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _traveler_id UUID;
BEGIN
  UPDATE public.travelers
  SET
    full_name = COALESCE(_full_name, full_name),
    cpf = COALESCE(_cpf, cpf),
    birth_date = COALESCE(_birth_date, birth_date),
    gender = COALESCE(_gender, gender),
    nationality = COALESCE(_nationality, nationality),
    phone = COALESCE(_phone, phone),
    email = COALESCE(_email, email),
    form_completed_at = now()
  WHERE form_token = _token
  RETURNING id INTO _traveler_id;

  RETURN _traveler_id;
END;
$$;

-- Traveler documents table
CREATE TABLE public.traveler_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  traveler_id UUID NOT NULL REFERENCES public.travelers(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL, -- passaporte, rg, visto, vacina
  doc_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  file_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, valid, expired
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.traveler_documents ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_traveler_docs_traveler ON public.traveler_documents(traveler_id);

CREATE TRIGGER update_traveler_documents_updated_at
  BEFORE UPDATE ON public.traveler_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can view docs in own org"
  ON public.traveler_documents FOR SELECT USING (org_id = public.get_my_org_id());
CREATE POLICY "Users can create docs in own org"
  ON public.traveler_documents FOR INSERT WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "Users can update docs in own org"
  ON public.traveler_documents FOR UPDATE USING (org_id = public.get_my_org_id());
CREATE POLICY "Users can delete docs in own org"
  ON public.traveler_documents FOR DELETE USING (org_id = public.get_my_org_id());

-- Travel groups
CREATE TABLE public.travel_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.travel_groups ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_travel_groups_updated_at
  BEFORE UPDATE ON public.travel_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can view groups in own org"
  ON public.travel_groups FOR SELECT USING (org_id = public.get_my_org_id());
CREATE POLICY "Users can create groups in own org"
  ON public.travel_groups FOR INSERT WITH CHECK (org_id = public.get_my_org_id());
CREATE POLICY "Users can update groups in own org"
  ON public.travel_groups FOR UPDATE USING (org_id = public.get_my_org_id());
CREATE POLICY "Users can delete groups in own org"
  ON public.travel_groups FOR DELETE USING (org_id = public.get_my_org_id());

-- Travel group members
CREATE TABLE public.travel_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.travel_groups(id) ON DELETE CASCADE,
  traveler_id UUID NOT NULL REFERENCES public.travelers(id) ON DELETE CASCADE,
  UNIQUE(group_id, traveler_id)
);

ALTER TABLE public.travel_group_members ENABLE ROW LEVEL SECURITY;

-- RLS via join to travel_groups
CREATE POLICY "Users can view members via group org"
  ON public.travel_group_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.travel_groups g WHERE g.id = group_id AND g.org_id = public.get_my_org_id()));
CREATE POLICY "Users can create members via group org"
  ON public.travel_group_members FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.travel_groups g WHERE g.id = group_id AND g.org_id = public.get_my_org_id()));
CREATE POLICY "Users can delete members via group org"
  ON public.travel_group_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.travel_groups g WHERE g.id = group_id AND g.org_id = public.get_my_org_id()));

-- Storage bucket for traveler documents
INSERT INTO storage.buckets (id, name, public) VALUES ('traveler-documents', 'traveler-documents', false);

CREATE POLICY "Users can view own org docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'traveler-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'traveler-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own docs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'traveler-documents' AND auth.role() = 'authenticated');
