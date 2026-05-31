import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Footer from '../../components/Footer'
import MapaFinca from '../../components/MapaFinca'

export default function SolicitarInspeccion() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  const [lugares, setLugares]               = useState([])
  const [lotes, setLotes]                   = useState([])
  const [lugarSeleccionado, setLugarSel]    = useState(null)
  const [mensaje, setMensaje]               = useState('')
  const [error, setError]                   = useState('')
  const [cargando, setCargando]             = useState(false)
  const [form, setForm] = useState({ id_lote: '', fecha_solicitada: '', motivo: '' })

  useEffect(() => { fetchLugares() }, [])

  const fetchLugares = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/lugares')
      setLugares(res.data.filter(l => l.id_productor === usuario.id_productor && l.estado === 'Aprobado'))
    } catch {}
  }

  const seleccionarLugar = async (l) => {
    setLugarSel(l)
    setForm({ id_lote: '', fecha_solicitada: '', motivo: '' })
    try {
      const res = await axios.get(`http://localhost:3000/api/lotes/lugar/${l.id_lugar_produccion}`)
      setLotes(res.data)
    } catch { setLotes([]) }
  }

  const handleEnviar = async () => {
    setError('')
    if (!lugarSeleccionado) return setError('Elige tu finca primero')
    if (!form.id_lote)      return setError('Elige qué lote quieres revisar')
    if (!form.fecha_solicitada) return setError('Elige una fecha para la visita')

    setCargando(true)
    try {
      await axios.post('http://localhost:3000/api/solicitudes', {
        id_lugar_produccion: lugarSeleccionado.id_lugar_produccion,
        id_lote: parseInt(form.id_lote),
        id_productor: usuario.id_productor,
        fecha_solicitada: form.fecha_solicitada,
        motivo: form.motivo,
      })
      setMensaje('ok')
    } catch {
      setError('Hubo un problema al enviar. Inténtalo de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  // ── PANTALLA DE ÉXITO ──────────────────────────────────────────
  if (mensaje === 'ok') {
    return (
      <div style={s.page}>
        <style>{css}</style>
        <nav style={s.navbar}><NavContent navigate={navigate} usuario={usuario} /></nav>
        <div style={s.exitoPage}>
          <div style={s.exitoCard}>
            <div style={s.exitoIcono}>✅</div>
            <h1 style={s.exitoTitulo}>¡Solicitud enviada!</h1>
            <p style={s.exitoDesc}>
              Le avisamos al ICA que quieres una visita en
              <strong> {lugarSeleccionado?.nombre_lugar}</strong>.
              <br />Ellos te confirmarán la fecha pronto.
            </p>
            <button className="btn" style={s.btnExito}
              onClick={() => navigate('/productor/inspecciones')}>
              Ver mis inspecciones →
            </button>
            <button className="btn" style={s.btnExitoSecundario}
              onClick={() => { setMensaje(''); setLugarSel(null); setForm({ id_lote: '', fecha_solicitada: '', motivo: '' }) }}>
              Pedir otra visita
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // ── FORMULARIO ─────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <style>{css}</style>

      <nav style={s.navbar}><NavContent navigate={navigate} usuario={usuario} /></nav>

      <div style={s.contenido}>

        {/* ENCABEZADO */}
        <div style={s.header}>
          <div style={s.headerIcono}>🌿</div>
          <div>
            <h1 style={s.headerTitulo}>Pedir visita del ICA</h1>
            <p style={s.headerDesc}>
              Un inspector del ICA vendrá a revisar tu finca y te dará un certificado.
              Solo sigue los 3 pasos de abajo.
            </p>
          </div>
          <button className="btn" style={s.btnVerHistorial}
            onClick={() => navigate('/productor/inspecciones')}>
            📋 Ver mis inspecciones
          </button>
        </div>

        {error && (
          <div style={s.msgError}>{error}
            <span style={{ cursor: 'pointer', marginLeft: '12px' }} onClick={() => setError('')}>✕</span>
          </div>
        )}

        {/* ── PASO 1 ── */}
        <div style={s.paso}>
          <div style={s.pasoHeader}>
            <div style={{ ...s.pasoNum, background: lugarSeleccionado ? '#1a4d2e' : '#f5f7f5', color: lugarSeleccionado ? 'white' : '#1a4d2e' }}>
              {lugarSeleccionado ? '✓' : '1'}
            </div>
            <div>
              <p style={s.pasoTitulo}>¿A cuál finca viene el ICA?</p>
              <p style={s.pasoDes}>Toca la finca que quieres inspeccionar</p>
            </div>
          </div>

          {lugares.length === 0 ? (
            <div style={s.sinFincas}>
              <p style={s.sinFincasTxt}>No tienes fincas aprobadas todavía.</p>
              <button className="btn" style={s.btnIrFincas} onClick={() => navigate('/productor/lotes')}>
                Ver mis fincas →
              </button>
            </div>
          ) : (
            <div style={s.fincasGrid}>
              {lugares.map(l => {
                const sel = lugarSeleccionado?.id_lugar_produccion === l.id_lugar_produccion
                return (
                  <div key={l.id_lugar_produccion} className="fcard"
                    style={{ ...s.fincaCard, background: sel ? '#e8f5e9' : 'white', border: sel ? '3px solid #1a4d2e' : '2px solid #e8efe8' }}
                    onClick={() => seleccionarLugar(l)}>
                    <div style={s.fincaCardTop}>
                      <span style={{ fontSize: '1.8rem' }}>🏡</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ ...s.fincaNombre, color: sel ? '#1a4d2e' : '#333' }}>{l.nombre_lugar}</p>
                        <p style={s.fincaDato}>📍 {l.municipio}, {l.departamento}</p>
                        <p style={s.fincaDato}>🌿 {l.area_total_ha} hectáreas</p>
                      </div>
                      {sel && <span style={s.checkSel}>✓</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Mini mapa cuando hay finca seleccionada */}
          {lugarSeleccionado && (
            <div style={{ marginTop: '14px' }}>
              <MapaFinca
                key={lugarSeleccionado.id_lugar_produccion}
                latitud={lugarSeleccionado.latitud}
                longitud={lugarSeleccionado.longitud}
                nombre={lugarSeleccionado.nombre_lugar}
                municipio={lugarSeleccionado.municipio}
                departamento={lugarSeleccionado.departamento}
                altura={180}
              />
            </div>
          )}
        </div>

        {/* ── PASO 2 ── */}
        {lugarSeleccionado && (
          <div style={s.paso}>
            <div style={s.pasoHeader}>
              <div style={{ ...s.pasoNum, background: form.id_lote ? '#1a4d2e' : '#f5f7f5', color: form.id_lote ? 'white' : '#1a4d2e' }}>
                {form.id_lote ? '✓' : '2'}
              </div>
              <div>
                <p style={s.pasoTitulo}>¿Qué lote quieres revisar?</p>
                <p style={s.pasoDes}>Elige el pedazo de la finca que el inspector va a revisar</p>
              </div>
            </div>

            {lotes.length === 0 ? (
              <div style={s.sinFincas}>
                <p style={s.sinFincasTxt}>Esta finca no tiene lotes registrados.</p>
                <button className="btn" style={s.btnIrFincas}
                  onClick={() => navigate(`/productor/lotes/${lugarSeleccionado.id_lugar_produccion}`)}>
                  Crear lotes →
                </button>
              </div>
            ) : (
              <div style={s.lotesGrid}>
                {lotes.map(l => {
                  const sel = form.id_lote === String(l.id_lote)
                  return (
                    <div key={l.id_lote} className="fcard"
                      style={{ ...s.loteCard, background: sel ? '#e8f5e9' : 'white', border: sel ? '3px solid #1a4d2e' : '2px solid #e8efe8' }}
                      onClick={() => setForm({ ...form, id_lote: String(l.id_lote) })}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ ...s.fincaNombre, color: sel ? '#1a4d2e' : '#333' }}>{l.nombre_lote}</p>
                          <p style={s.fincaDato}>🌱 {l.especie} · {l.total_plantas_lote} plantas · {l.area_ha} ha</p>
                        </div>
                        {sel && <span style={s.checkSel}>✓</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PASO 3 ── */}
        {lugarSeleccionado && form.id_lote && (
          <div style={s.paso}>
            <div style={s.pasoHeader}>
              <div style={{ ...s.pasoNum, background: form.fecha_solicitada ? '#1a4d2e' : '#f5f7f5', color: form.fecha_solicitada ? 'white' : '#1a4d2e' }}>
                {form.fecha_solicitada ? '✓' : '3'}
              </div>
              <div>
                <p style={s.pasoTitulo}>¿Para cuándo la visita?</p>
                <p style={s.pasoDes}>Pon la fecha en que te queda bien que venga el inspector</p>
              </div>
            </div>

            <div style={s.paso3Grid}>
              <div style={s.campo}>
                <label style={s.label}>📅 Fecha de la visita</label>
                <input style={s.input} type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={form.fecha_solicitada}
                  onChange={e => setForm({ ...form, fecha_solicitada: e.target.value })}
                />
              </div>
              <div style={s.campo}>
                <label style={s.label}>📝 ¿Por qué necesitas la visita? <span style={{ color: '#aaa', fontWeight: '400' }}>(opcional)</span></label>
                <textarea style={{ ...s.input, height: '88px', resize: 'vertical' }}
                  placeholder="Ejemplo: Renovación anual, vi unas plagas nuevas, quiero el certificado..."
                  value={form.motivo}
                  onChange={e => setForm({ ...form, motivo: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* BOTÓN ENVIAR */}
        {lugarSeleccionado && form.id_lote && form.fecha_solicitada && (
          <button className="btn" style={{
            ...s.btnEnviar,
            opacity: cargando ? 0.7 : 1,
            cursor: cargando ? 'not-allowed' : 'pointer',
          }} onClick={handleEnviar} disabled={cargando}>
            {cargando ? '⏳ Enviando...' : '✅ Pedir la visita del ICA'}
          </button>
        )}

      </div>
      <Footer />
    </div>
  )
}

function NavContent({ navigate, usuario }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: 'white', fontSize: '1.4rem', fontFamily: "'DM Serif Display', serif", letterSpacing: '1px' }}>UdiFica</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}>|</span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Sistema ICA</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Hola, {usuario.nombre_completo?.split(' ')[0]}</span>
        <button style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif" }}
          onClick={() => navigate('/productor/lotes')}>Mis fincas</button>
        <button style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem' }}
          onClick={() => { localStorage.clear(); window.location.href = '/' }}>Salir</button>
      </div>
    </>
  )
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  input:focus, select:focus, textarea:focus { border-color: #1a4d2e !important; outline: none; }
  .btn:hover { opacity: 0.85; }
  .fcard { transition: all 0.15s; cursor: pointer; }
  .fcard:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1) !important; }
`

const s = {
  page: { minHeight: '100vh', background: '#f0f4f0', fontFamily: "'DM Sans', sans-serif" },
  navbar: { background: '#1a4d2e', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  contenido: { maxWidth: '760px', margin: '0 auto', padding: '40px 24px 60px' },

  header: { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '32px', background: 'white', borderRadius: '18px', padding: '24px', border: '1px solid #e8efe8', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  headerIcono: { fontSize: '2.5rem', lineHeight: 1, flexShrink: 0 },
  headerTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: '#1a4d2e', fontWeight: 'normal', marginBottom: '6px' },
  headerDesc: { fontSize: '0.88rem', color: '#666', lineHeight: 1.6 },
  btnVerHistorial: { background: '#e8f5e9', color: '#1a4d2e', border: '2px solid #c8e6c9', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', flexShrink: 0 },

  msgError: { background: '#fee2e2', color: '#dc2626', padding: '14px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },

  paso: { background: 'white', borderRadius: '18px', padding: '24px', marginBottom: '16px', border: '1px solid #e8efe8', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  pasoHeader: { display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '18px' },
  pasoNum: { width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #1a4d2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '700', flexShrink: 0, transition: 'all 0.2s' },
  pasoTitulo: { fontSize: '1.05rem', fontWeight: '700', color: '#1a4d2e', marginBottom: '2px' },
  pasoDes: { fontSize: '0.82rem', color: '#888' },

  sinFincas: { background: '#f8faf8', borderRadius: '12px', padding: '20px', textAlign: 'center' },
  sinFincasTxt: { fontSize: '0.9rem', color: '#888', marginBottom: '12px' },
  btnIrFincas: { background: '#1a4d2e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600', fontFamily: "'DM Sans', sans-serif" },

  fincasGrid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  fincaCard: { borderRadius: '14px', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', transition: 'all 0.15s' },
  fincaCardTop: { display: 'flex', alignItems: 'center', gap: '14px' },
  fincaNombre: { fontSize: '1rem', fontWeight: '700', marginBottom: '3px' },
  fincaDato: { fontSize: '0.8rem', color: '#888', marginTop: '1px' },
  checkSel: { background: '#1a4d2e', color: 'white', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', flexShrink: 0 },

  lotesGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  loteCard: { borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s' },

  paso3Grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  campo: { marginBottom: '0' },
  label: { display: 'block', marginBottom: '7px', fontSize: '0.88rem', fontWeight: '600', color: '#444' },
  input: { width: '100%', padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", background: 'white' },

  btnEnviar: { width: '100%', background: '#1a4d2e', color: 'white', border: 'none', padding: '18px', borderRadius: '14px', fontSize: '1.1rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", marginTop: '8px', boxShadow: '0 4px 16px rgba(26,77,46,0.3)' },

  // Éxito
  exitoPage: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 24px' },
  exitoCard: { background: 'white', borderRadius: '24px', padding: '48px 40px', textAlign: 'center', maxWidth: '480px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' },
  exitoIcono: { fontSize: '4rem', marginBottom: '16px' },
  exitoTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: '#1a4d2e', marginBottom: '14px' },
  exitoDesc: { fontSize: '1rem', color: '#666', lineHeight: 1.7, marginBottom: '28px' },
  btnExito: { display: 'block', width: '100%', background: '#1a4d2e', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", marginBottom: '10px', cursor: 'pointer' },
  btnExitoSecundario: { display: 'block', width: '100%', background: 'white', color: '#1a4d2e', border: '2px solid #1a4d2e', padding: '12px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' },
}
