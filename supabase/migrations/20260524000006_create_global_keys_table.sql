-- ============================================================
-- Migration: 20260524000006_create_global_keys_table.sql
-- Objetivo: Criar a tabela de chaves de IA globais (para o master admin) e habilitar RLS.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.global_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    api_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.global_keys ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para a tabela global_keys: apenas super_admin pode gerenciar.
DROP POLICY IF EXISTS "Apenas super_admin pode gerenciar global_keys" ON public.global_keys;

CREATE POLICY "Apenas super_admin pode gerenciar global_keys" ON public.global_keys
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'super_admin'
        )
    );
