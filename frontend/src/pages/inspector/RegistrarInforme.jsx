import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Footer from '../../components/Footer'

const MEDIDAS = [
  'Control biológico',
  'Control químico',
  'Poda y descarte de material afectado',
  'Monitoreo continuo',
  'Cuarentena fitosanitaria',
  'Aplicación de bioinsumos',
  'Capacitación al productor',
  'Ninguna medida requerida',
]

const CONDICION_COLORS = {
  'Óptima':    '#16a34a',
  'Buena':     '#40916c',
  'Regular':   '#ca8a04',
  'Deficiente':'#ea580c',
  'Crítica':   '#dc2626',
}

const RIESGO_COLORS = {
  'Bajo':     '#16a34a',
  'Moderado': '#ca8a04',
  'Alto':     '#ea580c',
  'Muy Alto': '#dc2626',
}

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
  const [evaluacion, setEvaluacion] = useState({
    condicion_cultivo: '',
    riesgo_fitosanitario: '',
    medidas_recomendadas: [],
    conclusion_inspector: '',
    proxima_visita_sugerida: '',
  })
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    const visitaActiva = JSON.parse(localStorage.getItem('visita_activa') || 'null')
    if (!visitaActiva) { navigate('/inspector/calendario'); return }
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
      setHallazgos(res.data.filter(d => d.id_visita_inspeccion === idVisita))
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

  const nivelAlerta = (pct) => {
    const p = parseFloat(pct)
    if (p >= 50) return { label: 'Alto',  color: '#dc2626', bg: '#fee2e2' }
    if (p >= 20) return { label: 'Medio', color: '#ca8a04', bg: '#fef9c3' }
    return             { label: 'Bajo',  color: '#16a34a', bg: '#dcfce7' }
  }

  const handleGuardar = async () => {
    setError('')
    if (!loteSeleccionado)                              return setError('Selecciona un lote')
    if (!plagaSeleccionada)                             return setError('Selecciona una plaga')
    if (!form.especie_muestreadas || !form.especie_afectadas) return setError('Ingresa los conteos de plantas')

    const muestreadas = parseInt(form.especie_muestreadas)
    const afectadas   = parseInt(form.especie_afectadas)
    if (afectadas > muestreadas) return setError('Las plantas afectadas no pueden superar las muestreadas')
    if (loteActivo && parseFloat(form.area_registrada) > parseFloat(loteActivo.area_ha))
      return setError(`El área no puede superar las ${loteActivo.area_ha} ha del lote`)

    setCargando(true)
    try {
      const porcentaje = (afectadas / muestreadas) * 100
      await axios.post('http://localhost:3000/api/detalles', {
        especie_muestreadas: muestreadas,
        especie_afectadas: afectadas,
        estado_aprobacion: nivelAlerta(porcentaje).label,
        area_registrada: form.area_registrada || 0,
        informacion_de_produccion: form.informacion_de_produccion,
        id_lote: loteSeleccionado,
        id_plaga: plagaSeleccionada,
        id_visita_inspeccion: visita.id_visita_inspeccion,
      })
      setMensaje('Hallazgo guardado correctamente')
      setForm({ especie_muestreadas: '', especie_afectadas: '', area_registrada: '', informacion_de_produccion: '' })
      setLoteSeleccionado(null); setLoteActivo(null); setPlagaSeleccionada(null)
      fetchHallazgos(visita.id_visita_inspeccion)
    } catch {
      setError('Error al guardar el hallazgo')
    } finally {
      setCargando(false)
    }
  }

  const handleFinalizar = async () => {
    setError('')
    if (hallazgos.length === 0)
      return setError('Debes registrar al menos un hallazgo antes de finalizar')
    if (!evaluacion.condicion_cultivo)
      return setError('Selecciona la condición general del cultivo en la Evaluación ICA')
    if (!evaluacion.riesgo_fitosanitario)
      return setError('Selecciona el nivel de riesgo fitosanitario')
    if (!evaluacion.conclusion_inspector.trim())
      return setError('El concepto del inspector es obligatorio para finalizar')

    try {
      await axios.patch(`http://localhost:3000/api/visitas/${visita.id_visita_inspeccion}`, {
        hora_fin: new Date().toTimeString().slice(0, 5),
        condicion_cultivo: evaluacion.condicion_cultivo,
        riesgo_fitosanitario: evaluacion.riesgo_fitosanitario,
        medidas_recomendadas: evaluacion.medidas_recomendadas.join(', '),
        conclusion_inspector: evaluacion.conclusion_inspector,
        proxima_visita_sugerida: evaluacion.proxima_visita_sugerida || null,
      })
      localStorage.removeItem('visita_activa')
      setMensaje('✅ Informe y evaluación ICA enviados al administrador')
      timeoutRef.current = setTimeout(() => navigate('/inspector/calendario'), 2200)
    } catch {
      setError('Error al finalizar el informe')
    }
  }

  const incidencia = calcularIncidencia()
  const alerta = nivelAlerta(incidencia)

  const toggleMedida = (op) => {
    const activas = evaluacion.medidas_recomendadas
    setEvaluacion({
      ...evaluacion,
      medidas_recomendadas: activas.includes(op) ? activas.filter(m => m !== op) : [...activas, op],
    })
  }

  // Paso actual del flujo
  const paso = hallazgos.length === 0 ? 1
    : (!evaluacion.condicion_cultivo || !evaluacion.riesgo_fitosanitario || !evaluacion.conclusion_inspector.trim()) ? 2
    : 3

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        select:focus, input:focus, textarea:focus { border-color: #1a4d2e !important; outline: none; }
        .btn:hover { opacity: 0.85; }
      `}</style>

      {/* NAVBAR */}
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <span style={s.navLogo}>UdiFica</span>
          <span style={s.navSep}>|</span>
          <span style={s.navSub}>Sistema ICA</span>
        </div>
        <div style={s.navRight}>
          <button style={s.navBack} onClick={() => navigate('/inspector/calendario')}>
            ← Volver al calendario
          </button>
          <button style={s.navLogout} onClick={() => { localStorage.clear(); window.location.href = '/' }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div style={s.contenido}>

        {/* HEADER */}
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>Inspector — Registro de Inspección</p>
            <h1 style={s.headerTitulo}>
              {visita?.nombre_lugar || `Visita #${visita?.id_visita_inspeccion}`}
            </h1>
            <p style={s.headerInfo}>
              {visita && new Date(String(visita.fecha).split('T')[0] + 'T12:00:00').toLocaleDateString('es-CO', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
              {visita?.hora_inicio && ` · ${visita.hora_inicio} – ${visita.hora_fin}`}
              {visita?.periodo_reportado && ` · Periodo: ${visita.periodo_reportado}`}
            </p>
          </div>
        </div>

        {/* INDICADOR DE PASOS */}
        <div style={s.pasos}>
          {[
            { n: 1, label: 'Registrar hallazgos', done: hallazgos.length > 0 },
            { n: 2, label: 'Evaluación ICA', done: paso > 2 },
            { n: 3, label: 'Finalizar informe', done: false },
          ].map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                ...s.pasoNum,
                background: p.done ? '#1a4d2e' : paso === p.n ? '#e8f5e9' : '#f5f7f5',
                color: p.done ? 'white' : paso === p.n ? '#1a4d2e' : '#aaa',
                border: paso === p.n ? '2px solid #1a4d2e' : p.done ? 'none' : '2px solid #e5e7eb',
              }}>
                {p.done ? '✓' : p.n}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: paso === p.n ? '700' : '400', color: paso === p.n ? '#1a4d2e' : p.done ? '#40916c' : '#aaa' }}>
                {p.label}
              </span>
              {i < 2 && <span style={{ color: '#ddd', fontSize: '1.2rem', margin: '0 4px' }}>›</span>}
            </div>
          ))}
        </div>

        {error   && <div style={s.msgError}>{error}   <span style={{ cursor: 'pointer' }} onClick={() => setError('')}>✕</span></div>}
        {mensaje && <div style={s.msgExito}>{mensaje} <span style={{ cursor: 'pointer' }} onClick={() => setMensaje('')}>✕</span></div>}

        {/* ─── PASO 1: HALLAZGOS ─── */}
        <div style={s.layout}>

          {/* Formulario de hallazgo */}
          <div style={s.formCard}>
            <h2 style={s.formTitulo}>Registrar Hallazgo</h2>

            <div style={s.campo}>
              <label style={s.label}>Lote a evaluar</label>
              <select style={s.input} value={loteSeleccionado || ''} onChange={handleSeleccionarLote}>
                <option value="">Selecciona un lote...</option>
                {lotes.map(l => (
                  <option key={l.id_lote} value={l.id_lote}>
                    {l.nombre_lote} — {l.especie} ({l.total_plantas_lote} plantas)
                  </option>
                ))}
              </select>
            </div>

            <div style={s.campo}>
              <label style={s.label}>
                Plaga / organismo
                {loteActivo?.especie && (
                  <span style={{ marginLeft: '6px', color: '#40916c', fontStyle: 'normal', textTransform: 'none', letterSpacing: 0 }}>
                    — filtrando por {loteActivo.especie}
                  </span>
                )}
              </label>
              {(() => {
                const esp = (loteActivo?.especie || '').toLowerCase().trim()
                const relacionadas = esp
                  ? plagas.filter(p => {
                      const c = (p.cultivos_afectados || '').toLowerCase()
                      return c.split(',').some(x => { const t = x.trim(); return t && (t.includes(esp) || esp.includes(t)) })
                    })
                  : []
                const otras = plagas.filter(p => !relacionadas.includes(p))
                return (
                  <select style={s.input} value={plagaSeleccionada || ''} onChange={e => setPlagaSeleccionada(parseInt(e.target.value))}>
                    <option value="">Selecciona una plaga...</option>
                    {relacionadas.length > 0 && (
                      <optgroup label={`Comunes en ${loteActivo.especie}`}>
                        {relacionadas.map(p => (
                          <option key={p.id_plaga} value={p.id_plaga}>{p.nombre_plaga} — {p.tipo_plaga}</option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label={relacionadas.length > 0 ? 'Otras plagas' : 'Todas las plagas'}>
                      {otras.map(p => (
                        <option key={p.id_plaga} value={p.id_plaga}>{p.nombre_plaga} — {p.tipo_plaga}</option>
                      ))}
                    </optgroup>
                  </select>
                )
              })()}
            </div>

            <div style={s.gridDos}>
              <div style={s.campo}>
                <label style={s.label}>Plantas muestreadas</label>
                <input style={s.input} type="number" min="0" placeholder="0"
                  value={form.especie_muestreadas}
                  onChange={e => setForm({ ...form, especie_muestreadas: e.target.value })} />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Plantas afectadas</label>
                <input style={s.input} type="number" min="0" placeholder="0"
                  value={form.especie_afectadas}
                  onChange={e => setForm({ ...form, especie_afectadas: e.target.value })} />
              </div>
            </div>

            {/* Cálculo en tiempo real */}
            {form.especie_muestreadas && form.especie_afectadas && (
              <div style={{ ...s.incidenciaBox, background: alerta.bg, borderColor: alerta.color }}>
                <div>
                  <p style={s.incidenciaLbl}>Porcentaje de incidencia</p>
                  <p style={{ ...s.incidenciaVal, color: alerta.color }}>{incidencia}%</p>
                </div>
                <span style={{ ...s.alertaBadge, background: alerta.color }}>Nivel {alerta.label}</span>
              </div>
            )}

            <div style={s.campo}>
              <label style={s.label}>Área registrada (ha)</label>
              <input style={s.input} type="number" step="0.1" min="0.1"
                max={loteActivo?.area_ha || ''}
                placeholder={loteActivo ? `Máx: ${loteActivo.area_ha} ha` : 'Selecciona un lote primero'}
                value={form.area_registrada}
                onChange={e => setForm({ ...form, area_registrada: e.target.value })}
                disabled={!loteActivo} />
              {loteActivo && (
                <span style={s.areaHint}>Este lote tiene {loteActivo.area_ha} hectáreas disponibles</span>
              )}
            </div>

            <div style={s.campo}>
              <label style={s.label}>Observaciones del hallazgo</label>
              <textarea style={{ ...s.input, height: '80px', resize: 'vertical' }}
                placeholder="Notas sobre síntomas, distribución, condiciones del lote..."
                value={form.informacion_de_produccion}
                onChange={e => setForm({ ...form, informacion_de_produccion: e.target.value })} />
            </div>

            <button className="btn" style={{ ...s.btnGuardar, opacity: cargando ? 0.7 : 1, cursor: cargando ? 'not-allowed' : 'pointer' }}
              onClick={handleGuardar} disabled={cargando}>
              {cargando ? 'Guardando...' : '+ Guardar Hallazgo'}
            </button>
          </div>

          {/* Hallazgos registrados */}
          <div style={s.hallazgosSection}>
            <h2 style={s.hallazgosTitulo}>Hallazgos registrados ({hallazgos.length})</h2>

            {hallazgos.length === 0 ? (
              <div style={s.vacio}>
                <p style={s.vacioTexto}>Sin hallazgos aún</p>
                <p style={s.vacioSub}>Registra el primer hallazgo de esta inspección</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {hallazgos.map((h, i) => {
                  const al = nivelAlerta(h.porcentaje_incidencia)
                  const loteNombre = lotes.find(l => l.id_lote === h.id_lote)?.nombre_lote || `Lote #${h.id_lote}`
                  const plagaNombre = plagas.find(p => p.id_plaga === h.id_plaga)?.nombre_plaga || `Plaga #${h.id_plaga}`
                  return (
                    <div key={i} style={s.hallazgoCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div>
                          <p style={s.hallazgoTitulo}>{loteNombre} — {plagaNombre}</p>
                          <p style={s.hallazgoDato}>{h.especie_muestreadas} muestreadas / {h.especie_afectadas} afectadas · {h.area_registrada} ha</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ ...s.hallazgoPct, color: '#1a4d2e' }}>{parseFloat(h.porcentaje_incidencia).toFixed(1)}%</span>
                          <span style={{ ...s.alertaBadgeSmall, background: al.bg, color: al.color }}>{al.label}</span>
                        </div>
                      </div>
                      {h.informacion_de_produccion && (
                        <p style={s.hallazgoObs}>{h.informacion_de_produccion}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Resumen de riesgo general */}
            {hallazgos.length > 0 && (() => {
              const promedio = hallazgos.reduce((acc, h) => acc + parseFloat(h.porcentaje_incidencia), 0) / hallazgos.length
              const al = nivelAlerta(promedio)
              return (
                <div style={{ ...s.resumenCard, background: al.bg, borderColor: al.color }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: '600', color: al.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Incidencia promedio
                    </p>
                    <p style={{ fontSize: '1.8rem', fontFamily: "'DM Serif Display', serif", color: al.color, lineHeight: 1 }}>
                      {promedio.toFixed(1)}%
                    </p>
                  </div>
                  <span style={{ ...s.alertaBadge, background: al.color }}>
                    Riesgo {al.label}
                  </span>
                </div>
              )
            })()}
          </div>
        </div>

        {/* ─── PASO 2: EVALUACIÓN ICA ─── */}
        {hallazgos.length > 0 && (
          <div style={s.evalSection}>
            <div style={s.evalHeader}>
              <div style={s.evalIcono}>📋</div>
              <div>
                <h2 style={s.evalTitulo}>Evaluación Fitosanitaria ICA</h2>
                <p style={s.evalSub}>
                  Completa este formulario oficial antes de finalizar el informe
                </p>
              </div>
            </div>

            <div style={s.evalGrid}>
              {/* Condición del cultivo */}
              <div style={s.evalBloque}>
                <p style={s.evalBloqueLabel}>
                  Condición general del cultivo <span style={{ color: '#dc2626' }}>*</span>
                </p>
                <div style={s.radioGroup}>
                  {Object.keys(CONDICION_COLORS).map(op => {
                    const activo = evaluacion.condicion_cultivo === op
                    const color = CONDICION_COLORS[op]
                    return (
                      <button key={op} className="btn" onClick={() => setEvaluacion({ ...evaluacion, condicion_cultivo: op })}
                        style={{ ...s.radioBtn, background: activo ? color : 'white', color: activo ? 'white' : color, border: `2px solid ${color}` }}>
                        {op}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Riesgo fitosanitario */}
              <div style={s.evalBloque}>
                <p style={s.evalBloqueLabel}>
                  Nivel de riesgo fitosanitario <span style={{ color: '#dc2626' }}>*</span>
                </p>
                <div style={s.radioGroup}>
                  {Object.keys(RIESGO_COLORS).map(op => {
                    const activo = evaluacion.riesgo_fitosanitario === op
                    const color = RIESGO_COLORS[op]
                    return (
                      <button key={op} className="btn" onClick={() => setEvaluacion({ ...evaluacion, riesgo_fitosanitario: op })}
                        style={{ ...s.radioBtn, background: activo ? color : 'white', color: activo ? 'white' : color, border: `2px solid ${color}` }}>
                        {op}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Medidas recomendadas */}
            <div style={s.evalBloque}>
              <p style={s.evalBloqueLabel}>Medidas fitosanitarias recomendadas</p>
              <div style={s.checkGroup}>
                {MEDIDAS.map(op => {
                  const activo = evaluacion.medidas_recomendadas.includes(op)
                  return (
                    <button key={op} className="btn" onClick={() => toggleMedida(op)}
                      style={{
                        ...s.checkBtn,
                        background: activo ? '#e8f5e9' : 'white',
                        color: activo ? '#1a4d2e' : '#555',
                        border: activo ? '2px solid #1a4d2e' : '2px solid #e5e7eb',
                        fontWeight: activo ? '600' : '400',
                      }}>
                      {activo ? '✓ ' : ''}{op}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={s.evalGrid}>
              {/* Concepto del inspector */}
              <div style={s.evalBloque}>
                <p style={s.evalBloqueLabel}>
                  Concepto técnico del inspector <span style={{ color: '#dc2626' }}>*</span>
                </p>
                <textarea
                  style={{ ...s.input, height: '140px', resize: 'vertical' }}
                  placeholder="Escribe el concepto técnico, observaciones generales y recomendaciones para el productor sobre el estado fitosanitario del predio..."
                  value={evaluacion.conclusion_inspector}
                  onChange={e => setEvaluacion({ ...evaluacion, conclusion_inspector: e.target.value })}
                />
                <p style={s.campoHint}>{evaluacion.conclusion_inspector.length} / recomendado mínimo 100 caracteres</p>
              </div>

              {/* Próxima visita */}
              <div style={s.evalBloque}>
                <p style={s.evalBloqueLabel}>Fecha sugerida de próxima visita</p>
                <input type="date" style={s.input}
                  value={evaluacion.proxima_visita_sugerida}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setEvaluacion({ ...evaluacion, proxima_visita_sugerida: e.target.value })}
                />
                <p style={s.campoHint}>Opcional — sugiere cuándo realizar el siguiente seguimiento</p>

                {/* Resumen evaluación */}
                {(evaluacion.condicion_cultivo || evaluacion.riesgo_fitosanitario) && (
                  <div style={s.evalResumen}>
                    <p style={s.evalResumenTitulo}>Resumen de evaluación</p>
                    {evaluacion.condicion_cultivo && (
                      <div style={s.evalResumenFila}>
                        <span style={s.evalResumenLabel}>Condición</span>
                        <span style={{ ...s.evalResumenVal, color: CONDICION_COLORS[evaluacion.condicion_cultivo] }}>
                          {evaluacion.condicion_cultivo}
                        </span>
                      </div>
                    )}
                    {evaluacion.riesgo_fitosanitario && (
                      <div style={s.evalResumenFila}>
                        <span style={s.evalResumenLabel}>Riesgo</span>
                        <span style={{ ...s.evalResumenVal, color: RIESGO_COLORS[evaluacion.riesgo_fitosanitario] }}>
                          {evaluacion.riesgo_fitosanitario}
                        </span>
                      </div>
                    )}
                    {evaluacion.medidas_recomendadas.length > 0 && (
                      <div style={s.evalResumenFila}>
                        <span style={s.evalResumenLabel}>Medidas</span>
                        <span style={s.evalResumenVal}>{evaluacion.medidas_recomendadas.length} seleccionadas</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Botón finalizar */}
            <div style={s.finalizarArea}>
              <div style={s.finalizarInfo}>
                <p style={s.finalizarTxt}>
                  {paso < 3
                    ? '⚠ Completa los campos obligatorios (*) para habilitar el envío'
                    : '✅ Todo listo. El informe se enviará al administrador para revisión.'}
                </p>
              </div>
              <button className="btn" style={{
                ...s.btnFinalizar,
                opacity: paso < 3 ? 0.5 : 1,
                cursor: paso < 3 ? 'not-allowed' : 'pointer',
              }} onClick={handleFinalizar}>
                Finalizar y Enviar Informe →
              </button>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#f5f7f5', fontFamily: "'DM Sans', sans-serif" },

  navbar: { background: '#1a4d2e', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  navLogo: { color: 'white', fontSize: '1.4rem', fontFamily: "'DM Serif Display', serif", letterSpacing: '1px' },
  navSep: { color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' },
  navSub: { color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  navBack: { background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif" },
  navLogout: { background: 'transparent', color: 'rgba(255,255,255,0.6)', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem' },

  contenido: { maxWidth: '1200px', margin: '0 auto', padding: '48px 40px' },
  header: { marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #dde8dd' },
  headerSub: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#40916c', marginBottom: '8px', fontWeight: '600' },
  headerTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: '#1a4d2e', fontWeight: 'normal', marginBottom: '6px' },
  headerInfo: { fontSize: '0.88rem', color: '#888', textTransform: 'capitalize' },

  // Pasos
  pasos: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '28px', background: 'white', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e8efe8', flexWrap: 'wrap' },
  pasoNum: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700' },

  msgError: { background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' },
  msgExito: { background: '#dcfce7', color: '#16a34a', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' },

  // Layout hallazgos
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' },
  formCard: { background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e8efe8', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  formTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#1a4d2e', marginBottom: '24px' },
  campo: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s', background: 'white' },
  gridDos: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  incidenciaBox: { border: '2px solid', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  incidenciaLbl: { fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#666', fontWeight: '600', marginBottom: '2px' },
  incidenciaVal: { fontSize: '1.8rem', fontFamily: "'DM Serif Display', serif", lineHeight: 1 },
  alertaBadge: { color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700' },
  areaHint: { fontSize: '0.75rem', color: '#40916c', marginTop: '4px', display: 'block' },
  btnGuardar: { width: '100%', background: '#1a4d2e', color: 'white', border: 'none', padding: '13px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", marginTop: '8px' },

  // Hallazgos
  hallazgosSection: { display: 'flex', flexDirection: 'column', gap: '14px' },
  hallazgosTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#1a4d2e', fontWeight: 'normal' },
  vacio: { background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid #e8efe8' },
  vacioTexto: { fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: '#ccc', marginBottom: '6px' },
  vacioSub: { fontSize: '0.82rem', color: '#ccc' },
  hallazgoCard: { background: 'white', borderRadius: '12px', padding: '16px 18px', border: '1px solid #e8efe8', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
  hallazgoTitulo: { fontSize: '0.92rem', fontWeight: '700', color: '#1a4d2e', marginBottom: '3px' },
  hallazgoDato: { fontSize: '0.8rem', color: '#888' },
  hallazgoPct: { fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem' },
  alertaBadgeSmall: { padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700' },
  hallazgoObs: { fontSize: '0.8rem', color: '#888', fontStyle: 'italic', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #f5f5f5' },
  resumenCard: { border: '2px solid', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' },

  // Evaluación ICA
  evalSection: { background: 'white', borderRadius: '20px', padding: '36px', border: '2px solid #dde8dd', boxShadow: '0 4px 20px rgba(26,77,46,0.08)' },
  evalHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #e8efe8' },
  evalIcono: { fontSize: '2.4rem', lineHeight: 1 },
  evalTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: '#1a4d2e', fontWeight: 'normal', marginBottom: '4px' },
  evalSub: { fontSize: '0.88rem', color: '#888' },
  evalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
  evalBloque: { marginBottom: '24px' },
  evalBloqueLabel: { fontSize: '0.82rem', fontWeight: '700', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' },
  radioGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  radioBtn: { padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '500', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' },
  checkGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  checkBtn: { padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' },
  campoHint: { fontSize: '0.75rem', color: '#aaa', marginTop: '6px' },
  evalResumen: { background: '#f8faf8', borderRadius: '10px', padding: '14px', marginTop: '16px', border: '1px solid #e8efe8' },
  evalResumenTitulo: { fontSize: '0.75rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' },
  evalResumenFila: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  evalResumenLabel: { fontSize: '0.82rem', color: '#888' },
  evalResumenVal: { fontSize: '0.82rem', fontWeight: '600' },

  // Finalizar
  finalizarArea: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '24px', borderTop: '1px solid #e8efe8', gap: '16px', flexWrap: 'wrap' },
  finalizarInfo: { flex: 1 },
  finalizarTxt: { fontSize: '0.88rem', color: '#888' },
  btnFinalizar: { background: '#1565c0', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
}
