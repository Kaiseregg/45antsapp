
import { useRef, useState } from 'react'
import { supabase, BUCKET } from '../supabaseClient'

// Simple Supabase Storage uploader.
// - onUrl(publicUrl)
// - accept: input accept string, e.g. 'image/*' or 'application/pdf'
export default function UploadZone({ onUrl, accept }){
  const [drag,setDrag]=useState(false)
  const ref=useRef()
  async function handle(files){
    const f=files?.[0]; if(!f) return

    // Basic file-type guard (best-effort, browser-provided mime)
    if(accept && f.type){
      const ok = accept.split(',').some(a=>{
        const t=a.trim();
        if(!t) return false
        if(t==='*/*') return true
        if(t.endsWith('/*')) return f.type.startsWith(t.slice(0,-1))
        return f.type===t
      })
      if(!ok){
        alert('Dateityp nicht erlaubt')
        return
      }
    }

    const path = `uploads/${Date.now()}_${f.name}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, f, { upsert:true })
    if(error){ alert('Upload Fehler: '+error.message); return }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    onUrl?.(data.publicUrl)
  }
  return (
    <div className={'upload'+(drag?' drag':'')}
      onDragOver={e=>{e.preventDefault(); setDrag(true)}}
      onDragLeave={()=>setDrag(false)}
      onDrop={e=>{e.preventDefault(); setDrag(false); handle(e.dataTransfer.files)}}>
      <div>Hierher ziehen oder wählen</div>
      <button type='button' onClick={()=>ref.current.click()}>Datei auswählen</button>
      <input ref={ref} type='file' accept={accept||undefined} style={{display:'none'}} onChange={e=>handle(e.target.files)} />
    </div>
  )
}
