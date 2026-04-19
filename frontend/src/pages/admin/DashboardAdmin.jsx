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
        setStats({ lugares: l.data.length, inspectores: i.data.length, productores: p.data.length, visitas: v.data.length })
      } catch (err) { console.error(err) }
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
        .modulo-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .modulo-card:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(0,0,0,0.13) !important; }
        .stat-card { transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-3px); }
        .nav-btn:hover { background: rgba(255,255,255,0.25) !important; }
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

      <div style={styles.contenido}>

        {/* HERO HEADER */}
        <div style={styles.hero}>
          <div style={styles.heroTexto}>
            <p style={styles.heroSub}>Bienvenido al panel de control</p>
            <h1 style={styles.heroTitulo}>Administración del Sistema</h1>
            <p style={styles.heroDesc}>
              Gestiona lugares de producción, inspecciones y usuarios del sistema fitosanitario ICA.
            </p>
          </div>
          <div style={styles.heroFecha}>
            <span style={styles.heroFechaDia}>
              {new Date().toLocaleDateString('es-CO', { day: 'numeric' })}
            </span>
            <span style={styles.heroFechaMes}>
              {new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* STATS */}
        <div style={styles.statsGrid}>
          {statsConfig.map((s, i) => (
            <div key={i} className="stat-card" style={{ ...styles.statCard, background: s.bg, borderColor: s.bg }}>
              <span style={{ ...styles.statValor, color: s.color }}>{s.valor}</span>
              <span style={{ ...styles.statLabel, color: s.color }}>{s.label}</span>
              <div style={{ ...styles.statBar, background: s.color }} />
            </div>
          ))}
        </div>

        {/* MÓDULOS */}
        <div style={styles.seccionHeader}>
          <h2 style={styles.seccionTitulo}>Módulos del sistema</h2>
          <p style={styles.seccionSub}>Selecciona un módulo para comenzar</p>
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
              <div style={styles.moduloFooter}>
                <span style={{ ...styles.moduloIr, color: m.accent }}>Ir al módulo →</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f7f5', fontFamily: "'DM Sans', sans-serif" },
  navbar: {
    background: '#1a4d2e', padding: '0 40px', height: '64px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  navLogo: { color: 'white', fontSize: '1.4rem', fontFamily: "'DM Serif Display', serif", letterSpacing: '1px' },
  navSep: { color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' },
  navSub: { color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  navRol: { color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' },
  navLogout: {
    background: 'rgba(255,255,255,0.12)', color: 'white',
    border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif",
  },
  contenido: { maxWidth: '1200px', margin: '0 auto', padding: '48px 40px' },
  hero: {
    background: 'linear-gradient(135deg, #1a4d2e 0%, #2d7a4f 100%)',
    borderRadius: '20px', padding: '40px 48px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '32px', color: 'white',
  },
  heroTexto: { flex: 1 },
  heroSub: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.7, marginBottom: '10px' },
  heroTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2.4rem', marginBottom: '12px', fontWeight: 'normal' },
  heroDesc: { fontSize: '0.95rem', opacity: 0.8, maxWidth: '480px', lineHeight: '1.6' },
  heroFecha: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: 'rgba(255,255,255,0.1)', borderRadius: '16px',
    padding: '20px 32px', backdropFilter: 'blur(10px)',
  },
  heroFechaDia: { fontSize: '3rem', fontFamily: "'DM Serif Display', serif", lineHeight: 1 },
  heroFechaMes: { fontSize: '0.8rem', opacity: 0.8, textTransform: 'capitalize', marginTop: '4px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' },
  statCard: {
    borderRadius: '16px', padding: '24px 28px', border: '2px solid',
    display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative', overflow: 'hidden',
  },
  statValor: { fontSize: '2.8rem', fontFamily: "'DM Serif Display', serif", lineHeight: 1 },
  statLabel: { fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' },
  statBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', opacity: 0.3 },
  seccionHeader: { marginBottom: '20px' },
  seccionTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: '#1a4d2e', fontWeight: 'normal' },
  seccionSub: { fontSize: '0.88rem', color: '#888', marginTop: '4px' },
  modulosGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
  moduloCard: {
    borderRadius: '18px', padding: '28px 32px', cursor: 'pointer',
    border: '2px solid', display: 'flex', flexDirection: 'column', gap: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  moduloTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  moduloTag: {
    color: 'white', padding: '4px 12px', borderRadius: '20px',
    fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase',
  },
  moduloNum: { fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px' },
  moduloTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', fontWeight: 'normal' },
  moduloDesc: { fontSize: '0.88rem', color: '#555', lineHeight: '1.6', flex: 1 },
  moduloFooter: { marginTop: '8px' },
  moduloIr: { fontSize: '0.85rem', fontWeight: '700' },
}