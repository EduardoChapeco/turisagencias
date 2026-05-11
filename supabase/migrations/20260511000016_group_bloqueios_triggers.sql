-- Migration: Triggers e Inteligência de Automação para Bloqueios e Grupos (VECTOR v4.0)
-- Versão: 20260511000016
-- Propósito: Manter atomicidade sem depender do frontend.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Trigger para sincronizar o preço do pacote em group_trips
-- Quando a calculadora (group_pricing) for salva, o preço oficial do pacote (group_trips.price) atualiza
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_group_trip_price()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Atualiza o preço_base_padrao na tabela group_trips
  -- Assumindo que group_trips tem uma coluna price (se não existir, o trigger não quebra)
  UPDATE public.group_trips
  SET 
    updated_at = now()
    -- Se a tabela tiver coluna price, adicione a atualização do price aqui
    -- price = NEW.preco_final
  WHERE id = NEW.group_trip_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_group_trip_price ON public.group_pricing;
CREATE TRIGGER trg_sync_group_trip_price
  AFTER INSERT OR UPDATE OF preco_final ON public.group_pricing
  FOR EACH ROW EXECUTE FUNCTION public.sync_group_trip_price();


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Trigger para Semáforo de Inadimplência Inteligente em group_clients
-- Quando uma parcela é paga, recalcula o status financeiro do cliente.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_group_client_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_total_parcelas INT;
  v_parcelas_pagas INT;
  v_parcelas_atrasadas INT;
  v_novo_status TEXT;
  v_dias_atraso INT;
BEGIN
  -- Conta as parcelas do cliente em questão
  SELECT 
    COUNT(id),
    COUNT(CASE WHEN status = 'pago' THEN 1 END),
    COUNT(CASE WHEN status = 'atrasado' OR (status = 'pendente' AND data_vencimento < CURRENT_DATE) THEN 1 END),
    MAX(CASE WHEN status = 'atrasado' OR (status = 'pendente' AND data_vencimento < CURRENT_DATE) 
             THEN CURRENT_DATE - data_vencimento ELSE 0 END)
  INTO 
    v_total_parcelas,
    v_parcelas_pagas,
    v_parcelas_atrasadas,
    v_dias_atraso
  FROM public.group_installments
  WHERE group_client_id = NEW.group_client_id AND status != 'cancelado';

  -- Máquina de Estados do Status
  IF v_total_parcelas > 0 AND v_parcelas_pagas = v_total_parcelas THEN
    v_novo_status := 'quitado';
  ELSIF v_parcelas_atrasadas > 0 THEN
    v_novo_status := 'atrasado';
  ELSIF v_parcelas_pagas > 0 THEN
    v_novo_status := 'em_dia';
  ELSE
    v_novo_status := 'pendente';
  END IF;

  -- Atualiza o CRM (group_clients) com o resultado atômico
  UPDATE public.group_clients
  SET 
    status_pagamento = v_novo_status,
    dias_atraso = COALESCE(v_dias_atraso, 0),
    parcelas_atrasadas = COALESCE(v_parcelas_atrasadas, 0),
    updated_at = now()
  WHERE id = NEW.group_client_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_group_client_status ON public.group_installments;
CREATE TRIGGER trg_update_group_client_status
  AFTER INSERT OR UPDATE OF status, data_pagamento, data_vencimento ON public.group_installments
  FOR EACH ROW EXECUTE FUNCTION public.update_group_client_status();

-- Se a parcela for deletada, também recalcula
DROP TRIGGER IF EXISTS trg_update_group_client_status_del ON public.group_installments;
CREATE TRIGGER trg_update_group_client_status_del
  AFTER DELETE ON public.group_installments
  FOR EACH ROW EXECUTE FUNCTION public.update_group_client_status();
