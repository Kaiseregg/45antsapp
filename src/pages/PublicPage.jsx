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
    // v1.0.8
    backgroundImageUrl: t.backgroundImageUrl ?? '',
    fontFamily: t.fontFamily ?? 'system',
    textColor: t.textColor ?? '#0f172a',
    headingColor: t.headingColor ?? '#0b1220',
    linkColor: t.linkColor ?? '#2563eb',
    headingAlign: t.headingAlign ?? 'left',
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

  // Track a "scan" (= page opened via QR) once per load.
  useEffect(()=>{
    if(!page?.id) return
    ;(async()=>{
      try{
        await supabase.from('analytics_45ants').insert({
          page_id: page.id,
          event_type: 'scan',
          target: window.location.pathname,
          referrer: document.referrer || null,
        })
      }catch(e){
        // analytics should never break the page
      }
    })()
  }, [page?.id])

  const trackClick = async (target) => {
    try{
      await supabase.from('analytics_45ants').insert({
        page_id: page.id,
        event_type: 'click',
        target: String(target||''),
        referrer: document.referrer || null,
      })
    }catch(e){
      // ignore
    }
  }

  const components = page?.components || []
  const theme = useMemo(()=>getTheme(components), [components])

  const fontStack = useMemo(()=>{
    switch(theme.fontFamily){
      case 'arial': return 'Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
      case 'helvetica': return 'Helvetica, Arial, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
      case 'roboto': return 'Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif'
      default: return 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'
    }
  }, [theme.fontFamily])

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
          {title && <h2 className="h2" style={{color: theme.headingColor, textAlign: theme.headingAlign}}>{title}</h2>}
          {subtitle && <div className="muted">{subtitle}</div>}
        </div>
      )
    }

    if(c.type==='text'){
      const text = c.data?.text || ''
      return (
        <div className="card" key={idx} style={{background:theme.cardBg,borderColor:theme.cardBorder}}>
          <div style={{whiteSpace:'pre-wrap',fontSize:theme.textSize}}>{text}</div>
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
          <div className="stack" style={{fontSize:theme.linkSize}}>
            {urls.map((u,i)=>(
              <a className="btn" key={u+i} href={u} target="_blank" rel="noreferrer" onClick={()=>trackClick(u)}>
                <div style={{display:'flex',flexDirection:'column',gap:2,alignItems:'flex-start'}}>
                  <div style={{fontWeight:900, color: theme.linkColor}}>{titles[i] || `PDF ${i+1}`}</div>
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
      const embed = toYouTubeEmbed(url)
      const widthPct = Number(c.data?.widthPct ?? 100)
      const align = c.data?.align || 'center'
      const height = Number(c.data?.height ?? 420)
      return (
        <div className="card" key={idx} style={{background:theme.cardBg,borderColor:theme.cardBorder}}>
          <div style={{display:'flex',justifyContent: align==='left'?'flex-start':align==='right'?'flex-end':'center'}}>
            <div style={{width:`${Math.max(30, Math.min(100, widthPct))}%`}}>
              <div style={{position:'relative', paddingTop:'56.25%'}}>
                <iframe
                  src={embed}
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

    if(c.type==='testimonial'){
      const text = c.data?.text || ''
      if(!text) return null
      return (
        <div className="card" key={idx} style={{background:theme.cardBg,borderColor:theme.cardBorder}}>
          <div style={{fontWeight:900, marginBottom:6, color: theme.headingColor}}>Info</div>
          <div style={{whiteSpace:'pre-wrap',fontSize:theme.textSize}}>{text}</div>
        </div>
      )
    }

    if(c.type==='images'){
      const items = Array.isArray(c.data?.items)
        ? c.data.items
        : (c.data?.urls||'')
            .split(',')
            .map(s=>s.trim())
            .filter(Boolean)
            .map(src=>({src, href:''}))

      if(items.length===0) return null
      const cols = Math.max(1, Math.min(4, Number(c.data?.cols||2)))
      const title = (c.data?.title||'').trim()
      return (
        <div className="card" key={idx} style={{background:theme.cardBg,borderColor:theme.cardBorder}}>
          {title ? <div style={{fontWeight:900, marginBottom:10, color: theme.headingColor}}>{title}</div> : null}
          <div style={{display:'grid', gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:12}}>
            {items.map((it,i)=> (
              <a
                key={(it.src||'')+i}
                href={it.href || it.src}
                target="_blank"
                rel="noreferrer"
                onClick={()=>trackClick(it.href || it.src)}
                style={{display:'block'}}
                title={it.href ? 'Link öffnen' : 'Bild öffnen'}
              >
                <img src={it.src} alt="" style={{width:'100%',height:'auto',borderRadius:12,display:'block'}} />
              </a>
            ))}
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
          <div className="stack" style={{fontSize:theme.linkSize}}>
            {items.map((it,i)=>(
              <a key={i} className="btn" href={it.url} target="_blank" rel="noreferrer" onClick={()=>trackClick(it.url)} style={{color: theme.linkColor, fontWeight:900}}>{it.label}</a>
            ))}
          </div>
        </div>
      )
    }

    // fallback
    return null
  }

  if(loading){
    return <div className="publicWrap" style={{backgroundColor:theme.bg, fontFamily:fontStack, color:theme.textColor}}><div className="publicContainer" style={{maxWidth: theme.maxWidth===9999 ? "none" : theme.maxWidth}}><div className="muted">Lädt…</div></div></div>
  }

  if(!page){
    return <div className="publicWrap" style={{backgroundColor:theme.bg, fontFamily:fontStack, color:theme.textColor}}><div className="publicContainer" style={{maxWidth: theme.maxWidth===9999 ? "none" : theme.maxWidth}}><div className="muted">Nicht gefunden.</div></div></div>
  }

  // If someone appends ?admin=1 we still never show admin UI on public pages
  void sp

  return (
    <div className="publicWrap" style={{
      backgroundColor:theme.bg,
      backgroundImage: theme.backgroundImageUrl ? `url(${theme.backgroundImageUrl})` : undefined,
      backgroundSize:'cover',
      backgroundPosition:'center',
      backgroundRepeat:'no-repeat',
      fontFamily:fontStack,
      color:theme.textColor,
    }}>
      <div className="publicContainer" style={{maxWidth: theme.maxWidth===9999 ? "none" : theme.maxWidth}}>
        <div className="grid">
          {components.map(render)}
        </div>
      </div>
    </div>
  )
}

function toYouTubeEmbed(url){
  try{
    if(url.includes('youtube.com/embed/')) return url
    const u = new URL(url)
    if(u.hostname.includes('youtu.be')){
      const id = u.pathname.replace('/','').trim()
      return `https://www.youtube-nocookie.com/embed/${id}`
    }
    if(u.hostname.includes('youtube.com')){
      const id = u.searchParams.get('v')
      if(id) return `https://www.youtube-nocookie.com/embed/${id}`
    }
  } catch(e){
    // ignore
  }
  return url
}
