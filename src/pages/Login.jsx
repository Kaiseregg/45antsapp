import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const nav = useNavigate()
  const [email,setEmail]=useState('')
  const [pw,setPw]=useState('')
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState('')
  const [info,setInfo]=useState('')

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      if(data?.session) nav('/dashboard',{replace:true})
    })
  },[])

  
  async function sendReset(){
    setErr('')
    setInfo('')
    if(!email) return setErr('Bitte E‑Mail eingeben, dann Passwort‑Reset senden.')
    const redirectTo = window.location.origin + '/reset-password'
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if(error) return setErr(error.message)
    setInfo('Reset‑Mail wurde gesendet. Link öffnen, neues Passwort setzen.')
  }

  async function submit(e){
    e.preventDefault()
    setErr('')
    setInfo('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    setLoading(false)
    if(error) return setErr(error.message)
    nav('/dashboard',{replace:true})
  }

  return (
    <div className='card' style={{maxWidth:420, margin:'60px auto'}}>
      <h2>Admin Login</h2>
      <p className='muted' style={{marginTop:-6}}>Login via Supabase Auth (kein Passwort mehr im Code).</p>
      <form onSubmit={submit} className='grid'>
        <input className='input' type='email' value={email} onChange={e=>setEmail(e.target.value)} placeholder='E‑Mail' required />
        <input className='input' type='password' value={pw} onChange={e=>setPw(e.target.value)} placeholder='Passwort' required />
        {err && <div className='card' style={{borderColor:'#ffb3b3'}}>{err}</div>}
        {info && <div className='card' style={{borderColor:'#b6f2c2'}}>{info}</div>}
        <button className='button' type='button' onClick={sendReset} style={{background:'#222'}}>Passwort vergessen?</button>
        <button className='button' type='submit' disabled={loading}>{loading?'Login…':'Login'}</button>
      </form>
    </div>
  )
}
