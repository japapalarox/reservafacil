// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const url  = process.env.REACT_APP_SUPABASE_URL
const key  = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('⚠️  Variáveis REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY não definidas.')
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,          // mantém sessão no localStorage
    autoRefreshToken: true,
  },
})
