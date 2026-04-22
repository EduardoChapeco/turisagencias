
-- Migration: atomic_sales_sync
-- Created: 2026-04-22
-- Purpose: Automatically create financial transactions when a Kanban card is moved to "Fechado" (Won)

CREATE OR REPLACE FUNCTION fn_on_kanban_card_sold()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_column_name TEXT;
    v_board_slug TEXT;
BEGIN
    -- 1. Get column name and board slug
    SELECT c.name, b.slug INTO v_column_name, v_board_slug
    FROM kanban_columns c
    JOIN kanban_boards b ON b.id = c.board_id
    WHERE c.id = NEW.column_id;

    -- 2. Trigger logic: If moved to 'Fechado' in 'sales' board
    -- We use ILIKE for robustness, but usually it's exact match from our seeding
    IF v_board_slug = 'sales' AND (v_column_name ILIKE 'Fechado' OR v_column_name ILIKE 'Vendido') THEN
        
        -- Only create if it was NOT in this column before (to avoid duplicates on title updates etc)
        -- Or if it's a new card being created directly in this column
        IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.column_id IS DISTINCT FROM NEW.column_id) THEN
            
            INSERT INTO financial_transactions (
                org_id,
                description,
                amount,
                type,
                category,
                client_id,
                group_trip_id,
                trip_id,
                status,
                due_date
            ) VALUES (
                NEW.org_id,
                'Venda originada do Funil: ' || NEW.title,
                COALESCE(NEW.estimated_value, 0),
                'receivable',
                'Vendas',
                NEW.client_id,
                NEW.group_trip_id,
                NEW.trip_id,
                'pending',
                CURRENT_DATE + INTERVAL '7 days' -- Default due date
            );
            
            -- Optional: Create a notification for the team
            INSERT INTO notifications (
                org_id,
                user_id,
                type,
                title,
                message,
                entity_type,
                entity_id
            ) VALUES (
                NEW.org_id,
                NEW.assigned_to, -- Notify the agent
                'sale_closed',
                '🎉 Venda Fechada!',
                'O card "' || NEW.title || '" foi movido para Fechado. Um lançamento financeiro foi gerado.',
                'kanban_card',
                NEW.id
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Trigger for INSERT and UPDATE
DROP TRIGGER IF EXISTS trg_kanban_card_atomic_sync ON kanban_cards;
CREATE TRIGGER trg_kanban_card_atomic_sync
    AFTER INSERT OR UPDATE OF column_id ON kanban_cards
    FOR EACH ROW
    EXECUTE FUNCTION fn_on_kanban_card_sold();
