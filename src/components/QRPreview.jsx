import { useState } from 'react'
import useQRCode from '../hooks/useQRCode'

export default function QRPreview({ value, size }){
  const [fg,setFg]=useState('#000000')
  const [bg,setBg]=useState('#ffffff')
  const [scale,setScale]=useState(6)
  const [margin,setMargin]=useState(2)
  const { pngDataUrl, svgString } = useQRCode(value,{ color:fg, bgColor:bg, margin, scale })

  // Compact mode (table preview)
  if(size){
    return (
      <div style={{width:size,height:size,display:'grid',placeItems:'center',background:'#f5f6fa',borderRadius:12}}>
        {pngDataUrl && <img src={pngDataUrl} alt='qr' style={{width:size-18,height:size-18}}/>}
      </div>
    )
  }

  function dl(blob,name){
    const u=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=u; a.download=name; a.click()
    URL.revokeObjectURL(u)
  }

  return (
    <div className='card'>
      <h3>QR‑Code Vorschau</h3>
      <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{width:220,height:220,display:'grid',placeItems:'center',background:'#f5f6fa',borderRadius:12}}>
          {pngDataUrl && <img src={pngDataUrl} alt='qr' style={{width:190,height:190}}/>}
        </div>
        <div className='grid'>
          <label>Vordergrund <input type='color' value={fg} onChange={e=>setFg(e.target.value)} /></label>
          <label>Hintergrund <input type='color' value={bg} onChange={e=>setBg(e.target.value)} /></label>
          <label>Scale <input type='number' min='2' max='12' value={scale} onChange={e=>setScale(parseInt(e.target.value||'6',10))} /></label>
          <label>Margin <input type='number' min='0' max='8' value={margin} onChange={e=>setMargin(parseInt(e.target.value||'2',10))} /></label>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <button className='button' onClick={()=>fetch(pngDataUrl).then(r=>r.blob()).then(b=>dl(b,'qr.png'))}>PNG</button>
            <button className='button ghost' onClick={()=>dl(new Blob([svgString],{type:'image/svg+xml'}),'qr.svg')}>SVG</button>
          </div>
        </div>
      </div>
    </div>
  )
}
