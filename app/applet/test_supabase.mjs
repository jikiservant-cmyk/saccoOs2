import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'apps/web/.env.local' });
dotenv.config({ path: 'apps/web/.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.schema('sacco').from('members').select('*').limit(1);
  console.log('With sacco schema:', { error });

  const { data: d2, error: e2 } = await supabase.from('members').select('*').limit(1);
  console.log('Without sacco schema:', { error: e2 });
}
test();
