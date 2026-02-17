import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useLocation,
  Link,
  Outlet,
} from 'react-router-dom'

import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from './supabaseClient'

import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import PublicPage from './pages/PublicPage'
import PublicHome from './pages/PublicHome'
import Login from './pages/Login'
import Analytics from './pages/Analytics'
import SystemCheck from './pages/SystemCheck'
import Settings from './pages/Settings'
import BrandingBootstrap from './components/BrandingBootstrap'

// --- Auth guard ---
function RequireAuth({ children }) {
  const location = useLocation()
  if (!window.__SESSION_READY__) return <div className='card' style={{maxWidth:720, margin:'40px auto'}}>Lade…</div>
  const session = window.__SUPA_SESSION__
  if (!session) return <Navigate to='/login' replace state={{ from: location }} />
  return children
}

function Layout() {
  const location = useLocation()
  const [session, setSession] = React.useState(null)

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session)
      window.__SUPA_SESSION__ = data.session
      window.__SESSION_READY__ = true
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      window.__SUPA_SESSION__ = s
      window.__SESSION_READY__ = true
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  React.useEffect(() => {
    const adminPaths = ['/login', '/dashboard', '/editor', '/analytics', '/system-check', '/settings']
    const isAdmin = adminPaths.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'))
    document.body.classList.remove('theme-admin', 'theme-public')
    document.body.classList.add(isAdmin ? 'theme-admin' : 'theme-public')
  }, [location.pathname])

  async function onLogout() {
    await supabase.auth.signOut()
  }

  const brand = window.__BRANDING__
  const title = brand?.appName
    ? `${brand.appName} v${String(brand.appVersion || '').replace(/^v/, '')}`
    : '45AntsApp v1.0'

  return (
    <>
      <div style={{
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ fontWeight: 800 }}>{title}</div>
        <div style={{ flex: 1 }} />
        <Link className='tab' to='/'>Public</Link>
        <Link className='tab' to='/dashboard'>Dashboard</Link>
        <Link className='tab' to='/analytics'>Analytics</Link>
        <Link className='tab' to='/system-check'>System-Check</Link>
        <Link className='tab' to='/settings'>Settings</Link>
        {session ? (
          <button className='tab' onClick={onLogout}>Logout</button>
        ) : (
          <Link className='tab' to='/login'>Login</Link>
        )}
      </div>
      <div className='container'>
        <Outlet />
      </div>
    </>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <PublicHome /> },
      { path: 'p/:id', element: <PublicPage /> },
      { path: 'login', element: <Login /> },
      { path: 'dashboard', element: <RequireAuth><Dashboard /></RequireAuth> },
      { path: 'editor/:id', element: <RequireAuth><Editor /></RequireAuth> },
      { path: 'analytics', element: <RequireAuth><Analytics /></RequireAuth> },
      { path: 'system-check', element: <RequireAuth><SystemCheck /></RequireAuth> },
      { path: 'settings', element: <RequireAuth><Settings /></RequireAuth> },
      { path: '*', element: <Navigate to='/' replace /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <BrandingBootstrap>
        <RouterProvider router={router} />
      </BrandingBootstrap>
    </SessionContextProvider>
  </React.StrictMode>
)
