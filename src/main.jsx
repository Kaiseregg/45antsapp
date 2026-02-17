
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles.css'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Editor from './pages/Editor.jsx'
import PublicPage from './pages/PublicPage.jsx'
import Analytics from './pages/Analytics.jsx'
import SystemCheck from './pages/SystemCheck.jsx'
import { APP_VERSION, supabase } from './supabaseClient.js'

const RequireAuth = ({ children }) => {
  const [loading,setLoading]=useState(true)
  const [session,setSession]=useState(null)

  useEffect(()=>{
    let sub
    supabase.auth.getSession().then(({data})=>{
      setSession(data?.session||null)
      setLoading(false)
    })
    sub = supabase.auth.onAuthStateChange((_evt, sess)=>{
      setSession(sess)
    })
    return ()=>{ sub?.data?.subscription?.unsubscribe?.() }
  },[])

  if(loading) return <div className='card' style={{maxWidth:560, margin:'40px auto'}}>Lade…</div>
  return session ? children : <Navigate to='/login' replace />
}

function Nav(){
  const [session,setSession]=useState(null)
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>setSession(data?.session||null))
    const sub = supabase.auth.onAuthStateChange((_evt, sess)=>setSession(sess))
    return ()=>sub?.data?.subscription?.unsubscribe?.()
  },[])

  async function logout(){
    await supabase.auth.signOut()
    window.location.href='/login'
  }

  return (
    <div className='nav'>
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <a className='button' href='/dashboard'>Dashboard</a>
        <a className='button' href='/analytics'>Analytics</a>
        <a className='button' href='/system-check'>System‑Check</a>
        {session && <button className='button' onClick={logout} style={{background:'#222'}}>Logout</button>}
      </div>
      <div className='muted' style={{fontSize:12}}>v{APP_VERSION}</div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <div className='app'>
      <Nav/>
      <Routes>
        <Route path='/' element={<Navigate to='/login'/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/dashboard' element={<RequireAuth><Dashboard/></RequireAuth>} />
        <Route path='/editor' element={<RequireAuth><Navigate to='/dashboard' replace/></RequireAuth>} />
        <Route path='/editor/:id' element={<RequireAuth><Editor/></RequireAuth>} />
        <Route path='/p/:id' element={<PublicPage/>} />
        <Route path='/analytics' element={<RequireAuth><Analytics/></RequireAuth>} />
        <Route path='/system-check' element={<SystemCheck/>} />
      </Routes>
    </div>
  </BrowserRouter>
)
