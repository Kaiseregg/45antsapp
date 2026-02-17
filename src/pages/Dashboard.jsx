import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import QRPreview from '../components/QRPreview'

export default function Dashboard(){
  const nav = useNavigate()
  const [pages,setPages]=useState([])
  const [events,setEvents]=useState([])
  const [q,setQ]=useState('')
  const [loading,setLoading]=useState(true)

  useEffect(()=>{(async()=>{
    const [{data:lp},{data:ev}] = await Promise.all([
      supabase.from('landingpages_45ants').select('id,name,created_at').order('created_at',{ascending:false}),
      supabase.from('analytics_45ants').select('page_id,event_type,ts').limit(2000).order('ts',{ascending:false})
    ])
    setPages(lp||[])
    setEvents(ev||[])
    setLoading(false)
  })()},[])

  const scanByPage = useMemo(()=>{
    const m = new Map()
    for(const e of events){
      if(e.event_type!=='scan') continue
      m.set(e.page_id, (m.get(e.page_id)||0)+1)
    }
    return m
  },[events])

  const monthScans = useMemo(()=>{
    const now = new Date()
    const y=now.getFullYear(), mo=now.getMonth()
    return events.filter(e=>e.event_type==='scan' && e.ts && (new Date(e.ts).getFullYear()===y) && (new Date(e.ts).getMonth()===mo)).length
  },[events])

  const filtered = useMemo(()=>{
    const s=q.trim().toLowerCase()
    if(!s) return pages
    return pages.filter(p=>(p.name||'').toLowerCase().includes(s) || (p.id||'').toLowerCase().includes(s))
  },[pages,q])

  async function createNew(){
    const name = prompt('Name der neuen Landingpage?','Neue PDF‑Galerie')
    if(!name) return
    const { data, error } = await supabase.from('landingpages_45ants').insert({ name, components: [] }).select('id').single()
    if(error){ alert(error.message); return }
    nav(`/editor/${data.id}`)
  }

  return (
    <div className='chimp-dashboard'>
      <div className='chimp-dash-head'>
        <h2 style={{margin:0}}>Dashboard</h2>
        <button className='button' onClick={createNew}>+ Neu erstellen</button>
      </div>

      <div className='chimp-kpis'>
        <KPI label='Total Scans' value={events.filter(e=>e.event_type==='scan').length}/>
        <KPI label='Current Month Scans' value={monthScans}/>
        <KPI label='Active Dynamic QR Codes' value={pages.length}/>
        <KPI label='Static QR Codes' value={0}/>
      </div>

      <div className='chimp-section'>
        <h3>Folders</h3>
        <div className='muted'>Basis‑Version: Folder‑Feature ist vorbereitet (kommt als nächster Schritt).</div>
      </div>

      <div className='chimp-section'>
        <div className='chimp-table-head'>
          <h3 style={{margin:0}}>QR Codes List</h3>
          <div className='chimp-search'>
            <input className='input' placeholder='Search by Name/ID' value={q} onChange={e=>setQ(e.target.value)} />
          </div>
        </div>

        {loading ? <div className='card'>Lade…</div> : (
          <table className='table'>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Type</th>
                <th>Total Scans</th>
                <th>QR Code</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p=>{
                const url = `${window.location.origin}/p/${p.id}`
                return (
                  <tr key={p.id}>
                    <td>{p.created_at ? new Date(p.created_at).toLocaleString() : ''}</td>
                    <td>
                      <div style={{fontWeight:700}}>{p.name||'—'}</div>
                      <div className='muted' style={{fontSize:12}}>{url}</div>
                    </td>
                    <td>Dynamic<br/><span className='muted'>PDF Gallery / Multi</span></td>
                    <td>{scanByPage.get(p.id)||0}</td>
                    <td><QRPreview value={url} size={88}/></td>
                    <td style={{whiteSpace:'nowrap'}}>
                      <button className='button ghost' onClick={()=>nav(`/editor/${p.id}`)}>Edit</button>{' '}
                      <a className='button ghost' href={url} target='_blank' rel='noreferrer'>Open</a>{' '}
                      <button className='button ghost' onClick={async()=>{
                        if(!confirm('Wirklich löschen?')) return
                        const { error } = await supabase.from('landingpages_45ants').delete().eq('id',p.id)
                        if(error) return alert(error.message)
                        setPages(prev=>prev.filter(x=>x.id!==p.id))
                      }}>Delete</button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length===0 && <tr><td colSpan={6} className='muted'>Keine Einträge.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
function KPI({label,value}){
  return (
    <div className='chimp-kpi'>
      <div className='chimp-kpi-label'>{label}</div>
      <div className='chimp-kpi-value'>{value}</div>
    </div>
  )
}
