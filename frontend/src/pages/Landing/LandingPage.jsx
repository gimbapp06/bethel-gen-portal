import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, ChevronRight, Phone, Mail, MapPin, Menu, X,
  Flame, Car, Anchor, Wrench, AlertTriangle, FileText,
  CheckCircle, Star, ArrowRight, ChevronDown, Facebook,
  Instagram, Twitter, Linkedin, Users, Award, Clock, Globe
} from 'lucide-react'
import AuthModals from '../Auth/AuthModals'
import api from '../../utils/api'

const NAV_LINKS = ['Home', 'Products', 'News & Events', 'Partners', 'About Us']

const PRODUCTS = [
  { icon: <Flame size={28} />, name: 'Fire Insurance', slug: 'fire', desc: 'Protects your property against fire, typhoon, flood, and allied perils.' },
  { icon: <Car size={28} />, name: 'Motor Car Insurance', slug: 'motor', desc: 'Comprehensive coverage for your vehicle including CTPL and own damage.' },
  { icon: <Anchor size={28} />, name: 'Marine Insurance', slug: 'marine', desc: 'Safeguard your goods and cargo in transit by sea, air, or land.' },
  { icon: <Wrench size={28} />, name: 'Engineering Insurance', slug: 'engineering', desc: 'Covers construction projects and machinery against unforeseen damage.' },
  { icon: <AlertTriangle size={28} />, name: 'Casualty Insurance', slug: 'casualty', desc: 'Legal liability protection for bodily injury and property damage.' },
  { icon: <FileText size={28} />, name: 'Bonds', slug: 'bonds', desc: 'Surety bonds for contractors, supply, and performance obligations.' },
]

const STATS = [
  { icon: <Users size={22} />, value: '50,000+', label: 'Policyholders' },
  { icon: <Award size={22} />, value: '30+ Years', label: 'of Service' },
  { icon: <Globe size={22} />, value: 'Nationwide', label: 'Branch Network' },
  { icon: <Clock size={22} />, value: '24/7', label: 'Claims Support' },
]

const NEWS = [
  { date: 'May 2025', title: 'Bethel Gen Launches Digital Client Portal', excerpt: 'Legazpi Branch now offers online policy applications and document uploads for faster processing.' },
  { date: 'Apr 2025', title: 'Typhoon Season Advisory', excerpt: 'Tips on ensuring your properties are covered before the typhoon season. Review your policy coverage today.' },
  { date: 'Mar 2025', title: 'New Branch Office in Naga City', excerpt: 'Bethel Gen expands its Bicol Region presence with a new office serving clients in Camarines Sur.' },
]

const PARTNERS = [
  'BDO Insurance', 'PhilLife', 'IC Philippines', 'Re-insurance Corp', 'BancNet', 'PhilHealth'
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab]     = useState('Home')
  const [menuOpen, setMenuOpen]       = useState(false)
  const [modal, setModal]             = useState(null) // 'login' | 'register' | 'quote'
  const [loginRole, setLoginRole]     = useState('client')
  const [products, setProducts]       = useState(PRODUCTS)
  const [quoteStep, setQuoteStep]     = useState(1)
  const [quoteProduct, setQuoteProduct] = useState(null)
  const [productDetails, setProductDetails] = useState(null)
  const [scrolled, setScrolled]       = useState(false)

  const heroImages = [
  '/hero-fire.jpg',
  '/hero-motor.jpg',
  '/hero-marine.jpg',
  '/hero-engineering.jpg',
  '/hero-casualty.jpeg',
  '/hero-bonds.jpg',
]
const [heroSlide, setHeroSlide] = useState(0)
useEffect(() => {
  const timer = setInterval(() => {
    setHeroSlide(prev => (prev + 1) % heroImages.length)
  }, 5000) // change photo every 5 seconds
  return () => clearInterval(timer)
}, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data.products?.map((p, i) => ({
      ...PRODUCTS[i] || PRODUCTS[0], ...p, icon: PRODUCTS.find(x => x.slug === p.slug)?.icon || <FileText size={28} />
    })) || PRODUCTS)).catch(() => {})
  }, [])

  const handleQuoteProduct = async (slug) => {
    setQuoteProduct(slug)
    try {
      const r = await api.get(`/products/${slug}`)
      setProductDetails(r.data.product)
    } catch {}
    setQuoteStep(2)
  }

  const openLogin = (role = 'client') => { setLoginRole(role); setModal('login') }

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const handleNav = (tab) => {
    setActiveTab(tab)
    setMenuOpen(false)
    const map = { 'Home': 'hero', 'Products': 'products', 'News & Events': 'news', 'Partners': 'partners', 'About Us': 'about' }
    scrollTo(map[tab] || 'hero')
  }

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      {/* ── TOP CONTACT BAR ── */}
      <div className="contact-bar" style={{ background: 'var(--bethel-navy-dark)', color: 'rgba(255,255,255,0.72)', fontSize: '0.78rem', padding: '7px 40px', display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={12} /> (+63)927-290-4397</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={12} /> damanzanillojr@bethelgen.com</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={12} /> Legazpi City, Albay</span>
      </div>

      {/* ── NAVBAR ── */}
      <nav className="landing-nav" style={{
        position: 'sticky', top: 0, zIndex: 500,
        background: scrolled ? 'rgba(26,43,95,0.97)' : 'var(--bethel-navy)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
        padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 66,
      }}>
        <div className="landing-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minWidth: 0 }} onClick={() => scrollTo('hero')}>
          <img src="/bethel_logo_only.png" alt="Bethel Gen" className="logo-shield"
            style={{ height: 42, width: 42, objectFit: 'contain', filter: 'brightness(1.4)', flexShrink: 0 }}
            onError={e => { e.target.style.display='none' }} />
          <img src="/bethel_logo_with_text.png" alt="Bethel General Insurance" className="logo-text-img"
            style={{ height: 46, objectFit: 'contain', filter: 'brightness(1.4) contrast(1.1)', minWidth: 0 }}
            onError={e => { e.target.style.display='none' }} />
        </div>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {NAV_LINKS.map(link => (
            <button key={link} onClick={() => handleNav(link)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 14px', borderRadius: 'var(--radius-md)',
              color: activeTab === link ? 'var(--bethel-gold)' : 'rgba(255,255,255,0.82)',
              fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: activeTab === link ? 700 : 500,
              borderBottom: activeTab === link ? '2px solid var(--bethel-gold)' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>{link}</button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-outline nav-action" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', padding: '7px 16px' }}
            onClick={() => openLogin('client')}>
            Sign In
          </button>
          <button className="btn btn-gold nav-action" style={{ fontSize: '0.82rem', padding: '7px 16px' }}
            onClick={() => setModal('quote')}>
            Get a Quote
          </button>
          <button className="btn-icon btn" style={{ background: 'transparent', color: '#fff', display: 'none' }} id="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 66, left: 0, right: 0, background: 'var(--bethel-navy)', zIndex: 499, padding: '12px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {NAV_LINKS.map(link => (
            <button key={link} onClick={() => handleNav(link)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', padding: '12px 8px', fontFamily: 'var(--font-sans)', fontSize: '0.95rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {link}
            </button>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', flex: 1 }} onClick={() => { openLogin('client'); setMenuOpen(false) }}>Sign In</button>
            <button className="btn btn-gold" style={{ flex: 1 }} onClick={() => { setModal('quote'); setMenuOpen(false) }}>Get a Quote</button>
          </div>
        </div>
      )}

{/* ── HERO ── */}
      <section id="hero" style={{
        background: 'linear-gradient(135deg, var(--bethel-navy-dark) 0%, var(--bethel-navy) 50%, #2a4080 100%)',
        minHeight: '88vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* ── Carousel background watermark (6 products) ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          {heroImages.map((src, i) => (
            <div key={src} style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: i === heroSlide ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
            }} />
          ))}
          {/* Navy tint so the photos read as a faint watermark */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(15,26,61,0.82) 0%, rgba(26,43,95,0.78) 50%, rgba(42,64,128,0.72) 100%)',
          }} />
        </div>

        {/* Background pattern */}
        <div style={{ position: 'absolute', right: '-80px', bottom: '-60px', width: 520, height: 520, borderRadius: '50%', background: 'rgba(200,169,55,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '10%', top: '15%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(200,169,55,0.05)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '80px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', width: '100%' }}>
          <div style={{ animation: 'slideUp 0.6s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200,169,55,0.15)', border: '1px solid rgba(200,169,55,0.3)', borderRadius: 20, padding: '5px 14px', marginBottom: 22 }}>
              <Shield size={14} color="var(--bethel-gold)" />
              <span style={{ color: 'var(--bethel-gold)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em' }}>TRUSTED NON-LIFE INSURER</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontFamily: 'var(--font-serif)', fontWeight: 700, lineHeight: 1.2, marginBottom: 20 }}>
              Insurance That<br />
              <span style={{ color: 'var(--bethel-gold)' }}>Works for You</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
              Bethel General Insurance and Surety Corporation provides comprehensive non-life insurance solutions for individuals and businesses across the Philippines.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button className="btn btn-gold btn-lg" onClick={() => setModal('quote')}>
                Get a Quote <ArrowRight size={18} />
              </button>
              <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)' }}
                onClick={() => { setModal('login'); setLoginRole('client') }}>
                Client Portal <ChevronRight size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 28, marginTop: 40, flexWrap: 'wrap' }}>
              {STATS.map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--bethel-gold)', fontWeight: 800, fontSize: '1.4rem' }}>{s.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 340, height: 340 }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(200,169,55,0.12)', border: '2px solid rgba(200,169,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/bethel_logo_only.png" alt="Bethel" style={{ width: 140, height: 140, objectFit: 'contain', opacity: 0.9 }}
                    onError={e => { e.target.replaceWith(Object.assign(document.createElement('div'), { innerHTML: '🛡️', style: 'font-size:80px;display:flex;align-items:center;justify-content:center;' })) }} />
                </div>
              </div>
              {/* Floating product icons */}
              {[
                { icon: <Flame size={18} color="var(--bethel-gold)" />, top: '5%', left: '50%', label: 'Fire' },
                { icon: <Car size={18} color="var(--bethel-gold)" />, top: '50%', right: '0%', label: 'Motor' },
                { icon: <Anchor size={18} color="var(--bethel-gold)" />, bottom: '5%', left: '50%', label: 'Marine' },
                { icon: <FileText size={18} color="var(--bethel-gold)" />, top: '50%', left: '0%', label: 'Bonds' },
              ].map(({ icon, label, ...pos }) => (
                <div key={label} style={{ position: 'absolute', ...pos, transform: 'translate(-50%,-50%)', background: 'rgba(26,43,95,0.85)', border: '1px solid rgba(200,169,55,0.3)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(8px)' }}>
                  {icon}
                  <span style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" style={{ padding: '80px 40px', background: 'var(--bethel-off-white)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ color: 'var(--bethel-gold)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Our Coverage</span>
            <h2 style={{ color: 'var(--bethel-navy)', fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,3vw,2.4rem)', margin: '10px 0 14px' }}>Insurance Products</h2>
            <p style={{ color: 'var(--bethel-text-muted)', maxWidth: 560, margin: '0 auto' }}>Comprehensive non-life insurance solutions tailored to protect what matters most to you.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22 }}>
            {PRODUCTS.map(p => (
              <div key={p.slug} className="card" style={{ padding: 28, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--bethel-border)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--bethel-navy)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--bethel-border)' }}
                onClick={() => handleQuoteProduct(p.slug)}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bethel-light-bg)', border: '1px solid var(--bethel-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bethel-navy)', marginBottom: 18 }}>
                  {p.icon}
                </div>
                <h3 style={{ color: 'var(--bethel-navy)', fontWeight: 700, marginBottom: 8, fontSize: '1rem' }}>{p.name}</h3>
                <p style={{ color: 'var(--bethel-text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 18 }}>{p.description || p.desc}</p>
                <span style={{ color: 'var(--bethel-gold)', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Get a Quote <ChevronRight size={14} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY BETHEL ── */}
      <section style={{ padding: '80px 40px', background: 'var(--bethel-navy)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ color: 'var(--bethel-gold)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Why Choose Us</span>
            <h2 style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,3vw,2.4rem)', margin: '10px 0' }}>The Bethel Difference</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { icon: <Shield size={24} />, title: 'IC Accredited', desc: 'Licensed and regulated by the Insurance Commission of the Philippines.' },
              { icon: <CheckCircle size={24} />, title: 'Fast Claims', desc: 'Streamlined claims process with dedicated handlers for quick resolution.' },
              { icon: <Users size={24} />, title: 'Expert Team', desc: 'Experienced underwriters and agents ready to guide your coverage needs.' },
              { icon: <Star size={24} />, title: 'Trusted Brand', desc: 'Decades of service protecting Filipino individuals and businesses.' },
            ].map(item => (
              <div key={item.title} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-lg)', padding: 28, border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(200,169,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bethel-gold)', margin: '0 auto 16px' }}>{item.icon}</div>
                <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWS & EVENTS ── */}
      <section id="news" style={{ padding: '80px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ color: 'var(--bethel-gold)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Latest Updates</span>
            <h2 style={{ color: 'var(--bethel-navy)', fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,3vw,2.4rem)', margin: '10px 0' }}>News & Events</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {NEWS.map(n => (
              <div key={n.title} className="card" style={{ overflow: 'hidden', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}>
                <div style={{ height: 6, background: 'linear-gradient(90deg, var(--bethel-navy), var(--bethel-gold))' }} />
                <div className="card-body">
                  <div style={{ fontSize: '0.75rem', color: 'var(--bethel-text-muted)', marginBottom: 10, fontWeight: 600 }}>{n.date}</div>
                  <h3 style={{ color: 'var(--bethel-navy)', fontWeight: 700, marginBottom: 10, lineHeight: 1.4 }}>{n.title}</h3>
                  <p style={{ color: 'var(--bethel-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{n.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section id="partners" style={{ padding: '60px 40px', background: 'var(--bethel-off-white)', borderTop: '1px solid var(--bethel-border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--bethel-navy)', fontWeight: 700, marginBottom: 36, fontSize: '1.2rem' }}>Our Partners & Affiliates</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            {PARTNERS.map(p => (
              <div key={p} style={{ background: '#fff', border: '1px solid var(--bethel-border)', borderRadius: 'var(--radius-md)', padding: '14px 28px', color: 'var(--bethel-text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: '80px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          <div>
            <span style={{ color: 'var(--bethel-gold)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>About Us</span>
            <h2 style={{ color: 'var(--bethel-navy)', fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem,3vw,2.2rem)', margin: '12px 0 18px', lineHeight: 1.3 }}>Protecting Filipinos for Over 30 Years</h2>
            <p style={{ color: 'var(--bethel-text-muted)', lineHeight: 1.8, marginBottom: 16 }}>Bethel General Insurance & Surety Corporation (formerly BF General Insurance Company) envisions itself to be your first-choice non-life insurer, delivering peace of mind through reliable coverage and exceptional service.</p>
            <p style={{ color: 'var(--bethel-text-muted)', lineHeight: 1.8, marginBottom: 28 }}>Our Legazpi Branch serves the Bicol Region with personalized insurance solutions for fire, motor, marine, engineering, casualty, and bond requirements.</p>
            <div style={{ display: 'flex', gap: 14 }}>
              <button className="btn btn-primary" onClick={() => setModal('quote')}>Get a Quote</button>
              <button className="btn btn-outline" onClick={() => setModal('login')}>Sign In</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ background: 'var(--bethel-light-bg)', borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center', border: '1px solid var(--bethel-border)' }}>
                <div style={{ color: 'var(--bethel-navy)', marginBottom: 8 }}>{s.icon}</div>
                <div style={{ color: 'var(--bethel-navy)', fontWeight: 800, fontSize: '1.5rem' }}>{s.value}</div>
                <div style={{ color: 'var(--bethel-text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '60px 40px', background: 'linear-gradient(135deg, var(--bethel-gold-dark), var(--bethel-gold))' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--bethel-navy-dark)', fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem,3vw,2.2rem)', marginBottom: 14 }}>Ready to Get Covered?</h2>
          <p style={{ color: 'rgba(15,26,61,0.75)', marginBottom: 32 }}>Start your application online today. Fast, paperless, and monitored in real-time.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-lg" style={{ background: 'var(--bethel-navy)', color: '#fff' }} onClick={() => setModal('register')}>
              Create Account <ArrowRight size={18} />
            </button>
            <button className="btn btn-lg btn-outline" style={{ borderColor: 'var(--bethel-navy-dark)', color: 'var(--bethel-navy-dark)' }} onClick={() => openLogin('client')}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--bethel-navy-dark)', color: 'rgba(255,255,255,0.65)', padding: '52px 40px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
            <div>
              <img src="/BETHEL_newLogo.png" alt="Bethel Gen"
            style={{ height: 50, marginBottom: 16, filter: 'brightness(1.4)' }}
            onError={e => e.target.style.display='none'} />
              <p style={{ fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 20 }}>Your trusted non-life insurance partner in the Philippines. IC Accredited and committed to protecting what matters most.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(200,169,55,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}>
                    <Icon size={16} color="rgba(255,255,255,0.7)" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 16, fontSize: '0.9rem' }}>Products</h4>
              {['Fire', 'Motor Car', 'Marine', 'Engineering', 'Casualty', 'Bonds'].map(p => (
                <div key={p} style={{ marginBottom: 8, fontSize: '0.85rem', cursor: 'pointer', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--bethel-gold)'}
                  onMouseLeave={e => e.currentTarget.style.color=''}>
                  {p} Insurance
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 16, fontSize: '0.9rem' }}>Quick Links</h4>
              {['About Us', 'News & Events', 'Partners', 'Privacy Policy', 'Terms & Conditions'].map(l => (
                <div key={l} style={{ marginBottom: 8, fontSize: '0.85rem', cursor: 'pointer' }}>{l}</div>
              ))}
            </div>
            <div>
              <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: 16, fontSize: '0.9rem' }}>Legazpi Branch</h4>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>
                <div style={{ marginBottom: 10, display: 'flex', gap: 8 }}><MapPin size={14} style={{ flexShrink: 0, marginTop: 3 }} /><span>Unit 19, 2nd Floor, V&O Building, cor. Quezon Ave. & Lapu-Lapu St., Legazpi City, Albay</span></div>
                <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}><Phone size={14} style={{ flexShrink: 0 }} />(+63)927-290-4397</div>
                <div style={{ display: 'flex', gap: 8 }}><Mail size={14} style={{ flexShrink: 0 }} />damanzanillojr@bethelgen.com</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, fontSize: '0.78rem' }}>
            <span>© {new Date().getFullYear()} Bethel General Insurance and Surety Corporation. All rights reserved.</span>
            <span>Legazpi Branch | IC Accredited</span>
          </div>
        </div>
      </footer>

      {/* ── MODALS ── */}
      <AuthModals
        modal={modal}
        setModal={setModal}
        loginRole={loginRole}
        setLoginRole={setLoginRole}
        quoteStep={quoteStep}
        setQuoteStep={setQuoteStep}
        quoteProduct={quoteProduct}
        setQuoteProduct={setQuoteProduct}
        productDetails={productDetails}
        setProductDetails={setProductDetails}
        handleQuoteProduct={handleQuoteProduct}
        products={PRODUCTS}
      />

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          #hamburger { display: flex !important; }
          .nav-action { display: none !important; }
          .landing-nav { padding: 0 16px !important; }
          .contact-bar { padding: 7px 16px !important; justify-content: center !important; gap: 12px !important; row-gap: 4px !important; }
          .logo-shield { height: 34px !important; width: 34px !important; }
          .logo-text-img { height: 34px !important; }
          section > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          section > div[style*="grid-template-columns: 2fr 1fr"] { grid-template-columns: 1fr 1fr !important; }
          footer div[style*="grid-template-columns: 2fr 1fr 1fr 1fr"] { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 400px) {
          .contact-bar span:nth-child(2) { font-size: 0.72rem; }
          .logo-text-img { height: 30px !important; }
        }
      `}</style>
    </div>
  )
}
