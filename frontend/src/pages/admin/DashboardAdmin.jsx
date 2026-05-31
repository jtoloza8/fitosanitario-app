import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Footer from '../../components/Footer'

export default function DashboardAdmin() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    lugares: { total: 0, pendientes: 0, aprobados: 0, rechazados: 0 },
    inspectores: 0,
    administradores: 0,
    productores: 0,
    visitas: { total: 0, pendientes: 0, finalizadas: 0, aprobadas: 0 },
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [l, f, p, v] = await Promise.all([
          axios.get('http://localhost:3000/api/lugares'),
          axios.get('http://localhost:3000/api/funcionarios'),
          axios.get('http://localhost:3000/api/productores'),
          axios.get('http://localhost:3000/api/visitas'),
        ])
        const lg = l.data
        const fn = f.data
        const vi = v.data
        setStats({
          lugares: {
            total: lg.length,
            pendientes: lg.filter(x => (x.estado || 'Pendiente') === 'Pendiente').length,
            aprobados: lg.filter(x => x.estado === 'Aprobado').length,
            rechazados: lg.filter(x => x.estado === 'Rechazado').length,
          },
          inspectores: fn.filter(x => x.rol_funcionario === 'Inspector').length,
          administradores: fn.filter(x => x.rol_funcionario === 'Administrador').length,
          productores: p.data.length,
          visitas: {
            total: vi.length,
            pendientes: vi.filter(x => !x.estado || x.estado === 'Pendiente').length,
            finalizadas: vi.filter(x => x.estado === 'Finalizada').length,
            aprobadas: vi.filter(x => x.estado === 'Aprobada').length,
          },
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
      color: '#e8f5e9', accent: '#1a4d2e', border: '#a5d6a7', num: '01', tag: 'Gestión',
    },
    {
      titulo: 'Gestión de Inspecciones',
      descripcion: 'Validar los informes fitosanitarios registrados por los inspectores',
      ruta: '/admin/inspecciones',
      color: '#e3f2fd', accent: '#1565c0', border: '#90caf9', num: '02', tag: 'Inspecciones',
    },
    {
      titulo: 'Asignar Inspecciones',
      descripcion: 'Programar visitas y asignar inspectores a lugares aprobados',
      ruta: '/admin/asignar',
      color: '#f3e5f5', accent: '#6a1b9a', border: '#ce93d8', num: '03', tag: 'Asignación',
    },
    {
      titulo: 'Inspectores y Admins',
      descripcion: 'Crear, editar y eliminar inspectores y administradores del sistema ICA',
      ruta: '/admin/inspectores',
      color: '#fce4ec', accent: '#c62828', border: '#f48fb1', num: '04', tag: 'Usuarios',
    },
    {
      titulo: 'Gestión de Productores',
      descripcion: 'Ver, editar y gestionar los productores vinculados al sistema',
      ruta: '/admin/productores',
      color: '#fff8e1', accent: '#e65100', border: '#ffcc80', num: '05', tag: 'Usuarios',
    },
  ]

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .modulo-card { transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: pointer; }
        .modulo-card:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(0,0,0,0.13) !important; }
        .nav-btn:hover { background: rgba(255,255,255,0.25) !important; }
      `}</style>

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

        {/* STATS CON DESGLOSE */}
        <div style={styles.statsGrid}>

          {/* Lugares */}
          <div style={{ ...styles.statCard, background: '#e8f5e9', borderColor: '#a5d6a7' }}>
            <div style={styles.statTop}>
              <span style={{ ...styles.statValor, color: '#1a4d2e' }}>{stats.lugares.total}</span>
              <span style={{ ...styles.statLabel, color: '#1a4d2e' }}>Lugares registrados</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.subStats}>
              <span style={styles.subStat}>
                <span style={{ ...styles.subDot, background: '#ca8a04' }} />
                Pendientes: <b>{stats.lugares.pendientes}</b>
              </span>
              <span style={styles.subStat}>
                <span style={{ ...styles.subDot, background: '#16a34a' }} />
                Aprobados: <b>{stats.lugares.aprobados}</b>
              </span>
              <span style={styles.subStat}>
                <span style={{ ...styles.subDot, background: '#dc2626' }} />
                Rechazados: <b>{stats.lugares.rechazados}</b>
              </span>
            </div>
            <div style={{ ...styles.statBar, background: '#1a4d2e' }} />
          </div>

          {/* Funcionarios */}
          <div style={{ ...styles.statCard, background: '#e3f2fd', borderColor: '#90caf9' }}>
            <div style={styles.statTop}>
              <span style={{ ...styles.statValor, color: '#1565c0' }}>{stats.inspectores + stats.administradores}</span>
              <span style={{ ...styles.statLabel, color: '#1565c0' }}>Funcionarios activos</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.subStats}>
              <span style={styles.subStat}>
                <span style={{ ...styles.subDot, background: '#1565c0' }} />
                Inspectores: <b>{stats.inspectores}</b>
              </span>
              <span style={styles.subStat}>
                <span style={{ ...styles.subDot, background: '#6a1b9a' }} />
                Administradores: <b>{stats.administradores}</b>
              </span>
            </div>
            <div style={{ ...styles.statBar, background: '#1565c0' }} />
          </div>

          {/* Productores */}
          <div style={{ ...styles.statCard, background: '#fff8e1', borderColor: '#ffcc80' }}>
            <div style={styles.statTop}>
              <span style={{ ...styles.statValor, color: '#e65100' }}>{stats.productores}</span>
              <span style={{ ...styles.statLabel, color: '#e65100' }}>Productores vinculados</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.subStats}>
              <span style={styles.subStat}>
                <span style={{ ...styles.subDot, background: '#e65100' }} />
                Registrados en el sistema
              </span>
            </div>
            <div style={{ ...styles.statBar, background: '#e65100' }} />
          </div>

          {/* Visitas */}
          <div style={{ ...styles.statCard, background: '#fce4ec', borderColor: '#f48fb1' }}>
            <div style={styles.statTop}>
              <span style={{ ...styles.statValor, color: '#c62828' }}>{stats.visitas.total}</span>
              <span style={{ ...styles.statLabel, color: '#c62828' }}>Inspecciones totales</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.subStats}>
              <span style={styles.subStat}>
                <span style={{ ...styles.subDot, background: '#ca8a04' }} />
                Pendientes: <b>{stats.visitas.pendientes}</b>
              </span>
              <span style={styles.subStat}>
                <span style={{ ...styles.subDot, background: '#6a1b9a' }} />
                Finalizadas: <b>{stats.visitas.finalizadas}</b>
              </span>
              <span style={styles.subStat}>
                <span style={{ ...styles.subDot, background: '#16a34a' }} />
                Aprobadas: <b>{stats.visitas.aprobadas}</b>
              </span>
            </div>
            <div style={{ ...styles.statBar, background: '#c62828' }} />
          </div>
        </div>

        <div style={styles.seccionHeader}>
          <h2 style={styles.seccionTitulo}>Módulos de Gestión</h2>
        </div>

        <div style={styles.modulosGrid}>
          {modulos.map((m, i) => (
            <div key={i} className="modulo-card" style={{
              ...styles.moduloCard, background: m.color, borderColor: m.border,
            }} onClick={() => navigate(m.ruta)}>
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

      <Footer />
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
  statCard: { borderRadius: '16px', padding: '22px 24px', border: '2px solid', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', gap: '0' },
  statTop: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '2px' },
  statValor: { fontSize: '2.6rem', fontFamily: "'DM Serif Display', serif", lineHeight: 1 },
  statLabel: { fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' },
  statDivider: { height: '1px', background: 'rgba(0,0,0,0.08)', margin: '12px 0' },
  subStats: { display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' },
  subStat: { fontSize: '0.8rem', color: '#555', display: 'flex', alignItems: 'center', gap: '7px' },
  subDot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  statBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', opacity: 0.25 },

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
}
