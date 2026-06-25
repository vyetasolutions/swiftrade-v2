import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function Register() {
  const nav = useNavigate()
  const [form, setForm]     = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.full_name || !form.email || !form.password) { setError('Please fill in all required fields.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: { full_name: form.full_name.trim(), phone: form.phone.trim(), role: 'customer' }
        }
      })
      if (err) throw err
      toast.success('Account created! Check your email to confirm.')
      nav('/login')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="bg-scene"><div className="orb orb-1" /><div className="orb orb-2" /></div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px 80px' }}>

        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div className="logo-orb animate-breathe" style={{ width: 60, height: 60, margin: '0 auto 14px' }} />
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>Create your account</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Start sourcing smarter with SwifTrade</p>
          </div>

          <div className="glass" style={{ padding: '32px 28px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {[
                { k: 'full_name',  label: 'Full Name',        type: 'text',     ph: 'John Banda',           req: true },
                { k: 'email',      label: 'Email Address',    type: 'email',    ph: 'you@example.com',       req: true },
                { k: 'phone',      label: 'Phone (optional)', type: 'tel',      ph: '+260 97 000 0000',      req: false },
                { k: 'password',   label: 'Password',         type: 'password', ph: 'Min. 8 characters',     req: true },
                { k: 'confirm',    label: 'Confirm Password', type: 'password', ph: 'Repeat your password',  req: true },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>
                    {f.label} {!f.req && <span style={{ fontWeight: 400, textTransform: 'none', opacity: 0.6 }}>(optional)</span>}
                  </label>
                  <input
                    type={f.type}
                    className="input-field"
                    style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                    placeholder={f.ph}
                    value={form[f.k]}
                    onChange={e => set(f.k, e.target.value)}
                  />
                </div>
              ))}

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#fca5a5', fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account →'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#9d6cf0', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
