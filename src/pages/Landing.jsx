import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const nav = useNavigate()

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      {/* Background */}
      <div className="bg-scene">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px 80px', minHeight: '100vh' }}>

        {/* Logo */}
        <div style={{ marginBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="logo-orb animate-breathe" style={{ width: 88, height: 88 }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '6px 14px', marginBottom: 14 }}>
              🇿🇲 Zambia's Sourcing Platform
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#fff', marginBottom: 10 }}>
              Swif<span className="text-gradient">Trade</span>
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', fontWeight: 500, lineHeight: 1.6, maxWidth: 300, textAlign: 'center' }}>
              Describe what you need.<br />Get matched with the right suppliers.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Buyer card */}
          <button
            onClick={() => nav('/register')}
            style={{ background: 'linear-gradient(135deg, rgba(157,108,240,0.9), rgba(90,44,160,0.95))', border: 'none', borderRadius: 24, padding: 24, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16, width: '100%', boxShadow: '0 12px 32px rgba(90,44,160,0.4), inset 0 1px 0 rgba(255,255,255,0.2)', transition: 'all 0.25s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 16px 40px rgba(90,44,160,0.55), inset 0 1px 0 rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 12px 32px rgba(90,44,160,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'}
          >
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🛒</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 3 }}>I need to source something</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500, lineHeight: 1.4 }}>Post a request, get matched with suppliers</div>
            </div>
            <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)' }}>→</div>
          </button>

          {/* Supplier card */}
          <button
            onClick={() => nav('/register/supplier')}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 24, padding: 24, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16, width: '100%', backdropFilter: 'blur(10px)', transition: 'all 0.25s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(157,108,240,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🏢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 3 }}>I'm a supplier</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500, lineHeight: 1.4 }}>Register your business, receive matched requests</div>
            </div>
            <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)' }}>→</div>
          </button>

          {/* Login link */}
          <button
            onClick={() => nav('/login')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.45)', padding: '12px', borderRadius: 12, transition: 'all 0.2s', width: '100%' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'none' }}
          >
            Already have an account? Sign in →
          </button>
        </div>

        {/* How it works */}
        <div style={{ width: '100%', maxWidth: 420, marginTop: 48 }}>
          <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>How SwifTrade works</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { n: '01', t: 'Describe your need', d: 'Tell us what you need — product, quantity, budget, location.' },
              { n: '02', t: 'We find suppliers', d: 'Our matching engine scores and ranks the best suppliers for you.' },
              { n: '03', t: 'Receive offers', d: 'Matched suppliers submit offers. You choose the best one.' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(124,63,214,0.2)', border: '1px solid rgba(124,63,214,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#9d6cf0', flexShrink: 0 }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{s.t}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust strip */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 40, flexWrap: 'wrap' }}>
          {['🔒 Secure', '🇿🇲 Zambia-first', '⚡ Fast matching', '🌍 International sourcing'].map(t => (
            <span key={t} style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{t}</span>
          ))}
        </div>

      </div>
    </div>
  )
}
