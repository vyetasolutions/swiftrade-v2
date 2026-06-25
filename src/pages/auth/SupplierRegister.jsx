import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { generateSupplierCode } from '../../lib/utils'
import { ZAMBIA_PROVINCES } from '../../lib/utils'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'Automotive','Construction','Electronics','Food & Agriculture',
  'Healthcare','Industrial Equipment','Mining & Resources',
  'Office Supplies','Retail & FMCG','Services & Consulting',
  'Textiles & Apparel','Transport & Logistics',
]

const STEPS = ['Account','Business','Categories','Done']

export default function SupplierRegister() {
  const nav = useNavigate()
  const [step, setStep]     = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [regCode]           = useState(generateSupplierCode())

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', confirm: '',
    business_name: '', description: '', website: '',
    province: '', city: '',
    sourcing_scope: 'local',
    budget_min: '', budget_max: '',
    keywords: '',
    categories: [],
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleCat = (c) => set('categories', form.categories.includes(c) ? form.categories.filter(x => x !== c) : [...form.categories, c])

  function nextStep() {
    setError('')
    if (step === 0) {
      if (!form.full_name || !form.email || !form.password) { setError('Please fill in all required fields.'); return }
      if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
      if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    }
    if (step === 1) {
      if (!form.business_name || !form.province) { setError('Business name and province are required.'); return }
    }
    if (step === 2) {
      if (form.categories.length === 0) { setError('Select at least one category.'); return }
    }
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      // 1. Create auth user
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: { data: { full_name: form.full_name.trim(), role: 'supplier' } }
      })
      if (authErr) throw authErr

      const userId = authData.user.id

      // 2. Update profile
      await supabase.from('profiles').upsert({
        id: userId, role: 'supplier',
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      })

      // 3. Create supplier record
      const { data: supplier, error: supErr } = await supabase.from('suppliers').insert({
        profile_id:        userId,
        business_name:     form.business_name.trim(),
        registration_code: regCode,
        description:       form.description.trim(),
        website:           form.website.trim(),
        sourcing_scope:    form.sourcing_scope,
        budget_min_zmw:    form.budget_min ? Number(form.budget_min) : null,
        budget_max_zmw:    form.budget_max ? Number(form.budget_max) : null,
        keywords:          form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        status:            'pending',
      }).select().single()
      if (supErr) throw supErr

      // 4. Add location
      if (form.province) {
        await supabase.from('supplier_locations').insert({
          supplier_id: supplier.id,
          country: 'ZM',
          province: form.province,
          city: form.city,
          is_primary: true,
        })
      }

      // 5. Add categories
      const catData = form.categories.map(name => ({ supplier_id: supplier.id, category_name: name }))
      // We store by name since categories table is seeded — look up IDs
      const { data: cats } = await supabase.from('categories').select('id,name').in('name', form.categories)
      if (cats?.length) {
        await supabase.from('supplier_categories').insert(
          cats.map(c => ({ supplier_id: supplier.id, category_id: c.id }))
        )
      }

      toast.success('Registration submitted! Await admin approval.')
      setStep(3)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const provinces = Object.keys(ZAMBIA_PROVINCES)
  const cities    = form.province ? ZAMBIA_PROVINCES[form.province] || [] : []

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="bg-scene"><div className="orb orb-1" /><div className="orb orb-2" /></div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px 80px' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div className="logo-orb animate-breathe" style={{ width: 60, height: 60, margin: '0 auto 14px' }} />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>Register your business</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Join SwifTrade as a verified supplier</p>
          </div>

          {/* Progress */}
          {step < 3 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                <span>{STEPS[step]}</span><span>Step {step + 1} of 3</span>
              </div>
              <div style={{ height: 5, background: 'rgba(124,63,214,0.15)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((step + 1) / 3) * 100}%`, background: 'linear-gradient(90deg, #5a2ca0, #9d6cf0)', borderRadius: 999, transition: 'width 0.4s' }} />
              </div>
            </div>
          )}

          <div className="glass" style={{ padding: '32px 28px' }}>

            {/* Step 0 — Account */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Your account details</h2>
                {[
                  { k: 'full_name', label: 'Your Full Name',    type: 'text',     ph: 'John Banda' },
                  { k: 'email',     label: 'Email Address',     type: 'email',    ph: 'you@company.com' },
                  { k: 'phone',     label: 'Phone Number',      type: 'tel',      ph: '+260 97 000 0000' },
                  { k: 'password',  label: 'Password',          type: 'password', ph: 'Min. 8 characters' },
                  { k: 'confirm',   label: 'Confirm Password',  type: 'password', ph: 'Repeat password' },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>{f.label}</label>
                    <input type={f.type} className="input-field" style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }} placeholder={f.ph} value={form[f.k]} onChange={e => set(f.k, e.target.value)} />
                  </div>
                ))}
              </div>
            )}

            {/* Step 1 — Business */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Business details</h2>
                {[
                  { k: 'business_name', label: 'Business Name',    type: 'text', ph: 'Chanda Auto Spares Ltd' },
                  { k: 'website',       label: 'Website (optional)', type: 'url', ph: 'https://yourbusiness.com' },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>{f.label}</label>
                    <input type={f.type} className="input-field" style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }} placeholder={f.ph} value={form[f.k]} onChange={e => set(f.k, e.target.value)} />
                  </div>
                ))}

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Description</label>
                  <textarea className="input-field" style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff', height: 88, resize: 'vertical' }} placeholder="Describe your business and what you supply…" value={form.description} onChange={e => set('description', e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Province</label>
                    <select className="input-field" style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: form.province ? '#fff' : 'rgba(255,255,255,0.4)' }} value={form.province} onChange={e => { set('province', e.target.value); set('city', '') }}>
                      <option value="">Select…</option>
                      {provinces.map(p => <option key={p} value={p} style={{ background: '#1a0a30' }}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>City</label>
                    <select className="input-field" style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: form.city ? '#fff' : 'rgba(255,255,255,0.4)' }} value={form.city} onChange={e => set('city', e.target.value)} disabled={!form.province}>
                      <option value="">Select…</option>
                      {cities.map(c => <option key={c} value={c} style={{ background: '#1a0a30' }}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Sourcing Scope</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[['local','🇿🇲 Local'],['international','🌍 International'],['both','🌐 Both']].map(([v,l]) => (
                      <button key={v} type="button" onClick={() => set('sourcing_scope', v)} style={{ flex: 1, padding: '10px 8px', borderRadius: 12, border: `1.5px solid ${form.sourcing_scope === v ? '#9d6cf0' : 'rgba(255,255,255,0.12)'}`, background: form.sourcing_scope === v ? 'rgba(157,108,240,0.2)' : 'transparent', color: form.sourcing_scope === v ? '#e0d4ff' : 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>{l}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Keywords <span style={{ fontWeight: 400, textTransform: 'none', opacity: 0.6 }}>(comma-separated)</span></label>
                  <input type="text" className="input-field" style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }} placeholder="brake pads, Toyota, Isuzu, engine parts" value={form.keywords} onChange={e => set('keywords', e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[['budget_min','Min Budget (ZMW)'],['budget_max','Max Budget (ZMW)']].map(([k,l]) => (
                    <div key={k}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>{l}</label>
                      <input type="number" className="input-field" style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }} placeholder="0" value={form[k]} onChange={e => set(k, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — Categories */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 4 }}>What do you supply?</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: -8 }}>Select all categories that apply to your business.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CATEGORIES.map(c => (
                    <button key={c} type="button" onClick={() => toggleCat(c)} style={{ padding: '10px 16px', borderRadius: 999, border: `1.5px solid ${form.categories.includes(c) ? 'transparent' : 'rgba(124,63,214,0.2)'}`, background: form.categories.includes(c) ? 'linear-gradient(135deg, #5a2ca0, #7c3fd6)' : 'rgba(124,63,214,0.06)', color: form.categories.includes(c) ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: form.categories.includes(c) ? '0 4px 14px rgba(90,44,160,0.35)' : 'none', transform: form.categories.includes(c) ? 'translateY(-1px)' : 'none' }}>{c}</button>
                  ))}
                </div>
                {form.categories.length > 0 && (
                  <p style={{ fontSize: 12, color: '#9d6cf0', fontWeight: 600 }}>✓ {form.categories.length} selected</p>
                )}

                {/* Registration code preview */}
                <div style={{ background: 'rgba(124,63,214,0.1)', border: '1px solid rgba(124,63,214,0.2)', borderRadius: 14, padding: '14px 16px', marginTop: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Your Registration Code</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#b794f6', letterSpacing: '0.04em' }}>{regCode}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Save this — you'll use it to access your supplier dashboard</div>
                </div>
              </div>
            )}

            {/* Step 3 — Done */}
            {step === 3 && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #5a2ca0, #7c3fd6)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, boxShadow: '0 12px 32px rgba(90,44,160,0.4)' }}>🎉</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Registration Submitted!</h2>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 24 }}>Your business is under review. We'll email you within 24 hours once approved.</p>
                <div style={{ background: 'rgba(124,63,214,0.1)', border: '1px solid rgba(124,63,214,0.2)', borderRadius: 14, padding: '14px 16px', marginBottom: 24 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Your Registration Code</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#b794f6', letterSpacing: '0.04em' }}>{regCode}</div>
                </div>
                <button className="btn-primary" onClick={() => nav('/login')}>Go to Sign In →</button>
              </div>
            )}

            {/* Error */}
            {error && step < 3 && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#fca5a5', fontWeight: 500, marginTop: 12 }}>
                {error}
              </div>
            )}

            {/* Navigation buttons */}
            {step < 3 && (
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {step < 2 && <button className="btn-primary" type="button" onClick={nextStep}>Continue →</button>}
                {step === 2 && (
                  <button className="btn-primary" type="button" onClick={handleSubmit} disabled={loading}>
                    {loading ? <><span className="spinner" /> Submitting…</> : 'Submit Registration →'}
                  </button>
                )}
                {step > 0 && (
                  <button className="btn-ghost" type="button" onClick={() => { setStep(s => s - 1); setError('') }}>← Back</button>
                )}
              </div>
            )}
          </div>

          {step < 3 && (
            <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: '#9d6cf0', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
