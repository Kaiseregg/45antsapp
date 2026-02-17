
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
export default function useQRCode(text, { color='#000', bgColor='#fff', margin=2, scale=6 }={}){
  const [png,setPng]=useState(null); const [svg,setSvg]=useState(null); const [err,setErr]=useState(null)
  useEffect(()=>{ let alive=true; (async()=>{ try{ const opts={ color:{dark:color, light:bgColor}, margin, scale, errorCorrectionLevel:'M' }; const d=await QRCode.toDataURL(text||'',opts); const s=await QRCode.toString(text||'',{...opts,type:'svg'}); if(alive){ setPng(d); setSvg(s) } }catch(e){ if(alive) setErr(e) } })(); return ()=>{alive=false} },[text,color,bgColor,margin,scale])
  return { pngDataUrl:png, svgString:svg, error:err }
}
