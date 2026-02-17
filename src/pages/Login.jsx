
import { useState, useEffect } from 'react'
import { ADMIN_PASS } from '../supabaseClient'
export default function Login(){
  const [pw,setPw]=useState('')
  useEffect(()=>{ if(localStorage.getItem('admin_ok')==='1'){ window.location.href='/dashboard' } },[])
  function submit(e){ e.preventDefault(); if(pw===ADMIN_PASS){ localStorage.setItem('admin_ok','1'); window.location.href='/dashboard' } else alert('Falsches Passwort') }
  return (
    <div className='card' style={{maxWidth:360, margin:'60px auto'}}>
      <h2>Login</h2>
      <form onSubmit={submit} className='grid'>
        <input className='input' type='password' value={pw} onChange={e=>setPw(e.target.value)} placeholder='Admin‑Passwort' />
        <button className='button' type='submit'>Login</button>
      </form>
    </div>
  )
}
