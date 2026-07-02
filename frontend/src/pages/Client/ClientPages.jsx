import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderOpen, Plus, FileText, Clock, CheckCircle, XCircle,
  AlertTriangle, Upload, ChevronRight, Eye, Trash2, Loader,
  RefreshCw, HelpCircle, Search, ChevronDown, ChevronUp,
  Send, Bot, Download, X, ExternalLink
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

// ── Shared helpers ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    draft:             ['badge-draft',        'Draft'],
    submitted:         ['badge-submitted',    'Submitted'],
    under_review:      ['badge-under-review', 'Under Review'],
    pending_documents: ['badge-pending-docs', 'Needs Documents'],
    approved:          ['badge-approved',     'Approved'],
    rejected:          ['badge-rejected',     'Rejected'],
    cancelled:         ['badge-cancelled',    'Cancelled'],
  }
  const [cls, label] = map[status] || ['badge-draft', status]
  return <span className={`badge ${cls}`}>{label}</span>
}

function DocStatusBadge({ status }) {
  const map = {
    pending:            ['badge-submitted',    'Pending Review'],
    ai_reviewed:        ['badge-ai-reviewed',  'AI Reviewed'],
    approved:           ['badge-approved',     'Approved'],
    rejected:           ['badge-rejected',     'Rejected'],
    needs_resubmission: ['badge-needs-resubmit','Resubmit'],
  }
  const [cls, label] = map[status] || ['badge-draft', status]
  return <span className={`badge ${cls}`}>{label}</span>
}

// ── CLIENT HOME ─────────────────────────────────────────────────
export function ClientHome() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [apps, setApps] = useState([])

  useEffect(() => {
    api.get('/client/applications').then(r => setApps(r.data.applications?.slice(0, 3) || [])).catch(() => {})
  }, [])

  const stats = [
    { label: 'Total Applications', value: apps.length,                                                          icon: <FolderOpen size={20} />,   color: 'var(--bethel-navy)' },
    { label: 'Approved',           value: apps.filter(a => a.status === 'approved').length,                     icon: <CheckCircle size={20} />,  color: '#16A34A' },
    { label: 'Pending Review',     value: apps.filter(a => ['submitted','under_review'].includes(a.status)).length, icon: <Clock size={20} />,    color: '#D97706' },
    { label: 'Needs Attention',    value: apps.filter(a => a.status === 'pending_documents').length,             icon: <AlertTriangle size={20} />, color: '#DC2626' },
  ]

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--bethel-navy), var(--bethel-navy-mid))', borderRadius: 'var(--radius-xl)', padding: '32px 36px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(200,169,55,0.08)', pointerEvents: 'none' }} />
        <h1 style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: '1.7rem', marginBottom: 8 }}>
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>Manage your insurance applications and documents in one place.</p>
        <button className="btn btn-gold" onClick={() => navigate('/client/applications')}>
          <Plus size={16} /> New Application
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="stat-icon" style={{ background: s.color + '18' }}>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.6rem' }}>{s.value}</div>
              <div className="stat-label" style={{ fontSize: '0.7rem' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Applications</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/client/applications')}>View All <ChevronRight size={14} /></button>
        </div>
        {apps.length === 0 ? (
          <div style={{ padding: '36px 24px', textAlign: 'center', color: 'var(--bethel-text-muted)' }}>
            <FolderOpen size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ marginBottom: 14 }}>No applications yet.</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/client/applications')}><Plus size={14} /> Start Application</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Reference</th><th>Product</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {apps.map(a => (
                  <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/client/applications')}>
                    <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.reference_number}</td>
                    <td>{a.product?.name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{a.type}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td style={{ color: 'var(--bethel-text-muted)', fontSize: '0.8rem' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── CLIENT APPLICATIONS ─────────────────────────────────────────
export function ClientApplications() {
  const [apps, setApps]             = useState([])
  const [products, setProducts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [showNew, setShowNew]       = useState(false)
  const [form, setForm]             = useState({ product_id: '', type: 'policy', property_details: {} })
  const [productDetails, setProductDetails] = useState(null)
  const [creating, setCreating]     = useState(false)
  const [selected, setSelected]     = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [typeErr, setTypeErr]       = useState('')

  useEffect(() => {
    fetchApps()
    api.get('/products').then(r => setProducts(r.data.products || [])).catch(() => {})
  }, [])

  const fetchApps = async () => {
    setLoading(true)
    try { const r = await api.get('/client/applications'); setApps(r.data.applications || []) } catch {}
    finally { setLoading(false) }
  }

  const onProductChange = async (id) => {
    setForm(f => ({ ...f, product_id: id, property_details: {} }))
    if (id) { const p = products.find(p => p.id == id); if (p) setProductDetails(p) }
    else setProductDetails(null)
  }

  const [claimRef, setClaimRef]   = useState('')
  const [claimRefErr, setClaimRefErr] = useState('')

  const onTypeChange = (type) => {
    setTypeErr('')
    setClaimRef('')
    setClaimRefErr('')
    setForm(f => ({ ...f, type }))
  }

  const validateClaimRef = () => {
    if (form.type !== 'claim') return true
    if (!claimRef.trim()) { setClaimRefErr('Please enter your approved policy reference number.'); return false }
    const match = apps.find(a => a.reference_number.toUpperCase() === claimRef.toUpperCase().trim())
    if (!match) { setClaimRefErr('Policy reference number not found in your applications.'); return false }
    if (match.type !== 'policy') { setClaimRefErr('That reference number is not a policy application.'); return false }
    if (match.status !== 'approved') { setClaimRefErr(`That policy is currently "${match.status.replace(/_/g,' ')}" — only approved policies can be used for claims.`); return false }
    // Auto-fill product from the matched policy
    setForm(f => ({ ...f, product_id: match.product_id }))
    setClaimRefErr('')
    return true
  }

  const createApp = async () => {
    if (!form.product_id) return
    if (!validateClaimRef()) return
    setCreating(true)
    try {
      await api.post('/client/applications', {
        ...form,
        property_details: form.type === 'claim'
          ? { ...form.property_details, related_policy_ref: claimRef.trim() }
          : form.property_details
      })
      setShowNew(false)
      setForm({ product_id: '', type: 'policy', property_details: {} })
      setProductDetails(null)
      setClaimRef('')
      fetchApps()
    } catch {} finally { setCreating(false) }
  }

  const submitApp = async (id) => {
    setSubmitting(true)
    try { await api.put(`/client/applications/${id}`, { status: 'submitted' }); fetchApps(); setSelected(null) }
    catch {} finally { setSubmitting(false) }
  }

  const deleteApp = async (id) => {
    if (!window.confirm('Delete this draft application?')) return
    try { await api.delete(`/client/applications/${id}`); fetchApps() } catch {}
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: 'var(--bethel-navy)', fontWeight: 800, fontSize: '1.4rem' }}>Applications</h1>
          <p style={{ color: 'var(--bethel-text-muted)', fontSize: '0.875rem' }}>Manage your policy and claims applications.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setTypeErr(''); setShowNew(true) }}><Plus size={16} /> New Application</button>
      </div>

      {/* New application modal */}
      {showNew && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowNew(false)}>
          <div className="modal-box" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2>New Application</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowNew(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Application Type<span className="required">*</span></label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['policy', 'claim'].map(t => (
                    <button key={t} onClick={() => onTypeChange(t)} style={{
                      flex: 1, padding: '10px 0', borderRadius: 'var(--radius-md)',
                      border: '1.5px solid',
                      borderColor: form.type === t ? 'var(--bethel-navy)' : 'var(--bethel-border)',
                      background: form.type === t ? 'var(--bethel-light-bg)' : '#fff',
                      color: 'var(--bethel-navy)', fontWeight: 600, cursor: 'pointer',
                      textTransform: 'capitalize', fontFamily: 'var(--font-sans)',
                    }}>
                      {t === 'policy' ? '📋 New Policy' : '🔖 File a Claim'}
                    </button>
                  ))}
                </div>
                {typeErr && (
                  <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginTop: 10, fontSize: '0.82rem', color: '#92400E', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> {typeErr}
                  </div>
                )}
              </div>
              {!typeErr && form.type === 'claim' && (
                <div className="form-group">
                  <label className="form-label">Approved Policy Reference Number<span className="required">*</span></label>
                  <input
                    className={`form-input${claimRefErr ? ' error' : ''}`}
                    placeholder="e.g. BGI-P-2025-00001"
                    value={claimRef}
                    onChange={e => { setClaimRef(e.target.value.toUpperCase()); setClaimRefErr('') }}
                    onBlur={validateClaimRef}
                  />
                  {claimRefErr && (
                    <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', padding: '8px 12px', marginTop: 6, fontSize: '0.82rem', color: '#991B1B', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} /> {claimRefErr}
                    </div>
                  )}
                  <p style={{ fontSize: '0.75rem', color: 'var(--bethel-text-muted)', marginTop: 4 }}>
                    Enter the reference number of your approved policy. Format: BGI-P-YYYY-XXXXX
                  </p>
                </div>
              )}
              {!typeErr && form.type !== 'claim' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Insurance Product<span className="required">*</span></label>
                    <select className="form-select" value={form.product_id} onChange={e => onProductChange(e.target.value)}>
                      <option value="">Select product...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  {(typeof productDetails?.basic_info_fields === 'string' ? JSON.parse(productDetails.basic_info_fields) : productDetails?.basic_info_fields || []).map(field => (
                    <div key={field.key} className="form-group">
                      <label className="form-label">{field.label}</label>
                      {field.type === 'select' ? (
                        <select className="form-select" value={form.property_details[field.key] || ''} onChange={e => setForm(f => ({ ...f, property_details: { ...f.property_details, [field.key]: e.target.value } }))}>
                          <option value="">Select...</option>
                          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input className="form-input" type={field.type} value={form.property_details[field.key] || ''} onChange={e => setForm(f => ({ ...f, property_details: { ...f.property_details, [field.key]: e.target.value } }))} />
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createApp}
                disabled={creating || !!claimRefErr || (form.type === 'policy' && !form.product_id)}>
                {creating ? <><Loader size={15} className="spinner" /> Creating...</> : 'Create Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applications list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}><Loader size={28} className="spinner" color="var(--bethel-navy)" /></div>
      ) : apps.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <FolderOpen size={48} style={{ color: 'var(--bethel-border)', marginBottom: 16 }} />
          <h3 style={{ color: 'var(--bethel-navy)', marginBottom: 8 }}>No applications yet</h3>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={15} /> New Application</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {apps.map(a => (
            <div key={a.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setSelected(selected?.id === a.id ? null : a)}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, color: 'var(--bethel-navy)', fontSize: '0.95rem', marginBottom: 3 }}>{a.reference_number}</div>
                  <div style={{ color: 'var(--bethel-text-muted)', fontSize: '0.82rem' }}>{a.product?.name} · <span style={{ textTransform: 'capitalize' }}>{a.type}</span></div>
                </div>
                <StatusBadge status={a.status} />
                {a.estimated_premium && <span style={{ fontWeight: 700, color: 'var(--bethel-navy)', fontSize: '0.9rem' }}>PHP {Number(a.estimated_premium).toLocaleString()}</span>}
                <span style={{ color: 'var(--bethel-text-muted)', fontSize: '0.78rem' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {a.status === 'draft' && (
                    <>
                      <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); submitApp(a.id) }} disabled={submitting}>Submit</button>
                      <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); deleteApp(a.id) }}><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              </div>
              {selected?.id === a.id && (
                <div style={{ padding: '0 20px 18px', borderTop: '1px solid var(--bethel-border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px 20px', marginTop: 14 }}>
                    {Object.entries(a.property_details || {}).map(([k, v]) => (
                      <div key={k}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--bethel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.replace(/_/g, ' ')}</span>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {a.admin_notes && <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bethel-light-bg)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--bethel-text-muted)' }}><strong>Branch notes:</strong> {a.admin_notes}</div>}
                  {a.rejection_reason && <div style={{ marginTop: 10, padding: '10px 14px', background: '#FEE2E2', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#991B1B' }}><strong>Rejection reason:</strong> {a.rejection_reason}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── CLIENT DOCUMENTS ────────────────────────────────────────────
export function ClientDocuments() {
  const [apps, setApps]           = useState([])
  const [selApp, setSelApp]       = useState(null)
  const [docs, setDocs]           = useState([])
  const [uploading, setUploading] = useState(false)
  const [docType, setDocType]     = useState('')
  const [file, setFile]           = useState(null)
  const [required, setRequired]   = useState([])
  const [validating, setValidating] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null) // doc to delete
  const [deleting, setDeleting]   = useState(false)
  const [deleteErr, setDeleteErr] = useState('')
  const [viewDoc, setViewDoc]     = useState(null) // doc to preview
  const fileInputRef = useRef(null)

  useEffect(() => {
    api.get('/client/applications')
      .then(r => setApps(r.data.applications?.filter(a => !['draft','cancelled'].includes(a.status)) || []))
      .catch(() => {})
  }, [])

  const selectApp = async (a) => {
    setSelApp(a)
    setDocs([])
    try { const r = await api.get(`/client/applications/${a.id}/documents`); setDocs(r.data.documents || []) } catch {}
    const rd = a.product?.required_documents
    setRequired(typeof rd === 'string' ? JSON.parse(rd) : rd || [])
  }

  const upload = async () => {
    if (!file || !docType.trim() || !selApp) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('document_type', docType)
    try {
      await api.post(`/client/applications/${selApp.id}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setFile(null)
      setDocType('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      // Immediately refresh docs list
      const r = await api.get(`/client/applications/${selApp.id}/documents`)
      setDocs(r.data.documents || [])
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally { setUploading(false) }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteErr('')
    try {
      await api.delete(`/client/documents/${deleteTarget.id}`)
      setDocs(docs.filter(d => d.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setDeleteErr(err.response?.data?.message || 'Could not delete this document. It may have already been reviewed by the branch.')
    } finally { setDeleting(false) }
  }

  const reValidate = async (id) => {
    setValidating(id)
    try {
      const r = await api.post(`/documents/${id}/ai-validate`)
      setDocs(docs.map(d => d.id === id ? { ...d, ...r.data.document } : d))
    } catch {} finally { setValidating(null) }
  }

  const canDelete = (doc) => ['pending', 'needs_resubmission'].includes(doc.status)
  const canView   = (doc) => ['jpg','jpeg','png','pdf'].some(ext => doc.original_filename?.toLowerCase().endsWith(ext))

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: 'var(--bethel-navy)', fontWeight: 800, fontSize: '1.4rem' }}>Document Uploads</h1>
        <p style={{ color: 'var(--bethel-text-muted)', fontSize: '0.875rem' }}>Upload required documents for your applications. AI validates them before admin review.</p>
      </div>

      {/* Select application */}
      <div className="form-group" style={{ maxWidth: 420 }}>
        <label className="form-label">Select Application</label>
        <select className="form-select" value={selApp?.id || ''} onChange={e => {
          const a = apps.find(x => x.id == e.target.value)
          if (a) selectApp(a); else { setSelApp(null); setDocs([]) }
        }}>
          <option value="">Choose application...</option>
          {apps.map(a => <option key={a.id} value={a.id}>{a.reference_number} – {a.product?.name}</option>)}
        </select>
      </div>

      {selApp && (
        <>
          {/* Required checklist */}
          {required.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><span className="card-title">Required Documents Checklist</span></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8 }}>
                  {required.map(req => {
                    const uploaded = docs.some(d =>
                      d.document_type.toLowerCase().includes(req.toLowerCase()) ||
                      req.toLowerCase().includes(d.document_type.toLowerCase())
                    )
                    return (
                      <div key={req} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: uploaded ? '#DCFCE7' : 'var(--bethel-light-bg)', borderRadius: 'var(--radius-md)', fontSize: '0.83rem' }}>
                        {uploaded ? <CheckCircle size={15} color="#16A34A" /> : <AlertTriangle size={15} color="#D97706" />}
                        <span style={{ color: uploaded ? '#15803D' : 'var(--bethel-text)' }}>{req}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Upload form */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header"><span className="card-title">Upload Document</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Document Type<span className="required">*</span></label>
                  <select className="form-select" value={docType} onChange={e => setDocType(e.target.value)}>
                    <option value="">Select type...</option>
                    {required.map(r => <option key={r} value={r}>{r}</option>)}
                    <option value="Other Document">Other Document</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">File (PDF/JPG/PNG, max 10MB)<span className="required">*</span></label>
                  <input ref={fileInputRef} type="file" className="form-input" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setFile(e.target.files[0])} style={{ padding: '7px 12px' }} />
                </div>
              </div>
              <button className="btn btn-primary" onClick={upload} disabled={uploading || !file || !docType}>
                {uploading
                  ? <><Loader size={15} className="spinner" /> Uploading & AI validating...</>
                  : <><Upload size={15} /> Upload Document</>}
              </button>
              <p style={{ fontSize: '0.75rem', color: 'var(--bethel-text-muted)', marginTop: 8 }}>
                Documents are automatically scanned by AI before admin review. Supported: PDF, JPG, PNG (max 10MB).
              </p>
            </div>
          </div>

          {/* Uploaded docs */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Uploaded Documents ({docs.length})</span>
            </div>
            {docs.length === 0 ? (
              <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--bethel-text-muted)' }}>
                <Upload size={36} style={{ marginBottom: 10, opacity: 0.3 }} /><br />No documents uploaded yet.
              </div>
            ) : (
              <div>
                {docs.map(d => (
                  <div key={d.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--bethel-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 3 }}>{d.document_type}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--bethel-text-muted)' }}>
                          {d.original_filename} · {(d.file_size / 1024).toFixed(0)}KB
                        </div>
                      </div>
                      <DocStatusBadge status={d.status} />
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {/* View button - always show */}
                        <button className="btn btn-ghost btn-sm" onClick={() => setViewDoc(d)} title="View document">
                          <Eye size={14} /> View
                        </button>
                        {/* Re-validate */}
                        {['pending','needs_resubmission'].includes(d.status) && (
                          <button className="btn btn-ghost btn-sm" onClick={() => reValidate(d.id)} disabled={validating === d.id} title="Re-run AI validation">
                            {validating === d.id ? <Loader size={14} className="spinner" /> : <RefreshCw size={14} />}
                          </button>
                        )}
                        {/* Delete - only if deletable */}
                        {canDelete(d) && (
                          <button className="btn btn-danger btn-sm" onClick={() => { setDeleteErr(''); setDeleteTarget(d) }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AI result */}
                    {d.ai_validation_result && (
                      <div style={{ marginTop: 10, padding: '10px 12px', background: d.status === 'needs_resubmission' ? '#FEF9C3' : '#F0FDF4', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', border: '1px solid', borderColor: d.status === 'needs_resubmission' ? '#FCD34D' : '#BBF7D0' }}>
                        <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                          🤖 AI Validation
                          {d.ai_validation_result.score !== undefined && (
                            <span style={{ fontWeight: 400, color: 'var(--bethel-text-muted)' }}>· Score: {d.ai_validation_result.score}/100</span>
                          )}
                        </div>
                        <div style={{ color: 'var(--bethel-text-muted)', lineHeight: 1.5 }}>{d.ai_validation_result.summary}</div>
                        {d.ai_validation_result.issues?.length > 0 && d.ai_validation_result.issues.map((issue, i) => (
                          <div key={i} style={{ color: '#B45309', display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}><AlertTriangle size={12} />{issue}</div>
                        ))}
                        {d.ai_validation_result.suggestions?.length > 0 && d.ai_validation_result.suggestions.map((s, i) => (
                          <div key={i} style={{ color: '#15803D', display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}><CheckCircle size={12} />{s}</div>
                        ))}
                      </div>
                    )}

                    {/* Admin feedback */}
                    {d.admin_feedback && (
                      <div style={{ marginTop: 8, padding: '8px 12px', background: d.status === 'approved' ? '#DCFCE7' : '#FEE2E2', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: d.status === 'approved' ? '#15803D' : '#991B1B' }}>
                        <strong>Branch feedback:</strong> {d.admin_feedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Remove Document</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setDeleteTarget(null)} disabled={deleting}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '24px 28px 8px' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Trash2 size={22} color="#DC2626" />
              </div>
              <h3 style={{ color: 'var(--bethel-navy)', marginBottom: 8 }}>Are you sure?</h3>
              <p style={{ color: 'var(--bethel-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                You are about to remove <strong>"{deleteTarget.document_type}"</strong> ({deleteTarget.original_filename}). This cannot be undone.
              </p>
              {deleteErr && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginTop: 14, color: '#991B1B', fontSize: '0.82rem' }}>
                  {deleteErr}
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)} disabled={deleting} style={{ minWidth: 90 }}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting} style={{ minWidth: 90 }}>
                {deleting ? <><Loader size={14} className="spinner" /> Removing...</> : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View document modal ── */}
      {viewDoc && (
        <div className="modal-overlay" onClick={() => setViewDoc(null)}>
          <div className="modal-box" style={{ maxWidth: 700, width: '95vw' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{viewDoc.document_type}</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--bethel-text-muted)', marginTop: 2 }}>{viewDoc.original_filename}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={async () => {
                  try {
                    const r = await api.get(`/client/documents/${viewDoc.id}/download`, { responseType: 'blob' })
                    const url = window.URL.createObjectURL(new Blob([r.data]))
                    const a = document.createElement('a'); a.href = url; a.download = viewDoc.original_filename; a.click()
                    window.URL.revokeObjectURL(url)
                  } catch { alert('Download failed.') }
                }}>
                  <Download size={14} /> Download
                </button>
                <button className="btn btn-ghost btn-icon" onClick={() => setViewDoc(null)}><X size={18} /></button>
              </div>
            </div>
            <div style={{ padding: '0 28px 24px' }}>
              <DocStatusBadge status={viewDoc.status} />
              <ViewDocContent doc={viewDoc} />
              {viewDoc.ai_validation_result && (
                <div style={{ marginTop: 14, padding: '12px 14px', background: '#F0FDF4', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', border: '1px solid #BBF7D0' }}>
                  <strong>🤖 AI Score: {viewDoc.ai_validation_result.score}/100</strong> — {viewDoc.ai_validation_result.summary}
                </div>
              )}
              {viewDoc.admin_feedback && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: viewDoc.status === 'approved' ? '#DCFCE7' : '#FEE2E2', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: viewDoc.status === 'approved' ? '#15803D' : '#991B1B' }}>
                  <strong>Branch feedback:</strong> {viewDoc.admin_feedback}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── ViewDocContent — loads image via authenticated API ──────────
function ViewDocContent({ doc }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const isImage = ['jpg','jpeg','png'].some(ext => doc.original_filename?.toLowerCase().endsWith(ext))
  const isPdf   = doc.original_filename?.toLowerCase().endsWith('.pdf')

  useEffect(() => {
    if (!isImage) return
    api.get(`/client/documents/${doc.id}/download`, { responseType: 'blob' })
      .then(r => setBlobUrl(window.URL.createObjectURL(r.data)))
      .catch(() => {})
    return () => { if (blobUrl) window.URL.revokeObjectURL(blobUrl) }
  }, [doc.id])

  return (
    <div style={{ marginTop: 16, background: 'var(--bethel-light-bg)', borderRadius: 'var(--radius-md)', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: isImage ? 0 : 32 }}>
      {isImage && blobUrl && (
        <img src={blobUrl} alt={doc.document_type} style={{ maxWidth: '100%', maxHeight: 480, objectFit: 'contain', borderRadius: 'var(--radius-md)' }} />
      )}
      {isImage && !blobUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Loader size={24} className="spinner" color="var(--bethel-navy)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--bethel-text-muted)' }}>Loading preview...</span>
        </div>
      )}
      {isPdf && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
          <FileText size={48} color="var(--bethel-text-muted)" />
          <p style={{ color: 'var(--bethel-text-muted)', fontSize: '0.9rem' }}>PDF file — use Download button to open</p>
        </div>
      )}
      {!isImage && !isPdf && (
        <div style={{ textAlign: 'center', color: 'var(--bethel-text-muted)' }}>
          <FileText size={40} style={{ marginBottom: 8, opacity: 0.5 }} />
          <p>Preview not available — use Download button</p>
        </div>
      )}
    </div>
  )
}


export function ClientFaq() {
  const [faqs, setFaqs]     = useState([])
  const [open, setOpen]     = useState(null)
  const [q, setQ]           = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { api.get('/faqs').then(r => setFaqs(r.data.faqs || [])).catch(() => {}) }, [])

  const askAi = async () => {
    if (!q.trim() || asking) return
    setAsking(true); setAnswer('')
    try { const r = await api.post('/ai/faq-answer', { question: q }); setAnswer(r.data.answer) }
    catch { setAnswer('Sorry, I could not process your question right now.') }
    finally { setAsking(false) }
  }

  const matched = faqs.filter(f => !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase()))
  const filtered = search ? matched : matched.slice(0, 5)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--bethel-navy)', fontWeight: 800, fontSize: '1.4rem' }}>Frequently Asked Questions</h1>
        <p style={{ color: 'var(--bethel-text-muted)', fontSize: '0.875rem' }}>Find answers to common questions, or ask our AI assistant.</p>
      </div>

      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, var(--bethel-navy) 0%, var(--bethel-navy-mid) 100%)' }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--bethel-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={18} color="var(--bethel-navy-dark)" /></div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>AI Assistant</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Ask anything about Bethel Gen and our products</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" style={{ flex: 1, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}
              placeholder="Type your question here..."
              value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && askAi()}
            />
            <button className="btn btn-gold" onClick={askAi} disabled={asking || !q.trim()}>
              {asking ? <Loader size={16} className="spinner" /> : <Send size={16} />}
            </button>
          </div>
          {answer && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.875rem', lineHeight: 1.6, border: '1px solid rgba(255,255,255,0.15)' }}>
              {answer}
            </div>
          )}
        </div>
      </div>

      <div className="input-wrapper" style={{ maxWidth: 380, marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--bethel-text-muted)' }} />
        <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(f => (
          <div key={f.id} className="card" style={{ overflow: 'hidden' }}>
            <button onClick={() => setOpen(open === f.id ? null : f.id)} style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)' }}>
              <span style={{ fontWeight: 700, color: 'var(--bethel-navy)', fontSize: '0.9rem', lineHeight: 1.4 }}>{f.question}</span>
              {open === f.id ? <ChevronUp size={18} color="var(--bethel-text-muted)" /> : <ChevronDown size={18} color="var(--bethel-text-muted)" />}
            </button>
            {open === f.id && (
              <div style={{ padding: '0 20px 16px', color: 'var(--bethel-text-muted)', lineHeight: 1.7, fontSize: '0.875rem', borderTop: '1px solid var(--bethel-border)' }}>
                <div style={{ paddingTop: 14 }}>{f.answer}</div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--bethel-text-muted)' }}>
            <HelpCircle size={36} style={{ marginBottom: 10, opacity: 0.3 }} /><br />No questions match your search.
          </div>
        )}
        {!search && matched.length > filtered.length && (
          <div style={{ textAlign: 'center', padding: '6px 0', color: 'var(--bethel-text-muted)', fontSize: '0.8rem' }}>
            Showing {filtered.length} of {matched.length} questions. Use the search box above to find more.
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientHome
