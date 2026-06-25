import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { timeAgo, formatZMW, formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function SupplierDashboard() {
  const nav = useNavigate()
  const { profile, supplier, signOut } = useAuthStore()
  const [matches, setMatches]   = useState([])
  const [offers, setOffers]     = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (supplier?.id) fetchAll()
  }, [supplier?.id])

  async function fetchAll() {
    const [{ data: m }, { data: o }] = await Promise.all([
      supabase.from('request_matches').select('*, requests(title, reference_code, category_id, location_province, location_city, budget_min_zmw, budget_max_zmw, deadline, status, categories(name,icon))').eq('supplier_id', supplier.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('offers').select('*, requests(title, reference_code)').eq('supplier_id', supplier.id).order('created_at', { ascending: false }).limit(10),
    ])
    setMatches(m || [])
    setOffers(o || [])
    setLoading(false)
  }

  const isPending   = supplier?.status === 'pending'
  const isSuspended = supplier?.status === 'suspended'
  const isActive    = supplier?.status === 'active'

  return (
    <div style={{ minHeight: '100vh', background: '#faf8ff' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid rgba(124,63,214,0.1)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-orb" style={{ width: 32, height: 32 }} />
          <span style={{ fontSize: 17, fontWeight: 800, color: '#1a1030' }}>SwifTrade</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6b5b78', background: 'rgba(124,63,214,0.08)', padding: '3px 10px', borderRadius: 999 }}>Supplier</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => nav('/supplier/profile')} style={{ fontSize: 12, fontWeight: 700, color: '#5a2ca0', background: 'rgba(124,63,214,0.08)', border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer' }}>Profile</button>
          <button onClick={() => { signOut(); nav('/') }} style={{ fontSize: 12, fontWeight: 700, color: '#6b5b78', background: 'rgba(107,91,120,0.08)', border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 20px' }}>

        {/* Status banner */}
        {isPending && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 16, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 24 }}>⏳</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>Pending Approval</div>
              <div style={{ fontSize: 13, color: '#92400e', opacity: 0.8 }}>Your registration is being reviewed by the SwifTrade team. You'll receive an email once approved.</div>
            </div>
          </div>
        )}

        {isSuspended && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: '16px 20px', marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#991b1b' }}>⚠️ Account Suspended</div>
            <div style={{ fontSize: 13, color: '#991b1b', opacity: 0.8, marginTop: 4 }}>{supplier?.suspension_reason || 'Contact SwifTrade support to restore your account.'}</div>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1030', letterSpacing: '-0.02em', marginBottom: 4 }}>{supplier?.business_name}</h1>
          <p style={{ fontSize: 13, color: '#6b5b78', fontWeight: 500 }}>{supplier?.registration_code} · {profile?.email}</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
          {[
            { icon: '🎯', label: 'Point Balance',   value: supplier?.point_balance ?? 300,      color: '#5a2ca0' },
            { icon: '📬', label: 'Total Matches',   value: supplier?.total_matches ?? 0,         color: '#1a1030' },
            { icon: '💬', label: 'Offers Sent',     value: offers.length,                        color: '#1a1030' },
            { icon: '✅', label: 'Deals Closed',    value: supplier?.deals_closed ?? 0,          color: '#15803d' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: '-0.02em', marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6b5b78' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Wallet */}
        <div style={{ background: 'linear-gradient(135deg, rgba(90,44,160,0.9), rgba(124,63,214,0.95))', borderRadius: 20, padding: '20px 24px', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Wallet Balance</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{supplier?.point_balance ?? 300} <span style={{ fontSize: 16, fontWeight: 600, opacity: 0.7 }}>pts</span></div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>25 pts per match engagement</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Subscription</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{supplier?.subscription_status || 'None'}</div>
            {supplier?.subscription_end && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Renews {formatDate(supplier.subscription_end)}</div>}
          </div>
        </div>

        {/* Recent matches */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1030' }}>Recent Matches</h2>
            <button onClick={() => nav('/supplier/matches')} style={{ fontSize: 12, fontWeight: 700, color: '#5a2ca0', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner spinner-dark" style={{ margin: '0 auto' }} /></div>
          ) : !isActive ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(124,63,214,0.04)', borderRadius: 18, border: '1.5px dashed rgba(124,63,214,0.15)' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
              <p style={{ fontSize: 13.5, color: '#6b5b78' }}>Matches will appear here once your account is approved.</p>
            </div>
          ) : matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(124,63,214,0.04)', borderRadius: 18, border: '1.5px dashed rgba(124,63,214,0.15)' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
              <p style={{ fontSize: 13.5, color: '#6b5b78' }}>No matches yet. They'll appear here when buyers post requests matching your categories.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {matches.slice(0, 5).map(m => (
                <div key={m.id} style={{ background: '#fff', border: '1.5px solid rgba(124,63,214,0.1)', borderRadius: 16, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(124,63,214,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{m.requests?.categories?.icon || '📋'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1030', marginBottom: 2 }}>{m.requests?.title}</div>
                    <div style={{ fontSize: 11, color: '#6b5b78', fontWeight: 500 }}>{m.requests?.reference_code} · {m.requests?.location_city || m.requests?.location_province || '—'} · {timeAgo(m.created_at)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: m.status === 'notified' ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)', color: m.status === 'notified' ? '#1d4ed8' : '#15803d' }}>{m.status}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#9d6cf0' }}>Score: {Math.round(m.total_score)}</span>
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
