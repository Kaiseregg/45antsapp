import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ComponentPicker from '../components/ComponentPicker'
import EditorCard from '../components/EditorCard'
import QRPreview from '../components/QRPreview'

export default function Editor(){
  const nav = useNavigate()
  const params = useParams()
  const [sp] = useSearchParams()
  const id = params.id || sp.get('id') // backward compatible
  const [name,setName]=useState('')
  const [components,setComponents]=useState([])
  const [step,setStep]=useState(1)
  const [saving,setSaving]=useState(false)
  const [loading,setLoading]=useState(true)
  const [err,setErr]=useState('')

  const publicUrl = useMemo(()=> id ? `${window.location.origin}/p/${id}` : '', [id])

  useEffect(()=>{
    if(!id){ nav('/dashboard'); return }
    ;(async()=>{
      const { data, error } = await supabase.from('landingpages_45ants').select('*').eq('id', id).maybeSingle()
      if(error){ setErr(error.message); setLoading(false); return }
      setName(data?.name || '')
      setComponents(data?.components || [])
      setLoading(false)
    })()
  },[id])

  function add(type){
    setComponents(prev=>[...prev,{ id: Date.now().toString(), type, data:{} }])
  }
  function updateComponent(cid, data){
    setComponents(prev=>prev.map(c=>c.id===cid? {...c, data}: c))
  }

  function deleteComponent(cid){
    setComponents(prev=>prev.filter(c=>c.id!==cid))
  }
  function move(idx, dir){
    setComponents(prev=>{
      const next=[...prev]
      const j = idx+dir
      if(j<0||j>=next.length) return next
      const tmp = next[idx]; next[idx]=next[j]; next[j]=tmp
      return next
    })
  }

  async function save(){
    setSaving(true); setErr('')
    const { error } = await supabase.from('landingpages_45ants').update({ name, components }).eq('id', id)
    if(error) setErr(error.message)
    setSaving(false)
  }

  if(loading) return <div className='chimp-shell'><div className='card' style={{maxWidth:720}}>Lade…</div></div>

  return (
    <div className='chimp-shell'>
      <div className='chimp-top'>
        <div className='chimp-steps'>
          <Step n={1} active={step===1} label='Inhalt' onClick={()=>setStep(1)} />
          <Step n={2} active={step===2} label='Design / Einstellungen' onClick={()=>setStep(2)} />
          <Step n={3} active={step===3} label='QR Code' onClick={()=>setStep(3)} />
        </div>
        <button className='chimp-save' onClick={save} disabled={saving}>
          {saving?'Speichern…':'Speichern'}
        </button>
      </div>

      {err && <div className='chimp-error'>{err}</div>}

      <div className='chimp-grid'>
        <div className='chimp-left'>
          <div className='card'>
            <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
              <h3 style={{margin:0}}>Projekt</h3>
              <a className='button ghost' href={publicUrl} target='_blank' rel='noreferrer'>Vorschau öffnen</a>
            </div>
            <label style={{display:'grid',gap:6,marginTop:10}}>
              <span className='muted'>Name</span>
              <input className='input' value={name} onChange={e=>setName(e.target.value)} />
            </label>
          </div>

          {step===1 && (
            <>
              <ComponentPicker onAdd={add} />
              <div style={{display:'grid',gap:12}}>
                {components.map((c,idx)=>(
                  <EditorCard
                    key={c.id}
                    component={c}
                    onChange={(data)=>updateComponent(c.id,data)}
                    onMoveUp={()=>move(idx,-1)}
                    onMoveDown={()=>move(idx, 1)}
                    onDelete={()=>deleteComponent(c.id)}
                  />
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
                <div />
                <button className='button' onClick={()=>setStep(2)}>Nächster →</button>
              </div>
            </>
          )}

          {step===2 && (
            <div className='card'>
              <h3>Design / Einstellungen</h3>
              <div className='muted'>Basis‑Version: Farben/Fonts/Buttons folgen dem App‑Theme. (Wenn du willst, baue ich dir hier Chimp‑Style Themes, Header‑Bild, Card‑Background Toggles, etc.)</div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
                <button className='button ghost' onClick={()=>setStep(1)}>← Zurück</button>
                <button className='button' onClick={()=>setStep(3)}>Nächster →</button>
              </div>
            </div>
          )}

          {step===3 && (
            <div className='card'>
              <h3>QR Code</h3>
              <div className='muted'>Dieser QR führt auf deine Landingpage.</div>
              <div style={{display:'flex',gap:18,alignItems:'center',flexWrap:'wrap',marginTop:12}}>
                <QRPreview value={publicUrl} />
                <div style={{minWidth:260}}>
                  <div className='muted' style={{fontSize:12}}>Link</div>
                  <div style={{fontWeight:600, wordBreak:'break-all'}}>{publicUrl}</div>
                  <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
                    <button className='button ghost' onClick={()=>navigator.clipboard?.writeText(publicUrl)}>Link kopieren</button>
                    <a className='button' href={publicUrl} target='_blank' rel='noreferrer'>Öffnen</a>
                  </div>
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
                <button className='button ghost' onClick={()=>setStep(2)}>← Zurück</button>
                <a className='button' href='/dashboard'>Fertig</a>
              </div>
            </div>
          )}
        </div>

        <div className='chimp-right'>
          <div className='chimp-preview-head'>
            <div className='muted' style={{fontSize:12}}>Live‑Vorschau</div>
          </div>
          <div className='chimp-phone'>
            <iframe title='preview' src={publicUrl} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Step({n,label,active,onClick}){
  return (
    <button type='button' className={'chimp-step '+(active?'active':'')} onClick={onClick}>
      <span className='chimp-step-n'>{n}</span>
      <span className='chimp-step-l'>{label}</span>
    </button>
  )
}
