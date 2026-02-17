
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
export default function Analytics(){
  const [rows,setRows]=useState([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{ (async()=>{ const { data } = await supabase.from('analytics_45ants').select('*').order('ts',{ascending:false}).limit(500); setRows(data||[]); setLoading(false) })() },[])
  const counts = useMemo(()=>({ total:rows.length, scans:rows.filter(r=>r.event_type==='scan').length, clicks:rows.filter(r=>r.event_type==='click').length }),[rows])
  return (
    <div>
      <h2>Analytics</h2>
      {loading? 'Lade…' : (
        <>
          <div style={{display:'flex',gap:12,margin:'12px 0'}}>
            <KPI label='Events' value={counts.total} />
            <KPI label='Scans' value={counts.scans} />
            <KPI label='Klicks' value={counts.clicks} />
          </div>
          <table className='table'>
            <thead><tr><th>Zeit</th><th>Typ</th><th>Page</th><th>Target</th><th>Referrer</th></tr></thead>
            <tbody>
              {rows.map((r,i)=>(<tr key={i}><td>{new Date(r.ts).toLocaleString()}</td><td>{r.event_type}</td><td>{r.page_id}</td><td>{r.target||''}</td><td>{r.referrer||''}</td></tr>))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
function KPI({label,value}){ return <div className='card' style={{minWidth:120}}><div style={{color:'#64748b',fontSize:12}}>{label}</div><div style={{fontSize:24,fontWeight:700}}>{value}</div></div> }
