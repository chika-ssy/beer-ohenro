import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 「export」を付けて外部から参照できるようにする
export const supabase = createClient(supabaseUrl, supabaseAnonKey);