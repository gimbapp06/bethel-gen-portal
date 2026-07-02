import React, { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  Home, FolderOpen, Upload, HelpCircle, Bell, LogOut,
  ChevronLeft, ChevronRight, MessageCircle, X, Send, Menu, Shield, ExternalLink
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const NAV = [
  { to: '/client',              icon: <Home size={18} />,       label: 'Home',            end: true },
  { to: '/client/applications', icon: <FolderOpen size={18} />, label: 'Applications' },
  { to: '/client/documents',    icon: <Upload size={18} />,     label: 'Document Uploads' },
  { to: '/client/faq',          icon: <HelpCircle size={18} />, label: 'FAQ' },
]

export default function ClientLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed]         = useState(false)
  const [mobileOpen, setMobileOpen]       = useState(false)
  const [notifs, setNotifs]               = useState([])
  const [unread, setUnread]               = useState(0)
  const [notifOpen, setNotifOpen]         = useState(false)
  const [chatOpen, setChatOpen]           = useState(false)
  const [threads, setThreads]             = useState([])
  const [activeThread, setActiveThread]   = useState(null)
  const [messages, setMessages]           = useState([])
  const [sending, setSending]             = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const msgEndRef    = useRef(null)
  const pollRef      = useRef(null)
  const chatInputRef = useRef(null)
  const activeThreadRef = useRef(null)

  useEffect(() => { activeThreadRef.current = activeThread }, [activeThread])

  useEffect(() => { fetchNotifs() }, [])
  useEffect(() => {
    const t = setInterval(fetchNotifs, 15000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!chatOpen) { clearInterval(pollRef.current); return }
    pollRef.current = setInterval(() => {
      if (activeThreadRef.current?.id) fetchMessages(activeThreadRef.current.id)
    }, 3000)
    return () => clearInterval(pollRef.current)
  }, [chatOpen])

  useEffect(() => { if (chatOpen) fetchThreads() }, [chatOpen])
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const fetchNotifs = async () => {
    try { const r = await api.get('/notifications'); setNotifs(r.data.notifications || []); setUnread(r.data.unread || 0) } catch {}
  }
  const fetchThreads = async () => {
    try { const r = await api.get('/client/messages/threads'); setThreads(r.data.threads || []) } catch {}
  }
  const fetchMessages = async (threadId) => {
    try { const r = await api.get(`/client/messages/threads/${threadId}`); setMessages(r.data.messages || []) } catch {}
  }
  const openThread = async (thread) => {
    setActiveThread(thread)
    activeThreadRef.current = thread
    await fetchMessages(thread.id)
    try { await api.put(`/client/messages/threads/${thread.id}/read`) } catch {}
  }
  const sendMsg = async () => {
    const body = chatInputRef.current?.value?.trim()
    if (!body || sending) return
    if (chatInputRef.current) chatInputRef.current.value = ''
    setSending(true)
    try {
      if (!activeThread || !activeThread.id) {
        const r = await api.post('/client/messages/threads', { body, subject: 'Client Inquiry' })
        const newThread = r.data.thread
        setActiveThread(newThread)
        activeThreadRef.current = newThread
        await fetchMessages(newThread.id)
        fetchThreads()
      } else {
        await api.post(`/client/messages/threads/${activeThread.id}`, { body })
        await fetchMessages(activeThread.id)
      }
    } catch { if (chatInputRef.current) chatInputRef.current.value = body }
    finally { setSending(false) }
  }
  const markNotifRead = async (id) => {
    try { await api.put(`/notifications/${id}/read`); fetchNotifs() } catch {}
  }

  const [selectedNotif, setSelectedNotif] = useState(null)

  const getNotifAction = (notif) => {
    if (!notif.link) return null
    if (notif.link.includes('messages'))     return { label: 'Open Messages',    path: '/client', action: 'chat' }
    if (notif.link.includes('applications')) return { label: 'View Applications', path: '/client/applications' }
    if (notif.link.includes('documents'))    return { label: 'View Documents',    path: '/client/documents' }
    return { label: 'View', path: '/client' }
  }

  const handleNotifClick = async (n) => {
    if (!n.is_read) await markNotifRead(n.id)
    setSelectedNotif(n)
    setNotifOpen(false)
  }
  const handleLogout = async () => { await logout(); navigate('/') }
  const initials = user ? (user.first_name[0] + user.last_name[0]).toUpperCase() : 'U'

  return (
    <div className="portal-layout">

      {/* ── Sidebar ── */}
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>

        {/* Sidebar header with toggle */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-end', minHeight: 64 }}>
          {collapsed ? (
            <img
              src="/open_sidebar.png"
              alt="Open sidebar"
              onClick={() => setCollapsed(false)}
              style={{ width: 20, height: 20, objectFit: 'contain', cursor: 'pointer', filter: 'brightness(1.4)', transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity='0.65'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}
              onError={e => e.target.style.display='none'}
              title="Expand sidebar"
            />
          ) : (
            <img
              src="/close_sidebar.png"
              alt="Close sidebar"
              onClick={() => setCollapsed(true)}
              style={{ width: 20, height: 20, objectFit: 'contain', cursor: 'pointer', filter: 'brightness(1.4)', transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity='0.65'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}
              onError={e => e.target.style.display='none'}
              title="Collapse sidebar"
            />
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" style={{ flex: 1 }}>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}>
              {item.icon}
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: user info + sign out */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '12px 10px' }}>
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-md)', marginBottom: 6, overflow: 'hidden' }}>
            <div className="avatar" style={{ background: 'var(--bethel-gold)', color: 'var(--bethel-navy-dark)', flexShrink: 0, width: 32, height: 32, fontSize: '0.75rem' }}>
              {user?.photo ? <img src={user.photo} alt={user.first_name} /> : initials}
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.first_name} {user?.last_name}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>Client</div>
              </div>
            )}
          </div>

          {/* Sign out */}
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.72)', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,57,43,0.3)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.72)' }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }} onClick={() => setMobileOpen(false)} />}

      {/* ── Main content ── */}
      <main className={`main-content${collapsed ? ' sidebar-collapsed' : ''}`}>
        <header className="topbar">
          <div className="topbar-left">
            <button className="btn btn-ghost btn-icon" onClick={() => setMobileOpen(true)} style={{ display: 'none' }} id="mobile-menu-btn"><Menu size={20} /></button>
            {/* Logos in topbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/client')}>
              <img src="/bethel_logo_only.png" alt="Bethel"
                style={{ height: 44, width: 44, objectFit: 'contain' }}
                onError={e => e.target.style.display='none'} />
              <img src="/bethel_logo_with_text.png" alt="Bethel General Insurance"
                style={{ height: 40, objectFit: 'contain', maxWidth: 200 }}
                onError={e => e.target.style.display='none'} />
            </div>
          </div>
          <div className="topbar-right">
            <div style={{ position: 'relative' }}>
              <button className="btn btn-ghost btn-icon notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={20} />
                {unread > 0 && <span className="notif-dot">{unread > 9 ? '9+' : unread}</span>}
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', right: 0, top: 44, width: 340, background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bethel-border)', boxShadow: 'var(--shadow-lg)', zIndex: 200 }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--bethel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {unread > 0 && <button onClick={async () => { await api.put('/notifications/read-all'); fetchNotifs() }} style={{ background: 'none', border: 'none', color: 'var(--bethel-navy)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Mark all read</button>}
                      <button onClick={() => setNotifOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                    </div>
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {notifs.length === 0
                      ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--bethel-text-muted)', fontSize: '0.875rem' }}>No notifications</div>
                      : notifs.map(n => (
                        <div key={n.id} onClick={() => handleNotifClick(n)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--bethel-border)', cursor: 'pointer', background: n.is_read ? 'transparent' : 'var(--bethel-light-bg)' }}
                          onMouseEnter={e => e.currentTarget.style.background='var(--bethel-off-white)'}
                          onMouseLeave={e => e.currentTarget.style.background=n.is_read ? 'transparent' : 'var(--bethel-light-bg)'}>
                          <div style={{ fontWeight: n.is_read ? 500 : 700, fontSize: '0.85rem', marginBottom: 2 }}>{n.title}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--bethel-text-muted)', lineHeight: 1.4 }}>{n.message}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--bethel-text-muted)', marginTop: 4 }}>{new Date(n.created_at).toLocaleDateString()}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bethel-light-bg)' }}>
              <div className="avatar">{user?.photo ? <img src={user.photo} alt={user.first_name} /> : initials}</div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--bethel-navy)', lineHeight: 1 }}>{user?.first_name} {user?.last_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--bethel-text-muted)' }}>Client</div>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content"><Outlet /></div>
      </main>

      {/* ── Floating chat button ── */}
      <button className="float-msg-btn" onClick={() => setChatOpen(!chatOpen)} title="Message Branch">
        {chatOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {threads.some(t => t.client_has_unread) && !chatOpen && (
          <span style={{ position: 'absolute', top: -3, right: -3, width: 12, height: 12, background: 'var(--bethel-red)', borderRadius: '50%', border: '2px solid #fff' }} />
        )}
      </button>

      {/* ── Chat widget ── */}
      {chatOpen && (
        <div className="chat-widget" style={{ position: 'fixed', bottom: 92, right: 28, width: 340, height: 480, background: '#fff', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--bethel-border)', display: 'flex', flexDirection: 'column', zIndex: 199, animation: 'slideUp 0.2s ease' }}>
          <div style={{ padding: '14px 16px', background: 'var(--bethel-navy)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bethel-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="var(--bethel-navy-dark)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>Bethel Gen Support</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>Legazpi Branch</div>
            </div>
            {activeThread && (
              <button onClick={() => { setActiveThread(null); setMessages([]) }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                <ChevronLeft size={18} />
              </button>
            )}
          </div>

          {!activeThread ? (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--bethel-border)' }}>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '9px 0' }}
                  onClick={() => setActiveThread({ id: null, subject: 'New Message' })}>
                  + New Message
                </button>
              </div>
              {threads.length === 0
                ? <div style={{ padding: 28, textAlign: 'center', color: 'var(--bethel-text-muted)', fontSize: '0.85rem' }}>
                    <MessageCircle size={32} style={{ marginBottom: 8, opacity: 0.4 }} /><br />No messages yet.
                  </div>
                : threads.map(t => (
                  <div key={t.id} onClick={() => openThread(t)} style={{ padding: '12px 14px', borderBottom: '1px solid var(--bethel-border)', cursor: 'pointer', background: t.client_has_unread ? 'var(--bethel-light-bg)' : 'transparent' }}>
                    <div style={{ fontWeight: t.client_has_unread ? 700 : 500, fontSize: '0.85rem', marginBottom: 3 }}>{t.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--bethel-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.latest_message?.body || 'No messages'}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--bethel-text-muted)', fontSize: '0.8rem', padding: 20 }}>
                    Send a message to start the conversation.
                  </div>
                )}
                {messages.map(m => {
                  const isMine = m.sender_id === user?.id
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '78%', padding: '9px 12px', borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: isMine ? 'var(--bethel-navy)' : 'var(--bethel-light-bg)', color: isMine ? '#fff' : 'var(--bethel-text)', fontSize: '0.85rem', lineHeight: 1.5, wordBreak: 'break-word' }}>
                        {m.body}
                        <div style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={msgEndRef} />
              </div>
              <div style={{ padding: '10px 12px', borderTop: '1px solid var(--bethel-border)', display: 'flex', gap: 8 }}>
                <input
                  ref={chatInputRef}
                  className="form-input"
                  style={{ flex: 1, padding: '9px 12px', fontSize: '0.85rem' }}
                  placeholder="Type a message..."
                  defaultValue=""
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
                />
                <button className="btn btn-primary btn-icon" onClick={sendMsg} disabled={sending}>
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Sign out confirmation modal ── */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-box" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Sign Out</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowLogoutModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '28px 28px 8px' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <LogOut size={24} color="#DC2626" />
              </div>
              <h3 style={{ color: 'var(--bethel-navy)', marginBottom: 8 }}>Are you sure?</h3>
              <p style={{ color: 'var(--bethel-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                You are about to sign out of the Bethel Gen Client Portal. You will need to log in again to access your account.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setShowLogoutModal(false)} style={{ minWidth: 100 }}>Cancel</button>
              <button className="btn btn-danger" onClick={handleLogout} style={{ minWidth: 100 }}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notification detail modal ── */}
      {selectedNotif && (
        <div className="modal-overlay" onClick={() => setSelectedNotif(null)}>
          <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedNotif.title}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedNotif(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, marginBottom: 14, background: selectedNotif.type === 'success' ? '#DCFCE7' : selectedNotif.type === 'error' ? '#FEE2E2' : '#DBEAFE', color: selectedNotif.type === 'success' ? '#15803D' : selectedNotif.type === 'error' ? '#991B1B' : '#1D4ED8' }}>
                {selectedNotif.type?.toUpperCase() || 'INFO'}
              </div>
              <p style={{ color: 'var(--bethel-text)', lineHeight: 1.7, marginBottom: 8 }}>{selectedNotif.message}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--bethel-text-muted)' }}>{new Date(selectedNotif.created_at).toLocaleString()}</p>
            </div>
            {getNotifAction(selectedNotif) && (
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setSelectedNotif(null)}>Close</button>
                <button className="btn btn-primary" onClick={() => {
                  const action = getNotifAction(selectedNotif)
                  setSelectedNotif(null)
                  navigate(action.path)
                  if (action.action === 'chat') {
                    setTimeout(() => setChatOpen(true), 300)
                  }
                }}>
                  <ExternalLink size={15} /> {getNotifAction(selectedNotif).label}
                </button>
              </div>
            )}
            {!getNotifAction(selectedNotif) && (
              <div className="modal-footer">
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSelectedNotif(null)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .sidebar { position: fixed !important; transform: translateX(-260px); transition: transform 0.25s; }
          .sidebar.mobile-open { transform: translateX(0); }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
