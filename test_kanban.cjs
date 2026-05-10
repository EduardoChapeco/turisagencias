const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function test() {
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'eusoueduoficial@gmail.com',
    password: 'admin123'
  });
  if (authErr) return console.error('Auth err', authErr);

  console.log('Logged in as', auth.user.id);
  
  const { data: profile } = await supabase.from('profiles').select('org_id').eq('user_id', auth.user.id).single();
  console.log('Org:', profile?.org_id);
  
  const org_id = profile?.org_id;

  const { data: board, error: boardError } = await supabase
    .from('kanban_boards')
    .select('*')
    .eq('org_id', org_id)
    .eq('slug', 'sales')
    .maybeSingle();

  console.log('Board:', board);
  console.log('Board err:', boardError);

  if (!board) {
    console.log('Trying RPC ensure_default_kanban_boards');
    const { error: rpcErr } = await supabase.rpc('ensure_default_kanban_boards', { _org_id: org_id });
    console.log('RPC err:', rpcErr);

    const { data: newBoard, error: createErr } = await supabase
      .from('kanban_boards')
      .insert({ org_id: org_id, name: 'Test', slug: 'sales', board_type: 'sales' })
      .select()
      .maybeSingle();
      
    console.log('Create board res:', newBoard, 'err:', createErr);
  }
}
test();
