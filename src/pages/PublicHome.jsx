import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function PublicHome(){
  const [loading,setLoading]=useState(true)
  const [first,setFirst]=useState(null)

  useEffect(()=>{
    let mounted=true
    ;(async()=>{
      try{
        const { data } = await supabase
          .from('landingpages_45ants')
          .select('id,name')
          .order('created_at',{ascending:false})
          .limit(1)
        if(!mounted) return
        setFirst(data?.[0]||null)
      } finally {
        if(mounted) setLoading(false)
      }
    })()
    return ()=>{mounted=false}
  },[])

  if(loading) return <div className='card' style={{maxWidth:720, margin:'40px auto'}}>Lade…</div>

  if(!first){
    return (
      <div className='card' style={{maxWidth:720, margin:'40px auto'}}>
        <h2 style={{marginTop:0}}>Noch keine Seite veröffentlicht</h2>
        <p className='muted'>Sobald der Admin eine Landingpage erstellt, wird sie hier angezeigt.</p>
      </div>
    )
  }

  return (
    <div className='card' style={{maxWidth:720, margin:'40px auto'}}>
      <h2 style={{marginTop:0}}>{first.name || 'Landingpage'}</h2>
      <a className='button' href={`/p/${first.id}`}>Öffnen</a>
    </div>
  )
}
