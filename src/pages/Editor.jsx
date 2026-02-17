
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import ComponentPicker from '../components/ComponentPicker'
import EditorCard from '../components/EditorCard'
import QRPreview from '../components/QRPreview'

const Editor = () => {
  const [components,setComponents]=useState([])
  const [loading,setLoading]=useState(true)
  const id = new URLSearchParams(window.location.search).get('id')
  const publicUrl = `${window.location.origin}/p/${id}`

  useEffect(()=>{ (async()=>{ const { data } = await supabase.from('landingpages_45ants').select('*').eq('id', id).maybeSingle(); setComponents(data?.components||[]); setLoading(false) })() },[id])

  async function save(){ const { error } = await supabase.from('landingpages_45ants').update({ components }).eq('id', id); if(error) alert('Speichern fehlgeschlagen'); else alert('Gespeichert') }
  function move(i,dir){ const c=[...components]; const t=i+dir; if(t<0||t>=c.length) return; [c[i],c[t]]=[c[t],c[i]]; setComponents(c) }
  function add(type){ setComponents([...components, { type, data:{} }]) }
  function update(i,d){ const c=[...components]; c[i].data=d; setComponents(c) }

  if(loading) return <div className='card'>Lade…</div>
  return (
    <div className='grid' style={{gap:16}}>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <button className='button' onClick={save}>Speichern</button>
        <a className='button ghost' href={`/p/${id}`} target='_blank'>Öffentliche Seite</a>
      </div>
      <QRPreview value={publicUrl} />
      <ComponentPicker onAdd={add} />
      <div className='grid'>
        {components.map((c,i)=> (
          <EditorCard key={i} component={c} onMoveUp={()=>move(i,-1)} onMoveDown={()=>move(i,1)} onChange={d=>update(i,d)} />
        ))}
      </div>
    </div>
  )
}

export default Editor
