
import { createClient } from '@supabase/supabase-js'

// Runtime overrides (optional). If /env.runtime.js is missing, we fall back to build-time env.
const R = (typeof window !== 'undefined' && window.__ENV) ? window.__ENV : {}
const V = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}

const SUPABASE_URL = R.VITE_SUPABASE_URL || V.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = R.VITE_SUPABASE_ANON_KEY || V.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL) throw new Error('supabaseUrl is required.')
if (!SUPABASE_ANON_KEY) throw new Error('supabaseAnonKey is required.')

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export const BUCKET = R.VITE_BUCKET || V.VITE_BUCKET || '45ants_documents'
export const APP_VERSION = R.VITE_APP_VERSION || V.VITE_APP_VERSION || '7.4.0'
