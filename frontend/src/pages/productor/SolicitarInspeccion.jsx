import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function SolicitarInspeccion() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const [lugares, setLugares] = useState([])
  const [lotes, setLotes] = useState([])
  const [solicitudes, setSolicitudes] = useState([])
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [form, setForm] = useState({
    id_lote: '',
    fecha_solicitada: '',
    motivo: '',
  })

  useEffect(() => {
    fetchLugares()
    fetchSolicitudes()
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

  const fetchSolicitudes = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/solicitudes/productor/${usuario.id_productor}`)
      setSolicitudes(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchLotes = async (idLugar) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/lotes/lugar/${idLugar}`)
      setLotes(res.data)
    } catch (err) { console.error(err) }
  }

  const handleSeleccionarLugar = (lugar) => {
    setLugarSeleccionado(lugar)
    setLotes([])
    setForm({ id_lote: '', fecha_solicitada: '', motivo: '' })
    fetchLotes(lugar.id_lugar_produccion)
  }

  const handleSolicitar = async (e) => {
    e.preventDefault()
    setError('')
    if (!lugarSeleccionado) return setError('Selecciona una finca')
    if (!form.id_lote) return setError('Selecciona un lote')
    if (!form.fecha_solicitada) return setError('Selecciona una fecha')

    setCargando(true)
    try {
      await axios.post('http://localhost:3000/api/solicitudes', {
        id_lugar_produccion: lugarSeleccionado.id_lugar_produccion,
        id_lote: parseInt(form.id_lote),
        id_productor: usuario.id_productor,
        fecha_solicitada: form.fecha_solicitada,
        motivo: form.motivo,
      })
      setMensaje('✅ Solicitud enviada correctamente. El administrador la revisará pronto.')
      setForm({ id_lote: '', fecha_solicitada: '', motivo: '' })
      setLugarSeleccionado(null)
      setLotes([])
      fetchSolicitudes()
    } catch (err) {
      setError('❌ Error al enviar la solicitud')
    } finally {
      setCargando(false)
    }
  }

  const estadoColor = (estado) => {
    if (estado === 'Aprobada') return { bg: '#dcfce7', color: '#16a34a' }
    if (estado === 'Rechazada') return { bg: '#fee2e2', color: '#dc2626' }
    return { bg: '#fef9c3', color: '#ca8a04' }
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus, textarea:focus { border-color: #1a4d2e !important; outline: none; }
        .lugar-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .btn:hover { opacity: 0.85; }
      `}</style>

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <span style={styles.navLogo}>UdiFica</span>
        <div style={styles.navRight}>
          <span style={styles.navRol}>Hola, {usuario.nombre_completo?.split(' ')[0]}</span>
          <button style={styles.navBtn} onClick={() => navigate('/productor/lotes')}>
            Mis Fincas
          </button>
          <button style={styles.navLogout}
            onClick={() => { localStorage.clear(); window.location.href = '/' }}>
            Salir
          </button>
        </div>
      </nav>

      <div style={styles.contenido}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <p style={styles.headerSub}>Panel del Productor</p>
            <h1 style={styles.headerTitulo}>Solicitar Inspección</h1>
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

          {/* FORMULARIO */}
          <div>
            <h2 style={styles.seccionTitulo}>Nueva solicitud</h2>
            <p style={styles.seccionSub}>Selecciona la finca y el lote que quieres inspeccionar</p>

            {/* PASO 1 - SELECCIONAR FINCA */}
            <div style={styles.paso}>
              <div style={styles.pasoHeader}>
                <span style={styles.pasoNum}>1</span>
                <span style={styles.pasoTitulo}>Selecciona tu finca</span>
              </div>
              {lugares.length === 0 ? (
                <div style={styles.vacioPaso}>
                  No tienes fincas aprobadas.
                  <span style={styles.vacioPasoLink}
                    onClick={() => navigate('/productor/lotes')}> Ver mis fincas →</span>
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
                    }} onClick={() => handleSeleccionarLugar(l)}>
                      <h3 style={styles.lugarNombre}>{l.nombre_lugar}</h3>
                      <p style={styles.lugarDato}>{l.municipio}, {l.departamento}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PASO 2 - SELECCIONAR LOTE */}
            {lugarSeleccionado && (
              <div style={styles.paso}>
                <div style={styles.pasoHeader}>
                  <span style={styles.pasoNum}>2</span>
                  <span style={styles.pasoTitulo}>Selecciona el lote a inspeccionar</span>
                </div>
                {lotes.length === 0 ? (
                  <div style={styles.vacioPaso}>
                    Esta finca no tiene lotes.
                    <span style={styles.vacioPasoLink}
                      onClick={() => {
                        localStorage.setItem('lugar_activo', JSON.stringify(lugarSeleccionado))
                        navigate(`/productor/lotes/${lugarSeleccionado.id_lugar_produccion}`)
                      }}> Crear lotes →</span>
                  </div>
                ) : (
                  <select style={styles.input} value={form.id_lote}
                    onChange={e => setForm({ ...form, id_lote: e.target.value })}>
                    <option value="">Selecciona un lote...</option>
                    {lotes.map(l => (
                      <option key={l.id_lote} value={l.id_lote}>
                        {l.nombre_lote} — {l.especie} ({l.total_plantas_lote} plantas)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* PASO 3 - FECHA Y MOTIVO */}
            {lugarSeleccionado && lotes.length > 0 && (
              <div style={styles.paso}>
                <div style={styles.pasoHeader}>
                  <span style={styles.pasoNum}>3</span>
                  <span style={styles.pasoTitulo}>¿Cuándo quieres la inspección?</span>
                </div>
                <form onSubmit={handleSolicitar}>
                  <div style={styles.campo}>
                    <label style={styles.label}>Fecha solicitada</label>
                    <input style={styles.input} type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={form.fecha_solicitada}
                      onChange={e => setForm({ ...form, fecha_solicitada: e.target.value })} required />
                  </div>
                  <div style={styles.campo}>
                    <label style={styles.label}>¿Por qué necesitas la inspección? (opcional)</label>
                    <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                      placeholder="Ej: Renovación trimestral, presencia de plagas..."
                      value={form.motivo}
                      onChange={e => setForm({ ...form, motivo: e.target.value })} />
                  </div>
                  <button className="btn" style={{
                    ...styles.btnSolicitar,
                    opacity: cargando ? 0.7 : 1,
                    cursor: cargando ? 'not-allowed' : 'pointer'
                  }} type="submit" disabled={cargando}>
                    {cargando ? '⏳ Enviando...' : '✅ Enviar solicitud de inspección'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* HISTORIAL */}
          <div>
            <h2 style={styles.seccionTitulo}>Mis solicitudes</h2>
            <p style={styles.seccionSub}>Historial de todas tus solicitudes de inspección</p>

            {solicitudes.length === 0 ? (
              <div style={styles.vacio}>
                <p style={styles.vacioTitulo}>Sin solicitudes aún</p>
                <p style={styles.vacioSub}>Tus solicitudes aparecerán aquí</p>
              </div>
            ) : (
              <div style={styles.solicitudesList}>
                {solicitudes.map((s, i) => {
                  const est = estadoColor(s.estado)
                  return (
                    <div key={i} style={styles.solicitudCard}>
                      <div style={styles.solicitudHeader}>
                        <div>
                          <h3 style={styles.solicitudNombre}>{s.nombre_lugar}</h3>
                          <p style={styles.solicitudDato}>Lote: {s.nombre_lote} — {s.especie}</p>
                          <p style={styles.solicitudDato}>
                            Fecha solicitada: {new Date(s.fecha_solicitada).toLocaleDateString('es-CO')}
                          </p>
                          {s.motivo && <p style={styles.solicitudDato}>Motivo: {s.motivo}</p>}
                        </div>
                        <span style={{ ...styles.estadoBadge, background: est.bg, color: est.color }}>
                          {s.estado}
                        </span>
                      </div>
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
  navRol: { color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' },
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
  seccionSub: { fontSize: '0.85rem', color: '#888', marginBottom: '20px' },
  paso: {
    background: 'white', borderRadius: '14px', padding: '20px 24px',
    marginBottom: '16px', border: '1px solid #e8efe8',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  pasoHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  pasoNum: {
    background: '#1a4d2e', color: 'white', width: '28px', height: '28px',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.85rem', fontWeight: '700', flexShrink: 0,
  },
  pasoTitulo: { fontSize: '1rem', fontWeight: '600', color: '#333' },
  vacioPaso: { fontSize: '0.88rem', color: '#aaa', padding: '8px 0' },
  vacioPasoLink: { color: '#1a4d2e', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' },
  lugaresList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  lugarCard: {
    background: 'white', borderRadius: '10px', padding: '14px 16px',
    cursor: 'pointer', border: '1px solid #e8efe8', transition: 'all 0.2s',
  },
  lugarNombre: { fontFamily: "'DM Serif Display', serif", fontSize: '1rem', color: '#1a4d2e', marginBottom: '4px' },
  lugarDato: { fontSize: '0.82rem', color: '#888' },
  campo: { marginBottom: '14px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '0.88rem', fontWeight: '600', color: '#333' },
  input: {
    width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb',
    borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  },
  btnSolicitar: {
    width: '100%', background: '#1a4d2e', color: 'white', border: 'none',
    padding: '14px', borderRadius: '10px', fontSize: '1rem',
    fontWeight: '700', fontFamily: "'DM Sans', sans-serif", marginTop: '8px',
  },
  vacio: {
    textAlign: 'center', padding: '48px 24px', background: 'white',
    borderRadius: '16px', border: '1px solid #e8efe8',
  },
  vacioTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem', color: '#ccc', marginBottom: '8px' },
  vacioSub: { fontSize: '0.85rem', color: '#ccc' },
  solicitudesList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  solicitudCard: {
    background: 'white', borderRadius: '12px', padding: '18px 20px',
    border: '1px solid #e8efe8', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  solicitudHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  solicitudNombre: { fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: '#1a4d2e', marginBottom: '6px' },
  solicitudDato: { fontSize: '0.82rem', color: '#888', marginTop: '2px' },
  estadoBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', whiteSpace: 'nowrap', marginLeft: '12px' },
}