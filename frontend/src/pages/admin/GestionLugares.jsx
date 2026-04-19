import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function GestionInspecciones() {
  const navigate = useNavigate()
  const [lugares, setLugares] = useState([])
  const [filtro, setFiltro] = useState('Pendiente')
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null)
  const [evidencias, setEvidencias] = useState([])
  const [mensaje, setMensaje] = useState('')

  useEffect(() => { fetchLugares() }, [])

  const fetchLugares = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/lugares')
      setLugares(res.data)
    } catch (err) { console.error(err) }
  }

  const verDetalle = async (lugar) => {
    setLugarSeleccionado(lugar)
    try {
      const res = await axios.get(`http://localhost:3000/api/evidencias/lugar/${lugar.id_lugar_produccion}`)
      setEvidencias(res.data)
    } catch (err) { setEvidencias([]) }
  }

  const aprobar = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/api/lugares/${id}/aprobar`)
      setMensaje('Lugar aprobado correctamente')
      setLugarSeleccionado(null)
      fetchLugares()
    } catch (err) { setMensaje('Error al aprobar') }
  }

  const rechazar = async (id) => {
    if (!motivoRechazo) return alert('Debes ingresar un motivo de rechazo')
    try {
      await axios.patch(`http://localhost:3000/api/lugares/${id}/rechazar`, { motivo: motivoRechazo })
      setMensaje('Lugar rechazado')
      setLugarSeleccionado(null)
      setMotivoRechazo('')
      fetchLugares()
    } catch (err) { setMensaje('Error al rechazar') }
  }

  const estadoColor = (estado) => {
    if (estado === 'Aprobado') return { bg: '#dcfce7', color: '#16a34a' }
    if (estado === 'Rechazado') return { bg: '#fee2e2', color: '#dc2626' }
    return { bg: '#fef9c3', color: '#ca8a04' }
  }

  const lugaresFiltrados = lugares.filter(l => (l.estado || 'Pendiente') === filtro)

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .fila:hover { background: #f5f7f5 !important; }
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
          <button style={styles.navBack} onClick={() => navigate('/admin')}>← Volver</button>
          <button style={styles.navLogout} onClick={() => { localStorage.clear(); window.location.href = '/' }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div style={styles.contenido}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <p style={styles.headerSub}>Administración</p>
            <h1 style={styles.headerTitulo}>Gestión de Lugares</h1>
          </div>
        </div>

        {mensaje && (
          <div style={styles.mensajeBox}>
            {mensaje}
            <span style={{ cursor: 'pointer', marginLeft: '12px' }} onClick={() => setMensaje('')}>✕</span>
          </div>
        )}

        {/* FILTROS */}
        <div style={styles.filtros}>
          {['Pendiente', 'Aprobado', 'Rechazado'].map(f => (
            <button key={f} className="btn" style={{
              ...styles.filtroBtn,
              background: filtro === f ? '#1a4d2e' : 'white',
              color: filtro === f ? 'white' : '#555',
              border: filtro === f ? '2px solid #1a4d2e' : '2px solid #e5e7eb',
            }} onClick={() => setFiltro(f)}>
              {f} ({lugares.filter(l => (l.estado || 'Pendiente') === f).length})
            </button>
          ))}
        </div>

        <div style={styles.layout}>

          {/* LISTA */}
          <div style={styles.lista}>
            {lugaresFiltrados.length === 0 ? (
              <div style={styles.vacio}>No hay lugares con estado "{filtro}"</div>
            ) : (
              lugaresFiltrados.map((l, i) => {
                const est = estadoColor(l.estado || 'Pendiente')
                const seleccionado = lugarSeleccionado?.id_lugar_produccion === l.id_lugar_produccion
                return (
                  <div key={i} className="fila" style={{
                    ...styles.fila,
                    background: seleccionado ? '#e8f5e9' : 'white',
                    borderLeft: seleccionado ? '4px solid #1a4d2e' : '4px solid transparent',
                  }} onClick={() => verDetalle(l)}>
                    <div style={styles.filaInfo}>
                      <h3 style={styles.filaNombre}>{l.nombre_lugar}</h3>
                      <p style={styles.filaDato}>{l.municipio}, {l.departamento}</p>
                      <p style={styles.filaDato}>Registro ICA: {l.numero_registroica}</p>
                    </div>
                    <span style={{ ...styles.estadoBadge, background: est.bg, color: est.color }}>
                      {l.estado || 'Pendiente'}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* DETALLE */}
          {lugarSeleccionado && (
            <div style={styles.detalle}>
              <h2 style={styles.detalleTitulo}>{lugarSeleccionado.nombre_lugar}</h2>

              <div style={styles.detalleInfo}>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Registro ICA</span>
                  <span style={styles.detalleValor}>{lugarSeleccionado.numero_registroica}</span>
                </div>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Ubicación</span>
                  <span style={styles.detalleValor}>{lugarSeleccionado.municipio}, {lugarSeleccionado.departamento}</span>
                </div>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Área total</span>
                  <span style={styles.detalleValor}>{lugarSeleccionado.area_total_m2} m²</span>
                </div>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Estado actual</span>
                  <span style={styles.detalleValor}>{lugarSeleccionado.estado || 'Pendiente'}</span>
                </div>
              </div>

              {/* EVIDENCIAS */}
              <div style={styles.evidenciasSection}>
                <h3 style={styles.evidenciasTitulo}>Documentos adjuntos</h3>
                {evidencias.length === 0 ? (
                  <p style={styles.sinEvidencias}>Sin documentos adjuntos</p>
                ) : (
                  evidencias.map((e, i) => (
                    <div key={i} style={styles.evidenciaCard}>
                      <div>
                        <p style={styles.evidenciaNombre}>{e.nombre_archivo || 'Documento'}</p>
                        <p style={styles.evidenciaTipo}>{e.tipo}</p>
                        {e.observacion && <p style={styles.evidenciaObs}>{e.observacion}</p>}
                      </div>
                      {e.url_archivo && (
                        <a href={e.url_archivo} target="_blank" rel="noreferrer" style={styles.verDoc}>
                          Ver →
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* ACCIONES */}
              {(lugarSeleccionado.estado === 'Pendiente' || !lugarSeleccionado.estado) && (
                <div style={styles.acciones}>
                  <button className="btn" style={styles.btnAprobar}
                    onClick={() => aprobar(lugarSeleccionado.id_lugar_produccion)}>
                    Aprobar Lugar
                  </button>

                  <div style={styles.rechazoSection}>
                    <textarea
                      style={styles.motivoInput}
                      placeholder="Motivo de rechazo..."
                      value={motivoRechazo}
                      onChange={e => setMotivoRechazo(e.target.value)}
                    />
                    <button className="btn" style={styles.btnRechazar}
                      onClick={() => rechazar(lugarSeleccionado.id_lugar_produccion)}>
                      Rechazar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
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
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  navBack: {
    background: 'rgba(255,255,255,0.12)', color: 'white',
    border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif",
  },
  navLogout: {
    background: 'transparent', color: 'rgba(255,255,255,0.6)',
    border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem',
  },
  contenido: { maxWidth: '1200px', margin: '0 auto', padding: '48px 40px' },
  header: { marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #dde8dd' },
  headerSub: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#40916c', marginBottom: '8px', fontWeight: '600' },
  headerTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2.4rem', color: '#1a4d2e', fontWeight: 'normal' },
  mensajeBox: {
    background: '#dcfce7', color: '#16a34a', padding: '14px 20px',
    borderRadius: '10px', marginBottom: '24px', display: 'flex',
    justifyContent: 'space-between', fontSize: '0.9rem',
  },
  filtros: { display: 'flex', gap: '12px', marginBottom: '24px' },
  filtroBtn: {
    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.88rem', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
  },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '24px' },
  lista: { display: 'flex', flexDirection: 'column', gap: '8px' },
  fila: {
    background: 'white', borderRadius: '12px', padding: '18px 20px',
    cursor: 'pointer', border: '1px solid #e8efe8', transition: 'all 0.2s',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  filaInfo: { flex: 1 },
  filaNombre: { fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: '#1a4d2e', marginBottom: '4px' },
  filaDato: { fontSize: '0.82rem', color: '#888', marginTop: '2px' },
  estadoBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', whiteSpace: 'nowrap', marginLeft: '12px' },
  vacio: { textAlign: 'center', padding: '48px', color: '#aaa', background: 'white', borderRadius: '12px' },
  detalle: {
    background: 'white', borderRadius: '16px', padding: '32px',
    border: '1px solid #e8efe8', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    height: 'fit-content', position: 'sticky', top: '24px',
  },
  detalleTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', color: '#1a4d2e', marginBottom: '20px' },
  detalleInfo: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f0f0f0' },
  detalleItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  detalleLabel: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#aaa', fontWeight: '600' },
  detalleValor: { fontSize: '0.9rem', color: '#333', fontWeight: '500' },
  evidenciasSection: { marginBottom: '24px' },
  evidenciasTitulo: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '12px', fontWeight: '600' },
  sinEvidencias: { fontSize: '0.88rem', color: '#ccc', fontStyle: 'italic' },
  evidenciaCard: {
    background: '#f9fafb', borderRadius: '10px', padding: '14px 16px',
    marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  evidenciaNombre: { fontSize: '0.9rem', fontWeight: '600', color: '#333' },
  evidenciaTipo: { fontSize: '0.78rem', color: '#888', marginTop: '2px', textTransform: 'uppercase' },
  evidenciaObs: { fontSize: '0.82rem', color: '#666', marginTop: '4px' },
  verDoc: { color: '#1a4d2e', fontWeight: '700', fontSize: '0.85rem', textDecoration: 'none' },
  acciones: { display: 'flex', flexDirection: 'column', gap: '12px' },
  btnAprobar: {
    background: '#1a4d2e', color: 'white', border: 'none',
    padding: '13px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.95rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
  },
  rechazoSection: { display: 'flex', flexDirection: 'column', gap: '8px' },
  motivoInput: {
    padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px',
    fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", resize: 'vertical', minHeight: '80px',
  },
  btnRechazar: {
    background: '#dc2626', color: 'white', border: 'none',
    padding: '13px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.95rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
  },
}