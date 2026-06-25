import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { formatDate } from '../../lib/utils'

export default function SupplierProfile() {
  const nav = useNavigate()
  const { profile, supplier } = useAuthStore()

  return (
    <div style={{ minHeight: '100vh', background: '#faf8ff' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid rgba(124,63,214,0.1)', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12, height: 64, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => nav('/supplier')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#5a2ca0' }}>← Back</button>
        <div className="logo-orb" style={{ width: 28, height: 28 }} />
        <span style={{ fontSize: 15, fontWeight: 800, color: '#1a1030' }}>Business Profile</span>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ background: '#fff', border: '1.5px solid rgba(124,63,214,0.1)', borderRadius: 22, padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1030', marginBottom: 18 }}>Business Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              ['Business Name',     supplier?.business_name],
              ['Registration Code', supplier?.registration_code],
              ['Status',            supplier?.status],
              ['Sourcing Scope',    supplier?.sourcing_scope],
              ['Description',       supplier?.description],
              ['Website',           supplier?.website],
              ['Member Since',      formatDate(supplier?.created_at)],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(124,63,214,0.08)' : 'none', gap: 12 }}>
                <span style={{ fontSize: 12, color: '#6b5b78', fontWeight: 600 }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1030', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1.5px solid rgba(124,63,214,0.1)', borderRadius: 22, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1030', marginBottom: 18 }}>Account Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              ['Full Name', profile?.full_name],
              ['Email',     profile?.email],
              ['Phone',     profile?.phone],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(124,63,214,0.08)' : 'none', gap: 12 }}>
                <span style={{ fontSize: 12, color: '#6b5b78', fontWeight: 600 }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1030' }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
