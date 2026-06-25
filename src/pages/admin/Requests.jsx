import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { timeAgo, formatZMW, REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS } from '../../lib/utils'

export default function AdminRequests() {
  const nav = useNavigate()
  const { signOut } = useAuthStore()
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')

  useEffect(() => { fetchRequests() }, [])

  async function fetchRequests() {
    const { data } = await supabase
      .from('requests')
      .select('*, profiles(full_name,email), categories(name,icon)')
      .order('created_at', { ascending: false })
      .limit(100)
    setRequests(data || [])
    setLoading(false)
  }

  const filtered = requests.filter(r => filter === 'all' || r.status === filter)

  return (
    <div style={{ minHeight: '100vh', background: '#faf8ff' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid rgba(124,63,214,0.1)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => nav('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#5a2ca0' }}>← Dashboard</button>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#1a1030' }}>All Requests</span>
        </div>
        <button onClick={() => { signOut(); nav('/') }} style={{ fontSize: 12, fontWeight: 700, color: '#6b5b78', background: 'rgba(107,91,120,0.08)', border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {['all','submitted','matching','offers_received','supplier_selected','closed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${filter === f ? '#7c3fd6' : 'rgba(124,63,214,0.14)'}`, background: filter === f ? 'rgba(124,63,214,0.1)' : 'transparent', color: filter === f ? '#5a2ca0' : '#6b5b78', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {f === 'all' ? 'All' : REQUEST_STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner spinner-dark" style={{ margin: '0 auto' }} /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(r => (
              <div key={r.id} style={{ background: '#fff', border: '1.5px solid rgba(124,63,214,0.1)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(124,63,214,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{r.categories?.icon || '📋'}</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1030' }}>{r.title}</span>
                    <span className={REQUEST_STATUS_COLORS[r.status]}>{REQUEST_STATUS_LABELS[r.status]}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6b5b78', fontWeight: 500 }}>{r.reference_code} · {r.profiles?.full_name} · {timeAgo(r.created_at)}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#5a2ca0' }}>{r.match_count || 0} matches · {r.offer_count || 0} offers</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{[r.location_city, r.location_province].filter(Boolean).join(', ') || '—'}</div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(124,63,214,0.04)', borderRadius: 18 }}>
                <p style={{ fontSize: 14, color: '#6b5b78' }}>No requests found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
