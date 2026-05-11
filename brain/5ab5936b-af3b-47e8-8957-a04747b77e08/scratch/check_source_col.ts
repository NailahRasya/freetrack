
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addColumn() {
  // We can't run ALTER TABLE via the JS client unless we have a specific RPC.
  // But we can check if it exists.
  const { data, error } = await supabase.from('projects').select('source_project_id').limit(1);
  if (error) {
    console.log("Column source_project_id does not exist. Attempting to use a workaround or check for other columns.");
    const { data: cols, error: err2 } = await supabase.from('projects').select('*').limit(1);
    console.log("Available columns:", Object.keys(cols?.[0] || {}));
  } else {
    console.log("Column source_project_id exists!");
  }
}

addColumn();
