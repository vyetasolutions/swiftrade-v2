import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { timeAgo, SUPPLIER_STATUS_LABELS, SUPPLIER_STATUS_COLORS } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function AdminSuppliers() {
  const nav = useNavigate()
  const { signOut } = useAuthStore()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [search, setSearch]       = useState('')

  useEffect(() => { fetchSuppliers() }, [])

  async function fetchSuppliers() {
    const { data } = await supabase
      .from('suppliers')
      .select('*, profiles(full_name,email,phone)')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
    setSuppliers(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status, reason) {
    const update = { status }
    if (reason) update.suspension_reason = reason
    const { error } = await supabase.from('suppliers').update(update).eq('id', id)
    if (error) { toast.error('Failed to update status.'); return }
    toast.success(`Supplier ${status}.`)
    fetchSuppliers()
  }

  async function addPoints(id, pts) {
    const sup = suppliers.find(s => s.id === id)
    if (!sup) return
    const newBal = (sup.point_balance || 0) + pts
    await supabase.from('suppliers').update({ point_balance: newBal, points_purchased: (sup.points_purchased || 0) + pts }).eq('id', id)
    toast.success(`Added ${pts} points.`)
    fetchSuppliers()
  }

  const filtered = suppliers
    .filter(s => filter === 'all' || s.status === filter)
    .filter(s => !search || s.business_name?.toLowerCase().includes(search.toLowerCase()) || s.registration_code?.toLowerCase().includes(search.toLowerCase()) || s.profiles?.email?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ minHeight: '100vh', background: '#faf8ff' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid rgba(124,63,214,0.1)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => nav('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#5a2ca0' }}>← Dashboard</button>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#1a1030' }}>Suppliers</span>
        </div>
        <button onClick={() => { signOut(); nav('/') }} style={{ fontSize: 12, fontWeight: 700, color: '#6b5b78', background: 'rgba(107,91,120,0.08)', border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input className="input-field" style={{ maxWidth: 280 }} placeholder="Search by name, code or email…" value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ display: 'flex', gap: 6 }}>
            {['all','pending','active','suspended'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${filter === f ? '#7c3fd6' : 'rgba(124,63,214,0.14)'}`, background: filter === f ? 'rgba(124,63,214,0.1)' : 'transparent', color: filter === f ? '#5a2ca0' : '#6b5b78', fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>{f}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner spinner-dark" style={{ margin: '0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(124,63,214,0.04)', borderRadius: 18 }}>
            <p style={{ fontSize: 14, color: '#6b5b78' }}>No suppliers found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(s => (
              <div key={s.id} style={{ background: '#fff', border: '1.5px solid rgba(124,63,214,0.1)', borderRadius: 18, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1030' }}>{s.business_name}</span>
                      <span className={SUPPLIER_STATUS_COLORS[s.status]}>{SUPPLIER_STATUS_LABELS[s.status]}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b5b78', fontWeight: 500 }}>{s.profiles?.full_name} · {s.profiles?.email}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.registration_code} · {timeAgo(s.created_at)} · {s.point_balance} pts</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
                    {s.status === 'pending'   && <button onClick={() => updateStatus(s.id, 'active')} style={{ padding: '7px 14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#5a2ca0,#7c3fd6)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Approve</button>}
                    {s.status === 'pending'   && <button onClick={() => updateStatus(s.id, 'rejected')} style={{ padding: '7px 14px', borderRadius: 10, border: '1.5px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Reject</button>}
                    {s.status === 'active'    && <button onClick={() => { const r = prompt('Reason for suspension?'); if (r) updateStatus(s.id, 'suspended', r) }} style={{ padding: '7px 14px', borderRadius: 10, border: '1.5px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Suspend</button>}
                    {s.status === 'suspended' && <button onClick={() => updateStatus(s.id, 'active', '')} style={{ padding: '7px 14px', borderRadius: 10, border: 'none', background: 'rgba(34,197,94,0.1)', color: '#15803d', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Restore</button>}
                    <button onClick={() => { const p = prompt('Points to add?'); if (p && !isNaN(Number(p))) addPoints(s.id, Number(p)) }} style={{ padding: '7px 14px', borderRadius: 10, border: '1.5px solid rgba(124,63,214,0.2)', background: 'transparent', color: '#5a2ca0', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Points</button>
                  </div>
                </div>
                {s.suspension_reason && (
                  <div style={{ marginTop: 10, fontSize: 12, color: '#991b1b', background: 'rgba(239,68,68,0.06)', borderRadius: 8, padding: '8px 12px' }}>Reason: {s.suspension_reason}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
