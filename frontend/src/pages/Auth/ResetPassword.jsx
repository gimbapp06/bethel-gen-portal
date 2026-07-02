import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, CheckCircle, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react'
import api from '../../utils/api'

const PW_RULES = [
  { label: 'At least 8 characters', test: v => v.length >= 8 },
  { label: 'Uppercase letter', test: v => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: v => /[a-z]/.test(v) },
  { label: 'Number', test: v => /[0-9]/.test(v) },
  { label: 'Special character', test: v => /[^A-Za-z0-9]/.test(v) },
]

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', password_confirmation: '' })
  const [show, setShow] = useState({ pw: false, conf: false })
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setError('')
    const token = params.get('token')
    const email = params.get('email')
    if (!token || !email) { setError('Invalid or expired reset link.'); return }
    const failed = PW_RULES.find(r => !r.test(form.password))
    if (failed) { setError(failed.label + ' required.'); return }
    if (form.password !== form.password_confirmation) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, email, ...form })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bethel-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '36px 36px', width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/bethel_logo_only.png" alt="Bethel" style={{ height: 52, marginBottom: 14 }} onError={e => e.target.style.display='none'} />
          <h2 style={{ color: 'var(--bethel-navy)', fontWeight: 800, fontSize: '1.3rem' }}>Set New Password</h2>
          <p style={{ color: 'var(--bethel-text-muted)', fontSize: '0.875rem', marginTop: 6 }}>Choose a strong password for your account.</p>
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={48} color="#16A34A" style={{ marginBottom: 14 }} />
            <h3 style={{ color: 'var(--bethel-navy)', marginBottom: 8 }}>Password updated!</h3>
            <p style={{ color: 'var(--bethel-text-muted)', marginBottom: 22 }}>You can now sign in with your new password.</p>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/login')}>Go to Sign In</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: '#991B1B', fontSize: '0.85rem', marginBottom: 16, display: 'flex', gap: 8 }}><AlertCircle size={16} />{error}</div>}
            <div className="form-group">
              <label className="form-label">New Password<span className="required">*</span></label>
              <div className="input-wrapper">
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--bethel-text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: 36, paddingRight: 40 }} type={show.pw ? 'text' : 'password'} name="password" value={form.password} onChange={set} placeholder="New password" />
                <span className="input-icon-right" onClick={() => setShow(s => ({ ...s, pw: !s.pw }))}>{show.pw ? <EyeOff size={16} /> : <Eye size={16} />}</span>
              </div>
              {form.password && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ height: 4, background: '#e5e7eb', borderRadius: 4 }}>
                    <div style={{ height: '100%', width: (PW_RULES.filter(r => r.test(form.password)).length / PW_RULES.length * 100) + '%', background: '#22C55E', borderRadius: 4, transition: 'width 0.3s' }} />
                  </div>
                  {PW_RULES.map(r => (
                    <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: r.test(form.password) ? '#16A34A' : '#9CA3AF', marginTop: 3 }}>
                      {r.test(form.password) ? <CheckCircle size={12} /> : <AlertCircle size={12} />} {r.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password<span className="required">*</span></label>
              <div className="input-wrapper">
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--bethel-text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: 36, paddingRight: 40 }} type={show.conf ? 'text' : 'password'} name="password_confirmation" value={form.password_confirmation} onChange={set} placeholder="Repeat password" />
                <span className="input-icon-right" onClick={() => setShow(s => ({ ...s, conf: !s.conf }))}>{show.conf ? <EyeOff size={16} /> : <Eye size={16} />}</span>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 0', marginTop: 4 }} disabled={loading}>
              {loading ? <><Loader size={16} className="spinner" /> Updating...</> : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
