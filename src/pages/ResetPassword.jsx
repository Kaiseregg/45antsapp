import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword(){
  const nav = useNavigate()
  const [pw,setPw]=useState('')
  const [pw2,setPw2]=useState('')
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState('')
  const [msg,setMsg]=useState('')

  useEffect(()=>{
    // When opened from the recovery email, Supabase sets the session from the URL hash.
    supabase.auth.getSession().then(({data})=>{
      if(!data?.session){
        setErr('Reset‑Link ungültig oder abgelaufen. Bitte Passwort‑Reset erneut anfordern.')
      }
    })
  },[])

  async function save(e){
    e.preventDefault()
    setErr(''); setMsg('')
    if(!pw || pw.length < 8) return setErr('Passwort muss mindestens 8 Zeichen haben.')
    if(pw !== pw2) return setErr('Passwörter stimmen nicht überein.')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: pw })
    setLoading(false)
    if(error) return setErr(error.message)
    setMsg('Passwort gespeichert. Du wirst zum Login weitergeleitet…')
    setTimeout(()=>nav('/login',{replace:true}), 900)
  }

  return (
    <div className='card' style={{maxWidth:520, margin:'60px auto'}}>
      <h2>Passwort zurücksetzen</h2>
      <p className='muted' style={{marginTop:-6}}>Neues Passwort setzen und danach normal einloggen.</p>
      <form onSubmit={save} className='grid'>
        <input className='input' type='password' value={pw} onChange={e=>setPw(e.target.value)} placeholder='Neues Passwort (min. 8 Zeichen)' required />
        <input className='input' type='password' value={pw2} onChange={e=>setPw2(e.target.value)} placeholder='Passwort wiederholen' required />
        {err && <div className='card' style={{borderColor:'#ffb3b3'}}>{err}</div>}
        {msg && <div className='card' style={{borderColor:'#b6f2c2'}}>{msg}</div>}
        <button className='button' type='submit' disabled={loading}>{loading?'Speichern…':'Speichern'}</button>
      </form>
    </div>
  )
}
