const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: boards, error: boardsErr } = await supabase.from('kanban_boards').select('*').limit(1);
  console.log('Boards:', boardsErr || 'OK');

  const { data: cards, error: cardsErr } = await supabase.from('kanban_cards').select(`
            id, board_id, column_id, title, description, client_id, quotation_id, 
            trip_id, group_trip_id, position, meta, assigned_to, whatsapp, email, 
            tags, estimated_value, created_at, updated_at, 
            clients(name, phone), 
            quotations(destination), 
            group_trips(title)
          `).limit(1);
  console.log('Cards:', cardsErr || 'OK');
}

test();
