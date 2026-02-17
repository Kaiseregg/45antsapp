
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles.css'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Editor from './pages/Editor.jsx'
import PublicPage from './pages/PublicPage.jsx'
import Analytics from './pages/Analytics.jsx'
import SystemCheck from './pages/SystemCheck.jsx'
import { APP_VERSION } from './supabaseClient.js'

const RequireAuth = ({ children }) => {
  const ok = localStorage.getItem('admin_ok')==='1'
  return ok ? children : <Navigate to='/login' replace />
}

function Nav(){
  return (
    <div className='nav'>
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <a className='button' href='/dashboard'>Dashboard</a>
        <a className='button' href='/analytics'>Analytics</a>
        <a className='button' href='/system-check'>System‑Check</a>
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
        <Route path='/editor' element={<RequireAuth><Editor/></RequireAuth>} />
        <Route path='/p/:id' element={<PublicPage/>} />
        <Route path='/analytics' element={<RequireAuth><Analytics/></RequireAuth>} />
        <Route path='/system-check' element={<SystemCheck/>} />
      </Routes>
    </div>
  </BrowserRouter>
)
