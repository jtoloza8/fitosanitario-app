import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function RegistrarInforme() {
  const navigate = useNavigate()
  const timeoutRef = useRef(null)
  const [visita, setVisita] = useState(null)
  const [lotes, setLotes] = useState([])
  const [plagas, setPlagas] = useState([])
  const [loteSeleccionado, setLoteSeleccionado] = useState(null)
  const [loteActivo, setLoteActivo] = useState(null)
  const [plagaSeleccionada, setPlagaSeleccionada] = useState(null)
  const [hallazgos, setHallazgos] = useState([])
  const [form, setForm] = useState({
    especie_muestreadas: '',
    especie_afectadas: '',
    area_registrada: '',
    informacion_de_produccion: '',
  })
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    const visitaActiva = JSON.parse(localStorage.getItem('visita_activa') || 'null')
    if (!visitaActiva) {
      navigate('/inspector/calendario')
      return
    }
    setVisita(visitaActiva)
    fetchLotes(visitaActiva.id_lugar_produccion)
    fetchPlagas()
    fetchHallazgos(visitaActiva.id_visita_inspeccion)
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  const fetchLotes = async (idLugar) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/lotes/lugar/${idLugar}`)
      setLotes(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchPlagas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/plagas')
      setPlagas(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchHallazgos = async (idVisita) => {
    try {
      const res = await axios.get('http://localhost:3000/api/detalles')
      const filtrados = res.data.filter(d => d.id_visita_inspeccion === idVisita)
      setHallazgos(filtrados)
    } catch (err) { console.error(err) }
  }

  const handleSeleccionarLote = (e) => {
    const id = parseInt(e.target.value)
    setLoteSeleccionado(id)
    const lote = lotes.find(l => l.id_lote === id)
    setLoteActivo(lote)
    setForm(prev => ({ ...prev, area_registrada: lote?.area_ha || '' }))
  }

  const calcularIncidencia = () => {
    const m = parseFloat(form.especie_muestreadas)
    const a = parseFloat(form.especie_afectadas)
    if (!m || !a) return 0
    return ((a / m) * 100).toFixed(1)
  }

  const nivelAlerta = (porcentaje) => {
    const p = parseFloat(porcentaje)
    if (p >= 50) return { label: 'Alto', color: '#dc2626', bg: '#fee2e2' }
    if (p >= 20) return { label: 'Medio', color: '#ca8a04', bg: '#fef9c3' }
    return { label: 'Bajo', color: '#16a34a', bg: '#dcfce7' }
  }

  const handleGuardar = async () => {
    setError('')
    if (!loteSeleccionado) return setError('Selecciona un lote')
    if (!plagaSeleccionada) return setError('Selecciona una plaga')
    if (!form.especie_muestreadas || !form.especie_afectadas) return setError('Ingresa los conteos')

    const muestreadas = parseInt(form.especie_muestreadas)
    const afectadas = parseInt(form.especie_afectadas)

    if (afectadas > muestreadas) {
      return setError('Las plantas afectadas no pueden superar las muestreadas')
    }

    if (loteActivo && parseFloat(form.area_registrada) > parseFloat(loteActivo.area_ha)) {
      return setError(`El área no puede superar las ${loteActivo.area_ha} hectáreas del lote`)
    }

    setCargando(true)
    try {
      const porcentaje = (afectadas / muestreadas) * 100
      const alerta = nivelAlerta(porcentaje)

      await axios.post('http://localhost:3000/api/detalles', {
        especie_muestreadas: muestreadas,
        especie_afectadas: afectadas,
        estado_aprobacion: alerta.label,
        area_registrada: form.area_registrada || 0,
        informacion_de_produccion: form.informacion_de_produccion,
        id_lote: loteSeleccionado,
        id_plaga: plagaSeleccionada,
        id_visita_inspeccion: visita.id_visita_inspeccion,
      })

      setMensaje('Hallazgo guardado correctamente')
      setForm({ especie_muestreadas: '', especie_afectadas: '', area_registrada: '', informacion_de_produccion: '' })
      setLoteSeleccionado(null)
      setLoteActivo(null)
      setPlagaSeleccionada(null)
      fetchHallazgos(visita.id_visita_inspeccion)
    } catch (err) {
      setError('Error al guardar el hallazgo')
    } finally {
      setCargando(false)
    }
  }

  const handleFinalizar = async () => {
    if (hallazgos.length === 0) return setError('Debes registrar al menos un hallazgo')
    try {
      await axios.patch(`http://localhost:3000/api/visitas/${visita.id_visita_inspeccion}`, {
        hora_fin: new Date().toTimeString().slice(0, 5),
      })
      localStorage.removeItem('visita_activa')
      setMensaje('✅ Informe finalizado y enviado al administrador')
      timeoutRef.current = setTimeout(() => navigate('/inspector/calendario'), 2000)
    } catch (err) {
      setError('Error al finalizar el informe')
    }
  }

  const incidencia = calcularIncidencia()
  const alerta = nivelAlerta(incidencia)

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        select:focus, input:focus, textarea:focus { border-color: #1a4d2e !important; outline: none; }
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
          <button style={styles.navBack} onClick={() => navigate('/inspector/calendario')}>
            ← Volver al calendario
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
            <p style={styles.headerSub}>Inspector — Registro de Hallazgos</p>
            <h1 style={styles.headerTitulo}>
              {visita?.nombre_lugar || `Visita #${visita?.id_visita_inspeccion}`}
            </h1>
            <p style={styles.headerInfo}>
              {visita && new Date(visita.fecha).toLocaleDateString('es-CO', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })} | Periodo: {visita?.periodo_reportado}
            </p>
          </div>
          <button className="btn" style={styles.btnFinalizar} onClick={handleFinalizar}>
            Finalizar Informe
          </button>
        </div>

        {error && <div style={styles.error}>{error} <span style={{ cursor: 'pointer' }} onClick={() => setError('')}>✕</span></div>}
        {mensaje && <div style={styles.exito}>{mensaje} <span style={{ cursor: 'pointer' }} onClick={() => setMensaje('')}>✕</span></div>}

        <div style={styles.layout}>

          {/* FORMULARIO */}
          <div style={styles.formCard}>
            <h2 style={styles.formTitulo}>Registrar Hallazgo</h2>

            <div style={styles.campo}>
              <label style={styles.label}>Lote a evaluar</label>
              <select style={styles.input} value={loteSeleccionado || ''}
                onChange={handleSeleccionarLote}>
                <option value="">Selecciona un lote...</option>
                {lotes.map(l => (
                  <option key={l.id_lote} value={l.id_lote}>
                    {l.nombre_lote} — {l.especie} ({l.total_plantas_lote} plantas)
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Plaga a evaluar</label>
              <select style={styles.input} value={plagaSeleccionada || ''}
                onChange={e => setPlagaSeleccionada(parseInt(e.target.value))}>
                <option value="">Selecciona una plaga...</option>
                {plagas.map(p => (
                  <option key={p.id_plaga} value={p.id_plaga}>
                    {p.nombre_plaga} — {p.tipo_plaga}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.gridDos}>
              <div style={styles.campo}>
                <label style={styles.label}>Plantas muestreadas</label>
                <input style={styles.input} type="number" min="0"
                  placeholder="0" value={form.especie_muestreadas}
                  onChange={e => setForm({ ...form, especie_muestreadas: e.target.value })} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Plantas afectadas</label>
                <input style={styles.input} type="number" min="0"
                  placeholder="0" value={form.especie_afectadas}
                  onChange={e => setForm({ ...form, especie_afectadas: e.target.value })} />
              </div>
            </div>

            {/* CALCULADORA EN TIEMPO REAL */}
            {form.especie_muestreadas && form.especie_afectadas && (
              <div style={{ ...styles.incidenciaBox, background: alerta.bg, borderColor: alerta.color }}>
                <div style={styles.incidenciaInfo}>
                  <span style={styles.incidenciaLabel}>Porcentaje de incidencia</span>
                  <span style={{ ...styles.incidenciaValor, color: alerta.color }}>{incidencia}%</span>
                </div>
                <span style={{ ...styles.alertaBadge, background: alerta.color }}>
                  Nivel {alerta.label}
                </span>
              </div>
            )}

            <div style={styles.campo}>
              <label style={styles.label}>Área registrada (hectáreas)</label>
              <input style={styles.input} type="number" step="0.1" min="0.1"
                max={loteActivo?.area_ha || ''}
                placeholder={loteActivo ? `Máx: ${loteActivo.area_ha} ha` : 'Selecciona un lote primero'}
                value={form.area_registrada}
                onChange={e => setForm({ ...form, area_registrada: e.target.value })}
                disabled={!loteActivo} />
              {loteActivo && (
                <span style={{ fontSize: '0.78rem', color: '#40916c', marginTop: '4px', display: 'block' }}>
                  Este lote tiene {loteActivo.area_ha} hectáreas disponibles
                </span>
              )}
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Observaciones</label>
              <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                placeholder="Notas adicionales sobre el hallazgo..."
                value={form.informacion_de_produccion}
                onChange={e => setForm({ ...form, informacion_de_produccion: e.target.value })} />
            </div>

            <button className="btn" style={{
              ...styles.btnGuardar,
              opacity: cargando ? 0.7 : 1,
              cursor: cargando ? 'not-allowed' : 'pointer'
            }} onClick={handleGuardar} disabled={cargando}>
              {cargando ? 'Guardando...' : 'Guardar Hallazgo'}
            </button>
          </div>

          {/* HALLAZGOS REGISTRADOS */}
          <div style={styles.hallazgosSection}>
            <h2 style={styles.hallazgosTitulo}>
              Hallazgos registrados ({hallazgos.length})
            </h2>

            {hallazgos.length === 0 ? (
              <div style={styles.vacio}>
                <p style={styles.vacioTexto}>Sin hallazgos aún</p>
                <p style={styles.vacioSub}>Registra el primer hallazgo del informe</p>
              </div>
            ) : (
              <div style={styles.hallazgosList}>
                {hallazgos.map((h, i) => {
                  const al = nivelAlerta(h.porcentaje_incidencia)
                  const loteNombre = lotes.find(l => l.id_lote === h.id_lote)?.nombre_lote || `Lote #${h.id_lote}`
                  const plagaNombre = plagas.find(p => p.id_plaga === h.id_plaga)?.nombre_plaga || `Plaga #${h.id_plaga}`
                  return (
                    <div key={i} style={styles.hallazgoCard}>
                      <div style={styles.hallazgoHeader}>
                        <div>
                          <p style={styles.hallazgoTitulo}>{loteNombre} — {plagaNombre}</p>
                          <p style={styles.hallazgoDato}>
                            {h.especie_muestreadas} muestreadas / {h.especie_afectadas} afectadas
                          </p>
                          <p style={styles.hallazgoDato}>
                            Área: {h.area_registrada} ha
                          </p>
                        </div>
                        <div style={styles.hallazgoRight}>
                          <span style={styles.hallazgoPct}>{parseFloat(h.porcentaje_incidencia).toFixed(1)}%</span>
                          <span style={{ ...styles.alertaBadgeSmall, background: al.bg, color: al.color }}>
                            {al.label}
                          </span>
                        </div>
                      </div>
                      {h.informacion_de_produccion && (
                        <p style={styles.hallazgoObs}>{h.informacion_de_produccion}</p>
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
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '28px', paddingBottom: '28px', borderBottom: '1px solid #dde8dd',
  },
  headerSub: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#40916c', marginBottom: '8px', fontWeight: '600' },
  headerTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: '#1a4d2e', fontWeight: 'normal', marginBottom: '6px' },
  headerInfo: { fontSize: '0.88rem', color: '#888', textTransform: 'capitalize' },
  btnFinalizar: {
    background: '#1565c0', color: 'white', border: 'none',
    padding: '12px 24px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.95rem', fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
  },
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
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  formCard: {
    background: 'white', borderRadius: '16px', padding: '32px',
    border: '1px solid #e8efe8', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  formTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#1a4d2e', marginBottom: '24px' },
  campo: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb',
    borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s',
  },
  gridDos: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  incidenciaBox: {
    border: '2px solid', borderRadius: '12px', padding: '16px',
    marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  incidenciaInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
  incidenciaLabel: { fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666', fontWeight: '600' },
  incidenciaValor: { fontSize: '2rem', fontFamily: "'DM Serif Display', serif", lineHeight: 1 },
  alertaBadge: {
    color: 'white', padding: '6px 16px', borderRadius: '20px',
    fontSize: '0.82rem', fontWeight: '700',
  },
  btnGuardar: {
    width: '100%', background: '#1a4d2e', color: 'white', border: 'none',
    padding: '13px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.95rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", marginTop: '8px',
  },
  hallazgosSection: { display: 'flex', flexDirection: 'column', gap: '16px' },
  hallazgosTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#1a4d2e', fontWeight: 'normal' },
  vacio: {
    background: 'white', borderRadius: '16px', padding: '48px',
    textAlign: 'center', border: '1px solid #e8efe8',
  },
  vacioTexto: { fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem', color: '#ccc', marginBottom: '8px' },
  vacioSub: { fontSize: '0.85rem', color: '#ccc' },
  hallazgosList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  hallazgoCard: {
    background: 'white', borderRadius: '12px', padding: '18px 20px',
    border: '1px solid #e8efe8', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  hallazgoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  hallazgoTitulo: { fontSize: '0.95rem', fontWeight: '700', color: '#1a4d2e', marginBottom: '4px' },
  hallazgoDato: { fontSize: '0.82rem', color: '#888' },
  hallazgoRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  hallazgoPct: { fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', color: '#1a4d2e' },
  alertaBadgeSmall: { padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' },
  hallazgoObs: { fontSize: '0.82rem', color: '#888', fontStyle: 'italic', marginTop: '8px' },
}