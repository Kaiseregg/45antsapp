
import { supabase } from '../supabaseClient'
function hashUA(ua){ let h=0; for(let i=0;i<(ua||'').length;i++){ h=((h<<5)-h)+ua.charCodeAt(i); h|=0 } return String(h) }
export async function logEvent({ page_id, event_type, target=null }){
  try{
    const { error } = await supabase.from('analytics_45ants').insert({ page_id, event_type, target, referrer: document.referrer||null, ua_hash: hashUA(navigator.userAgent||''), ts: new Date().toISOString() })
    if(error) console.warn('analytics insert error', error.message)
  }catch(e){ console.warn('analytics log failed', e?.message) }
}
