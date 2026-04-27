-- Migration: sprint3_pdf_templates
-- Propósito: Adicionar coluna para armazenar o template visual escolhido para a cotação/PDF

ALTER TABLE public.quotations
ADD COLUMN IF NOT EXISTS pdf_template TEXT DEFAULT 'executivo'
CHECK (pdf_template IN ('executivo', 'apresentacao', 'exce_tur'));

COMMENT ON COLUMN public.quotations.pdf_template IS 'Template de design (Executivo, Apresentação, Exce Tur)';
