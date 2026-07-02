import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, Loader, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

export default function AdminMessages() {
  const { user } = useAuth()
  const [threads, setThreads]   = useState([])
  const [active, setActive]     = useState(null)
  const [messages, setMessages] = useState([])
  const [sending, setSending]   = useState(false)
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [meta, setMeta]         = useState({})
  const msgEndRef  = useRef(null)
  const inputRef   = useRef(null)
  const activeRef  = useRef(null)
  const pollRef    = useRef(null)

  // Keep activeRef in sync
  useEffect(() => { activeRef.current = active }, [active])

  useEffect(() => { fetchThreads() }, [page])

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll messages every 3s using ref - never touches input state
  useEffect(() => {
    pollRef.current = setInterval(() => {
      if (activeRef.current?.id) fetchMessages(activeRef.current.id)
    }, 3000)
    return () => clearInterval(pollRef.current)
  }, [])

  const fetchThreads = async () => {
    setLoading(true)
    try {
      const r = await api.get(`/admin/messages/threads?page=${page}`)
      const payload = r.data
      setThreads(payload.data || payload || [])
      if (payload.last_page) setMeta({ last_page: payload.last_page, total: payload.total })
    } catch {}
    finally { setLoading(false) }
  }

  const openThread = async (thread) => {
    setActive(thread)
    activeRef.current = thread
    await fetchMessages(thread.id)
    try { await api.put(`/admin/messages/threads/${thread.id}/read`) } catch {}
    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, admin_has_unread: false } : t))
  }

  const fetchMessages = async (id) => {
    try {
      const r = await api.get(`/admin/messages/threads/${id}`)
      setMessages(r.data.messages || [])
    } catch {}
  }

  const send = async () => {
    const body = inputRef.current?.value?.trim()
    if (!body || sending || !activeRef.current) return
    if (inputRef.current) inputRef.current.value = ''
    setSending(true)
    try {
      await api.post(`/admin/messages/threads/${activeRef.current.id}`, { body })
      await fetchMessages(activeRef.current.id)
    } catch {
      if (inputRef.current) inputRef.current.value = body
    } finally { setSending(false) }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)' }}>
      <h1 style={{ color: 'var(--bethel-navy)', fontWeight: 800, fontSize: '1.4rem', marginBottom: 16, flexShrink: 0 }}>
        Messages
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--bethel-border)',
        overflow: 'hidden',
        flex: 1,
        minHeight: 0, // critical for scroll to work
      }}>

        {/* ── Thread list ── */}
        <div style={{ borderRight: '1px solid var(--bethel-border)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--bethel-border)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--bethel-navy)', flexShrink: 0 }}>
            Conversations
          </div>

          {/* Scrollable thread list */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {loading ? (
              <div style={{ padding: 28, textAlign: 'center' }}>
                <Loader size={22} className="spinner" color="var(--bethel-navy)" />
              </div>
            ) : threads.length === 0 ? (
              <div style={{ padding: 28, textAlign: 'center', color: 'var(--bethel-text-muted)', fontSize: '0.875rem' }}>
                No messages yet.
              </div>
            ) : threads.map(t => (
              <div
                key={t.id}
                onClick={() => openThread(t)}
                style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid var(--bethel-border)',
                  cursor: 'pointer',
                  background: active?.id === t.id
                    ? 'var(--bethel-light-bg)'
                    : t.admin_has_unread ? '#FFFBEB' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                  <span style={{ fontWeight: t.admin_has_unread ? 700 : 500, fontSize: '0.85rem', color: 'var(--bethel-text)' }}>
                    {t.client?.first_name} {t.client?.last_name}
                  </span>
                  {t.admin_has_unread && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bethel-navy)', flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--bethel-text-muted)', marginBottom: 2, fontWeight: 600 }}>
                  {t.subject || 'General Inquiry'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--bethel-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t.latest_message?.body || ''}
                </div>
                {t.application && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--bethel-navy)', marginTop: 3, fontWeight: 600 }}>
                    📋 {t.application.reference_number}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div style={{ padding: '10px 12px', borderTop: '1px solid var(--bethel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: '0.75rem', color: 'var(--bethel-text-muted)' }}>{page}/{meta.last_page}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── Message view ── */}
        {!active ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bethel-text-muted)', flexDirection: 'column', gap: 10 }}>
            <MessageSquare size={44} style={{ opacity: 0.25 }} />
            <span style={{ fontSize: '0.9rem' }}>Select a conversation to view messages</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>

            {/* Thread header */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--bethel-border)', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
              <div className="avatar" style={{ background: 'var(--bethel-navy)' }}>
                {active.client?.first_name?.[0]}{active.client?.last_name?.[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                  {active.client?.first_name} {active.client?.last_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--bethel-text-muted)' }}>
                  {active.subject || 'General Inquiry'}
                  {active.application && ` · ${active.application.reference_number}`}
                </div>
              </div>
            </div>

            {/* Scrollable messages */}
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--bethel-text-muted)', fontSize: '0.82rem', padding: 20 }}>
                  No messages yet.
                </div>
              )}
              {messages.map(m => {
                const isMine = m.sender_id === user?.id
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: 8 }}>
                    {!isMine && (
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.7rem', flexShrink: 0, marginTop: 4, background: 'var(--bethel-navy)' }}>
                        {active.client?.first_name?.[0]}{active.client?.last_name?.[0]}
                      </div>
                    )}
                    <div style={{ maxWidth: '72%' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--bethel-text-muted)', marginBottom: 2, textAlign: isMine ? 'right' : 'left' }}>
                        {m.sender?.full_name || (isMine ? 'Branch Admin' : active.client?.first_name)}
                      </div>
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: isMine ? 'var(--bethel-navy)' : 'var(--bethel-light-bg)',
                        color: isMine ? '#fff' : 'var(--bethel-text)',
                        fontSize: '0.875rem',
                        lineHeight: 1.55,
                        wordBreak: 'break-word',
                      }}>
                        {m.body}
                        <div style={{ fontSize: '0.68rem', opacity: 0.55, marginTop: 4, textAlign: 'right' }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={msgEndRef} />
            </div>

            {/* Reply box */}
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--bethel-border)', display: 'flex', gap: 8, flexShrink: 0 }}>
              <input
                ref={inputRef}
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Type a reply... (Enter to send)"
                defaultValue=""
                onKeyDown={handleKey}
              />
              <button
                className="btn btn-primary btn-icon"
                onClick={send}
                disabled={sending}
                title="Send"
              >
                {sending ? <Loader size={16} className="spinner" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
