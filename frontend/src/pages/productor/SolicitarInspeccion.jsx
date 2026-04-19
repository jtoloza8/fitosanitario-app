import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function SolicitarInspeccion() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const lugarActivo = JSON.parse(localStorage.getItem('lugar_activo') || 'null')
  const [lugares, setLugares] = useState([])
  const [lugarSeleccionado, setLugarSeleccionado] = useState(lugarActivo)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [visitas, setVisitas] = useState([])

  useEffect(() => {
    fetchLugares()
    fetchVisitas()
  }, [])

  const fetchLugares = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/lugares')
      const aprobados = res.data.filter(l =>
        l.id_productor === usuario.id_productor && l.estado === 'Aprobado'
      )
      setLugares(aprobados)
    } catch (err) { console.error(err) }
  }

  const fetchVisitas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/visitas')
      setVisitas(res.data)
    } catch (err) { console.error(err) }
  }

  const tienePendiente = (idLugar) => {
    return visitas.some(v =>
      v.id_lugar_produccion === idLugar &&
      (v.estado === 'Pendiente' || !v.estado)
    )
  }

  const estadoColor = (estado) => {
    if (estado === 'Aprobada') return { bg: '#dcfce7', color: '#16a34a' }
    if (estado === 'Rechazada') return { bg: '#fee2e2', color: '#dc2626' }
    return { bg: '#fef9c3', color: '#ca8a04' }
  }

  const misVisitas = visitas.filter(v =>
    lugares.some(l => l.id_lugar_produccion === v.id_lugar_produccion)
  )

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .lugar-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .btn:hover { opacity: 0.85; }
      `}</style>

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <span style={styles.navLogo}>UdiFica</span>
        <div style={styles.navRight}>
          <span style={styles.navRol}>Productor — {usuario.nombre_completo}</span>
          <button style={styles.navBtn} onClick={() => navigate('/productor/lotes')}>
            Mis Lugares
          </button>
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
            <p style={styles.headerSub}>Panel del Productor</p>
            <h1 style={styles.headerTitulo}>Mis Inspecciones</h1>
          </div>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
            <span style={{ cursor: 'pointer' }} onClick={() => setError('')}>✕</span>
          </div>
        )}
        {mensaje && (
          <div style={styles.exito}>
            {mensaje}
            <span style={{ cursor: 'pointer' }} onClick={() => setMensaje('')}>✕</span>
          </div>
        )}

        <div style={styles.layout}>

          {/* MIS LUGARES APROBADOS */}
          <div>
            <h2 style={styles.seccionTitulo}>Mis lugares aprobados</h2>
            <p style={styles.seccionSub}>Solo los lugares aprobados pueden solicitar inspección</p>

            {lugares.length === 0 ? (
              <div style={styles.vacio}>
                <p style={styles.vacioTitulo}>Sin lugares aprobados</p>
                <p style={styles.vacioSub}>Espera a que el administrador apruebe tus lugares</p>
                <button style={styles.btnVolver} onClick={() => navigate('/productor/lotes')}>
                  Ver mis lugares →
                </button>
              </div>
            ) : (
              <div style={styles.lugaresList}>
                {lugares.map((l, i) => (
                  <div key={i} className="lugar-card" style={{
                    ...styles.lugarCard,
                    borderLeft: lugarSeleccionado?.id_lugar_produccion === l.id_lugar_produccion
                      ? '4px solid #1a4d2e' : '4px solid transparent',
                    background: lugarSeleccionado?.id_lugar_produccion === l.id_lugar_produccion
                      ? '#e8f5e9' : 'white',
                  }} onClick={() => setLugarSeleccionado(l)}>
                    <div style={styles.lugarHeader}>
                      <h3 style={styles.lugarNombre}>{l.nombre_lugar}</h3>
                      <span style={{ ...styles.badge, background: '#dcfce7', color: '#16a34a' }}>
                        Aprobado
                      </span>
                    </div>
                    <p style={styles.lugarDato}>{l.municipio}, {l.departamento}</p>
                    <p style={styles.lugarDato}>Registro ICA: {l.numero_registroica}</p>
                    {tienePendiente(l.id_lugar_produccion) && (
                      <span style={styles.pendienteTag}>Inspección en curso</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HISTORIAL DE VISITAS */}
          <div>
            <h2 style={styles.seccionTitulo}>Historial de inspecciones</h2>
            <p style={styles.seccionSub}>Estado de todas tus inspecciones</p>

            {misVisitas.length === 0 ? (
              <div style={styles.vacio}>
                <p style={styles.vacioTitulo}>Sin inspecciones</p>
                <p style={styles.vacioSub}>El administrador asignará un inspector a tu lugar</p>
              </div>
            ) : (
              <div style={styles.visitasList}>
                {misVisitas.map((v, i) => {
                  const est = estadoColor(v.estado || 'Pendiente')
                  return (
                    <div key={i} style={styles.visitaCard}>
                      <div style={styles.visitaHeader}>
                        <div>
                          <h3 style={styles.visitaNombre}>{v.nombre_lugar || `Visita #${v.id_visita_inspeccion}`}</h3>
                          <p style={styles.visitaDato}>
                            Inspector: {v.nombre_inspector || 'Por asignar'}
                          </p>
                          <p style={styles.visitaDato}>
                            Fecha: {new Date(v.fecha).toLocaleDateString('es-CO')}
                          </p>
                          <p style={styles.visitaDato}>
                            Periodo: {v.periodo_reportado}
                          </p>
                        </div>
                        <span style={{ ...styles.badge, background: est.bg, color: est.color }}>
                          {v.estado || 'Pendiente'}
                        </span>
                      </div>
                      {v.observacion_admin && (
                        <div style={styles.obsAdmin}>
                          <p style={styles.obsLabel}>Observación ICA:</p>
                          <p style={styles.obsTexto}>{v.observacion_admin}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
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
  navLogo: { color: 'white', fontSize: '1.4rem', fontFamily: "'DM Serif Display', serif", letterSpacing: '1px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  navRol: { color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' },
  navBtn: {
    background: 'rgba(255,255,255,0.12)', color: 'white',
    border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif",
  },
  navLogout: {
    background: 'transparent', color: 'rgba(255,255,255,0.6)',
    border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem',
  },
  contenido: { maxWidth: '1200px', margin: '0 auto', padding: '48px 40px' },
  header: {
    marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #dde8dd',
  },
  headerSub: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#40916c', marginBottom: '8px', fontWeight: '600' },
  headerTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2.4rem', color: '#1a4d2e', fontWeight: 'normal' },
  error: {
    background: '#fee2e2', color: '#dc2626', padding: '12px 16px',
    borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem',
    display: 'flex', justifyContent: 'space-between',
  },
  exito: {
    background: '#dcfce7', color: '#16a34a', padding: '12px 16px',
    borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem',
    display: 'flex', justifyContent: 'space-between',
  },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' },
  seccionTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', color: '#1a4d2e', marginBottom: '4px', fontWeight: 'normal' },
  seccionSub: { fontSize: '0.85rem', color: '#888', marginBottom: '16px' },
  vacio: {
    textAlign: 'center', padding: '48px 24px', background: 'white',
    borderRadius: '16px', border: '1px solid #e8efe8',
  },
  vacioTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem', color: '#ccc', marginBottom: '8px' },
  vacioSub: { fontSize: '0.85rem', color: '#ccc', marginBottom: '16px' },
  btnVolver: {
    background: '#1a4d2e', color: 'white', border: 'none',
    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.88rem', fontFamily: "'DM Sans', sans-serif",
  },
  lugaresList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  lugarCard: {
    background: 'white', borderRadius: '12px', padding: '18px 20px',
    cursor: 'pointer', border: '1px solid #e8efe8', transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '6px',
  },
  lugarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  lugarNombre: { fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: '#1a4d2e' },
  lugarDato: { fontSize: '0.82rem', color: '#888' },
  badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', whiteSpace: 'nowrap' },
  pendienteTag: {
    background: '#fef9c3', color: '#ca8a04', padding: '4px 10px',
    borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', alignSelf: 'flex-start',
  },
  visitasList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  visitaCard: {
    background: 'white', borderRadius: '12px', padding: '18px 20px',
    border: '1px solid #e8efe8', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  visitaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  visitaNombre: { fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: '#1a4d2e', marginBottom: '6px' },
  visitaDato: { fontSize: '0.82rem', color: '#888', marginTop: '2px' },
  obsAdmin: { marginTop: '12px', background: '#f0f4f0', borderRadius: '8px', padding: '12px' },
  obsLabel: { fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', fontWeight: '600', marginBottom: '4px' },
  obsTexto: { fontSize: '0.88rem', color: '#333' },
}