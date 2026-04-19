import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function AsignarInspector() {
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState([])
  const [inspectores, setInspectores] = useState([])
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('Pendiente')
  const [form, setForm] = useState({
    id_inspector: '',
    fecha: '',
    hora_inicio: '',
    periodo_reportado: '',
  })

  useEffect(() => {
    fetchSolicitudes()
    fetchInspectores()
  }, [])

  const fetchSolicitudes = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/solicitudes')
      setSolicitudes(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchInspectores = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/funcionarios')
      setInspectores(res.data.filter(f => f.rol_funcionario === 'Inspector'))
    } catch (err) { console.error(err) }
  }

  const handleAsignar = async (e) => {
    e.preventDefault()
    setError('')
    if (!solicitudSeleccionada) return setError('Selecciona una solicitud')
    if (!form.id_inspector) return setError('Selecciona un inspector')
    if (!form.fecha) return setError('Selecciona una fecha')

    try {
      // Crear la visita
      await axios.post('http://localhost:3000/api/visitas', {
        fecha: form.fecha,
        hora_inicio: form.hora_inicio || '08:00',
        hora_fin: '00:00',
        periodo_reportado: form.periodo_reportado || `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${new Date().getFullYear()}`,
        id_inspector: parseInt(form.id_inspector),
        id_lugar_produccion: solicitudSeleccionada.id_lugar_produccion,
      })

      // Aprobar la solicitud
      await axios.patch(`http://localhost:3000/api/solicitudes/${solicitudSeleccionada.id_solicitud}/aprobar`)

      setMensaje(`✅ Inspector asignado correctamente para ${solicitudSeleccionada.nombre_lugar} — ${solicitudSeleccionada.nombre_lote}`)
      setSolicitudSeleccionada(null)
      setForm({ id_inspector: '', fecha: '', hora_inicio: '', periodo_reportado: '' })
      fetchSolicitudes()
    } catch (err) {
      setError('❌ Error al asignar la inspección')
    }
  }

  const rechazarSolicitud = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/api/solicitudes/${id}/rechazar`)
      setMensaje('Solicitud rechazada')
      setSolicitudSeleccionada(null)
      fetchSolicitudes()
    } catch (err) {
      setError('Error al rechazar')
    }
  }

  const estadoColor = (estado) => {
    if (estado === 'Aprobada') return { bg: '#dcfce7', color: '#16a34a' }
    if (estado === 'Rechazada') return { bg: '#fee2e2', color: '#dc2626' }
    return { bg: '#fef9c3', color: '#ca8a04' }
  }

  const solicitudesFiltradas = solicitudes.filter(s => s.estado === filtro)

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus { border-color: #1a4d2e !important; outline: none; }
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
            <p style={styles.headerSub}>Administración</p>
            <h1 style={styles.headerTitulo}>Solicitudes de Inspección</h1>
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

        {/* FILTROS */}
        <div style={styles.filtros}>
          {['Pendiente', 'Aprobada', 'Rechazada'].map(f => (
            <button key={f} className="btn" style={{
              ...styles.filtroBtn,
              background: filtro === f ? '#6a1b9a' : 'white',
              color: filtro === f ? 'white' : '#555',
              border: filtro === f ? '2px solid #6a1b9a' : '2px solid #e5e7eb',
            }} onClick={() => setFiltro(f)}>
              {f} ({solicitudes.filter(s => s.estado === f).length})
            </button>
          ))}
        </div>

        <div style={styles.layout}>

          {/* LISTA DE SOLICITUDES */}
          <div style={styles.lista}>
            {solicitudesFiltradas.length === 0 ? (
              <div style={styles.vacio}>No hay solicitudes {filtro.toLowerCase()}s</div>
            ) : (
              solicitudesFiltradas.map((s, i) => {
                const est = estadoColor(s.estado)
                const seleccionada = solicitudSeleccionada?.id_solicitud === s.id_solicitud
                return (
                  <div key={i} className="fila" style={{
                    ...styles.fila,
                    background: seleccionada ? '#f3e5f5' : 'white',
                    borderLeft: seleccionada ? '4px solid #6a1b9a' : '4px solid transparent',
                  }} onClick={() => setSolicitudSeleccionada(s)}>
                    <div style={styles.filaInfo}>
                      <h3 style={styles.filaNombre}>{s.nombre_lugar}</h3>
                      <p style={styles.filaDato}>Lote: {s.nombre_lote} — {s.especie}</p>
                      <p style={styles.filaDato}>Productor: {s.nombre_productor}</p>
                      <p style={styles.filaDato}>
                        Fecha solicitada: {new Date(s.fecha_solicitada).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <span style={{ ...styles.estadoBadge, background: est.bg, color: est.color }}>
                      {s.estado}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* PANEL DE ASIGNACIÓN */}
          {solicitudSeleccionada && solicitudSeleccionada.estado === 'Pendiente' && (
            <div style={styles.formCard}>
              <h2 style={styles.formTitulo}>Asignar Inspector</h2>
              <div style={styles.detalleInfo}>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Finca</span>
                  <span style={styles.detalleValor}>{solicitudSeleccionada.nombre_lugar}</span>
                </div>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Lote</span>
                  <span style={styles.detalleValor}>{solicitudSeleccionada.nombre_lote}</span>
                </div>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Cultivo</span>
                  <span style={styles.detalleValor}>{solicitudSeleccionada.especie}</span>
                </div>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Productor</span>
                  <span style={styles.detalleValor}>{solicitudSeleccionada.nombre_productor}</span>
                </div>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Fecha solicitada</span>
                  <span style={styles.detalleValor}>
                    {new Date(solicitudSeleccionada.fecha_solicitada).toLocaleDateString('es-CO')}
                  </span>
                </div>
                {solicitudSeleccionada.motivo && (
                  <div style={styles.detalleItem}>
                    <span style={styles.detalleLabel}>Motivo</span>
                    <span style={styles.detalleValor}>{solicitudSeleccionada.motivo}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleAsignar}>
                <div style={styles.campo}>
                  <label style={styles.label}>Inspector asignado</label>
                  <select style={styles.input} value={form.id_inspector}
                    onChange={e => setForm({ ...form, id_inspector: e.target.value })} required>
                    <option value="">Selecciona un inspector...</option>
                    {inspectores.map(i => (
                      <option key={i.id_funcionario} value={i.id_funcionario}>
                        {i.nombre_completo} — {i.tarjeta_profesional}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.campo}>
                  <label style={styles.label}>Fecha de la visita</label>
                  <input style={styles.input} type="date" value={form.fecha}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm({ ...form, fecha: e.target.value })} required />
                </div>

                <div style={styles.campo}>
                  <label style={styles.label}>Hora de inicio</label>
                  <input style={styles.input} type="time" value={form.hora_inicio}
                    onChange={e => setForm({ ...form, hora_inicio: e.target.value })} />
                </div>

                <div style={styles.campo}>
                  <label style={styles.label}>Periodo reportado</label>
                  <select style={styles.input} value={form.periodo_reportado}
                    onChange={e => setForm({ ...form, periodo_reportado: e.target.value })}>
                    <option value="">Selecciona el periodo...</option>
                    <option value="Q1-2026">Q1-2026 (Ene - Mar)</option>
                    <option value="Q2-2026">Q2-2026 (Abr - Jun)</option>
                    <option value="Q3-2026">Q3-2026 (Jul - Sep)</option>
                    <option value="Q4-2026">Q4-2026 (Oct - Dic)</option>
                  </select>
                </div>

                <button className="btn" style={styles.btnAsignar} type="submit">
                  Asignar Inspector
                </button>
                <button className="btn" style={styles.btnRechazar} type="button"
                  onClick={() => rechazarSolicitud(solicitudSeleccionada.id_solicitud)}>
                  Rechazar Solicitud
                </button>
              </form>
            </div>
          )}

          {solicitudSeleccionada && solicitudSeleccionada.estado !== 'Pendiente' && (
            <div style={styles.formCard}>
              <h2 style={styles.formTitulo}>Detalle de solicitud</h2>
              <div style={styles.detalleInfo}>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Finca</span>
                  <span style={styles.detalleValor}>{solicitudSeleccionada.nombre_lugar}</span>
                </div>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Lote</span>
                  <span style={styles.detalleValor}>{solicitudSeleccionada.nombre_lote}</span>
                </div>
                <div style={styles.detalleItem}>
                  <span style={styles.detalleLabel}>Estado</span>
                  <span style={styles.detalleValor}>{solicitudSeleccionada.estado}</span>
                </div>
              </div>
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
  headerSub: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#6a1b9a', marginBottom: '8px', fontWeight: '600' },
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
  formCard: {
    background: 'white', borderRadius: '16px', padding: '32px',
    border: '1px solid #e8efe8', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    height: 'fit-content', position: 'sticky', top: '24px',
  },
  formTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#1a4d2e', marginBottom: '20px' },
  detalleInfo: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0' },
  detalleItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  detalleLabel: { fontSize: '0.78rem', textTransform: 'uppercase', color: '#aaa', fontWeight: '600' },
  detalleValor: { fontSize: '0.88rem', color: '#333', fontWeight: '500' },
  campo: { marginBottom: '14px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb',
    borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s',
  },
  btnAsignar: {
    width: '100%', background: '#6a1b9a', color: 'white', border: 'none',
    padding: '13px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.95rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", marginBottom: '10px',
  },
  btnRechazar: {
    width: '100%', background: '#dc2626', color: 'white', border: 'none',
    padding: '13px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.95rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
  },
}