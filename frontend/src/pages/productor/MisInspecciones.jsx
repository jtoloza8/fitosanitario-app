import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Footer from '../../components/Footer'

// Estado en lenguaje claro para campesinos
const INFO_SOLICITUD = {
  Pendiente: { icono: '⏳', texto: 'Esperando respuesta del ICA', color: '#92400e', bg: '#fef9c3' },
  Aprobada:  { icono: '✅', texto: '¡Aprobada! El ICA confirmó la visita', color: '#166534', bg: '#dcfce7' },
  Rechazada: { icono: '❌', texto: 'No fue aceptada por el ICA', color: '#991b1b', bg: '#fee2e2' },
}

const INFO_VISITA = {
  Pendiente:  { icono: '📅', texto: 'El inspector está por venir', color: '#92400e', bg: '#fef9c3' },
  Finalizada: { icono: '📋', texto: 'Inspección realizada — el ICA la está revisando', color: '#1e40af', bg: '#dbeafe' },
  Aprobada:   { icono: '🏆', texto: '¡Aprobado! Puedes descargar tu certificado', color: '#166534', bg: '#dcfce7' },
  Rechazada:  { icono: '⚠️', texto: 'No aprobada — revisa las observaciones', color: '#991b1b', bg: '#fee2e2' },
}

export default function MisInspecciones() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  const [solicitudes, setSolicitudes] = useState([])
  const [visitas, setVisitas]         = useState([])
  const [lugares, setLugares]         = useState([])
  const [cargando, setCargando]       = useState(true)
  const [tab, setTab]                 = useState('visitas')

  useEffect(() => { cargarTodo() }, [])

  const cargarTodo = async () => {
    setCargando(true)
    try {
      const [rSol, rVisitas, rLugares] = await Promise.all([
        axios.get(`http://localhost:3000/api/solicitudes/productor/${usuario.id_productor}`),
        axios.get('http://localhost:3000/api/visitas'),
        axios.get('http://localhost:3000/api/lugares'),
      ])
      setSolicitudes(rSol.data)
      const misLugares = rLugares.data.filter(l => l.id_productor === usuario.id_productor)
      setLugares(misLugares)
      const ids = new Set(misLugares.map(l => l.id_lugar_produccion))
      setVisitas(rVisitas.data.filter(v => ids.has(v.id_lugar_produccion)))
    } catch { /* silencioso */ }
    finally { setCargando(false) }
  }

  const visAprobadas  = visitas.filter(v => v.estado === 'Aprobada').length
  const visPendientes = visitas.filter(v => v.estado === 'Pendiente' || !v.estado).length
  const solPendientes = solicitudes.filter(s => (s.estado || 'Pendiente') === 'Pendiente').length

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .btn:hover { opacity: 0.85; }
        .card-item { transition: box-shadow 0.15s; }
        .card-item:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.1) !important; }
      `}</style>

      {/* NAVBAR */}
      <nav style={s.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={s.navLogo}>UdiFica</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}>|</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Sistema ICA</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem' }}>Hola, {usuario.nombre_completo?.split(' ')[0]}</span>
          <button style={s.navBtn} onClick={() => navigate('/productor/lotes')}>Mis fincas</button>
          <button style={s.navBtn} onClick={() => navigate('/productor/solicitar')}>+ Pedir visita</button>
          <button style={s.navLogout} onClick={() => { localStorage.clear(); window.location.href = '/' }}>Salir</button>
        </div>
      </nav>

      <div style={s.contenido}>

        {/* ENCABEZADO */}
        <div style={s.header}>
          <div>
            <p style={s.headerSub}>Panel del productor</p>
            <h1 style={s.headerTitulo}>Mis Inspecciones</h1>
          </div>
          <button className="btn" style={s.btnNueva} onClick={() => navigate('/productor/solicitar')}>
            + Pedir nueva visita del ICA
          </button>
        </div>

        {/* RESUMEN RÁPIDO */}
        <div style={s.resumGrid}>
          {[
            { icono: '⏳', num: solPendientes, txt: 'Solicitudes\nen espera',   color: '#92400e', bg: '#fef9c3' },
            { icono: '📅', num: visPendientes, txt: 'Visitas\nprogramadas',    color: '#1e40af', bg: '#dbeafe' },
            { icono: '🏆', num: visAprobadas,  txt: 'Con certificado\ndisponible', color: '#166534', bg: '#dcfce7' },
          ].map((r, i) => (
            <div key={i} style={{ ...s.resumCard, background: r.bg }}>
              <span style={{ fontSize: '2rem' }}>{r.icono}</span>
              <span style={{ ...s.resumNum, color: r.color }}>{r.num}</span>
              <span style={{ ...s.resumTxt, color: r.color }}>{r.txt}</span>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={s.tabs}>
          {[
            { id: 'visitas',    label: `🔬 Visitas (${visitas.length})` },
            { id: 'solicitudes', label: `📨 Solicitudes (${solicitudes.length})` },
          ].map(t => (
            <button key={t.id} className="btn"
              style={{ ...s.tabBtn, background: tab === t.id ? '#1a4d2e' : 'white', color: tab === t.id ? 'white' : '#555', border: tab === t.id ? '2px solid #1a4d2e' : '2px solid #e5e7eb' }}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {cargando && <div style={s.cargando}>Cargando...</div>}

        {/* ── VISITAS ── */}
        {!cargando && tab === 'visitas' && (
          <>
            {visitas.length === 0 ? (
              <Vacio icono="🔬" titulo="Todavía no tienes visitas programadas"
                desc="Cuando el ICA programe una visita a tu finca, aparecerá aquí." />
            ) : (
              <div style={s.lista}>
                {[...visitas]
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  .map((v, i) => {
                    const info = INFO_VISITA[v.estado] || INFO_VISITA.Pendiente
                    return (
                      <div key={i} className="card-item" style={s.card}>
                        {/* Status strip */}
                        <div style={{ ...s.strip, background: info.color }} />
                        <div style={s.cardBody}>
                          {/* Encabezado */}
                          <div style={s.cardHead}>
                            <div>
                              <p style={s.cardTitulo}>{v.nombre_lugar || `Visita #${v.id_visita_inspeccion}`}</p>
                              <p style={s.cardSub}>
                                📍 {v.lugar_municipio || ''}{v.lugar_departamento ? `, ${v.lugar_departamento}` : ''}
                              </p>
                            </div>
                            <span style={{ ...s.badge, background: info.bg, color: info.color }}>
                              {info.icono} {v.estado || 'Pendiente'}
                            </span>
                          </div>

                          {/* Info */}
                          <div style={s.cardInfo}>
                            <div style={s.infoItem}>
                              <span style={s.infoLabel}>📅 Fecha</span>
                              <span style={s.infoVal}>
                                {new Date(String(v.fecha).split('T')[0] + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                            <div style={s.infoItem}>
                              <span style={s.infoLabel}>👨‍🔬 Inspector</span>
                              <span style={s.infoVal}>{v.nombre_inspector || 'Por asignar'}</span>
                            </div>
                            {v.periodo_reportado && (
                              <div style={s.infoItem}>
                                <span style={s.infoLabel}>📆 Periodo</span>
                                <span style={s.infoVal}>{v.periodo_reportado}</span>
                              </div>
                            )}
                          </div>

                          {/* Qué significa el estado */}
                          <div style={{ ...s.statusBox, background: info.bg }}>
                            <span style={{ fontSize: '1.2rem' }}>{info.icono}</span>
                            <p style={{ ...s.statusTxt, color: info.color }}>{info.texto}</p>
                          </div>

                          {/* Observación del admin */}
                          {v.observacion_admin && (
                            <div style={s.obsBox}>
                              <p style={s.obsLabel}>Comentario del ICA:</p>
                              <p style={s.obsTxt}>"{v.observacion_admin}"</p>
                            </div>
                          )}

                          {/* Botón certificado */}
                          {v.estado === 'Aprobada' && (
                            <button className="btn" style={s.btnCert}
                              onClick={() => navigate(`/productor/certificado/${v.id_visita_inspeccion}`)}>
                              📄 Ver y descargar mi certificado
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </>
        )}

        {/* ── SOLICITUDES ── */}
        {!cargando && tab === 'solicitudes' && (
          <>
            {solicitudes.length === 0 ? (
              <Vacio icono="📨" titulo="No has pedido ninguna visita todavía"
                desc="Usa el botón 'Pedir nueva visita del ICA' para comenzar.">
                <button className="btn" style={s.btnNueva} onClick={() => navigate('/productor/solicitar')}>
                  + Pedir mi primera visita
                </button>
              </Vacio>
            ) : (
              <div style={s.lista}>
                {[...solicitudes]
                  .sort((a, b) => new Date(b.fecha_solicitada || 0) - new Date(a.fecha_solicitada || 0))
                  .map((sol, i) => {
                    const info = INFO_SOLICITUD[sol.estado] || INFO_SOLICITUD.Pendiente
                    return (
                      <div key={i} className="card-item" style={s.card}>
                        <div style={{ ...s.strip, background: info.color }} />
                        <div style={s.cardBody}>
                          <div style={s.cardHead}>
                            <div>
                              <p style={s.cardTitulo}>{sol.nombre_lugar || 'Solicitud de inspección'}</p>
                              <p style={s.cardSub}>Lote: {sol.nombre_lote || `#${sol.id_lote}`} — {sol.especie || ''}</p>
                            </div>
                            <span style={{ ...s.badge, background: info.bg, color: info.color }}>
                              {info.icono} {sol.estado || 'Pendiente'}
                            </span>
                          </div>
                          <div style={s.cardInfo}>
                            {sol.fecha_solicitada && (
                              <div style={s.infoItem}>
                                <span style={s.infoLabel}>📅 Fecha pedida</span>
                                <span style={s.infoVal}>
                                  {new Date(String(sol.fecha_solicitada).split('T')[0] + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                              </div>
                            )}
                            {sol.motivo && (
                              <div style={s.infoItem}>
                                <span style={s.infoLabel}>📝 Motivo</span>
                                <span style={s.infoVal}>{sol.motivo}</span>
                              </div>
                            )}
                          </div>
                          <div style={{ ...s.statusBox, background: info.bg }}>
                            <span style={{ fontSize: '1.2rem' }}>{info.icono}</span>
                            <p style={{ ...s.statusTxt, color: info.color }}>{info.texto}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </>
        )}

      </div>
      <Footer />
    </div>
  )
}

function Vacio({ icono, titulo, desc, children }) {
  return (
    <div style={{ background: 'white', borderRadius: '18px', padding: '60px 40px', textAlign: 'center', border: '1px solid #e8efe8' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{icono}</div>
      <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem', color: '#1a4d2e', marginBottom: '8px' }}>{titulo}</p>
      <p style={{ fontSize: '0.88rem', color: '#aaa', marginBottom: children ? '20px' : '0' }}>{desc}</p>
      {children}
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#f0f4f0', fontFamily: "'DM Sans', sans-serif" },
  navbar: { background: '#1a4d2e', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  navLogo: { color: 'white', fontSize: '1.4rem', fontFamily: "'DM Serif Display', serif", letterSpacing: '1px' },
  navBtn: { background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif" },
  navLogout: { background: 'transparent', color: 'rgba(255,255,255,0.6)', border: 'none', padding: '8px 10px', cursor: 'pointer', fontSize: '0.85rem' },
  contenido: { maxWidth: '840px', margin: '0 auto', padding: '40px 24px 60px' },

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' },
  headerSub: { fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#40916c', marginBottom: '4px', fontWeight: '600' },
  headerTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2.2rem', color: '#1a4d2e', fontWeight: 'normal' },
  btnNueva: { background: '#1a4d2e', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },

  resumGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' },
  resumCard: { borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' },
  resumNum: { fontSize: '2.2rem', fontFamily: "'DM Serif Display', serif", lineHeight: 1 },
  resumTxt: { fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'pre-line', lineHeight: 1.4 },

  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tabBtn: { padding: '10px 22px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' },
  cargando: { textAlign: 'center', padding: '60px', color: '#aaa', fontSize: '1rem' },

  lista: { display: 'flex', flexDirection: 'column', gap: '14px' },
  card: { background: 'white', borderRadius: '16px', overflow: 'hidden', display: 'flex', border: '1px solid #e8efe8', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  strip: { width: '6px', flexShrink: 0 },
  cardBody: { flex: 1, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '12px' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
  cardTitulo: { fontSize: '1rem', fontWeight: '700', color: '#1a4d2e', marginBottom: '3px' },
  cardSub: { fontSize: '0.8rem', color: '#888' },
  badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 },
  cardInfo: { display: 'flex', flexDirection: 'column', gap: '8px' },
  infoItem: { display: 'flex', gap: '8px', alignItems: 'flex-start' },
  infoLabel: { fontSize: '0.78rem', color: '#aaa', fontWeight: '600', whiteSpace: 'nowrap', minWidth: '120px' },
  infoVal: { fontSize: '0.88rem', color: '#333', fontWeight: '500', textTransform: 'capitalize' },
  statusBox: { borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' },
  statusTxt: { fontSize: '0.88rem', fontWeight: '600' },
  obsBox: { background: '#f8faf8', borderRadius: '10px', padding: '10px 14px' },
  obsLabel: { fontSize: '0.72rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  obsTxt: { fontSize: '0.88rem', color: '#555', fontStyle: 'italic' },
  btnCert: { background: '#1a4d2e', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif', alignSelf: 'flex-start'" },
}
