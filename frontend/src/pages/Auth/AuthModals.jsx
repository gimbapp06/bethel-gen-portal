import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Eye, EyeOff, Shield, User, Lock, Mail, Phone, MapPin, Calendar, ChevronLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const PW_RULES = [
  { label: 'At least 8 characters', test: v => v.length >= 8 },
  { label: 'Uppercase letter', test: v => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: v => /[a-z]/.test(v) },
  { label: 'Number', test: v => /[0-9]/.test(v) },
  { label: 'Special character', test: v => /[^A-Za-z0-9]/.test(v) },
]

function PasswordStrength({ password }) {
  const passed = PW_RULES.filter(r => r.test(password)).length
  const pct = (passed / PW_RULES.length) * 100
  const color = pct < 40 ? '#EF4444' : pct < 80 ? '#F59E0B' : '#22C55E'
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 4, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: pct + '%', background: color, borderRadius: 4, transition: 'width 0.3s' }} />
      </div>
      {password && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {PW_RULES.map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: r.test(password) ? '#16A34A' : '#9CA3AF' }}>
              {r.test(password) ? <CheckCircle size={12} /> : <AlertCircle size={12} />} {r.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TextInput({ label, name, type='text', value, onChange, error, required, icon: Icon, placeholder, suffix }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span className="required">*</span>}</label>
      <div className="input-wrapper">
        {Icon && <Icon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--bethel-text-muted)' }} />}
        <input
          className={`form-input${error ? ' error' : ''}`}
          style={{ paddingLeft: Icon ? 36 : 14, paddingRight: (isPassword || suffix) ? 40 : 14 }}
          type={isPassword ? (show ? 'text' : 'password') : type}
          name={name} value={value} onChange={onChange}
          placeholder={placeholder}
        />
        {isPassword && (
          <span className="input-icon-right" onClick={() => setShow(!show)}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </span>
        )}
        {suffix && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--bethel-text-muted)', fontSize: '0.8rem' }}>{suffix}</span>}
      </div>
      {error && <div className="form-error"><AlertCircle size={12} />{error}</div>}
    </div>
  )
}

// ── Login Modal ────────────────────────────────────────────────
function LoginModal({ onClose, role, setRole, switchToRegister, switchToForgot }) {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiErr, setApiErr]   = useState('')

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.password) e.password = 'Password is required.'
    setErrors(e); return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault(); setApiErr('')
    if (!validate()) return
    setLoading(true)
    try {
      const user = await login(form.email, form.password, role)
      onClose()
      navigate(user.role === 'admin' ? '/admin' : '/client')
    } catch (err) {
      setApiErr(err.response?.data?.message || 'Login failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/bethel_logo_only.png" alt="" style={{ height: 32 }} onError={e => e.target.style.display='none'} />
            <h2>Sign In to Portal</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {/* Role toggle */}
          <div style={{ display: 'flex', background: 'var(--bethel-light-bg)', borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 22 }}>
            {['client', 'admin'].map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                flex: 1, padding: '8px 0', borderRadius: 'var(--radius-sm)',
                background: role === r ? '#fff' : 'transparent',
                border: role === r ? '1px solid var(--bethel-border)' : 'none',
                color: role === r ? 'var(--bethel-navy)' : 'var(--bethel-text-muted)',
                fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                boxShadow: role === r ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}>
                {r === 'client' ? 'Client' : 'Admin'}
              </button>
            ))}
          </div>

          {apiErr && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: '#991B1B', fontSize: '0.85rem', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}><AlertCircle size={16} />{apiErr}</div>}

          <form onSubmit={submit}>
            <TextInput label="Email Address" name="email" type="email" value={form.email} onChange={set} error={errors.email} required icon={Mail} placeholder="you@example.com" />
            <TextInput label="Password" name="password" type="password" value={form.password} onChange={set} error={errors.password} required icon={Lock} placeholder="Your password" />

            {role === 'client' && (
              <div style={{ textAlign: 'right', marginTop: -10, marginBottom: 16 }}>
                <button type="button" onClick={switchToForgot} style={{ background: 'none', border: 'none', color: 'var(--bethel-navy)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }} disabled={loading}>
              {loading ? <><Loader size={16} className="spinner" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {role === 'client' && (
            <div style={{ textAlign: 'center', marginTop: 18, fontSize: '0.875rem', color: 'var(--bethel-text-muted)' }}>
              No account yet?{' '}
              <button onClick={switchToRegister} style={{ background: 'none', border: 'none', color: 'var(--bethel-navy)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                Register here
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Register Modal ─────────────────────────────────────────────
function RegisterModal({ onClose, switchToLogin, preProductSlug }) {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', phone:'', address:'', birthdate:'', gender:'', password:'', password_confirmation:'' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiErr, setApiErr] = useState('')

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validateStep1 = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'First name is required.'
    if (!form.last_name.trim())  e.last_name  = 'Last name is required.'
    if (!form.email.trim())      e.email      = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.'
    if (form.phone && !/^[\d\+\-\s()]+$/.test(form.phone)) e.phone = 'Invalid phone number.'
    setErrors(e); return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e = {}
    const failedRule = PW_RULES.find(r => !r.test(form.password))
    if (!form.password) e.password = 'Password is required.'
    else if (failedRule) e.password = failedRule.label + ' required.'
    if (form.password !== form.password_confirmation) e.password_confirmation = 'Passwords do not match.'
    setErrors(e); return Object.keys(e).length === 0
  }

  const next = () => { if (validateStep1()) { setErrors({}); setStep(2) } }

  const submit = async (ev) => {
    ev.preventDefault(); setApiErr('')
    if (!validateStep2()) return
    setLoading(true)
    try {
      const user = await register(form)
      onClose()
      navigate('/client')
    } catch (err) {
      const msg = err.response?.data?.message || ''
      const fieldErrs = err.response?.data?.errors || {}
      if (Object.keys(fieldErrs).length) setErrors(Object.fromEntries(Object.entries(fieldErrs).map(([k,v]) => [k, Array.isArray(v) ? v[0] : v])))
      else setApiErr(msg || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step === 2 && <button onClick={() => setStep(1)} className="btn btn-ghost btn-icon" style={{ marginRight: 4 }}><ChevronLeft size={18} /></button>}
            <img src="/bethel_logo_only.png" alt="" style={{ height: 32 }} onError={e => e.target.style.display='none'} />
            <div>
              <h2>Create Account</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--bethel-text-muted)', marginTop: 2 }}>Step {step} of 2</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
            {[1,2].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? 'var(--bethel-navy)' : 'var(--bethel-border)', transition: 'background 0.3s' }} />
            ))}
          </div>

          {apiErr && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: '#991B1B', fontSize: '0.85rem', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}><AlertCircle size={16} />{apiErr}</div>}

          {step === 1 ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                <TextInput label="First Name" name="first_name" value={form.first_name} onChange={set} error={errors.first_name} required icon={User} />
                <TextInput label="Last Name"  name="last_name"  value={form.last_name}  onChange={set} error={errors.last_name}  required icon={User} />
              </div>
              <TextInput label="Email Address" name="email" type="email" value={form.email} onChange={set} error={errors.email} required icon={Mail} placeholder="you@example.com" />
              <TextInput label="Phone Number" name="phone" value={form.phone} onChange={set} error={errors.phone} icon={Phone} placeholder="+63 9XX XXX XXXX" />
              <TextInput label="Address" name="address" value={form.address} onChange={set} icon={MapPin} placeholder="City, Province" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                <TextInput label="Birthdate" name="birthdate" type="date" value={form.birthdate} onChange={set} icon={Calendar} />
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" name="gender" value={form.gender} onChange={set}>
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <button type="button" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }} onClick={next}>
                Continue to Password
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <TextInput label="Create Password" name="password" type="password" value={form.password} onChange={set} error={errors.password} required icon={Lock} placeholder="At least 8 characters" />
              {form.password && <PasswordStrength password={form.password} />}
              <div style={{ marginTop: 14 }} />
              <TextInput label="Confirm Password" name="password_confirmation" type="password" value={form.password_confirmation} onChange={set} error={errors.password_confirmation} required icon={Lock} placeholder="Repeat your password" />
              <div style={{ background: 'var(--bethel-light-bg)', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: '0.78rem', color: 'var(--bethel-text-muted)', marginBottom: 18, lineHeight: 1.6 }}>
                <Shield size={13} style={{ display: 'inline', marginRight: 5 }} />
                Your data is encrypted and protected under the Data Privacy Act of 2012 (RA 10173).
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }} disabled={loading}>
                {loading ? <><Loader size={16} className="spinner" /> Creating account...</> : 'Create Account'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 18, fontSize: '0.875rem', color: 'var(--bethel-text-muted)' }}>
            Already have an account?{' '}
            <button onClick={switchToLogin} style={{ background: 'none', border: 'none', color: 'var(--bethel-navy)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Forgot Password Modal ──────────────────────────────────────
function ForgotPasswordModal({ onClose, switchToLogin }) {
  const [email, setEmail] = useState('')
  const [sent, setSent]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async e => {
    e.preventDefault(); setError('')
    if (!email) { setError('Email is required.'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address.'); return }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h2>Reset Password</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {sent ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <CheckCircle size={48} color="var(--bethel-success)" style={{ marginBottom: 14 }} />
              <h3 style={{ color: 'var(--bethel-navy)', marginBottom: 10 }}>Check your email</h3>
              <p style={{ color: 'var(--bethel-text-muted)', lineHeight: 1.6 }}>If that email exists in our system, we've sent a password reset link. Please check your inbox.</p>
              <button onClick={switchToLogin} className="btn btn-primary" style={{ marginTop: 22, width: '100%', justifyContent: 'center' }}>Back to Sign In</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <p style={{ color: 'var(--bethel-text-muted)', marginBottom: 18, lineHeight: 1.6 }}>Enter your registered email and we'll send you a link to reset your password.</p>
              <TextInput label="Email Address" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} error={error} required icon={Mail} placeholder="you@example.com" />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }} disabled={loading}>
                {loading ? <><Loader size={16} className="spinner" /> Sending...</> : 'Send Reset Link'}
              </button>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button type="button" onClick={switchToLogin} style={{ background: 'none', border: 'none', color: 'var(--bethel-navy)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 4, margin: '0 auto' }}>
                  <ChevronLeft size={14} /> Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Quote Modal ────────────────────────────────────────────────
function QuoteModal({ onClose, products, switchToRegister, quoteStep, setQuoteStep, quoteProduct, setQuoteProduct, productDetails, setProductDetails, handleQuoteProduct }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' })
  const [propForm, setPropForm] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const setProp = e => setPropForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const validateContact = () => {
    const e = {}
    if (!form.full_name.trim()) e.full_name = 'Name is required.'
    if (!form.email.trim())     e.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email.'
    setErrors(e); return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validateContact()) return
    const product = products.find(p => p.slug === quoteProduct)
    setLoading(true)
    try {
      await api.post('/quotes', {
        ...form,
        product_id: productDetails?.id || product?.id,
        property_details: propForm,
      })
      setDone(true)
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Submission failed.' })
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {quoteStep > 1 && !done && <button onClick={() => setQuoteStep(quoteStep - 1)} className="btn btn-ghost btn-icon"><ChevronLeft size={18} /></button>}
            <h2>{done ? 'Quote Submitted!' : quoteStep === 1 ? 'Select a Product' : quoteStep === 2 ? 'Property Details' : 'Your Contact Info'}</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {done ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <CheckCircle size={52} color="var(--bethel-success)" style={{ marginBottom: 16 }} />
              <h3 style={{ color: 'var(--bethel-navy)', marginBottom: 10 }}>We've received your quote request!</h3>
              <p style={{ color: 'var(--bethel-text-muted)', lineHeight: 1.6, marginBottom: 22 }}>Our branch team will contact you at <strong>{form.email}</strong> within 1–2 business days with your quotation.</p>
              <p style={{ color: 'var(--bethel-text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>Want to track your application, upload documents, and receive real-time updates? Create a client account!</p>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }} onClick={() => { onClose(); switchToRegister() }}>
                Create Account
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>Close</button>
            </div>
          ) : quoteStep === 1 ? (
            <div>
              <p style={{ color: 'var(--bethel-text-muted)', marginBottom: 18, fontSize: '0.9rem' }}>Choose the type of insurance you need a quote for:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {products.map(p => (
                  <button key={p.slug} onClick={() => handleQuoteProduct(p.slug)} style={{
                    background: 'var(--bethel-light-bg)', border: '1.5px solid var(--bethel-border)',
                    borderRadius: 'var(--radius-md)', padding: '14px 12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--bethel-navy)'; e.currentTarget.style.background='var(--bethel-white)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--bethel-border)'; e.currentTarget.style.background='var(--bethel-light-bg)' }}>
                    <div style={{ color: 'var(--bethel-navy)', flexShrink: 0 }}>{p.icon}</div>
                    <span style={{ color: 'var(--bethel-navy)', fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : quoteStep === 2 ? (
            <div>
              <p style={{ color: 'var(--bethel-text-muted)', marginBottom: 18, fontSize: '0.875rem' }}>Tell us a few basic details about the property or item to be insured so we can estimate your premium.</p>
              {(typeof productDetails?.basic_info_fields === 'string'
                ? JSON.parse(productDetails.basic_info_fields)
                : productDetails?.basic_info_fields || []
              ).map(field => (
                <div key={field.key} className="form-group">
                  <label className="form-label">{field.label}</label>
                  {field.type === 'select' ? (
                    <select className="form-select" name={field.key} value={propForm[field.key] || ''} onChange={setProp}>
                      <option value="">Select...</option>
                      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input className="form-input" type={field.type} name={field.key} value={propForm[field.key] || ''} onChange={setProp} />
                  )}
                </div>
              ))}
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={() => setQuoteStep(3)}>
                Continue
              </button>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--bethel-text-muted)', marginBottom: 18, fontSize: '0.875rem' }}>Almost done! We need your contact details to send the quotation.</p>
              {errors.api && <div style={{ background: '#FEE2E2', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: '#991B1B', fontSize: '0.85rem', marginBottom: 14 }}>{errors.api}</div>}
              <TextInput label="Full Name" name="full_name" value={form.full_name} onChange={set} error={errors.full_name} required icon={User} />
              <TextInput label="Email Address" name="email" type="email" value={form.email} onChange={set} error={errors.email} required icon={Mail} />
              <TextInput label="Phone Number" name="phone" value={form.phone} onChange={set} icon={Phone} placeholder="+63 9XX XXX XXXX" />
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }} onClick={submit} disabled={loading}>
                {loading ? <><Loader size={16} className="spinner" /> Submitting...</> : 'Submit Quote Request'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Export ────────────────────────────────────────────────
export default function AuthModals({ modal, setModal, loginRole, setLoginRole, quoteStep, setQuoteStep, quoteProduct, setQuoteProduct, productDetails, setProductDetails, handleQuoteProduct, products }) {
  if (!modal) return null

  const close = () => setModal(null)

  if (modal === 'login')    return <LoginModal onClose={close} role={loginRole} setRole={setLoginRole} switchToRegister={() => setModal('register')} switchToForgot={() => setModal('forgot')} />
  if (modal === 'register') return <RegisterModal onClose={close} switchToLogin={() => setModal('login')} />
  if (modal === 'forgot')   return <ForgotPasswordModal onClose={close} switchToLogin={() => setModal('login')} />
  if (modal === 'quote')    return (
    <QuoteModal
      onClose={close}
      products={products}
      switchToRegister={() => setModal('register')}
      quoteStep={quoteStep} setQuoteStep={setQuoteStep}
      quoteProduct={quoteProduct} setQuoteProduct={setQuoteProduct}
      productDetails={productDetails} setProductDetails={setProductDetails}
      handleQuoteProduct={handleQuoteProduct}
    />
  )
  return null
}
