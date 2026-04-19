import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function GestionInspecciones() {
  const navigate = useNavigate()
  const [visitas, setVisitas] = useState([])
  const [filtro, setFiltro] = useState('Pendiente')
  const [visitaSeleccionada, setVisitaSeleccionada] = useState(null)
  const [detalles, setDetalles] = useState([])
  const [observacion, setObservacion] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => { fetchVisitas() }, [])

  const fetchVisitas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/visitas')
      setVisitas(res.data)
    } catch (err) { console.error(err) }
  }

  const verDetalle = async (visita) => {
    setVisitaSeleccionada(visita)
    setObservacion('')
    try {
      const res = await axios.get('http://localhost:3000/api/detalles')
      const filtrados = res.data.filter(d => d.id_visita_inspeccion === visita.id_visita_inspeccion)
      setDetalles(filtrados)
    } catch (err) { setDetalles([]) }
  }

  const aprobar = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/api/visitas/${id}/aprobar`, { observacion_admin: observacion })
      setMensaje('Inspección aprobada correctamente')
      setVisitaSeleccionada(null)
      fetchVisitas()
    } catch (err) { setMensaje('Error al aprobar') }
  }

  const rechazar = async (id) => {
    if (!observacion) return alert('Debes ingresar una observación de rechazo')
    try {
      await axios.patch(`http://localhost:3000/api/visitas/${id}/rechazar`, { observacion_admin: observacion })
      setMensaje('Inspección rechazada')
      setVisitaSeleccionada(null)
      fetchVisitas()
    } catch (err) { setMensaje('Error al rechazar') }
  }

  const estadoColor = (estado) => {
    if (estado === 'Aprobada') return { bg: '#dcfce7', color: '#16a34a' }
    if (estado === 'Rechazada') return { bg: '#fee2e2', color: '#dc2626' }
    return { bg: '#fef9c3', color: '#ca8a04' }
  }

  const nivelAlerta = (porcentaje) => {
    const p = parseFloat(porcentaje)
    if (p >= 50) return { label: 'Alto', color: '#dc2626', bg: '#fee2e2' }
    if (p >= 20) return { label: 'Medio', color: '#ca8a04', bg: '#fef9c3' }
    return { label: 'Bajo', color: '#16a34a', bg: '#dcfce7' }
  }

  const visitasFiltradas = visitas.filter(v => (v.estado || 'Pendiente') === filtro)

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
            <h1 style={styles.headerTitulo}>Gestión de Inspecciones</h1>
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
          {['Pendiente', 'Aprobada', 'Rechazada'].map(f => (
            <button key={f} className="btn" style={{
              ...styles.filtroBtn,
              background: filtro === f ? '#1565c0' : 'white',
              color: filtro === f ? 'white' : '#555',
              border: filtro === f ? '2px solid #1565c0' : '2px solid #e5e7eb',
            }} onClick={() => setFiltro(f)}>
              {f} ({visitas.filter(v => (v.estado || 'Pendiente') === f).length})
            </button>
          ))}
        </div>

        <div style={styles.layout}>

          {/* LISTA */}
          <div style={styles.lista}>
            {visitasFiltradas.length === 0 ? (
              <div style={styles.vacio}>No hay inspecciones con estado "{filtro}"</div>
            ) : (
              visitasFiltradas.map((v, i) => {
                const est = estadoColor(v.estado || 'Pendiente')
                const seleccionado = visitaSeleccionada?.id_visita_inspeccion === v.id_visita_inspeccion
                return (
                  <div key={i} className="fila" style={{
                    ...styles.fila,
                    background: seleccionado ? '#e3f2fd' : 'white',
                    borderLeft: seleccionado ? '4px solid #1565c0' : '4px solid transparent',
                  }} onClick={() => verDetalle(v)}>
                    <div style={styles.filaInfo}>
                      <h3 style={styles.filaNombre}>{v.nombre_lugar || `Visita #${v.id_visita_inspeccion}`}</h3>
                      <p style={styles.filaDato}>Inspector: {v.nombre_inspector || 'No asignado'}</p>
                      <p style={styles.filaDato}>Fecha: {new Date(v.fecha).toLocaleDateString('es-CO')} | Periodo: {v.periodo_reportado}</p>
                    </div>
                    <span style={{ ...styles.estadoBadge, background: est.bg, color: est.color }}>
                      {v.estado || 'Pendiente'}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* DETALLE */}
          {visitaSeleccionada && (
            <div style={styles.detalle}>
              <h2 style={styles.detalleTitulo}>{visitaSeleccionada.nombre_lugar}</h2>

              <div style={styles.detalleInfo}>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Inspector</span>
                  <span style={styles.detalleValor}>{visitaSeleccionada.nombre_inspector}</span>
                </div>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Fecha</span>
                  <span style={styles.detalleValor}>{new Date(visitaSeleccionada.fecha).toLocaleDateString('es-CO')}</span>
                </div>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Horario</span>
                  <span style={styles.detalleValor}>{visitaSeleccionada.hora_inicio} - {visitaSeleccionada.hora_fin}</span>
                </div>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Periodo</span>
                  <span style={styles.detalleValor}>{visitaSeleccionada.periodo_reportado}</span>
                </div>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Estado</span>
                  <span style={styles.detalleValor}>{visitaSeleccionada.estado || 'Pendiente'}</span>
                </div>
              </div>

              {/* DETALLES DE INSPECCIÓN */}
              <div style={styles.detallesSection}>
                <h3 style={styles.detallesTitulo}>Hallazgos registrados</h3>
                {detalles.length === 0 ? (
                  <p style={styles.sinDetalles}>Sin hallazgos registrados</p>
                ) : (
                  detalles.map((d, i) => {
                    const alerta = nivelAlerta(d.porcentaje_incidencia)
                    return (
                      <div key={i} style={styles.detalleCard}>
                        <div style={styles.detalleCardTop}>
                          <span style={styles.detalleCardLabel}>Lote #{d.id_lote} — Plaga #{d.id_plaga}</span>
                          <span style={{ ...styles.alertaBadge, background: alerta.bg, color: alerta.color }}>
                            Alerta {alerta.label}
                          </span>
                        </div>
                        <div style={styles.detalleCardInfo}>
                          <span>Muestreadas: <b>{d.especie_muestreadas}</b></span>
                          <span>Afectadas: <b>{d.especie_afectadas}</b></span>
                          <span>Incidencia: <b>{parseFloat(d.porcentaje_incidencia).toFixed(1)}%</b></span>
                        </div>
                        {d.informacion_de_produccion && (
                          <p style={styles.detalleCardObs}>{d.informacion_de_produccion}</p>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* ACCIONES */}
              {(visitaSeleccionada.estado === 'Pendiente' || !visitaSeleccionada.estado) && (
                <div style={styles.acciones}>
                  <div style={styles.obsSection}>
                    <label style={styles.obsLabel}>Observación del administrador</label>
                    <textarea
                      style={styles.motivoInput}
                      placeholder="Escribe una observación (requerida para rechazar)..."
                      value={observacion}
                      onChange={e => setObservacion(e.target.value)}
                    />
                  </div>
                  <button className="btn" style={styles.btnAprobar}
                    onClick={() => aprobar(visitaSeleccionada.id_visita_inspeccion)}>
                    Aprobar Inspección
                  </button>
                  <button className="btn" style={styles.btnRechazar}
                    onClick={() => rechazar(visitaSeleccionada.id_visita_inspeccion)}>
                    Rechazar Inspección
                  </button>
                </div>
              )}

              {visitaSeleccionada.observacion_admin && (
                <div style={styles.obsAdmin}>
                  <p style={styles.obsAdminLabel}>Observación del admin:</p>
                  <p style={styles.obsAdminTexto}>{visitaSeleccionada.observacion_admin}</p>
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
  headerSub: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#1565c0', marginBottom: '8px', fontWeight: '600' },
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
  detallesSection: { marginBottom: '24px' },
  detallesTitulo: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#888', marginBottom: '12px', fontWeight: '600' },
  sinDetalles: { fontSize: '0.88rem', color: '#ccc', fontStyle: 'italic' },
  detalleCard: {
    background: '#f9fafb', borderRadius: '10px', padding: '14px 16px', marginBottom: '8px',
  },
  detalleCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  detalleCardLabel: { fontSize: '0.82rem', fontWeight: '600', color: '#555' },
  alertaBadge: { padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' },
  detalleCardInfo: { display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#555' },
  detalleCardObs: { fontSize: '0.82rem', color: '#888', marginTop: '8px', fontStyle: 'italic' },
  acciones: { display: 'flex', flexDirection: 'column', gap: '10px' },
  obsSection: { display: 'flex', flexDirection: 'column', gap: '6px' },
  obsLabel: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#aaa', fontWeight: '600' },
  motivoInput: {
    padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px',
    fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", resize: 'vertical', minHeight: '80px',
  },
  btnAprobar: {
    background: '#1565c0', color: 'white', border: 'none',
    padding: '13px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.95rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
  },
  btnRechazar: {
    background: '#dc2626', color: 'white', border: 'none',
    padding: '13px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.95rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
  },
  obsAdmin: { marginTop: '16px', background: '#f0f4f0', borderRadius: '10px', padding: '14px 16px' },
  obsAdminLabel: { fontSize: '0.78rem', textTransform: 'uppercase', color: '#888', fontWeight: '600', marginBottom: '6px' },
  obsAdminTexto: { fontSize: '0.9rem', color: '#333' },
}