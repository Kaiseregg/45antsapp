import { useEffect, useState } from 'react'
import { supabase, BUCKET } from '../supabaseClient'
import { getBranding, setBranding, applyBrandingToDocument } from '../lib/branding'

export default function Settings(){
  const [appName,setAppName]=useState('')
  const [faviconUrl,setFaviconUrl]=useState('')
  const [status,setStatus]=useState('')
  const [busy,setBusy]=useState(false)

  useEffect(()=>{
    ;(async()=>{
      const b = await getBranding()
      setAppName(b.appName||'')
      setFaviconUrl(b.faviconUrl||'')
    })()
  },[])

  async function onUploadFavicon(file){
    if(!file) return
    setBusy(true)
    setStatus('Upload läuft…')
    try{
      const ext = file.name.split('.').pop() || 'png'
      const path = `branding/favicon-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
      if(upErr) throw upErr
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const url = data?.publicUrl
      setFaviconUrl(url)
      setStatus('Favicon hochgeladen.')
    }catch(e){
      console.error(e)
      setStatus('Upload fehlgeschlagen (siehe Console).')
    } finally {
      setBusy(false)
    }
  }

  async function onSave(){
    setBusy(true)
    setStatus('Speichern…')
    try{
      await setBranding({ appName, faviconUrl })
      const b = { appName, faviconUrl, appVersion: (window.__BRANDING__?.appVersion || '1.0') }
      window.__BRANDING__ = b
      applyBrandingToDocument(b)
      setStatus('Gespeichert ✅')
    }catch(e){
      console.error(e)
      setStatus('Speichern fehlgeschlagen (siehe Console).')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className='container'>
      <h1>Einstellungen</h1>
      <div className='card' style={{maxWidth:720}}>
        <label className='label'>App-Name</label>
        <input className='input' value={appName} onChange={(e)=>setAppName(e.target.value)} placeholder='45AntsApp' />

        <div style={{height:16}} />

        <label className='label'>Favicon URL</label>
        <input className='input' value={faviconUrl} onChange={(e)=>setFaviconUrl(e.target.value)} placeholder='https://…/favicon.png' />
        <div className='muted' style={{marginTop:8}}>Optional: oder lade eine Datei hoch.</div>
        <input
          type='file'
          accept='image/png,image/svg+xml,image/x-icon,image/jpeg'
          disabled={busy}
          onChange={(e)=>onUploadFavicon(e.target.files?.[0])}
          style={{marginTop:8}}
        />

        <div style={{height:16}} />
        <button className='button' onClick={onSave} disabled={busy}>Speichern</button>
        {status && <div className='muted' style={{marginTop:10}}>{status}</div>}
      </div>
    </div>
  )
}
