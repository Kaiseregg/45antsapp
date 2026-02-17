
import { createClient } from '@supabase/supabase-js'
const E = window.__ENV || {}
export const supabase = createClient(E.VITE_SUPABASE_URL, E.VITE_SUPABASE_ANON_KEY)
export const BUCKET = E.VITE_BUCKET
export const ADMIN_PASS = E.VITE_ADMIN_PASS
export const APP_VERSION = E.VITE_APP_VERSION || 'dev'
