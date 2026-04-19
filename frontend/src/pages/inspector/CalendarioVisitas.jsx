import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function CalendarioVisitas() {
  const navigate = useNavigate()
  const [visitas, setVisitas] = useState([])
  const [filtro, setFiltro] = useState('Pendiente')

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  useEffect(() => { fetchVisitas() }, [])

  const fetchVisitas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/visitas')
      const misVisitas = res.data.filter(v => v.id_inspector === usuario.id_funcionario)
      setVisitas(misVisitas)
    } catch (err) { console.error(err) }
  }

  const estadoColor = (estado) => {
    if (estado === 'Aprobada') return { bg: '#dcfce7', color: '#16a34a' }
    if (estado === 'Rechazada') return { bg: '#fee2e2', color: '#dc2626' }
    return { bg: '#fef9c3', color: '#ca8a04' }
  }

  const visitasFiltradas = visitas.filter(v => (v.estado || 'Pendiente') === filtro)

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .btn:hover { opacity: 0.85; }
      `}</style>

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.navLogo}>UdiFica</span>
          <span style={styles.navSep}>|</span>
          <span style={styles.navSub}>Sistema ICA</span>
        </div>
        <div style={styles.navRight}>
          <span style={styles.navRol}>Inspector — {usuario.nombre_completo}</span>
          <button style={styles.navLogout}
            onClick={() => { localStorage.clear(); window.location.href = '/' }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div style={styles.contenido}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <p style={styles.headerSub}>Panel del Inspector</p>
            <h1 style={styles.headerTitulo}>Mis Visitas Asignadas</h1>
          </div>
          <button
            className="btn"
            style={styles.btnInforme}
            onClick={() => navigate('/inspector/informe')}
          >
            Registrar Informe
          </button>
        </div>

        {/* STATS */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Total visitas', valor: visitas.length, color: '#1a4d2e', bg: '#e8f5e9' },
            { label: 'Pendientes', valor: visitas.filter(v => (v.estado || 'Pendiente') === 'Pendiente').length, color: '#ca8a04', bg: '#fef9c3' },
            { label: 'Aprobadas', valor: visitas.filter(v => v.estado === 'Aprobada').length, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Rechazadas', valor: visitas.filter(v => v.estado === 'Rechazada').length, color: '#dc2626', bg: '#fee2e2' },
          ].map((s, i) => (
            <div key={i} style={{ ...styles.statCard, background: s.bg }}>
              <span style={{ ...styles.statValor, color: s.color }}>{s.valor}</span>
              <span style={{ ...styles.statLabel, color: s.color }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <div style={styles.filtros}>
          {['Pendiente', 'Aprobada', 'Rechazada'].map(f => (
            <button key={f} className="btn" style={{
              ...styles.filtroBtn,
              background: filtro === f ? '#1a4d2e' : 'white',
              color: filtro === f ? 'white' : '#555',
              border: filtro === f ? '2px solid #1a4d2e' : '2px solid #e5e7eb',
            }} onClick={() => setFiltro(f)}>
              {f} ({visitas.filter(v => (v.estado || 'Pendiente') === f).length})
            </button>
          ))}
        </div>

        {/* LISTA DE VISITAS */}
        {visitasFiltradas.length === 0 ? (
          <div style={styles.vacio}>
            <p style={styles.vacioTitulo}>No tienes visitas {filtro.toLowerCase()}s</p>
            <p style={styles.vacioSub}>El administrador te asignará visitas próximamente</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {visitasFiltradas.map((v, i) => {
              const est = estadoColor(v.estado || 'Pendiente')
              return (
                <div key={i} className="card" style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitulo}>{v.nombre_lugar || `Visita #${v.id_visita_inspeccion}`}</h3>
                    <span style={{ ...styles.estadoBadge, background: est.bg, color: est.color }}>
                      {v.estado || 'Pendiente'}
                    </span>
                  </div>

                  <div style={styles.cardInfo}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Fecha</span>
                      <span style={styles.infoValor}>
                        {new Date(v.fecha).toLocaleDateString('es-CO', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Horario</span>
                      <span style={styles.infoValor}>{v.hora_inicio} — {v.hora_fin}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoLabel}>Periodo</span>
                      <span style={styles.infoValor}>{v.periodo_reportado}</span>
                    </div>
                  </div>

                  {(v.estado === 'Pendiente' || !v.estado) && (
                    <button
                      className="btn"
                      style={styles.btnRegistrar}
                      onClick={() => {
                        localStorage.setItem('visita_activa', JSON.stringify(v))
                        navigate('/inspector/informe')
                      }}
                    >
                      Registrar informe →
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
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
    background: 'transparent', color: 'rgba(255,255,255,0.6)',
    border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem',
  },
  contenido: { maxWidth: '1200px', margin: '0 auto', padding: '48px 40px' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #dde8dd',
  },
  headerSub: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#40916c', marginBottom: '8px', fontWeight: '600' },
  headerTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2.4rem', color: '#1a4d2e', fontWeight: 'normal' },
  btnInforme: {
    background: '#1a4d2e', color: 'white', border: 'none',
    padding: '12px 24px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.95rem', fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' },
  statCard: {
    borderRadius: '14px', padding: '20px 24px',
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  statValor: { fontSize: '2.4rem', fontFamily: "'DM Serif Display', serif", lineHeight: 1 },
  statLabel: { fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' },
  filtros: { display: 'flex', gap: '12px', marginBottom: '24px' },
  filtroBtn: {
    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.88rem', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
  },
  vacio: {
    textAlign: 'center', padding: '80px 40px',
    background: 'white', borderRadius: '16px', border: '1px solid #e8efe8',
  },
  vacioTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', color: '#1a4d2e', marginBottom: '8px' },
  vacioSub: { fontSize: '0.9rem', color: '#aaa' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  card: {
    background: 'white', borderRadius: '16px', padding: '24px',
    border: '1px solid #e8efe8', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column', gap: '16px',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem', color: '#1a4d2e', fontWeight: 'normal' },
  estadoBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', whiteSpace: 'nowrap' },
  cardInfo: { display: 'flex', flexDirection: 'column', gap: '10px' },
  infoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#aaa', fontWeight: '600' },
  infoValor: { fontSize: '0.88rem', color: '#333', fontWeight: '500', textTransform: 'capitalize' },
  btnRegistrar: {
    background: '#1a4d2e', color: 'white', border: 'none',
    padding: '12px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.9rem', fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
    marginTop: 'auto',
  },
}