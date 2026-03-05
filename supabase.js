import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fawwiytsvoqyahcbxvzp.supabase.co'
const supabaseAnonKey = 'sb_publishable_Xl5AY9Y9Wam4sTWsM36kXg_nI98c7zk' 

// İstemciyi bir kez oluşturuyoruz
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Konsol logu istersen burada bir kez kalabilir
console.log("Supabase Bağlantısı Hazır");