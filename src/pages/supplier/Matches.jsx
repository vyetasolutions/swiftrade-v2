import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { timeAgo, formatZMW } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function SupplierMatches() {
  const nav = useNavigate()
  const { supplier } = useAuthStore()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [offering, setOffering] = useState(null)
  const [offerForm, setOfferForm] = useState({ title: '', description: '', price: '', lead_time: '', terms: '' })

  useEffect(() => {
    if (supplier?.id) fetchMatches()
  }, [supplier?.id])

  async function fetchMatches() {
    const { data } = await supabase
      .from('request_matches')
      .select('*, requests(*, categories(name,icon))')
      .eq('supplier_id', supplier.id)
      .order('created_at', { ascending: false })
    setMatches(data || [])
    setLoading(false)
  }

  async function submitOffer(match) {
    if (!offerForm.description.trim()) { toast.error('Please add a description.'); return }
    try {
      const { error } = await supabase.from('offers').insert({
        offer_code:    `OFR-${Date.now()}`,
        match_id:      match.id,
        request_id:    match.request_id,
        supplier_id:   supplier.id,
        customer_id:   match.requests.customer_id,
        title:         offerForm.title || `Offer from ${supplier.business_name}`,
        description:   offerForm.description,
        price_zmw:     offerForm.price ? Number(offerForm.price) : null,
        lead_time_days: offerForm.lead_time ? Number(offerForm.lead_time) : null,
        terms:         offerForm.terms,
        status:        'pending',
        expires_at:    new Date(Date.now() + 7 * 86400000).toISOString(),
      })
      if (error) throw error
      await supabase.from('request_matches').update({ status: 'offer_submitted' }).eq('id', match.id)
      toast.success('Offer submitted!')
      setOffering(null)
      setOfferForm({ title: '', description: '', price: '', lead_time: '', terms: '' })
      fetchMatches()
    } catch (err) {
      toast.error(err.message || 'Failed to submit offer.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf8ff' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid rgba(124,63,214,0.1)', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12, height: 64, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => nav('/supplier')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#5a2ca0' }}>← Back</button>
        <div className="logo-orb" style={{ width: 28, height: 28 }} />
        <span style={{ fontSize: 15, fontWeight: 800, color: '#1a1030' }}>All Matches</span>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 20px 80px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1030', marginBottom: 20 }}>Your Matches</h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner spinner-dark" style={{ margin: '0 auto' }} /></div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(124,63,214,0.04)', borderRadius: 20, border: '1.5px dashed rgba(124,63,214,0.15)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            <p style={{ fontSize: 14, color: '#6b5b78' }}>No matches yet. Keep your profile and categories up to date.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {matches.map(m => (
              <div key={m.id} style={{ background: '#fff', border: '1.5px solid rgba(124,63,214,0.1)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(124,63,214,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{m.requests?.categories?.icon || '📋'}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1030', marginBottom: 2 }}>{m.requests?.title}</div>
                        <div style={{ fontSize: 11, color: '#6b5b78', fontWeight: 500 }}>{m.requests?.reference_code} · {timeAgo(m.created_at)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#9d6cf0' }}>Score {Math.round(m.total_score)}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: m.status === 'offer_submitted' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)', color: m.status === 'offer_submitted' ? '#15803d' : '#1d4ed8' }}>{m.status}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, marginBottom: 14 }}>
                    {[
                      ['Location', [m.requests?.location_city, m.requests?.location_province].filter(Boolean).join(', ') || '—'],
                      ['Budget',   m.requests?.budget_min_zmw || m.requests?.budget_max_zmw ? `${formatZMW(m.requests.budget_min_zmw)} – ${formatZMW(m.requests.budget_max_zmw)}` : '—'],
                      ['Scope',    m.requests?.sourcing_scope || '—'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: 'rgba(124,63,214,0.04)', borderRadius: 10, padding: '8px 12px' }}>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{k}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1030' }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {m.requests?.description && (
                    <p style={{ fontSize: 13, color: '#6b5b78', lineHeight: 1.5, marginBottom: 14 }}>{m.requests.description.slice(0, 200)}{m.requests.description.length > 200 ? '…' : ''}</p>
                  )}

                  {m.status !== 'offer_submitted' && m.status !== 'skipped' && (
                    <button className="btn-sm" onClick={() => setOffering(offering?.id === m.id ? null : m)}>
                      {offering?.id === m.id ? 'Cancel' : '📝 Submit Offer'}
                    </button>
                  )}
                  {m.status === 'offer_submitted' && <span className="badge-green">✓ Offer Submitted</span>}
                </div>

                {/* Offer form */}
                {offering?.id === m.id && (
                  <div style={{ borderTop: '1.5px solid rgba(124,63,214,0.1)', padding: '18px 20px', background: 'rgba(124,63,214,0.02)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1030', marginBottom: 4 }}>Submit Your Offer</h3>
                    {[
                      { k: 'title',       label: 'Offer Title (optional)',       type: 'text',   ph: 'e.g. Genuine Toyota brake pads' },
                      { k: 'description', label: 'Description *',                type: 'textarea',ph: 'Describe your offer in detail…' },
                      { k: 'price',       label: 'Price (ZMW)',                  type: 'number', ph: '0' },
                      { k: 'lead_time',   label: 'Lead Time (days)',             type: 'number', ph: '3' },
                      { k: 'terms',       label: 'Terms & Conditions (optional)',type: 'text',   ph: 'e.g. 50% deposit required' },
                    ].map(f => (
                      <div key={f.k}>
                        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#6b5b78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{f.label}</label>
                        {f.type === 'textarea'
                          ? <textarea className="input-field" style={{ height: 80, resize: 'vertical' }} placeholder={f.ph} value={offerForm[f.k]} onChange={e => setOfferForm(p => ({ ...p, [f.k]: e.target.value }))} />
                          : <input type={f.type} className="input-field" placeholder={f.ph} value={offerForm[f.k]} onChange={e => setOfferForm(p => ({ ...p, [f.k]: e.target.value }))} />
                        }
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button className="btn-sm" onClick={() => submitOffer(m)}>Submit Offer →</button>
                      <button onClick={() => setOffering(null)} style={{ padding: '9px 16px', borderRadius: 12, border: '1.5px solid rgba(124,63,214,0.2)', background: 'transparent', color: '#6b5b78', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
