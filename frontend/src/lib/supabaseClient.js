import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
const supabaseUrl = 'https://kgbpnmeilgftctkxtaeu.supabase.co'
const supabaseAnonKey = 'sb_publishable_y8F_3lHxoU7GrBr49zA-pw_fmr6iU0t'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
