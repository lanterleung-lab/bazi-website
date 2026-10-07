import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qwpqaxtnvfjvzmlgncss.supabase.co';
const supabaseAnonKey = 'sb_publishable_eUProS6rrxBPBUgCrtbqVg_mPd-chrg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);