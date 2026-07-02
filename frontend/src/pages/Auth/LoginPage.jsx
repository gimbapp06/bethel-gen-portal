import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader, ChevronLeft, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const PW_RULES = [
  { label: 'At least 8 characters',  test: v => v.length >= 8 },
  { label: 'Uppercase letter',        test: v => /[A-Z]/.test(v) },
  { label: 'Lowercase letter',        test: v => /[a-z]/.test(v) },
  { label: 'Number',                  test: v => /[0-9]/.test(v) },
  { label: 'Special character',       test: v => /[^A-Za-z0-9]/.test(v) },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, login, register } = useAuth()
  const [panel, setPanel] = useState('login')
  const [role, setRole] = useState('client')

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loginErr, setLoginErr] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Register form
  const [step, setStep] = useState(1)
  const [regForm, setRegForm] = useState({ first_name:'', last_name:'', email:'', phone:'', address:'', birthdate:'', gender:'', password:'', password_confirmation:'' })
  const [showRegPw, setShowRegPw] = useState(false)
  const [regErr, setRegErr] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotErr, setForgotErr] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/client', { replace: true })
    }
  }, [user])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginErr('')
    if (!loginForm.email || !loginForm.password) { setLoginErr('Please fill in all fields.'); return }
    setLoginLoading(true)
    try {
      const u = await login(loginForm.email, loginForm.password, role)
      navigate(u.role === 'admin' ? '/admin' : '/client')
    } catch (err) {
      setLoginErr(err.response?.data?.message || 'Invalid email or password.')
    } finally { setLoginLoading(false) }
  }

  const handleRegStep1 = () => {
    if (!regForm.first_name || !regForm.last_name || !regForm.email) { setRegErr('First name, last name and email are required.'); return }
    if (!/\S+@\S+\.\S+/.test(regForm.email)) { setRegErr('Enter a valid email address.'); return }
    setRegErr('')
    setStep(2)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setRegErr('')
    if (regForm.password !== regForm.password_confirmation) { setRegErr('Passwords do not match.'); return }
    const failed = PW_RULES.find(r => !r.test(regForm.password))
    if (failed) { setRegErr(failed.label + ' is required.'); return }
    setRegLoading(true)
    try {
      await register(regForm)
      navigate('/client')
    } catch (err) {
      const errs = err.response?.data?.errors
      if (errs) setRegErr(Object.values(errs)[0]?.[0] || 'Registration failed.')
      else setRegErr(err.response?.data?.message || 'Registration failed.')
    } finally { setRegLoading(false) }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setForgotErr('')
    if (!forgotEmail) { setForgotErr('Email is required.'); return }
    setForgotLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail })
      setForgotSent(true)
    } catch { setForgotErr('Something went wrong. Please try again.') }
    finally { setForgotLoading(false) }
  }

  return (
    <div className="login-wrap" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F1A3D 0%, #1A2B5F 60%, #2a4080 100%)', display: 'flex', alignItems: 'stretch' }}>

      {/* Left branding */}
      <div className="login-brand" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px' }}>
        <div style={{ maxWidth: 440 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <img src="/bethel_logo_only.png" alt="Bethel"
              style={{ height: 56, width: 56, objectFit: 'contain', filter: 'brightness(1.4)' }}
              onError={e => e.target.style.display='none'} />
            <img src="/bethel_logo_with_text.png" alt="Bethel General Insurance"
              style={{ height: 48, objectFit: 'contain', filter: 'brightness(1.5) contrast(1.1)' }}
              onError={e => e.target.style.display='none'} />
          </div>
          <h1 style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: '2.4rem', lineHeight: 1.25, marginBottom: 18 }}>
            Your Policy.<br />
            <span style={{ color: '#C8A937' }}>Your Portal.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: 36, fontSize: '1rem' }}>
            Manage your insurance applications, upload documents, track status in real-time, and communicate directly with the Legazpi Branch.
          </p>
          {['Apply for policies and file claims online', 'Upload and track required documents', 'AI-powered document validation', 'Direct messaging with branch staff', 'Real-time status notifications'].map(text => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', marginBottom: 10 }}>
              <span style={{ color: '#C8A937', fontWeight: 700 }}>✓</span> {text}
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="login-form-panel" style={{ width: 480, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <img src="/bethel_logo_only.png" alt="Bethel"
              style={{ height: 42, width: 42, objectFit: 'contain' }}
              onError={e => e.target.style.display='none'} />
            <img src="/bethel_logo_with_text.png" alt="Bethel General Insurance"
              style={{ height: 36, objectFit: 'contain', maxWidth: 200 }}
              onError={e => e.target.style.display='none'} />
          </div>

          {/* ── LOGIN PANEL ── */}
          {panel === 'login' && (
            <div>
              <h2 style={{ color: '#1A2B5F', fontWeight: 800, fontSize: '1.4rem', marginBottom: 6 }}>Sign In</h2>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 22 }}>Access your Bethel Gen portal account.</p>

              {/* Role toggle */}
              <div style={{ display: 'flex', background: '#EEF1F8', borderRadius: 10, padding: 4, marginBottom: 22, gap: 4 }}>
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: role === 'client' ? '#fff' : 'transparent', border: role === 'client' ? '1px solid #D4D8E8' : 'none', color: role === 'client' ? '#1A2B5F' : '#6B7280', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: role === 'client' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: role === 'admin' ? '#fff' : 'transparent', border: role === 'admin' ? '1px solid #D4D8E8' : 'none', color: role === 'admin' ? '#1A2B5F' : '#6B7280', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: role === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                >
                  Admin
                </button>
              </div>

              {loginErr && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', color: '#991B1B', fontSize: '0.85rem', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <AlertCircle size={16} />{loginErr}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#1C2340', marginBottom: 5 }}>Email Address <span style={{ color: 'red' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                      style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1.5px solid #D4D8E8', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#1C2340', marginBottom: 5 }}>Password <span style={{ color: 'red' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Your password"
                      style={{ width: '100%', padding: '10px 40px 10px 36px', border: '1.5px solid #D4D8E8', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {role === 'client' && (
                  <div style={{ textAlign: 'right', marginBottom: 16 }}>
                    <button type="button" onClick={() => setPanel('forgot')} style={{ background: 'none', border: 'none', color: '#1A2B5F', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  style={{ width: '100%', padding: '13px 0', background: '#1A2B5F', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.95rem', cursor: loginLoading ? 'not-allowed' : 'pointer', opacity: loginLoading ? 0.7 : 1, marginTop: role === 'admin' ? 16 : 0 }}
                >
                  {loginLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {role === 'client' && (
                <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: '#6B7280' }}>
                  No account yet?{' '}
                  <button type="button" onClick={() => { setPanel('register'); setStep(1); setRegErr('') }} style={{ background: 'none', border: 'none', color: '#1A2B5F', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                    Register here
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── REGISTER PANEL ── */}
          {panel === 'register' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                {step === 2 && (
                  <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A2B5F', display: 'flex', alignItems: 'center' }}>
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div>
                  <h2 style={{ color: '#1A2B5F', fontWeight: 800, fontSize: '1.3rem', marginBottom: 2 }}>Create Account</h2>
                  <p style={{ color: '#6B7280', fontSize: '0.8rem' }}>Step {step} of 2</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 4, background: '#1A2B5F' }} />
                <div style={{ flex: 1, height: 4, borderRadius: 4, background: step === 2 ? '#1A2B5F' : '#D4D8E8' }} />
              </div>

              {regErr && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', color: '#991B1B', fontSize: '0.85rem', marginBottom: 16 }}>
                  {regErr}
                </div>
              )}

              {step === 1 ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 5 }}>First Name *</label>
                      <input value={regForm.first_name} onChange={e => setRegForm(f => ({ ...f, first_name: e.target.value }))} placeholder="Juan" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D4D8E8', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 5 }}>Last Name *</label>
                      <input value={regForm.last_name} onChange={e => setRegForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Dela Cruz" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D4D8E8', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 5 }}>Email Address *</label>
                    <input type="email" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D4D8E8', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 5 }}>Phone Number</label>
                    <input value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))} placeholder="+63 9XX XXX XXXX" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D4D8E8', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 5 }}>Address</label>
                    <input value={regForm.address} onChange={e => setRegForm(f => ({ ...f, address: e.target.value }))} placeholder="City, Province" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D4D8E8', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <button type="button" onClick={handleRegStep1} style={{ width: '100%', padding: '12px 0', background: '#1A2B5F', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
                    Continue →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 5 }}>Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showRegPw ? 'text' : 'password'} value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} placeholder="At least 8 characters" style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1.5px solid #D4D8E8', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                      <button type="button" onClick={() => setShowRegPw(!showRegPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                        {showRegPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {regForm.password && (
                      <div style={{ marginTop: 6 }}>
                        <div style={{ height: 4, background: '#e5e7eb', borderRadius: 4, marginBottom: 4 }}>
                          <div style={{ height: '100%', background: '#22C55E', borderRadius: 4, width: (PW_RULES.filter(r => r.test(regForm.password)).length / PW_RULES.length * 100) + '%', transition: 'width 0.3s' }} />
                        </div>
                        {PW_RULES.map(r => (
                          <div key={r.label} style={{ fontSize: '0.72rem', color: r.test(regForm.password) ? '#16A34A' : '#9CA3AF', marginTop: 2 }}>
                            {r.test(regForm.password) ? '✓' : '○'} {r.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 5 }}>Confirm Password *</label>
                    <input type="password" value={regForm.password_confirmation} onChange={e => setRegForm(f => ({ ...f, password_confirmation: e.target.value }))} placeholder="Repeat your password" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D4D8E8', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit" disabled={regLoading} style={{ width: '100%', padding: '12px 0', background: '#1A2B5F', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.95rem', cursor: regLoading ? 'not-allowed' : 'pointer', opacity: regLoading ? 0.7 : 1 }}>
                    {regLoading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              )}

              <div style={{ textAlign: 'center', marginTop: 18, fontSize: '0.875rem', color: '#6B7280' }}>
                Already have an account?{' '}
                <button type="button" onClick={() => setPanel('login')} style={{ background: 'none', border: 'none', color: '#1A2B5F', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* ── FORGOT PASSWORD PANEL ── */}
          {panel === 'forgot' && (
            <div>
              <button type="button" onClick={() => setPanel('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1A2B5F', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600 }}>
                <ChevronLeft size={16} /> Back to Sign In
              </button>
              <h2 style={{ color: '#1A2B5F', fontWeight: 800, fontSize: '1.3rem', marginBottom: 6 }}>Reset Password</h2>

              {forgotSent ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>✉️</div>
                  <h3 style={{ color: '#1A2B5F', marginBottom: 10 }}>Check your email</h3>
                  <p style={{ color: '#6B7280', lineHeight: 1.6, marginBottom: 22 }}>If that email is registered, we sent a reset link. Check your inbox.</p>
                  <button type="button" onClick={() => setPanel('login')} style={{ width: '100%', padding: '12px 0', background: '#1A2B5F', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-sans)', fontWeight: 700, cursor: 'pointer' }}>
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot}>
                  <p style={{ color: '#6B7280', marginBottom: 18, lineHeight: 1.6, fontSize: '0.875rem' }}>Enter your registered email and we'll send a reset link.</p>
                  {forgotErr && <div style={{ background: '#FEE2E2', borderRadius: 10, padding: '10px 14px', color: '#991B1B', fontSize: '0.85rem', marginBottom: 14 }}>{forgotErr}</div>}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: 5 }}>Email Address *</label>
                    <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D4D8E8', borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit" disabled={forgotLoading} style={{ width: '100%', padding: '12px 0', background: '#1A2B5F', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--font-sans)', fontWeight: 700, cursor: forgotLoading ? 'not-allowed' : 'pointer', opacity: forgotLoading ? 0.7 : 1 }}>
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              )}
            </div>
          )}

          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid #D4D8E8', textAlign: 'center' }}>
            <button type="button" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-sans)' }}>
              <ChevronLeft size={13} /> Back to main page
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .login-brand { display: none !important; }
          .login-form-panel { width: 100% !important; padding: 32px 22px !important; }
        }
      `}</style>
    </div>
  )
}
