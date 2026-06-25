import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatDate, formatZMW, timeAgo, REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function RequestDetail() {
  const { id } = useParams()
  const nav    = useNavigate()
  const [request, setRequest] = useState(null)
  const [offers, setOffers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
    const channel = supabase.channel('request-detail')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers', filter: `request_id=eq.${id}` }, fetchAll)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [id])

  async function fetchAll() {
    const [{ data: req }, { data: ofs }] = await Promise.all([
      supabase.from('requests').select('*, categories(name,icon)').eq('id', id).single(),
      supabase.from('offers').select('*, suppliers(business_name, avg_rating, verification_status, supplier_locations(*))').eq('request_id', id).order('created_at', { ascending: false }),
    ])
    setRequest(req)
    setOffers(ofs || [])
    setLoading(false)
  }

  async function acceptOffer(offerId) {
    const { error } = await supabase.from('offers').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', offerId)
    if (error) { toast.error('Failed to accept offer.'); return }
    await supabase.from('requests').update({ status: 'supplier_selected', selected_offer_id: offerId }).eq('id', id)
    toast.success('Offer accepted! The supplier will be notified.')
    fetchAll()
  }

  async function rejectOffer(offerId) {
    const { error } = await supabase.from('offers').update({ status: 'rejected', rejected_at: new Date().toISOString() }).eq('id', offerId)
    if (error) { toast.error('Failed to reject offer.'); return }
    toast.success('Offer rejected.')
    fetchAll()
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#faf8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner spinner-dark" />
    </div>
  )

  if (!request) return (
    <div style={{ minHeight: '100vh', background: '#faf8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 16, color: '#6b5b78' }}>Request not found.</p>
        <button className="btn-sm" onClick={() => nav('/dashboard')} style={{ marginTop: 16 }}>← Back to dashboard</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#faf8ff' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid rgba(124,63,214,0.1)', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12, height: 64, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => nav('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#5a2ca0' }}>← Back</button>
        <div className="logo-orb" style={{ width: 28, height: 28 }} />
        <span style={{ fontSize: 15, fontWeight: 800, color: '#1a1030' }}>Request Detail</span>
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '36px 20px 80px' }}>

        {/* Request card */}
        <div style={{ background: '#fff', border: '1.5px solid rgba(124,63,214,0.1)', borderRadius: 22, padding: '24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a1030', letterSpacing: '-0.01em' }}>{request.title}</h1>
                <span className={REQUEST_STATUS_COLORS[request.status]}>{REQUEST_STATUS_LABELS[request.status]}</span>
              </div>
              <p style={{ fontSize: 12, color: '#6b5b78', fontWeight: 600 }}>{request.reference_code} · {timeAgo(request.created_at)}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
            {[
              ['Category',   `${request.categories?.icon || ''} ${request.categories?.name || '—'}`],
              ['Location',   [request.location_city, request.location_province].filter(Boolean).join(', ') || '—'],
              ['Budget',     request.budget_min_zmw || request.budget_max_zmw ? `${formatZMW(request.budget_min_zmw)} – ${formatZMW(request.budget_max_zmw)}` : '—'],
              ['Deadline',   formatDate(request.deadline)],
              ['Priority',   request.priority],
              ['Scope',      request.sourcing_scope],
            ].map(([k, v]) => (
              <div key={k} style={{ background: 'rgba(124,63,214,0.04)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1030' }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(124,63,214,0.04)', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Description</div>
            <p style={{ fontSize: 13.5, color: '#1a1030', lineHeight: 1.6, fontWeight: 500 }}>{request.description}</p>
          </div>
        </div>

        {/* Offers */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1030', marginBottom: 14 }}>
            Offers {offers.length > 0 && <span style={{ fontSize: 14, fontWeight: 700, color: '#5a2ca0' }}>({offers.length})</span>}
          </h2>

          {offers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: 'rgba(124,63,214,0.04)', borderRadius: 20, border: '1.5px dashed rgba(124,63,214,0.15)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>⏳</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1030', marginBottom: 6 }}>Waiting for offers</h3>
              <p style={{ fontSize: 13, color: '#6b5b78' }}>Matched suppliers will submit their offers here soon.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {offers.map(offer => (
                <div key={offer.id} style={{ background: '#fff', border: `1.5px solid ${offer.status === 'accepted' ? 'rgba(34,197,94,0.3)' : offer.status === 'rejected' ? 'rgba(239,68,68,0.2)' : 'rgba(124,63,214,0.1)'}`, borderRadius: 20, padding: '20px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1030', marginBottom: 3 }}>{offer.suppliers?.business_name}</div>
                      <div style={{ fontSize: 12, color: '#6b5b78', fontWeight: 500 }}>{timeAgo(offer.created_at)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {offer.price_zmw && <div style={{ fontSize: 18, fontWeight: 800, color: '#5a2ca0' }}>{formatZMW(offer.price_zmw)}</div>}
                      {offer.lead_time_days && <div style={{ fontSize: 11, color: '#6b5b78', fontWeight: 600 }}>{offer.lead_time_days} day lead time</div>}
                    </div>
                  </div>

                  <p style={{ fontSize: 13.5, color: '#1a1030', lineHeight: 1.6, marginBottom: 16 }}>{offer.description}</p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {offer.suppliers?.avg_rating > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#6b5b78' }}>⭐ {offer.suppliers.avg_rating}</span>
                      )}
                      {offer.suppliers?.verification_status === 'verified' && (
                        <span className="badge-green">✓ Verified</span>
                      )}
                    </div>
                    {offer.status === 'pending' && request.status !== 'supplier_selected' && request.status !== 'closed' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => rejectOffer(offer.id)} style={{ padding: '8px 16px', borderRadius: 10, border: '1.5px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#dc2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Decline</button>
                        <button onClick={() => acceptOffer(offer.id)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #5a2ca0, #7c3fd6)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(90,44,160,0.3)' }}>Accept Offer</button>
                      </div>
                    )}
                    {offer.status === 'accepted' && <span className="badge-green">✓ Accepted</span>}
                    {offer.status === 'rejected' && <span className="badge-red">Declined</span>}
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
