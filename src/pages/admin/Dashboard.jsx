import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { timeAgo } from '../../lib/utils'

export default function AdminDashboard() {
  const nav = useNavigate()
  const { profile, signOut } = useAuthStore()
  const [stats, setStats]     = useState({})
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [
      { count: totalRequests },
      { count: totalSuppliers },
      { count: pendingSuppliers },
      { count: activeSuppliers },
      { data: pendingList },
    ] = await Promise.all([
      supabase.from('requests').select('*', { count: 'exact', head: true }),
      supabase.from('suppliers').select('*', { count: 'exact', head: true }),
      supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('suppliers').select('*, profiles(full_name,email,phone)').eq('status', 'pending').order('created_at', { ascending: false }),
    ])
    setStats({ totalRequests, totalSuppliers, pendingSuppliers, activeSuppliers })
    setPending(pendingList || [])
    setLoading(false)
  }

  async function approve(id) {
    await supabase.from('suppliers').update({ status: 'active' }).eq('id', id)
    fetchAll()
  }

  async function reject(id) {
    await supabase.from('suppliers').update({ status: 'rejected' }).eq('id', id)
    fetchAll()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf8ff' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid rgba(124,63,214,0.1)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-orb" style={{ width: 32, height: 32 }} />
          <span style={{ fontSize: 17, fontWeight: 800, color: '#1a1030' }}>SwifTrade</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#5a2ca0,#7c3fd6)', padding: '3px 10px', borderRadius: 999 }}>Admin</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => nav('/admin/suppliers')} style={{ fontSize: 12, fontWeight: 700, color: '#5a2ca0', background: 'rgba(124,63,214,0.08)', border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer' }}>Suppliers</button>
          <button onClick={() => nav('/admin/requests')}  style={{ fontSize: 12, fontWeight: 700, color: '#5a2ca0', background: 'rgba(124,63,214,0.08)', border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer' }}>Requests</button>
          <button onClick={() => { signOut(); nav('/') }} style={{ fontSize: 12, fontWeight: 700, color: '#6b5b78', background: 'rgba(107,91,120,0.08)', border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1030', marginBottom: 4 }}>Admin Dashboard</h1>
          <p style={{ fontSize: 13, color: '#6b5b78' }}>Platform overview and supplier approvals</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
          {[
            { icon: '📋', label: 'Total Requests',    value: stats.totalRequests   ?? '—' },
            { icon: '🏢', label: 'Total Suppliers',   value: stats.totalSuppliers  ?? '—' },
            { icon: '✅', label: 'Active Suppliers',  value: stats.activeSuppliers ?? '—' },
            { icon: '⏳', label: 'Pending Approval',  value: stats.pendingSuppliers ?? '—', highlight: true },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderColor: s.highlight && pending.length > 0 ? 'rgba(245,158,11,0.3)' : undefined }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.highlight && pending.length > 0 ? '#92400e' : '#1a1030', letterSpacing: '-0.02em', marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6b5b78' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pending approvals */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1030', marginBottom: 14 }}>
            Pending Approvals {pending.length > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e', background: 'rgba(245,158,11,0.15)', padding: '2px 8px', borderRadius: 999, marginLeft: 6 }}>{pending.length}</span>}
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner spinner-dark" style={{ margin: '0 auto' }} /></div>
          ) : pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(34,197,94,0.05)', borderRadius: 18, border: '1.5px dashed rgba(34,197,94,0.2)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <p style={{ fontSize: 14, color: '#15803d', fontWeight: 600 }}>All caught up — no pending approvals</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pending.map(s => (
                <div key={s.id} style={{ background: '#fff', border: '1.5px solid rgba(245,158,11,0.2)', borderRadius: 18, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1030', marginBottom: 3 }}>{s.business_name}</div>
                    <div style={{ fontSize: 12, color: '#6b5b78', fontWeight: 500 }}>{s.profiles?.full_name} · {s.profiles?.email}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.registration_code} · {timeAgo(s.created_at)}</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b5b78', fontWeight: 500, minWidth: 120 }}>
                    <div>{s.sourcing_scope}</div>
                    {s.description && <div style={{ marginTop: 2, opacity: 0.7 }}>{s.description.slice(0, 60)}…</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => reject(s.id)}  style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                    <button onClick={() => approve(s.id)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #5a2ca0, #7c3fd6)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Approve</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
