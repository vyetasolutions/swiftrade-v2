import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { formatDate, timeAgo, REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS, truncate } from '../../lib/utils'
import toast from 'react-hot-toast'

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="stat-card">
      <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1030', letterSpacing: '-0.02em', marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1030', marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#6b5b78', fontWeight: 500 }}>{sub}</div>}
    </div>
  )
}

export default function CustomerDashboard() {
  const nav = useNavigate()
  const { profile, signOut } = useAuthStore()
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetchRequests()
    // Real-time updates
    const channel = supabase
      .channel('customer-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests', filter: `customer_id=eq.${profile?.id}` }, () => fetchRequests())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [profile?.id])

  async function fetchRequests() {
    if (!profile?.id) return
    const { data } = await supabase
      .from('requests')
      .select('*, categories(name,icon)')
      .eq('customer_id', profile.id)
      .order('created_at', { ascending: false })
    setRequests(data || [])
    setLoading(false)
  }

  const stats = {
    total:    requests.length,
    active:   requests.filter(r => !['draft','closed'].includes(r.status)).length,
    offers:   requests.reduce((a, r) => a + (r.offer_count || 0), 0),
    closed:   requests.filter(r => r.status === 'closed').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf8ff' }}>

      {/* Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid rgba(124,63,214,0.1)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-orb" style={{ width: 32, height: 32 }} />
          <span style={{ fontSize: 17, fontWeight: 800, color: '#1a1030', letterSpacing: '-0.01em' }}>SwifTrade</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#6b5b78' }}>{profile?.full_name}</span>
          <button onClick={() => { signOut(); nav('/') }} style={{ fontSize: 12, fontWeight: 700, color: '#5a2ca0', background: 'rgba(124,63,214,0.08)', border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1030', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {profile?.full_name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: 14, color: '#6b5b78', fontWeight: 500 }}>Here's your sourcing overview</p>
          </div>
          <button className="btn-sm" onClick={() => nav('/dashboard/request/new')}>+ New Request</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 36 }}>
          <StatCard icon="📋" label="Total Requests"  value={stats.total}  sub="All time" />
          <StatCard icon="⚡" label="Active"          value={stats.active} sub="In progress" />
          <StatCard icon="📬" label="Offers Received" value={stats.offers} sub="From suppliers" />
          <StatCard icon="✅" label="Completed"       value={stats.closed} sub="Deals closed" />
        </div>

        {/* Requests list */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1030', letterSpacing: '-0.01em' }}>Your Requests</h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="spinner spinner-dark" style={{ margin: '0 auto' }} />
            </div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(124,63,214,0.04)', borderRadius: 20, border: '1.5px dashed rgba(124,63,214,0.15)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1030', marginBottom: 6 }}>No requests yet</h3>
              <p style={{ fontSize: 13.5, color: '#6b5b78', marginBottom: 20 }}>Post your first sourcing request and get matched with suppliers.</p>
              <button className="btn-sm" onClick={() => nav('/dashboard/request/new')}>Post your first request</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {requests.map(req => (
                <div key={req.id}
                  onClick={() => nav(`/dashboard/request/${req.id}`)}
                  style={{ background: '#fff', border: '1.5px solid rgba(124,63,214,0.1)', borderRadius: 18, padding: '20px 22px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 16 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,63,214,0.25)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(90,44,160,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124,63,214,0.1)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(124,63,214,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {req.categories?.icon || '📋'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1030' }}>{req.title}</span>
                      <span className={REQUEST_STATUS_COLORS[req.status]}>{REQUEST_STATUS_LABELS[req.status]}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b5b78', fontWeight: 500 }}>
                      {req.reference_code} · {req.categories?.name || 'Uncategorised'} · {timeAgo(req.created_at)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {req.offer_count > 0 && (
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#5a2ca0' }}>{req.offer_count} offer{req.offer_count !== 1 ? 's' : ''}</div>
                    )}
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{formatDate(req.created_at)}</div>
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
