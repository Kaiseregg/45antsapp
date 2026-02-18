import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function getTheme(components){
  const t = (components||[]).find(c=>c?.type==='theme')?.data || {}
  return {
    bg: t.bg ?? '#f5f7fb',
    maxWidth: t.maxWidth ?? 980,
    cardBg: t.cardBg ?? '#ffffff',
    cardBorder: t.cardBorder ?? '#e6eaf2',
    titleHidden: !!t.titleHidden,
  }
}

export default function PublicPage(){
  const { id } = useParams()
  const [sp] = useSearchParams()
  const [page,setPage]=useState(null)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    let alive=true
    ;(async()=>{
      setLoading(true)
      const { data, error } = await supabase
        .from('landingpages_45ants')
        .select('*')
        .eq('id', id)
        .single()
      if(!alive) return
      if(error){ setPage(null); setLoading(false); return }
      setPage(data)
      setLoading(false)
    })()
    return ()=>{ alive=false }
  },[id])

  const components = page?.components || []
  const theme = useMemo(()=>getTheme(components), [components])

  useEffect(()=>{
    const t = page?.name || '45Ants'
    document.title = t
  },[page?.name])

  const render = (c, idx)=>{
    if(!c) return null
    if(c.type==='theme') return null

    if(c.type==='heading'){
      const title = c.data?.title || ''
      const subtitle = c.data?.subtitle || ''
      return (
        <div className="card" key={idx} style={{background:theme.cardBg,borderColor:theme.cardBorder}}>
          {!theme.titleHidden && title && <h2 className="h2">{title}</h2>}
          {subtitle && <div className="muted">{subtitle}</div>}
        </div>
      )
    }

    if(c.type==='text'){
      const text = c.data?.text || ''
      return (
        <div className="card" key={idx} style={{background:theme.cardBg,borderColor:theme.cardBorder}}>
          <div style={{whiteSpace:'pre-wrap'}}>{text}</div>
        </div>
      )
    }

    if(c.type==='pdfgallery'){
      const urls = (c.data?.urls||'').split(',').map(s=>s.trim()).filter(Boolean)
      const titles = (c.data?.titles||'').split(',').map(s=>s.trim())
      const subs = (c.data?.subtitles||'').split(',').map(s=>s.trim())
      if(urls.length===0) return null
      return (
        <div className="card" key={idx} style={{background:theme.cardBg,borderColor:theme.cardBorder}}>
          <div className="stack">
            {urls.map((u,i)=>(
              <a className="btn" key={u+i} href={u} target="_blank" rel="noreferrer">
                <div style={{display:'flex',flexDirection:'column',gap:2,alignItems:'flex-start'}}>
                  <div>{titles[i] || `PDF ${i+1}`}</div>
                  {subs[i] ? <div style={{fontSize:12,opacity:.85}}>{subs[i]}</div> : null}
                </div>
              </a>
            ))}
          </div>
        </div>
      )
    }

    if(c.type==='image'){
      const url = c.data?.url || ''
      if(!url) return null
      const widthPct = Number(c.data?.widthPct ?? 100)
      const align = c.data?.align || 'center'
      return (
        <div className="card" key={idx} style={{background:theme.cardBg,borderColor:theme.cardBorder}}>
          <div style={{display:'flex',justifyContent: align==='left'?'flex-start':align==='right'?'flex-end':'center'}}>
            <img
              src={url}
              alt=""
              style={{width: `${Math.max(10, Math.min(100, widthPct))}%`, height:'auto', display:'block'}}
            />
          </div>
        </div>
      )
    }

    if(c.type==='video'){
      const url = c.data?.url || ''
      if(!url) return null
      const widthPct = Number(c.data?.widthPct ?? 100)
      const align = c.data?.align || 'center'
      const height = Number(c.data?.height ?? 420)
      return (
        <div className="card" key={idx} style={{background:theme.cardBg,borderColor:theme.cardBorder}}>
          <div style={{display:'flex',justifyContent: align==='left'?'flex-start':align==='right'?'flex-end':'center'}}>
            <div style={{width:`${Math.max(30, Math.min(100, widthPct))}%`}}>
              <div style={{position:'relative', paddingTop:'56.25%'}}>
                <iframe
                  src={url}
                  title="video"
                  style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', border:0, borderRadius:12, maxHeight: height}}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      )
    }

    if(c.type==='links'){
      const raw = c.data?.links || ''
      const items = raw.split(',').map(s=>s.trim()).filter(Boolean).map(x=>{
        const parts=x.split('|')
        return { label: (parts[0]||'Link').trim(), url:(parts[1]||parts[0]||'').trim() }
      })
      if(items.length===0) return null
      return (
        <div className="card" key={idx} style={{background:theme.cardBg,borderColor:theme.cardBorder}}>
          <div className="stack">
            {items.map((it,i)=>(
              <a key={i} className="btn" href={it.url} target="_blank" rel="noreferrer">{it.label}</a>
            ))}
          </div>
        </div>
      )
    }

    // fallback
    return null
  }

  if(loading){
    return <div className="publicWrap" style={{background:theme.bg}}><div className="publicContainer" style={{maxWidth: theme.maxWidth===9999 ? "none" : theme.maxWidth}}><div className="muted">Lädt…</div></div></div>
  }

  if(!page){
    return <div className="publicWrap" style={{background:theme.bg}}><div className="publicContainer" style={{maxWidth: theme.maxWidth===9999 ? "none" : theme.maxWidth}}><div className="muted">Nicht gefunden.</div></div></div>
  }

  // If someone appends ?admin=1 we still never show admin UI on public pages
  void sp

  return (
    <div className="publicWrap" style={{background:theme.bg}}>
      <div className="publicContainer" style={{maxWidth: theme.maxWidth===9999 ? "none" : theme.maxWidth}}>
        <div className="grid">
          {components.map(render)}
        </div>
      </div>
    </div>
  )
}
