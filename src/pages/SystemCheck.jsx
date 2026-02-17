
import { supabase } from '../supabaseClient'
export default function SystemCheck(){
  async function ping(){ const { error } = await supabase.from('landingpages_45ants').select('id',{head:true,count:'exact'}); if(error) alert('DB Fehler: '+error.message); else alert('DB erreichbar') }
  const E = window.__ENV||{}
  const ok = E.VITE_SUPABASE_URL && E.VITE_SUPABASE_ANON_KEY
  return (
    <div>
      <h2>System‑Check</h2>
      <div className='card'>
        <div>ENV: {ok? 'OK':'FEHLT'}</div>
        <div>URL: {String(E.VITE_SUPABASE_URL||'')}</div>
        <div>Bucket: {String(E.VITE_BUCKET||'')}</div>
        <button className='button' style={{marginTop:8}} onClick={ping}>DB testen</button>
      </div>
    </div>
  )
}
