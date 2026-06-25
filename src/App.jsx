import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

import Landing          from './pages/Landing'
import Login            from './pages/auth/Login'
import Register         from './pages/auth/Register'
import SupplierRegister from './pages/auth/SupplierRegister'
import CustomerDashboard from './pages/customer/Dashboard'
import NewRequest        from './pages/customer/NewRequest'
import RequestDetail     from './pages/customer/RequestDetail'
import SupplierDashboard from './pages/supplier/Dashboard'
import SupplierProfile   from './pages/supplier/Profile'
import SupplierMatches   from './pages/supplier/Matches'
import AdminDashboard    from './pages/admin/Dashboard'
import AdminSuppliers    from './pages/admin/Suppliers'
import AdminRequests     from './pages/admin/Requests'

function LoadingScreen() {
  return (
    <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0612' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div className="logo-orb animate-breathe" style={{ width:64, height:64 }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, fontWeight:600 }}>Loading SwifTrade…</p>
      </div>
    </div>
  )
}

function PrivateRoute({ children, roles }) {
  const { user, profile, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  if (!user)   return <Navigate to="/login" replace />
  if (roles && !roles.includes(profile?.role)) return <Navigate to="/" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, profile, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  if (user && profile) {
    if (profile.role === 'admin')    return <Navigate to="/admin" replace />
    if (profile.role === 'supplier') return <Navigate to="/supplier" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

export default function App() {
  const initialize = useAuthStore(s => s.initialize)
  useEffect(() => { initialize() }, [initialize])

  return (
    <Routes>
      <Route path="/"          element={<Landing />} />
      <Route path="/login"     element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register"  element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/register/supplier" element={<PublicRoute><SupplierRegister /></PublicRoute>} />

      <Route path="/dashboard"               element={<PrivateRoute roles={['customer']}><CustomerDashboard /></PrivateRoute>} />
      <Route path="/dashboard/request/new"   element={<PrivateRoute roles={['customer']}><NewRequest /></PrivateRoute>} />
      <Route path="/dashboard/request/:id"   element={<PrivateRoute roles={['customer']}><RequestDetail /></PrivateRoute>} />

      <Route path="/supplier"         element={<PrivateRoute roles={['supplier']}><SupplierDashboard /></PrivateRoute>} />
      <Route path="/supplier/profile" element={<PrivateRoute roles={['supplier']}><SupplierProfile /></PrivateRoute>} />
      <Route path="/supplier/matches" element={<PrivateRoute roles={['supplier']}><SupplierMatches /></PrivateRoute>} />

      <Route path="/admin"           element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/suppliers" element={<PrivateRoute roles={['admin']}><AdminSuppliers /></PrivateRoute>} />
      <Route path="/admin/requests"  element={<PrivateRoute roles={['admin']}><AdminRequests /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
