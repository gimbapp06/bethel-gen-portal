import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, MessageSquare, Calendar,
  BarChart2, LogOut, ChevronDown, ChevronRight, Bell,
  Menu, X, ClipboardList, ChevronLeft, ExternalLink
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const NAV = [
  { to: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
  {
    label: 'Client Management', icon: <Users size={18} />,
    children: [
      { to: '/admin/applications', icon: <FileText size={16} />,     label: 'Policies' },
      { to: '/admin/claims',       icon: <ClipboardList size={16} />, label: 'Claims' },
    ]
  },
  { to: '/admin/messages', icon: <MessageSquare size={18} />, label: 'Messages', badge: 'messages' },
  { to: '/admin/calendar', icon: <Calendar size={18} />,      label: 'Calendar' },
  { to: '/admin/reports',  icon: <BarChart2 size={18} />,     label: 'Reports' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [collapsed, setCollapsed]         = useState(false)
  const [mobileOpen, setMobileOpen]       = useState(false)
  const [notifs, setNotifs]               = useState([])
  const [unread, setUnread]               = useState(0)
  const [notifOpen, setNotifOpen]         = useState(false)
  const [msgUnread, setMsgUnread]         = useState(0)
  const [expanded, setExpanded]           = useState({ 'Client Management': true })
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [selectedNotif, setSelectedNotif] = useState(null)

  useEffect(() => {
    fetchNotifs(); fetchMsgUnread()
    const t = setInterval(() => { fetchNotifs(); fetchMsgUnread() }, 15000)
    return () => clearInterval(t)
  }, [])

  const fetchNotifs = async () => {
    try { const r = await api.get('/notifications'); setNotifs(r.data.notifications || []); setUnread(r.data.unread || 0) } catch {}
  }
  const fetchMsgUnread = async () => {
    try { const r = await api.get('/admin/messages/threads?unread=1'); setMsgUnread(r.data.total || r.data.data?.length || 0) } catch {}
  }
  const markNotifRead = async (id) => {
    try { await api.put(`/notifications/${id}/read`); fetchNotifs() } catch {}
  }
  const handleLogout = async () => { await logout(); navigate('/') }
  const toggleExpand = (label) => setExpanded(e => ({ ...e, [label]: !e[label] }))
  const isChildActive = (children) => children?.some(c => location.pathname === c.to || location.pathname.startsWith(c.to + '/'))
  const initials = user ? (user.first_name[0] + user.last_name[0]).toUpperCase() : 'A'

  const getNotifAction = (notif) => {
    if (!notif.link) return null
    if (notif.link.includes('messages'))     return { label: 'Go to Messages',     path: '/admin/messages' }
    if (notif.link.includes('applications')) return { label: 'View Applications',  path: '/admin/applications' }
    if (notif.link.includes('documents'))    return { label: 'View Applications',  path: '/admin/applications' }
    return { label: 'View', path: '/admin' }
  }

  const handleNotifClick = async (n) => {
    if (!n.is_read) await markNotifRead(n.id)
    setSelectedNotif(n)
    setNotifOpen(false)
  }

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
          {NAV.map(item => item.children ? (
            <div key={item.label}>
              <button onClick={() => toggleExpand(item.label)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                background: isChildActive(item.children) ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.72)',
                fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 500,
                marginBottom: 2, transition: 'all 0.15s',
              }}>
                {item.icon}
                {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
                {!collapsed && (expanded[item.label] ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
              </button>
              {expanded[item.label] && !collapsed && (
                <div style={{ marginLeft: 14, paddingLeft: 8, borderLeft: '1.5px solid rgba(255,255,255,0.15)', marginBottom: 4 }}>
                  {item.children.map(child => (
                    <NavLink key={child.to} to={child.to}
                      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                      style={{ fontSize: '0.825rem', padding: '8px 10px' }}
                      onClick={() => setMobileOpen(false)}>
                      {child.icon}
                      <span className="nav-label">{child.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}>
              {item.icon}
              {!collapsed && <span className="nav-label">{item.label}</span>}
              {!collapsed && item.badge === 'messages' && msgUnread > 0 && (
                <span style={{ marginLeft: 'auto', background: 'var(--bethel-red)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>{msgUnread}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: user + sign out */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '12px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-md)', marginBottom: 6, overflow: 'hidden' }}>
            <div className="avatar" style={{ background: 'var(--bethel-gold)', color: 'var(--bethel-navy-dark)', flexShrink: 0, width: 32, height: 32, fontSize: '0.75rem' }}>
              {user?.photo ? <img src={user.photo} alt={user.first_name} /> : initials}
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.first_name} {user?.last_name}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>Administrator</div>
              </div>
            )}
          </div>
          <button onClick={() => setShowLogoutModal(true)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.72)', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(192,57,43,0.3)'; e.currentTarget.style.color='#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.72)' }}>
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
            <button className="btn btn-ghost btn-icon" onClick={() => setMobileOpen(true)} style={{ display: 'none' }} id="admin-mobile-btn"><Menu size={20} /></button>
            {/* Logos in topbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/admin')}>
              <img src="/bethel_logo_only.png" alt="Bethel"
                style={{ height: 44, width: 44, objectFit: 'contain' }}
                onError={e => e.target.style.display='none'} />
              <img src="/bethel_logo_with_text.png" alt="Bethel General Insurance"
                style={{ height: 40, objectFit: 'contain', maxWidth: 200 }}
                onError={e => e.target.style.display='none'} />
            </div>
          </div>
          <div className="topbar-right">
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button className="btn btn-ghost btn-icon notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={20} />
                {unread > 0 && <span className="notif-dot">{unread > 9 ? '9+' : unread}</span>}
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', right: 0, top: 44, width: 340, background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bethel-border)', boxShadow: 'var(--shadow-lg)', zIndex: 200 }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--bethel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                    <button onClick={() => setNotifOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {notifs.length === 0
                      ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--bethel-text-muted)', fontSize: '0.875rem' }}>No notifications</div>
                      : notifs.map(n => (
                        <div key={n.id} onClick={() => handleNotifClick(n)}
                          style={{ padding: '12px 16px', borderBottom: '1px solid var(--bethel-border)', cursor: 'pointer', background: n.is_read ? 'transparent' : 'var(--bethel-light-bg)', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background='var(--bethel-off-white)'}
                          onMouseLeave={e => e.currentTarget.style.background=n.is_read?'transparent':'var(--bethel-light-bg)'}>
                          <div style={{ fontWeight: n.is_read ? 500 : 700, fontSize: '0.85rem', marginBottom: 2 }}>{n.title}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--bethel-text-muted)' }}>{n.message}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--bethel-text-muted)', marginTop: 3 }}>{new Date(n.created_at).toLocaleDateString()}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bethel-light-bg)' }}>
              <div className="avatar">{user?.photo ? <img src={user.photo} alt={user.first_name} /> : initials}</div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--bethel-navy)', lineHeight: 1 }}>{user?.first_name} {user?.last_name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--bethel-text-muted)' }}>Administrator</div>
              </div>
            </div>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>

      {/* ── Notification detail modal ── */}
      {selectedNotif && (
        <div className="modal-overlay" onClick={() => setSelectedNotif(null)}>
          <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedNotif.title}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedNotif(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, marginBottom: 14,
                background: selectedNotif.type === 'success' ? '#DCFCE7' : selectedNotif.type === 'error' ? '#FEE2E2' : '#DBEAFE',
                color: selectedNotif.type === 'success' ? '#15803D' : selectedNotif.type === 'error' ? '#991B1B' : '#1D4ED8' }}>
                {selectedNotif.type?.toUpperCase() || 'INFO'}
              </div>
              <p style={{ color: 'var(--bethel-text)', lineHeight: 1.7, marginBottom: 8 }}>{selectedNotif.message}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--bethel-text-muted)' }}>{new Date(selectedNotif.created_at).toLocaleString()}</p>
            </div>
            {getNotifAction(selectedNotif) ? (
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setSelectedNotif(null)}>Close</button>
                <button className="btn btn-primary" onClick={() => { navigate(getNotifAction(selectedNotif).path); setSelectedNotif(null) }}>
                  <ExternalLink size={15} /> {getNotifAction(selectedNotif).label}
                </button>
              </div>
            ) : (
              <div className="modal-footer">
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSelectedNotif(null)}>Close</button>
              </div>
            )}
          </div>
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
                You are about to sign out of the Bethel Gen Admin Portal.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setShowLogoutModal(false)} style={{ minWidth: 100 }}>Cancel</button>
              <button className="btn btn-danger" onClick={handleLogout} style={{ minWidth: 100 }}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .sidebar { position: fixed !important; transform: translateX(-260px); transition: transform 0.25s; }
          .sidebar.mobile-open { transform: translateX(0); }
          #admin-mobile-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
