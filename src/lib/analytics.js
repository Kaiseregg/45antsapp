import { supabase } from '../supabaseClient'

function hashUA(ua){
  let h=0;
  const s = ua || '';
  for(let i=0;i<s.length;i++){
    h=((h<<5)-h)+s.charCodeAt(i);
    h|=0;
  }
  return String(h);
}

// Backwards compatible event logger.
// New calls: logEvent({ type:'view'|'click'|'scan', page:'public'|'editor', target:<landing_id>, meta?:{} })
// Old calls: logEvent({ page_id, event_type, target })
export async function logEvent(payload){
  const page_id = payload?.page_id ?? payload?.target ?? null;
  const event_type = payload?.event_type ?? payload?.type ?? 'event';
  const target = payload?.target ?? null;
  const meta = payload?.meta ?? null;

  try{
    const base = {
      page_id,
      event_type,
      target,
      referrer: document.referrer || null,
      ua_hash: hashUA(navigator.userAgent || ''),
      ts: new Date().toISOString(),
    };

    // Try with meta (if schema supports it), otherwise fall back.
    let res = await supabase.from('analytics_45ants').insert(meta ? { ...base, meta } : base);
    if(res.error && meta){
      res = await supabase.from('analytics_45ants').insert(base);
    }
    if(res.error) console.warn('analytics insert error', res.error.message);
  }catch(e){
    console.warn('analytics log failed', e?.message);
  }
}
