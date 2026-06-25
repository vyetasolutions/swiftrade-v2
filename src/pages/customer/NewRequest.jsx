import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { generateRequestCode, extractKeywords, ZAMBIA_PROVINCES, SOURCING_COUNTRIES } from '../../lib/utils'
import toast from 'react-hot-toast'

const STEPS = ['Details', 'Location & Budget', 'Review']
const PRIORITIES = [['low','🟢 Low'],['normal','🔵 Normal'],['high','🟠 High'],['urgent','🔴 Urgent']]

export default function NewRequest() {
  const nav = useNavigate()
  const { profile } = useAuthStore()
  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [categories, setCategories] = useState([])

  const [form, setForm] = useState({
    title: '', description: '', category_id: '', quantity: '',
    priority: 'normal', sourcing_scope: 'local',
    countries_preferred: ['ZM'],
    province: '', city: '',
    budget_min: '', budget_max: '',
    deadline: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    supabase.from('categories').select('id,name,icon').eq('is_active', true).order('sort_order')
      .then(({ data }) => setCategories(data || []))
  }, [])

  function validate() {
    setError('')
    if (step === 0) {
      if (!form.title.trim())       { setError('Please enter a title for your request.'); return false }
      if (!form.description.trim()) { setError('Please describe what you need.'); return false }
      if (!form.category_id)        { setError('Please select a category.'); return false }
    }
    if (step === 1) {
      if (!form.province)           { setError('Please select a province.'); return false }
    }
    return true
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    try {
      const keywords = extractKeywords(`${form.title} ${form.description}`)
      const { data, error: err } = await supabase.from('requests').insert({
        reference_code:      generateRequestCode(),
        customer_id:         profile.id,
        title:               form.title.trim(),
        description:         form.description.trim(),
        category_id:         form.category_id || null,
        quantity:            form.quantity.trim() || null,
        priority:            form.priority,
        sourcing_scope:      form.sourcing_scope,
        countries_preferred: form.countries_preferred,
        location_province:   form.province,
        location_city:       form.city,
        budget_min_zmw:      form.budget_min ? Number(form.budget_min) : null,
        budget_max_zmw:      form.budget_max ? Number(form.budget_max) : null,
        deadline:            form.deadline || null,
        keywords_extracted:  keywords,
        status:              'submitted',
      }).select().single()
      if (err) throw err
      toast.success('Request posted! Finding suppliers…')
// Trigger matching engine
supabase.functions.invoke('run-matching', { body: { request_id: data.id } }).catch(console.error)
      nav(`/dashboard/request/${data.id}`)
    } catch (err) {
      setError(err.message || 'Failed to post request.')
      toast.error('Failed to post request.')
    } finally {
      setLoading(false)
    }
  }

  const provinces = Object.keys(ZAMBIA_PROVINCES)
  const cities    = form.province ? ZAMBIA_PROVINCES[form.province] || [] : []
  const selCat    = categories.find(c => c.id === form.category_id)

  return (
    <div style={{ minHeight: '100vh', background: '#faf8ff' }}>

      {/* Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid rgba(124,63,214,0.1)', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12, height: 64, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => step > 0 ? setStep(s => s - 1) : nav('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#5a2ca0', display: 'flex', alignItems: 'center', gap: 4 }}>← Back</button>
        <div className="logo-orb" style={{ width: 28, height: 28 }} />
        <span style={{ fontSize: 15, fontWeight: 800, color: '#1a1030' }}>New Request</span>
      </nav>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '36px 20px 80px' }}>

        {/* Progress */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#6b5b78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <span>{STEPS[step]}</span><span>Step {step + 1} of {STEPS.length}</span>
          </div>
          <div style={{ height: 5, background: 'rgba(124,63,214,0.1)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((step + 1) / STEPS.length) * 100}%`, background: 'linear-gradient(90deg, #5a2ca0, #9d6cf0)', borderRadius: 999, transition: 'width 0.4s' }} />
          </div>
        </div>

        <div className="glass-light" style={{ padding: '28px 24px' }}>

          {/* Step 0 */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1030', marginBottom: 4 }}>What do you need?</h2>
                <p style={{ fontSize: 13, color: '#6b5b78' }}>Be specific — better details lead to better matches.</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5b78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Request Title *</label>
                <input className="input-field" placeholder="e.g. Toyota Hilux brake pads x4 — genuine parts" value={form.title} onChange={e => set('title', e.target.value)} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5b78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Category *</label>
                <select className="input-field" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                  <option value="">Select a category…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5b78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Description *</label>
                <textarea className="input-field" style={{ height: 110, resize: 'vertical' }} placeholder="Describe exactly what you need — brand preferences, specifications, condition (new/used), any other requirements…" value={form.description} onChange={e => set('description', e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5b78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Quantity</label>
                  <input className="input-field" placeholder="e.g. 4 units, 2 pallets" value={form.quantity} onChange={e => set('quantity', e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5b78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Deadline</label>
                  <input type="date" className="input-field" value={form.deadline} onChange={e => set('deadline', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5b78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Priority</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {PRIORITIES.map(([v, l]) => (
                    <button key={v} type="button" onClick={() => set('priority', v)} style={{ padding: '9px 14px', borderRadius: 12, border: `1.5px solid ${form.priority === v ? '#7c3fd6' : 'rgba(124,63,214,0.14)'}`, background: form.priority === v ? 'rgba(124,63,214,0.1)' : 'transparent', color: form.priority === v ? '#5a2ca0' : '#6b5b78', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1030', marginBottom: 4 }}>Location & Budget</h2>
                <p style={{ fontSize: 13, color: '#6b5b78' }}>Help suppliers understand where and how much.</p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5b78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Sourcing Scope</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['local','🇿🇲 Local only'],['international','🌍 International'],['both','🌐 Both']].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => set('sourcing_scope', v)} style={{ flex: 1, padding: '10px 8px', borderRadius: 12, border: `1.5px solid ${form.sourcing_scope === v ? '#7c3fd6' : 'rgba(124,63,214,0.14)'}`, background: form.sourcing_scope === v ? 'rgba(124,63,214,0.1)' : 'transparent', color: form.sourcing_scope === v ? '#5a2ca0' : '#6b5b78', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>{l}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5b78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Province *</label>
                  <select className="input-field" value={form.province} onChange={e => { set('province', e.target.value); set('city', '') }}>
                    <option value="">Select…</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5b78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>City</label>
                  <select className="input-field" value={form.city} onChange={e => set('city', e.target.value)} disabled={!form.province}>
                    <option value="">Select…</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['budget_min','Min Budget (ZMW)'],['budget_max','Max Budget (ZMW)']].map(([k, l]) => (
                  <div key={k}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b5b78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>{l}</label>
                    <input type="number" className="input-field" placeholder="0" value={form[k]} onChange={e => set(k, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Review */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1030', marginBottom: 4 }}>Review your request</h2>
                <p style={{ fontSize: 13, color: '#6b5b78' }}>Confirm the details before posting.</p>
              </div>
              <div style={{ background: 'rgba(124,63,214,0.04)', border: '1px solid rgba(124,63,214,0.1)', borderRadius: 16, overflow: 'hidden' }}>
                {[
                  ['Title',       form.title],
                  ['Category',    selCat ? `${selCat.icon} ${selCat.name}` : '—'],
                  ['Description', form.description],
                  ['Quantity',    form.quantity || '—'],
                  ['Priority',    form.priority],
                  ['Scope',       form.sourcing_scope],
                  ['Location',    [form.city, form.province].filter(Boolean).join(', ') || '—'],
                  ['Budget',      form.budget_min || form.budget_max ? `K${form.budget_min || 0} – K${form.budget_max || '?'}` : '—'],
                  ['Deadline',    form.deadline || '—'],
                ].map(([k, v], i, arr) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 16px', borderBottom: i < arr.length - 1 ? '1px solid rgba(124,63,214,0.08)' : 'none', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 12, color: '#6b5b78', fontWeight: 600, whiteSpace: 'nowrap' }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1030', textAlign: 'right', wordBreak: 'break-word', maxWidth: '70%' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#15803d', fontWeight: 500 }}>
                ⚡ Once posted, our matching engine will find the best suppliers for you immediately.
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#dc2626', fontWeight: 500, marginTop: 14 }}>
              {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {step < 2 && (
              <button className="btn-primary" onClick={() => { if (validate()) setStep(s => s + 1) }}>Continue →</button>
            )}
            {step === 2 && (
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner" /> Posting request…</> : '🚀 Post Request'}
              </button>
            )}
            {step > 0 && (
              <button className="btn-ghost" onClick={() => { setStep(s => s - 1); setError('') }}>← Back</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
