import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const nav = useNavigate()
  const fetchProfile = useAuthStore(s => s.fetchProfile)
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      })
      if (err) throw err
      await fetchProfile(data.user)
      const role = data.user?.user_metadata?.role
      toast.success('Welcome back!')
      if (role === 'admin')    nav('/admin')
      else if (role === 'supplier') nav('/supplier')
      else nav('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="bg-scene"><div className="orb orb-1" /><div className="orb orb-2" /></div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '32px 20px' }}>

        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div className="logo-orb animate-breathe" style={{ width: 64, height: 64, margin: '0 auto 16px' }} />
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>Sign in to SwifTrade</h1>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>Welcome back</p>
          </div>

          {/* Form */}
          <div className="glass" style={{ padding: '32px 28px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Email</label>
                <input
                  type="email"
                  className="input-field"
                  style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Password</label>
                <input
                  type="password"
                  className="input-field"
                  style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: '#fff' }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#fca5a5', fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In →'}
              </button>
            </form>
          </div>

          {/* Footer links */}
          <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#9d6cf0', fontWeight: 700, textDecoration: 'none' }}>Sign up</Link>
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
              Are you a supplier?{' '}
              <Link to="/register/supplier" style={{ color: '#9d6cf0', fontWeight: 700, textDecoration: 'none' }}>Register your business</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
