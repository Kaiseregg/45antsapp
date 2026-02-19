
import UploadZone from './UploadZone'

export default function EditorCard({ component, onChange, onMoveUp, onMoveDown, onDelete }){
  const { type, data={} } = component
  const tf=(label,key)=>(
    <label style={{display:'grid',gap:6}}>
      <span style={{color:'#334155',fontWeight:600}}>{label}</span>
      <input className='input' value={data[key]||''} onChange={e=>onChange({...data,[key]:e.target.value})} />
    </label>
  )
  const appendUrl = (key, url) => {
    const cur = (data[key]||'').split(',').map(s=>s.trim()).filter(Boolean)
    if(url && !cur.includes(url)) cur.push(url)
    onChange({ ...data, [key]: cur.join(', ') })
  }
  return (
    <div className='card'>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <strong>{type}</strong>
        <div style={{display:'flex',gap:6}}>
          <button type='button' className='button ghost' onClick={onMoveUp}>▲</button>
          <button type='button' className='button ghost' onClick={onMoveDown}>▼</button>
          <button
            type='button'
            className='button danger ghost'
            title='Komponente löschen'
            onClick={()=>{ if(confirm('Komponente wirklich löschen?')) onDelete?.() }}
          >🗑</button>
        </div>
      </div>
      <div className='grid' style={{marginTop:12}}>
        {type==='heading' && tf('Titel','title')}
        {type==='text' && tf('Text','text')}
        {type==='image' && (
          <div className='grid' style={{gap:10}}>
            {tf('Bild URL','url')}
            <UploadZone onUrl={url=>onChange({...data,url})} />
            <div className='grid' style={{gridTemplateColumns:'1fr 1fr',gap:10}}>
              <label style={{display:'grid',gap:6}}>
                <span style={{color:'#334155',fontWeight:600}}>Breite (%)</span>
                <input
                  className='input'
                  type='number'
                  min='10'
                  max='100'
                  value={data.widthPct ?? 100}
                  onChange={e=>onChange({ ...data, widthPct: Number(e.target.value||100) })}
                />
              </label>
              <label style={{display:'grid',gap:6}}>
                <span style={{color:'#334155',fontWeight:600}}>Ausrichtung</span>
                <select className='input' value={data.align || 'center'} onChange={e=>onChange({ ...data, align: e.target.value })}>
                  <option value='left'>Links</option>
                  <option value='center'>Zentriert</option>
                  <option value='right'>Rechts</option>
                </select>
              </label>
            </div>
          </div>
        )}
        {type==='images' && (
          <div className='grid' style={{gap:10}}>
            {tf('Titel (optional)','title')}
            {tf('Bild-URLs (Komma getrennt)','urls')}
            <UploadZone accept='image/*' onUrl={url=>appendUrl('urls', url)} />
            <div className='grid' style={{gridTemplateColumns:'1fr 1fr',gap:10}}>
              <label style={{display:'grid',gap:6}}>
                <span style={{color:'#334155',fontWeight:600}}>Spalten</span>
                <select className='input' value={data.cols ?? 2} onChange={e=>onChange({ ...data, cols: Number(e.target.value||2) })}>
                  {[1,2,3,4].map(n=>(<option key={n} value={n}>{n}</option>))}
                </select>
              </label>
              <div style={{display:'grid',gap:6,alignContent:'end'}}>
                <div style={{color:'#334155',fontSize:12}}>Klick auf Bild öffnet es in neuem Tab.</div>
              </div>
            </div>
          </div>
        )}
        {type==='links' && tf('Links (Text|URL, Komma)','links')}
        {type==='button' && (<><label>Label<input className='input' value={data.label||''} onChange={e=>onChange({...data,label:e.target.value})} /></label>{tf('URL','url')}</>)}
        {type==='video' && (
          <div className='grid' style={{gap:10}}>
            {tf('Titel (optional)','title')}
            {tf('YouTube / Video URL (Embed)','url')}
            <div className='grid' style={{gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
              <label style={{display:'grid',gap:6}}>
                <span style={{color:'#334155',fontWeight:600}}>Breite (%)</span>
                <input
                  className='input'
                  type='number'
                  min='30'
                  max='100'
                  value={data.widthPct ?? 100}
                  onChange={e=>onChange({ ...data, widthPct: Number(e.target.value||100) })}
                />
              </label>
              <label style={{display:'grid',gap:6}}>
                <span style={{color:'#334155',fontWeight:600}}>Ausrichtung</span>
                <select className='input' value={data.align || 'center'} onChange={e=>onChange({ ...data, align: e.target.value })}>
                  <option value='left'>Links</option>
                  <option value='center'>Zentriert</option>
                  <option value='right'>Rechts</option>
                </select>
              </label>
              <label style={{display:'grid',gap:6}}>
                <span style={{color:'#334155',fontWeight:600}}>Max-Höhe (px)</span>
                <input
                  className='input'
                  type='number'
                  min='200'
                  max='1200'
                  value={data.height ?? 420}
                  onChange={e=>onChange({ ...data, height: Number(e.target.value||420) })}
                />
              </label>
            </div>
            <div style={{color:'#334155',fontSize:12}}>
              Hinweis: Watch-Links werden automatisch in einen Embed-Link umgewandelt (youtube‑nocookie).
            </div>
          </div>
        )}
        {type==='pdfgallery' && (
          <div className='grid' style={{gap:10}}>
            {tf('PDF-URLs (Komma)','urls')}
            {tf('PDF-Titel (Komma, optional)','titles')}
            {tf('PDF-Untertitel (Komma, optional)','subtitles')}
            <UploadZone accept='application/pdf' onUrl={url=>appendUrl('urls', url)} />
            <div style={{color:'#334155',fontSize:12}}>Tipp: PDFs werden in deinen Supabase‑Bucket hochgeladen und hier automatisch ergänzt.</div>
          </div>
        )}
        {type==='testimonial' && tf('Freitext','text')}
        {['details','hours','team','products','button'].includes(type) && (
          <div className='muted' style={{fontSize:12}}>
            Diese Komponente ist in v1.0.8 nicht mehr im Picker (Alt-Daten bleiben aber bestehen).
          </div>
        )}
      </div>
    </div>
  )
}
