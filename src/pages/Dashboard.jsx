
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
export default function Dashboard(){
  const [rows,setRows]=useState([])
  const [q,setQ]=useState('')
  useEffect(()=>{ (async()=>{ const { data } = await supabase.from('landingpages_45ants').select('*').order('created_at',{ascending:false}); setRows(data||[]) })() },[])
  async function createPage(){ const { data, error } = await supabase.from('landingpages_45ants').insert({ title:'Neue Seite', components:[] }).select('*').single(); if(error){ alert('Fehler: '+error.message); return } window.location.href=`/editor?id=${data.id}` }
  const filtered = rows.filter(r=> (r.title||'').toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <input className='input' placeholder='Suchen…' value={q} onChange={e=>setQ(e.target.value)} style={{maxWidth:320}} />
        <button className='button' onClick={createPage}>+ Neue Landingpage</button>
        <Link className='button ghost' to='/analytics'>Analytics</Link>
      </div>
      <table className='table' style={{marginTop:12}}>
        <thead><tr><th>Titel</th><th>ID</th><th>Aktion</th></tr></thead>
        <tbody>
          {filtered.map(r=> (
            <tr key={r.id}>
              <td>{r.title||'-'}</td>
              <td>{r.id}</td>
              <td><a className='button' href={`/editor?id=${r.id}`}>Editor</a> <a className='button' href={`/p/${r.id}`} target='_blank'>Public</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
