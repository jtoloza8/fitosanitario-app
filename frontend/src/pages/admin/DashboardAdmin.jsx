import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function DashboardAdmin() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ lugares: 0, inspectores: 0, productores: 0, visitas: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [l, i, p, v] = await Promise.all([
          axios.get('http://localhost:3000/api/lugares'),
          axios.get('http://localhost:3000/api/funcionarios'),
          axios.get('http://localhost:3000/api/productores'),
          axios.get('http://localhost:3000/api/visitas'),
        ])
        setStats({ 
          lugares: l.data.length, 
          inspectores: i.data.length, 
          productores: p.data.length, 
          visitas: v.data.length 
        })
      } catch (err) { 
        console.error(err) 
      }
    }
    fetchStats()
  }, [])

  const modulos = [
    {
      titulo: 'Lugares de Producción',
      descripcion: 'Aprobar o rechazar lugares registrados por los productores',
      ruta: '/admin/lugares',
      color: '#e8f5e9',
      accent: '#1a4d2e',
      border: '#a5d6a7',
      num: '01',
      tag: 'Gestión',
    },
    {
      titulo: 'Gestión de Inspecciones',
      descripcion: 'Validar los informes fitosanitarios registrados por los inspectores',
      ruta: '/admin/inspecciones',
      color: '#e3f2fd',
      accent: '#1565c0',
      border: '#90caf9',
      num: '02',
      tag: 'Inspecciones',
    },
    {
      titulo: 'Asignar Inspecciones',
      descripcion: 'Programar visitas y asignar inspectores a lugares aprobados',
      ruta: '/admin/asignar',
      color: '#f3e5f5',
      accent: '#6a1b9a',
      border: '#ce93d8',
      num: '03',
      tag: 'Asignación',
    },
    {
      titulo: 'Inspectores',
      descripcion: 'Ver y gestionar los inspectores técnicos del sistema',
      ruta: '/admin/inspectores',
      color: '#fce4ec',
      accent: '#c62828',
      border: '#f48fb1',
      num: '04',
      tag: 'Usuarios',
    },
    {
      titulo: 'Productores',
      descripcion: 'Gestionar los productores vinculados al sistema ICA',
      ruta: '/admin/productores',
      color: '#fff8e1',
      accent: '#e65100',
      border: '#ffcc80',
      num: '05',
      tag: 'Usuarios',
    },
  ]

  const statsConfig = [
    { label: 'Lugares', valor: stats.lugares, color: '#1a4d2e', bg: '#e8f5e9' },
    { label: 'Inspectores', valor: stats.inspectores, color: '#1565c0', bg: '#e3f2fd' },
    { label: 'Productores', valor: stats.productores, color: '#c62828', bg: '#fce4ec' },
    { label: 'Visitas', valor: stats.visitas, color: '#e65100', bg: '#fff8e1' },
  ]

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .modulo-card { transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: pointer; }
        .modulo-card:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(0,0,0,0.13) !important; }
        .nav-btn:hover { background: rgba(255,255,255,0.25) !important; }
        .footer-link:hover { color: #ffffff !important; text-decoration: underline; }
      `}</style>

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.navLogo}>UdiFica</span>
          <span style={styles.navSep}>|</span>
          <span style={styles.navSub}>Sistema ICA</span>
        </div>
        <div style={styles.navRight}>
          <span style={styles.navRol}>Administrador ICA</span>
          <button className="nav-btn" style={styles.navLogout}
            onClick={() => { localStorage.clear(); window.location.href = '/' }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div style={styles.contenido}>
        <div style={styles.hero}>
          <div style={styles.heroTexto}>
            <p style={styles.heroSub}>Panel de control institucional</p>
            <h1 style={styles.heroTitulo}>Administración del Sistema</h1>
            <p style={styles.heroDesc}>
              Supervisión de procesos fitosanitarios, gestión de predios y validación de inspecciones técnicas.
            </p>
          </div>
          <div style={styles.heroFecha}>
            <span style={styles.heroFechaDia}>{new Date().getDate()}</span>
            <span style={styles.heroFechaMes}>
              {new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div style={styles.statsGrid}>
          {statsConfig.map((s, i) => (
            <div key={i} style={{ ...styles.statCard, background: s.bg, borderColor: s.bg }}>
              <span style={{ ...styles.statValor, color: s.color }}>{s.valor}</span>
              <span style={{ ...styles.statLabel, color: s.color }}>{s.label}</span>
              <div style={{ ...styles.statBar, background: s.color }} />
            </div>
          ))}
        </div>

        <div style={styles.seccionHeader}>
          <h2 style={styles.seccionTitulo}>Módulos de Gestión</h2>
        </div>

        <div style={styles.modulosGrid}>
          {modulos.map((m, i) => (
            <div key={i} className="modulo-card" style={{
              ...styles.moduloCard,
              background: m.color,
              borderColor: m.border,
            }}
              onClick={() => navigate(m.ruta)}
            >
              <div style={styles.moduloTop}>
                <span style={{ ...styles.moduloTag, background: m.accent }}>{m.tag}</span>
                <span style={{ ...styles.moduloNum, color: m.accent }}>{m.num}</span>
              </div>
              <h3 style={{ ...styles.moduloTitulo, color: m.accent }}>{m.titulo}</h3>
              <p style={styles.moduloDesc}>{m.descripcion}</p>
              <span style={{ ...styles.moduloIr, color: m.accent }}>Acceder al módulo →</span>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER TIPO INSTITUCIONAL / SERIO */}
      <footer style={styles.footerMain}>
        <div style={styles.footerColumns}>
          
          {/* Columna 1: Logo y Contacto */}
          <div style={styles.footerCol}>
            <div style={styles.footerLogo}>UdiFica</div>
            <p style={styles.footerInfoText}>Sistema de Gestión Fitosanitaria</p>
            <div style={styles.contactItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 18.92z"></path></svg>
              <span>+57 (601) 332 3700</span>
            </div>
            <div style={styles.contactItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span>contacto@ica.gov.co</span>
            </div>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerColTitle}>ENLACES</h4>
            <div style={styles.footerLinkList}>
              <span className="footer-link" style={styles.footerLink}>Inicio</span>
              <span className="footer-link" style={styles.footerLink}>Sobre UdiFica</span>
              <span className="footer-link" style={styles.footerLink}>Normatividad ICA</span>
              <span className="footer-link" style={styles.footerLink}>Soporte Técnico</span>
            </div>
          </div>

          {/* Columna 3: Información Adicional */}
          <div style={styles.footerCol}>
            <h4 style={styles.footerColTitle}>SOPORTE</h4>
            <p style={styles.footerText}>
              Para asistencia técnica sobre el uso de la plataforma, por favor comuníquese con la mesa de ayuda institucional.
            </p>
            <div style={styles.statusBadge}>
              <div style={styles.statusDot}></div>
              <span>Servidores activos</span>
            </div>
          </div>
        </div>

        {/* Barra Inferior de Copyright */}
        <div style={styles.footerBottom}>
          <p>© {new Date().getFullYear()} UdiFica - Sistema Fitosanitario ICA. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f7f5', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' },
  navbar: { background: '#1a4d2e', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  navLogo: { color: 'white', fontSize: '1.4rem', fontFamily: "'DM Serif Display', serif" },
  navSep: { color: 'rgba(255,255,255,0.3)' },
  navSub: { color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textTransform: 'uppercase' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  navRol: { color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' },
  navLogout: { background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' },
  
  contenido: { maxWidth: '1200px', margin: '0 auto', padding: '48px 40px', flex: 1, width: '100%' },
  hero: { background: 'linear-gradient(135deg, #1a4d2e 0%, #2d7a4f 100%)', borderRadius: '20px', padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', color: 'white' },
  heroTexto: { flex: 1 },
  heroSub: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.7, marginBottom: '10px' },
  heroTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2.4rem', marginBottom: '12px' },
  heroDesc: { fontSize: '0.95rem', opacity: 0.8, maxWidth: '480px', lineHeight: '1.6' },
  heroFecha: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px 32px' },
  heroFechaDia: { fontSize: '3rem', fontFamily: "'DM Serif Display', serif" },
  heroFechaMes: { fontSize: '0.8rem', opacity: 0.8, textTransform: 'capitalize' },
  
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' },
  statCard: { borderRadius: '16px', padding: '24px 28px', border: '2px solid', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
  statValor: { fontSize: '2.8rem', fontFamily: "'DM Serif Display', serif", lineHeight: 1 },
  statLabel: { fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: '600', marginTop: '4px' },
  statBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', opacity: 0.3 },
  
  seccionHeader: { marginBottom: '20px' },
  seccionTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: '#1a4d2e' },
  modulosGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
  moduloCard: { borderRadius: '18px', padding: '28px 32px', border: '2px solid', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  moduloTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  moduloTag: { color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700' },
  moduloNum: { fontSize: '0.8rem', fontWeight: '700' },
  moduloTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem' },
  moduloDesc: { fontSize: '0.88rem', color: '#555', lineHeight: '1.6', flex: 1 },
  moduloIr: { fontSize: '0.85rem', fontWeight: '700' },

  /* ESTILOS FOOTER (MEJORADO) */
  footerMain: { background: '#143420', color: 'white', marginTop: '60px', width: '100%' },
  footerColumns: { maxWidth: '1200px', margin: '0 auto', padding: '60px 40px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '60px' },
  footerCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  footerLogo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', letterSpacing: '1px' },
  footerInfoText: { color: '#a5d6a7', fontSize: '0.9rem', marginTop: '-10px' },
  contactItem: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: '#ccc' },
  footerColTitle: { fontSize: '0.9rem', letterSpacing: '2px', fontWeight: '700', color: '#ffffff', marginBottom: '10px' },
  footerLinkList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  footerLink: { color: '#aaa', fontSize: '0.9rem', cursor: 'pointer', transition: '0.2s' },
  footerText: { color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '8px 15px', borderRadius: '50px', width: 'fit-content', fontSize: '0.8rem', color: '#a5d6a7' },
  statusDot: { width: '8px', height: '8px', background: '#4caf50', borderRadius: '50%', boxShadow: '0 0 10px #4caf50' },
  footerBottom: { background: '#0d2114', padding: '25px 40px', textAlign: 'center', fontSize: '0.85rem', color: '#666', borderTop: '1px solid rgba(255,255,255,0.05)' }
}