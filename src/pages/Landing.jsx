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
              🇿🇲 Made for Zambia
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05, color: '#fff', marginBottom: 10 }}>
              Swif<span className="text-gradient">Trade</span>
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', fontWeight: 500, lineHeight: 1.6, maxWidth: 300, textAlign: 'center' }}>
              Tell us what you're looking for.<br />We'll connect you with sellers who have it.
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
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 3 }}>I want to buy something</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500, lineHeight: 1.4 }}>Tell us what you need and get offers from sellers</div>
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
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 3 }}>I want to sell</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500, lineHeight: 1.4 }}>Add your business and get requests from buyers</div>
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
            Already have an account? Log in →
          </button>
        </div>

        {/* How it works */}
        <div style={{ width: '100%', maxWidth: 420, marginTop: 48 }}>
          <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>How SwifTrade works</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { n: '01', t: 'Tell us what you need', d: 'Share what you want, how many, your budget and where you are.' },
              { n: '02', t: 'We find the right sellers', d: 'We pick the best sellers for your request, so you don\u2019t have to search.' },
              { n: '03', t: 'Compare offers and choose', d: 'Sellers send you their offers. Pick the one you like best.' },
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
          {['🔒 Safe & secure', '🇿🇲 Built for Zambia', '⚡ Quick replies', '🌍 Buy from abroad too'].map(t => (
            <span key={t} style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{t}</span>
          ))}
        </div>

      </div>
    </div>
  )
}
