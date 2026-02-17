
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { logEvent } from '../lib/analytics'

function YouTube({ url }){
  if(!url) return null
  let id=null
  try{
    const u=new URL(url)
    if(u.hostname.includes('youtu.be')) id=u.pathname.slice(1)
    else if(u.searchParams.get('v')) id=u.searchParams.get('v')
  }catch(e){}
  if(!id) return null
  return <div style={{position:'relative',paddingTop:'56.25%'}}><iframe src={`https://www.youtube.com/embed/${id}`} title='YouTube' allow='accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture' allowFullScreen style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0}}/></div>
}

export default function PublicPage(){
  const { id } = useParams()
  const [page,setPage]=useState(null)
  const [comps,setComps]=useState([])
  useEffect(()=>{ (async()=>{ const { data } = await supabase.from('landingpages_45ants').select('*').eq('id', id).maybeSingle(); setPage(data); setComps(data?.components||[]); logEvent({ page_id:id, event_type:'scan' }) })() },[id])
  function clickLog(url){ logEvent({ page_id:id, event_type:'click', target:url }) }
  return (
    <div className='grid' style={{gap:12}}>
      <h1>{page?.title||'Landing Page'}</h1>
      {comps.map((c,i)=> (
        <div key={i} className='card'>
          {c.type==='heading' && <h2>{c.data?.title}</h2>}
          {c.type==='text' && <p>{c.data?.text}</p>}
          {c.type==='image' && c.data?.url && (()=>{
            const widthPct = Math.min(100, Math.max(10, Number(c.data?.widthPct ?? 100)))
            const align = c.data?.align || 'center'
            const textAlign = align==='left' ? 'left' : align==='right' ? 'right' : 'center'
            return (
              <div style={{textAlign}}>
                <img
                  src={c.data.url}
                  alt=''
                  style={{width:`${widthPct}%`, maxWidth:'100%', height:'auto', display:'inline-block'}}
                />
              </div>
            )
          })()}
          {c.type==='images' && (
            <div className='grid grid-2'>{(c.data?.urls||'').split(',').map((u,ix)=>(<img key={ix} src={u.trim()} alt='' style={{width:'100%'}}/>))}</div>
          )}
          {c.type==='links' && ( ()=>{ const items=(c.data?.items||'').split(',').map(s=>s.trim()).filter(Boolean).map(x=>{ const p=x.split('|'); return { label:p[0]||p[1], url:p[1]||p[0] } }); return <div className='grid'>{items.map((it,ix)=>(<a key={ix} className='button' href={it.url} target='_blank' onClick={()=>clickLog(it.url)}>{it.label}</a>))}</div> })()}
          {c.type==='button' && c.data?.url && <a className='button' href={c.data.url} target='_blank' onClick={()=>clickLog(c.data.url)}>{c.data.label||'Öffnen'}</a>}
          {c.type==='video' && <YouTube url={c.data?.url} />}
          {c.type==='pdfgallery' && ( ()=>{ const arr=(c.data?.urls||'').split(',').map(s=>s.trim()).filter(Boolean); return <div className='grid grid-2'>{arr.map((u,ix)=>(<a key={ix} className='button' href={u} target='_blank' onClick={()=>clickLog(u)}>PDF {ix+1}</a>))}</div> })()}
          {['details','hours','team','testimonial','products'].includes(c.type) && <pre style={{whiteSpace:'pre-wrap'}}>{c.data?.text||''}</pre>}
        </div>
      ))}
    </div>
  )
}
