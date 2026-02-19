import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ComponentPicker from '../components/ComponentPicker'
import EditorCard from '../components/EditorCard'
import QRPreview from '../components/QRPreview'
import UploadZone from '../components/UploadZone'

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
  const [previewTick,setPreviewTick]=useState(Date.now())

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

  

function ThemeEditor({ components, onChange }){
  const theme = useMemo(()=>{
    const t = (components||[]).find(c=>c?.type==='theme')?.data || {}
    return {
      bg: t.bg ?? '#f5f7fb',
      maxWidth: t.maxWidth ?? 980,
      cardBg: t.cardBg ?? '#ffffff',
      cardBorder: t.cardBorder ?? '#e6eaf2',
      titleHidden: !!t.titleHidden,
      // v1.0.8
      backgroundImageUrl: t.backgroundImageUrl ?? '',
      fontFamily: t.fontFamily ?? 'system',
      textColor: t.textColor ?? '#0f172a',
      headingColor: t.headingColor ?? '#0b1220',
      linkColor: t.linkColor ?? '#2563eb',
      headingAlign: t.headingAlign ?? 'left',
    }
  },[components])

  const set = (patch)=> onChange({ ...theme, ...patch })

  return (
    <div className="grid" style={{gap:12}}>
      <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:12}}>
        <label style={{display:'grid',gap:6}}>
          <span style={{color:'#334155',fontWeight:600}}>Hintergrundfarbe</span>
          <input className="input" type="text" value={theme.bg} onChange={e=>set({bg:e.target.value})} placeholder="#f5f7fb" />
        </label>

        <label style={{display:'grid',gap:6}}>
          <span style={{color:'#334155',fontWeight:600}}>Max. Breite (Desktop)</span>
          <select className="input" value={theme.maxWidth} onChange={e=>set({maxWidth:Number(e.target.value)})}>
            <option value={720}>720px</option>
            <option value={900}>900px</option>
            <option value={980}>980px</option>
            <option value={1100}>1100px</option>
            <option value={9999}>Full</option>
          </select>
        </label>
      </div>

      <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:12}}>
        <label style={{display:'grid',gap:6}}>
          <span style={{color:'#334155',fontWeight:600}}>Card Hintergrund</span>
          <input className="input" type="text" value={theme.cardBg} onChange={e=>set({cardBg:e.target.value})} placeholder="#ffffff" />
        </label>

        <label style={{display:'grid',gap:6}}>
          <span style={{color:'#334155',fontWeight:600}}>Card Rahmenfarbe</span>
          <input className="input" type="text" value={theme.cardBorder} onChange={e=>set({cardBorder:e.target.value})} placeholder="#e6eaf2" />
        </label>
      </div>

      <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:12}}>
        <label style={{display:'grid',gap:6}}>
          <span style={{color:'#334155',fontWeight:600}}>Textfarbe</span>
          <input className="input" type="text" value={theme.textColor} onChange={e=>set({textColor:e.target.value})} placeholder="#0f172a" />
        </label>
        <label style={{display:'grid',gap:6}}>
          <span style={{color:'#334155',fontWeight:600}}>Link‑Farbe</span>
          <input className="input" type="text" value={theme.linkColor} onChange={e=>set({linkColor:e.target.value})} placeholder="#2563eb" />
        </label>
      </div>

      <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:12}}>
        <label style={{display:'grid',gap:6}}>
          <span style={{color:'#334155',fontWeight:600}}>Überschrift‑Farbe</span>
          <input className="input" type="text" value={theme.headingColor} onChange={e=>set({headingColor:e.target.value})} placeholder="#0b1220" />
        </label>
        <label style={{display:'grid',gap:6}}>
          <span style={{color:'#334155',fontWeight:600}}>Überschrift Ausrichtung</span>
          <select className="input" value={theme.headingAlign} onChange={e=>set({headingAlign:e.target.value})}>
            <option value="left">Links</option>
            <option value="center">Zentriert</option>
            <option value="right">Rechts</option>
          </select>
        </label>
      </div>

      <label style={{display:'grid',gap:6}}>
        <span style={{color:'#334155',fontWeight:600}}>Schriftart</span>
        <select className="input" value={theme.fontFamily} onChange={e=>set({fontFamily:e.target.value})}>
          <option value="system">System (empfohlen)</option>
          <option value="arial">Arial</option>
          <option value="helvetica">Helvetica</option>
          <option value="roboto">Roboto (wenn verfügbar)</option>
        </select>
        <span className="muted" style={{fontSize:12}}>Custom‑Fonts können wir als nächstes als Upload‑Feature ergänzen (wegen Lizenz/Grösse sauber lösen).</span>
      </label>

      <div style={{display:'grid',gap:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <span style={{color:'#334155',fontWeight:600}}>Hintergrund‑Bild (optional)</span>
          {theme.backgroundImageUrl ? (
            <button type="button" className="button ghost" onClick={()=>set({backgroundImageUrl:''})}>Entfernen</button>
          ) : null}
        </div>
        <UploadZone bucket="45ants_documents" folder="branding" accept="image/*" onUploaded={(url)=>set({backgroundImageUrl:url})} />
        {theme.backgroundImageUrl ? (
          <div className="muted" style={{fontSize:12,wordBreak:'break-all'}}>{theme.backgroundImageUrl}</div>
        ) : (
          <div className="muted" style={{fontSize:12}}>Kein Hintergrundbild gesetzt.</div>
        )}
      </div>

      <label style={{display:'flex', gap:10, alignItems:'center'}}>
        <input type="checkbox" checked={theme.titleHidden} onChange={e=>set({titleHidden:e.target.checked})} />
        <span style={{color:'#334155',fontWeight:600}}>Titel oben ausblenden (kein „Landing Page“ / keine Überschrift)</span>
      </label>

      <div className="muted" style={{fontSize:12}}>
        Tipp: Farben als HEX (#RRGGBB) eintragen. Änderungen wirken sofort in der Live-Vorschau.
      </div>
    </div>
  )
}

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
        <div className="card" style={{padding:14}}>
          <div className="h2" style={{marginBottom:8}}>Design / Einstellungen</div>
          <div className="muted" style={{marginBottom:12}}>Diese Einstellungen gelten für die öffentliche Landing-Page.</div>

          {/* Theme editor stored as a special component: { type: 'theme', data: {...} } */}
          <ThemeEditor
            components={components}
            onChange={(nextTheme)=>{
              setComponents(prev=>{
                const other = (prev||[]).filter(c=>c?.type!=='theme')
                return [{ type:'theme', data: nextTheme }, ...other]
              })
              // cache-bust the iframe reliably
              setPreviewTick(Date.now())
            }}
          />

          <div style={{marginTop:12, display:'flex', justifyContent:'flex-end'}}>
            <button className="btn" onClick={()=>setStep(1)}>← Zurück</button>
          </div>
        </div>
      )}{step===3 && (
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
            <iframe title='preview' src={`${publicUrl}${publicUrl.includes('?') ? '&' : '?'}t=${previewTick}`} />
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