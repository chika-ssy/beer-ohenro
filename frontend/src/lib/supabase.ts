import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ビルド時にキーがない場合はダミーを返すか、エラーを防ぐ
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase env vars are missing. This might happen during build.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
)