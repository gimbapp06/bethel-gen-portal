import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Users, FileText, CheckCircle, Clock, AlertTriangle, MessageSquare,
  Search, Loader, Eye, Send, Plus, Trash2,
  Calendar as CalIcon, Check, XCircle, Download, RefreshCw,
  BarChart2, X, ChevronLeft, ChevronRight
} from 'lucide-react'
import api from '../../utils/api'

// ── Admin doc viewer — loads image via authenticated blob ────────
function AdminViewDocContent({ doc }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const isImage = ['jpg','jpeg','png'].some(ext => doc.original_filename?.toLowerCase().endsWith(ext))
  const isPdf   = doc.original_filename?.toLowerCase().endsWith('.pdf')

  useEffect(() => {
    if (!isImage) return
    api.get(`/admin/documents/${doc.id}/download`, { responseType: 'blob' })
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
        <div style={{ textAlign: 'center', color: 'var(--bethel-text-muted)' }}>
          <FileText size={48} style={{ marginBottom: 10, opacity: 0.5 }} />
          <p style={{ fontSize: '0.9rem' }}>PDF — use Download button to open</p>
        </div>
      )}
      {!isImage && !isPdf && (
        <div style={{ textAlign: 'center', color: 'var(--bethel-text-muted)' }}>
          <FileText size={40} style={{ marginBottom: 8, opacity: 0.5 }} />
          <p>Use Download button to view this file</p>
        </div>
      )}
    </div>
  )
}

// ── Shared ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = { draft:['badge-draft','Draft'], submitted:['badge-submitted','Submitted'], under_review:['badge-under-review','Under Review'], pending_documents:['badge-pending-docs','Needs Documents'], approved:['badge-approved','Approved'], rejected:['badge-rejected','Rejected'], cancelled:['badge-cancelled','Cancelled'] }
  const [cls, label] = map[status] || ['badge-draft', status]
  return <span className={`badge ${cls}`}>{label}</span>
}
function DocBadge({ status }) {
  const map = { pending:['badge-submitted','Pending'], ai_reviewed:['badge-ai-reviewed','AI Reviewed'], approved:['badge-approved','Approved'], rejected:['badge-rejected','Rejected'], needs_resubmission:['badge-needs-resubmit','Resubmit'] }
  const [cls, label] = map[status] || ['badge-draft', status]
  return <span className={`badge ${cls}`}>{label}</span>
}

// ── ADMIN DASHBOARD ─────────────────────────────────────────────
export function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.get('/admin/dashboard').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false)) }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Loader size={32} className="spinner" color="var(--bethel-navy)" /></div>

  const stats = [
    { label: 'Total Clients', value: data?.stats?.total_clients || 0, icon: <Users size={20} />, color: '#185FA5', bg: '#E6F1FB' },
    { label: 'Total Applications', value: data?.stats?.total_applications || 0, icon: <FileText size={20} />, color: '#534AB7', bg: '#EEEDFE' },
    { label: 'Pending Review', value: data?.stats?.pending_applications || 0, icon: <Clock size={20} />, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Approved', value: data?.stats?.approved_applications || 0, icon: <CheckCircle size={20} />, color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Pending Docs', value: data?.stats?.pending_documents || 0, icon: <AlertTriangle size={20} />, color: '#DC2626', bg: '#FEE2E2' },
    { label: 'Unread Messages', value: data?.stats?.unread_messages || 0, icon: <MessageSquare size={20} />, color: '#0369A1', bg: '#E0F2FE', onClick: () => navigate('/admin/messages') },
  ]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--bethel-navy)', fontWeight: 800, fontSize: '1.5rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--bethel-text-muted)' }}>Overview of branch operations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: s.onClick ? 'pointer' : 'default', transition: 'transform 0.15s' }}
            onMouseEnter={e => s.onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => s.onClick && (e.currentTarget.style.transform = '')}
            onClick={s.onClick}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--bethel-navy)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--bethel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 22 }}>
        {/* Recent applications */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Applications</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/applications')}>View All <ChevronRight size={14} /></button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Reference</th><th>Client</th><th>Product</th><th>Status</th></tr></thead>
              <tbody>
                {(data?.recent_applications || []).map(a => (
                  <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/applications/${a.id}`)}>
                    <td style={{ fontWeight: 600, fontSize: '0.82rem' }}>{a.reference_number}</td>
                    <td style={{ fontSize: '0.85rem' }}>{a.user?.first_name} {a.user?.last_name}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--bethel-text-muted)' }}>{a.product?.name}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
                {!(data?.recent_applications?.length) && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--bethel-text-muted)', padding: 24 }}>No applications yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent clients */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">New Clients</span>
          </div>
          <div style={{ padding: '0 4px' }}>
            {(data?.recent_clients || []).map(c => (
              <div key={c.id} style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--bethel-border)' }}>
                <div className="avatar">{(c.first_name[0] + c.last_name[0]).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.first_name} {c.last_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--bethel-text-muted)' }}>{c.email}</div>
                </div>
              </div>
            ))}
            {!(data?.recent_clients?.length) && <div style={{ padding: 24, textAlign: 'center', color: 'var(--bethel-text-muted)', fontSize: '0.875rem' }}>No clients yet.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ADMIN APPLICATIONS ──────────────────────────────────────────
export function AdminApplications({ type }) {
  const navigate = useNavigate()
  const [apps, setApps]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage]     = useState(1)
  const [meta, setMeta]     = useState({})

  useEffect(() => { fetchApps() }, [search, status, page, type])

  const fetchApps = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, ...(search && { search }), ...(status && { status }), ...(type && { type }) })
      const r = await api.get(`/admin/applications?${params}`)
      setApps(r.data.data || [])
      setMeta({ last_page: r.data.last_page, total: r.data.total })
    } catch {} finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: 'var(--bethel-navy)', fontWeight: 800, fontSize: '1.4rem' }}>{type === 'claim' ? 'Claims' : 'Policy Applications'}</h1>
        <p style={{ color: 'var(--bethel-text-muted)', fontSize: '0.875rem' }}>Review and manage {type === 'claim' ? 'client claims' : 'policy applications'}.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="input-wrapper" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--bethel-text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search by reference or client name..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="form-select" style={{ width: 180 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          {['draft','submitted','under_review','pending_documents','approved','rejected','cancelled'].map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div style={{ padding: 48, textAlign: 'center' }}><Loader size={28} className="spinner" color="var(--bethel-navy)" /></div> : (
          <>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Reference</th><th>Client</th><th>Product</th><th>Type</th><th>Status</th><th>Premium</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {apps.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600, fontSize: '0.82rem' }}>{a.reference_number}</td>
                      <td style={{ fontSize: '0.85rem' }}>{a.user?.first_name} {a.user?.last_name}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--bethel-text-muted)' }}>{a.product?.name}</td>
                      <td style={{ textTransform: 'capitalize', fontSize: '0.82rem' }}>{a.type}</td>
                      <td><StatusBadge status={a.status} /></td>
                      <td style={{ fontSize: '0.82rem' }}>{a.estimated_premium ? 'PHP ' + Number(a.estimated_premium).toLocaleString() : '–'}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--bethel-text-muted)' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/applications/${a.id}`)}><Eye size={14} /> View</button></td>
                    </tr>
                  ))}
                  {apps.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--bethel-text-muted)' }}>No applications found.</td></tr>}
                </tbody>
              </table>
            </div>
            {meta.last_page > 1 && (
              <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--bethel-border)', fontSize: '0.85rem', color: 'var(--bethel-text-muted)' }}>
                <span>Total: {meta.total} records</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}><ChevronLeft size={14} /></button>
                  <span style={{ padding: '0 8px', fontWeight: 600 }}>Page {page} / {meta.last_page}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(meta.last_page, p+1))} disabled={page === meta.last_page}><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── ADMIN APPLICATION DETAIL ────────────────────────────────────
export function AdminApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [app, setApp]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [statusForm, setStatusForm]   = useState({ status: '', rejection_reason: '', admin_notes: '' })
  const [premiumForm, setPremiumForm] = useState('')
  const [docFeedback, setDocFeedback] = useState({})
  const [taskForm, setTaskForm]       = useState({ title: '', priority: 'medium', task_type: 'document_review', due_date: '' })
  const [note, setNote] = useState('')
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => { fetchApp() }, [id])

  const fetchApp = async () => {
    setLoading(true)
    try { const r = await api.get(`/admin/applications/${id}`); setApp(r.data.application); setStatusForm(f => ({ ...f, status: r.data.application.status })) } catch {} finally { setLoading(false) }
  }

  const updateStatus = async () => {
    setUpdating(true)
    try { await api.put(`/admin/applications/${id}/status`, statusForm); fetchApp() } catch {} finally { setUpdating(false) }
  }

  const setPremium = async () => {
    if (!premiumForm) return
    try { await api.put(`/admin/applications/${id}/premium`, { estimated_premium: premiumForm }); fetchApp() } catch {}
  }

  const addNote = async () => {
    if (!note.trim()) return
    try { await api.post(`/admin/applications/${id}/notes`, { note }); setNote(''); fetchApp() } catch {}
  }

  const [viewDoc, setViewDoc]       = useState(null)
  const [taskSuccess, setTaskSuccess] = useState(false)
  const [creatingTask, setCreatingTask] = useState(false)

  const approveDoc = async (docId) => {
    try { await api.put(`/admin/documents/${docId}/approve`, { feedback: docFeedback[docId] || 'Document approved.' }); fetchApp() } catch {}
  }

  const rejectDoc = async (docId) => {
    if (!docFeedback[docId]?.trim()) { alert('Please provide rejection feedback.'); return }
    try { await api.put(`/admin/documents/${docId}/reject`, { feedback: docFeedback[docId] }); fetchApp() } catch {}
  }

  const downloadDoc = async (docId, filename) => {
    try {
      const r = await api.get(`/admin/documents/${docId}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([r.data]))
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
      window.URL.revokeObjectURL(url)
    } catch { alert('Download failed. The file may not be available.') }
  }

  const createTask = async () => {
    if (!taskForm.title || !taskForm.due_date) return
    setCreatingTask(true)
    try {
      await api.post('/admin/calendar', { ...taskForm, application_id: parseInt(id), client_id: app?.user_id })
      setTaskForm({ title: '', priority: 'medium', task_type: 'document_review', due_date: '' })
      setTaskSuccess(true)
    } catch { alert('Failed to create task. Please try again.') }
    finally { setCreatingTask(false) }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Loader size={32} className="spinner" color="var(--bethel-navy)" /></div>
  if (!app) return <div style={{ padding: 40, color: 'var(--bethel-text-muted)' }}>Application not found.</div>

  const TABS = ['details', 'documents', 'status', 'tasks']

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}><ChevronLeft size={15} /> Back</button>
        <div>
          <h1 style={{ color: 'var(--bethel-navy)', fontWeight: 800, fontSize: '1.3rem' }}>{app.reference_number}</h1>
          <p style={{ color: 'var(--bethel-text-muted)', fontSize: '0.82rem' }}>{app.user?.first_name} {app.user?.last_name} · {app.product?.name} · <span style={{ textTransform: 'capitalize' }}>{app.type}</span></p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--bethel-border)', marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: activeTab === t ? 700 : 500, color: activeTab === t ? 'var(--bethel-navy)' : 'var(--bethel-text-muted)', borderBottom: activeTab === t ? '2px solid var(--bethel-navy)' : '2px solid transparent', marginBottom: -2, transition: 'all 0.15s', textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Details tab */}
      {activeTab === 'details' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Client Information</span></div>
            <div className="card-body">
              {[['Name', `${app.user?.first_name} ${app.user?.last_name}`], ['Email', app.user?.email], ['Phone', app.user?.phone || '–'], ['Address', app.user?.address || '–']].map(([k,v]) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--bethel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Property / Item Details</span></div>
            <div className="card-body">
              {Object.entries(app.property_details || {}).map(([k,v]) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--bethel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.replace(/_/g,' ')}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{v}</div>
                </div>
              ))}
              {!Object.keys(app.property_details || {}).length && <span style={{ color: 'var(--bethel-text-muted)' }}>No property details.</span>}
            </div>
          </div>
          <div className="card" style={{ gridColumn: '1/-1' }}>
            <div className="card-header"><span className="card-title">Admin Notes</span></div>
            <div className="card-body">
              {app.admin_notes && <pre style={{ fontSize: '0.85rem', color: 'var(--bethel-text-muted)', whiteSpace: 'pre-wrap', marginBottom: 14, fontFamily: 'var(--font-sans)' }}>{app.admin_notes}</pre>}
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" placeholder="Add a note..." value={note} onChange={e => setNote(e.target.value)} style={{ flex: 1 }} />
                <button className="btn btn-primary btn-sm" onClick={addNote} disabled={!note.trim()}>Add Note</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents tab */}
      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {app.documents?.length === 0 ? (
            <div className="card" style={{ padding: '36px 24px', textAlign: 'center', color: 'var(--bethel-text-muted)' }}>No documents uploaded yet.</div>
          ) : app.documents?.map(d => (
            <div key={d.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 2 }}>{d.document_type}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--bethel-text-muted)' }}>{d.original_filename} · {(d.file_size/1024).toFixed(0)}KB</div>
                </div>
                <DocBadge status={d.status} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setViewDoc(d)}>
                    <Eye size={14} /> View
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => downloadDoc(d.id, d.original_filename)}>
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>
              {d.ai_validation_result && (
                <div style={{ padding: '10px 20px', background: 'var(--bethel-light-bg)', borderTop: '1px solid var(--bethel-border)', fontSize: '0.8rem' }}>
                  <strong>🤖 AI:</strong> {d.ai_validation_result.summary} (Score: {d.ai_validation_result.score}/100)
                  {d.ai_validation_result.issues?.map((i,idx) => <span key={idx} style={{ color: '#B45309', marginLeft: 8 }}>⚠ {i}</span>)}
                </div>
              )}
              {!['approved','rejected'].includes(d.status) && (
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--bethel-border)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input className="form-input" style={{ flex: 1, minWidth: 200 }} placeholder="Feedback (required for rejection)..." value={docFeedback[d.id] || ''} onChange={e => setDocFeedback(f => ({ ...f, [d.id]: e.target.value }))} />
                  <button className="btn btn-sm" style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }} onClick={() => approveDoc(d.id)}><CheckCircle size={14} /> Approve</button>
                  <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }} onClick={() => rejectDoc(d.id)}><XCircle size={14} /> Reject</button>
                </div>
              )}
              {d.admin_feedback && <div style={{ padding: '8px 20px', fontSize: '0.8rem', color: d.status === 'approved' ? '#15803D' : '#991B1B', background: d.status === 'approved' ? '#F0FDF4' : '#FEF2F2', borderTop: '1px solid var(--bethel-border)' }}>Feedback: {d.admin_feedback}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Status tab */}
      {activeTab === 'status' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Update Status</span></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select className="form-select" value={statusForm.status} onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}>
                  {['submitted','under_review','pending_documents','approved','rejected','cancelled'].map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              {statusForm.status === 'rejected' && (
                <div className="form-group">
                  <label className="form-label">Rejection Reason<span className="required">*</span></label>
                  <textarea className="form-textarea" rows={3} value={statusForm.rejection_reason} onChange={e => setStatusForm(f => ({ ...f, rejection_reason: e.target.value }))} placeholder="Explain why this application was rejected..." />
                </div>
              )}
              <button className="btn btn-primary" onClick={updateStatus} disabled={updating}>
                {updating ? <><Loader size={15} className="spinner" /> Updating...</> : 'Update Status'}
              </button>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Set Premium</span></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Estimated Premium (PHP)</label>
                <input className="form-input" type="number" placeholder="0.00" value={premiumForm} onChange={e => setPremiumForm(e.target.value)} />
              </div>
              {app.estimated_premium && <p style={{ fontSize: '0.8rem', color: 'var(--bethel-text-muted)', marginBottom: 12 }}>Current: PHP {Number(app.estimated_premium).toLocaleString()}</p>}
              <button className="btn btn-primary" onClick={setPremium} disabled={!premiumForm}>Set Premium</button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks tab */}
      {activeTab === 'tasks' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Create Calendar Task</span></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Task Title<span className="required">*</span></label>
                <input className="form-input" placeholder="e.g. Review documents for BGI-P-2025-00001" value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Task Type</label>
                <select className="form-select" value={taskForm.task_type} onChange={e => setTaskForm(f => ({ ...f, task_type: e.target.value }))}>
                  {[['document_review','Document Review'],['policy_issuance','Policy Issuance'],['claim_processing','Claim Processing'],['message_reply','Message Reply'],['other','Other']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date<span className="required">*</span></label>
                <input className="form-input" type="date" value={taskForm.due_date} onChange={e => setTaskForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={createTask} disabled={!taskForm.title || !taskForm.due_date || creatingTask}>
              {creatingTask ? <><Loader size={15} className="spinner" /> Adding...</> : <><Plus size={15} /> Add to Calendar</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Task success modal ── */}
      {taskSuccess && (
        <div className="modal-overlay" onClick={() => setTaskSuccess(false)}>
          <div className="modal-box" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Task Added!</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setTaskSuccess(false)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '24px 28px 8px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <CheckCircle size={28} color="#16A34A" />
              </div>
              <h3 style={{ color: 'var(--bethel-navy)', marginBottom: 8 }}>Task successfully added!</h3>
              <p style={{ color: 'var(--bethel-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                The task has been added to your calendar. You can view and manage it from the Calendar section.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setTaskSuccess(false)} style={{ minWidth: 90 }}>Close</button>
              <button className="btn btn-primary" onClick={() => { setTaskSuccess(false); navigate('/admin/calendar') }} style={{ minWidth: 120 }}>
                Go to Calendar
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
                <p style={{ fontSize: '0.75rem', color: 'var(--bethel-text-muted)', marginTop: 2 }}>{viewDoc.original_filename} · {(viewDoc.file_size/1024).toFixed(0)}KB</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => downloadDoc(viewDoc.id, viewDoc.original_filename)}>
                  <Download size={14} /> Download
                </button>
                <button className="btn btn-ghost btn-icon" onClick={() => setViewDoc(null)}><X size={18} /></button>
              </div>
            </div>
            <div style={{ padding: '0 28px 24px' }}>
              <DocBadge status={viewDoc.status} />
              <AdminViewDocContent doc={viewDoc} />
              {viewDoc.ai_validation_result && (
                <div style={{ marginTop: 14, padding: '12px 14px', background: '#F0FDF4', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', border: '1px solid #BBF7D0' }}>
                  <strong>🤖 AI Score: {viewDoc.ai_validation_result.score}/100</strong> — {viewDoc.ai_validation_result.summary}
                </div>
              )}
              {viewDoc.admin_feedback && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: viewDoc.status === 'approved' ? '#DCFCE7' : '#FEE2E2', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: viewDoc.status === 'approved' ? '#15803D' : '#991B1B' }}>
                  <strong>Feedback given:</strong> {viewDoc.admin_feedback}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── ADMIN MESSAGES ──────────────────────────────────────────────
export function AdminMessages() {
  const [threads, setThreads] = useState([])
  const [active, setActive]   = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput]     = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const msgEndRef = useRef(null)
  const { user } = require('../../context/AuthContext').useAuth ? require('../../context/AuthContext') : { useAuth: () => ({}) }

  // Can't use hooks in block — grab from window
  const adminUser = JSON.parse(localStorage.getItem('bethel_user') || '{}')

  useEffect(() => { fetchThreads() }, [])
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (!active) return
    const ch = echo.private(`thread.${active.id}`)
    ch.listen('.new-message', () => fetchMessages(active.id))
    return () => echo.leave(`thread.${active.id}`)
  }, [active])

  const fetchThreads = async () => { setLoading(true); try { const r = await api.get('/admin/messages/threads'); setThreads(r.data.data || r.data || []) } catch {} finally { setLoading(false) } }

  const openThread = async (thread) => {
    setActive(thread)
    await fetchMessages(thread.id)
    try { await api.put(`/admin/messages/threads/${thread.id}/read`); fetchThreads() } catch {}
  }

  const fetchMessages = async (id) => { try { const r = await api.get(`/admin/messages/threads/${id}`); setMessages(r.data.messages || []) } catch {} }

  const send = async () => {
    if (!input.trim() || sending || !active) return
    setSending(true)
    try { await api.post(`/admin/messages/threads/${active.id}`, { body: input }); setInput(''); fetchMessages(active.id) } catch {} finally { setSending(false) }
  }

  return (
    <div>
      <h1 style={{ color: 'var(--bethel-navy)', fontWeight: 800, fontSize: '1.4rem', marginBottom: 20 }}>Messages</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 0, background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bethel-border)', overflow: 'hidden', height: 'calc(100vh - 200px)', minHeight: 500 }}>
        {/* Thread list */}
        <div style={{ borderRight: '1px solid var(--bethel-border)', overflowY: 'auto' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--bethel-border)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--bethel-navy)' }}>Conversations</div>
          {loading ? <div style={{ padding: 24, textAlign: 'center' }}><Loader size={20} className="spinner" color="var(--bethel-navy)" /></div>
          : threads.length === 0 ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--bethel-text-muted)', fontSize: '0.875rem' }}>No messages yet.</div>
          : threads.map(t => (
            <div key={t.id} onClick={() => openThread(t)} style={{ padding: '12px 14px', borderBottom: '1px solid var(--bethel-border)', cursor: 'pointer', background: active?.id === t.id ? 'var(--bethel-light-bg)' : t.admin_has_unread ? '#FFF9E6' : 'transparent', transition: 'background 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontWeight: t.admin_has_unread ? 700 : 500, fontSize: '0.85rem', color: 'var(--bethel-text)' }}>{t.client?.first_name} {t.client?.last_name}</span>
                {t.admin_has_unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bethel-navy)', flexShrink: 0, marginTop: 5 }} />}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--bethel-text-muted)', marginBottom: 2, fontWeight: 500 }}>{t.subject}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--bethel-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.latest_message?.body || ''}</div>
            </div>
          ))}
        </div>

        {/* Message view */}
        {!active ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bethel-text-muted)', flexDirection: 'column', gap: 10 }}>
            <MessageSquare size={40} style={{ opacity: 0.3 }} />
            <span>Select a conversation</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--bethel-border)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <div className="avatar">{active.client?.first_name?.[0]}{active.client?.last_name?.[0]}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{active.client?.first_name} {active.client?.last_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--bethel-text-muted)' }}>{active.subject}</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map(m => {
                const isMine = m.sender_id === adminUser.id
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: 8 }}>
                    {!isMine && <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.7rem', flexShrink: 0, marginTop: 4 }}>{active.client?.first_name?.[0]}{active.client?.last_name?.[0]}</div>}
                    <div style={{ maxWidth: '72%' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--bethel-text-muted)', marginBottom: 2, textAlign: isMine ? 'right' : 'left' }}>{m.sender?.full_name}</div>
                      <div style={{ padding: '10px 14px', borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: isMine ? 'var(--bethel-navy)' : 'var(--bethel-light-bg)', color: isMine ? '#fff' : 'var(--bethel-text)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                        {m.body}
                        <div style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: 4, textAlign: 'right' }}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={msgEndRef} />
            </div>
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--bethel-border)', display: 'flex', gap: 8 }}>
              <input className="form-input" style={{ flex: 1 }} placeholder="Type a reply..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} />
              <button className="btn btn-primary btn-icon" onClick={send} disabled={sending || !input.trim()}><Send size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── ADMIN CALENDAR ──────────────────────────────────────────────
const PRIORITY_COLORS = { high: '#DC2626', medium: '#D97706', low: '#16A34A' }
const PRIORITY_BG     = { high: '#FEE2E2', medium: '#FEF3C7', low: '#DCFCE7' }
const TASK_TYPE_LABELS = { document_review: 'Doc Review', policy_issuance: 'Policy Issuance', claim_processing: 'Claim Processing', message_reply: 'Message Reply', other: 'Other' }

export function AdminCalendar() {
  const [tasks, setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('all')
  const [month, setMonth]   = useState(() => new Date().toISOString().slice(0, 7))
  const [form, setForm]     = useState({ title: '', description: '', priority: 'medium', task_type: 'other', due_date: '', due_time: '' })

  useEffect(() => { fetchTasks() }, [month])
  const fetchTasks = async () => { setLoading(true); try { const r = await api.get(`/admin/calendar?month=${month}`); setTasks(r.data.tasks || []) } catch {} finally { setLoading(false) } }

  const toggle = async (id) => { try { const r = await api.put(`/admin/calendar/${id}/toggle`); setTasks(t => t.map(x => x.id === id ? r.data.task : x)) } catch {} }
  const deleteTask = async (id) => { try { await api.delete(`/admin/calendar/${id}`); setTasks(t => t.filter(x => x.id !== id)) } catch {} }

  const addTask = async () => {
    if (!form.title || !form.due_date) return
    try { const r = await api.post('/admin/calendar', form); setTasks(t => [...t, r.data.task]); setForm({ title: '', description: '', priority: 'medium', task_type: 'other', due_date: '', due_time: '' }); setShowAdd(false) } catch {}
  }

  // Safe date formatter — handles both '2026-06-09' and '2026-06-09T00:00:00.000000Z'
  const safeDate = (dateStr) => {
    if (!dateStr) return 'Unknown Date'
    // Extract just the YYYY-MM-DD part regardless of format
    const datePart = dateStr.split('T')[0]
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return 'Invalid Date'
    const d = new Date(datePart + 'T12:00:00') // use noon to avoid timezone shifts
    if (isNaN(d)) return 'Invalid Date'
    return d.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.priority === filter || t.status === filter)
  // Normalize due_date to YYYY-MM-DD for grouping
  const groupedByDate = filtered.reduce((acc, t) => {
    const d = (t.due_date || '').split('T')[0]
    if (!acc[d]) acc[d] = []
    acc[d].push(t)
    return acc
  }, {})

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: 'var(--bethel-navy)', fontWeight: 800, fontSize: '1.4rem' }}>Task Calendar</h1>
          <p style={{ color: 'var(--bethel-text-muted)', fontSize: '0.875rem' }}>Manage and track your branch tasks by priority.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input type="month" className="form-input" style={{ width: 'auto' }} value={month} onChange={e => setMonth(e.target.value)} />
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Task</button>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['all','All'], ['high','🔴 High'], ['medium','🟡 Medium'], ['low','🟢 Low'], ['done','✅ Done']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)} className="btn btn-sm" style={{ background: filter === v ? 'var(--bethel-navy)' : 'var(--bethel-light-bg)', color: filter === v ? '#fff' : 'var(--bethel-text)', border: '1px solid', borderColor: filter === v ? 'var(--bethel-navy)' : 'var(--bethel-border)' }}>{l}</button>
        ))}
      </div>

      {/* Add task modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-box">
            <div className="modal-header"><h2>Add Task</h2><button className="btn btn-ghost btn-icon" onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title<span className="required">*</span></label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Task description..." />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                <div className="form-group">
                  <label className="form-label">Task Type</label>
                  <select className="form-select" value={form.task_type} onChange={e => setForm(f => ({ ...f, task_type: e.target.value }))}>
                    {Object.entries(TASK_TYPE_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date<span className="required">*</span></label>
                  <input type="date" className="form-input" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Time</label>
                  <input type="time" className="form-input" value={form.due_time} onChange={e => setForm(f => ({ ...f, due_time: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addTask} disabled={!form.title || !form.due_date}>Add Task</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: 48 }}><Loader size={28} className="spinner" color="var(--bethel-navy)" /></div>
      : Object.keys(groupedByDate).length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--bethel-text-muted)' }}>
          <CalIcon size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p>No tasks for this month. Add one to get started.</p>
        </div>
      ) : Object.entries(groupedByDate).sort(([a],[b]) => a.localeCompare(b)).map(([date, dayTasks]) => (
        <div key={date} style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: 'var(--bethel-navy)', fontSize: '0.9rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalIcon size={15} />
            {safeDate(date)}
            <span style={{ background: 'var(--bethel-light-bg)', padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>{dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dayTasks.map(t => (
              <div key={t.id} style={{ background: '#fff', border: '1px solid var(--bethel-border)', borderLeft: `4px solid ${PRIORITY_COLORS[t.priority]}`, borderRadius: `0 var(--radius-md) var(--radius-md) 0`, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <button onClick={() => toggle(t.id)} style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${PRIORITY_COLORS[t.priority]}`, background: t.is_checked ? PRIORITY_COLORS[t.priority] : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 1 }}>
                  {t.is_checked && <Check size={12} color="#fff" />}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: t.is_checked ? 400 : 700, color: t.is_checked ? 'var(--bethel-text-muted)' : 'var(--bethel-text)', textDecoration: t.is_checked ? 'line-through' : 'none', fontSize: '0.9rem', marginBottom: 3 }}>{t.title}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: PRIORITY_BG[t.priority], color: PRIORITY_COLORS[t.priority] }}>{t.priority.toUpperCase()}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--bethel-text-muted)', background: 'var(--bethel-light-bg)', padding: '2px 8px', borderRadius: 12 }}>{TASK_TYPE_LABELS[t.task_type]}</span>
                    {t.due_time && <span style={{ fontSize: '0.72rem', color: 'var(--bethel-text-muted)' }}>🕐 {t.due_time}</span>}
                    {t.client && <span style={{ fontSize: '0.72rem', color: 'var(--bethel-text-muted)' }}>👤 {t.client.first_name} {t.client.last_name}</span>}
                  </div>
                  {t.description && <div style={{ fontSize: '0.8rem', color: 'var(--bethel-text-muted)', marginTop: 4 }}>{t.description}</div>}
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => deleteTask(t.id)}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── ADMIN REPORTS ───────────────────────────────────────────────
export function AdminReports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.get('/admin/reports/summary').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false)) }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Loader size={32} className="spinner" color="var(--bethel-navy)" /></div>

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--bethel-navy)', fontWeight: 800, fontSize: '1.4rem' }}>Reports & Summary</h1>
        <p style={{ color: 'var(--bethel-text-muted)' }}>Overview of branch application activity.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[['Total Applications', data?.totals?.applications, '#185FA5', '#E6F1FB'], ['Total Clients', data?.totals?.clients, '#534AB7', '#EEEDFE'], ['Approved', data?.totals?.approved, '#16A34A', '#DCFCE7'], ['Documents', data?.totals?.documents, '#D97706', '#FEF3C7']].map(([label, value, color, bg]) => (
          <div key={label} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <BarChart2 size={20} color={color} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--bethel-navy)' }}>{value || 0}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--bethel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Monthly breakdown */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="card-header"><span className="card-title">Applications Per Month</span></div>
        <div className="card-body">
          {data?.by_month?.length === 0 ? <p style={{ color: 'var(--bethel-text-muted)' }}>No data yet.</p> : (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              {(data?.by_month || []).map(m => {
                const maxCount = Math.max(...(data.by_month.map(x => x.count)), 1)
                const pct = (m.count / maxCount) * 100
                return (
                  <div key={m.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--bethel-navy)' }}>{m.count}</span>
                    <div style={{ width: 36, height: Math.max(20, pct * 1.2), background: 'var(--bethel-navy)', borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} />
                    <span style={{ fontSize: '0.68rem', color: 'var(--bethel-text-muted)' }}>{m.month?.slice(5)}/{m.month?.slice(2,4)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
