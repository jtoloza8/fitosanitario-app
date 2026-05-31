import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Footer from '../../components/Footer'
import MapaFinca from '../../components/MapaFinca'

const DIAS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const toDateStr = (f) => String(f).split('T')[0]

const ESTADO = {
  Pendiente:  { bg: '#fef9c3', color: '#92400e', dot: '#f59e0b' },
  Finalizada: { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
  Aprobada:   { bg: '#dcfce7', color: '#166534', dot: '#22c55e' },
  Rechazada:  { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
}
const eStyle = (e) => ESTADO[e] || ESTADO.Pendiente

function VisitaCard({ v, navigate }) {
  const [verMapa, setVerMapa] = useState(false)
  const st = eStyle(v.estado || 'Pendiente')
  const pendiente = v.estado === 'Pendiente' || !v.estado
  const tieneMapa = v.latitud && v.longitud

  return (
    <div className="vcard" style={s.card}>
      {/* Cabecera */}
      <div style={s.cardTop}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={s.cardNombre}>{v.nombre_lugar || `Visita #${v.id_visita_inspeccion}`}</p>
          <p style={s.cardFecha}>
            {new Date(toDateStr(v.fecha) + 'T12:00:00').toLocaleDateString('es-CO', {
              weekday: 'short', day: 'numeric', month: 'short'
            })} · {v.hora_inicio} – {v.hora_fin}
          </p>
        </div>
        <span style={{ ...s.pill, background: st.bg, color: st.color }}>{v.estado || 'Pendiente'}</span>
      </div>

      {/* Info secundaria */}
      {v.periodo_reportado && (
        <p style={s.cardPeriodo}>Periodo: {v.periodo_reportado}</p>
      )}
      {v.observacion_admin && (
        <p style={{ ...s.cardPeriodo, color: st.color, fontStyle: 'italic' }}>
          Obs: "{v.observacion_admin}"
        </p>
      )}
      {(v.lugar_municipio || v.lugar_departamento) && (
        <p style={{ ...s.cardPeriodo, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>📍</span>
          <span>{v.lugar_municipio}, {v.lugar_departamento}</span>
        </p>
      )}

      {/* Botones de acción */}
      <div style={s.cardBtns}>
        <button
          className="btn"
          style={{
            ...s.btnUbicacion,
            background: verMapa ? '#e8f5e9' : 'white',
            color: verMapa ? '#1a4d2e' : '#555',
            border: verMapa ? '2px solid #1a4d2e' : '2px solid #e5e7eb',
          }}
          onClick={() => setVerMapa(!verMapa)}
        >
          📍 {verMapa ? 'Ocultar mapa' : 'Ver ubicación'}
        </button>

        {pendiente && (
          <button className="btn" style={s.btnIniciar} onClick={() => {
            localStorage.setItem('visita_activa', JSON.stringify(v))
            navigate('/inspector/informe')
          }}>
            Iniciar inspección →
          </button>
        )}
      </div>

      {/* Mapa desplegable */}
      {verMapa && (
        <div style={{ marginTop: '4px' }}>
          <MapaFinca
            key={v.id_visita_inspeccion}
            latitud={v.latitud}
            longitud={v.longitud}
            nombre={v.nombre_lugar}
            municipio={v.lugar_municipio}
            departamento={v.lugar_departamento}
            altura={200}
          />
        </div>
      )}

      {v.estado === 'Finalizada' && (
        <div style={s.doneBadge}>✓ Enviado al administrador</div>
      )}
    </div>
  )
}

export default function CalendarioVisitas() {
  const navigate = useNavigate()
  const [visitas, setVisitas] = useState([])
  const [mes, setMes] = useState(new Date().getMonth())
  const [anio, setAnio] = useState(new Date().getFullYear())
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [filtro, setFiltro] = useState('Pendiente')

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  useEffect(() => { fetchVisitas() }, [])

  const fetchVisitas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/visitas')
      setVisitas(res.data.filter(v => v.id_inspector === usuario.id_funcionario))
    } catch (err) { console.error(err) }
  }

  // Agrupar por fecha
  const visitasPorDia = {}
  visitas.forEach(v => {
    const k = toDateStr(v.fecha)
    if (!visitasPorDia[k]) visitasPorDia[k] = []
    visitasPorDia[k].push(v)
  })

  // Construir celdas del mes
  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const celdas = [...Array(primerDia).fill(null), ...Array.from({ length: diasEnMes }, (_, i) => i + 1)]

  const hoy = new Date()
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`
  const keyDia = (d) => `${anio}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  // Próxima visita pendiente
  const proximaVisita = [...visitas]
    .filter(v => toDateStr(v.fecha) >= hoyStr && (v.estado === 'Pendiente' || !v.estado))
    .sort((a, b) => toDateStr(a.fecha).localeCompare(toDateStr(b.fecha)))[0]

  const diasParaProxima = proximaVisita
    ? Math.round((new Date(toDateStr(proximaVisita.fecha) + 'T12:00:00') - hoy) / 86400000)
    : null
  const labelDias = (n) => n <= 0 ? 'Hoy' : n === 1 ? 'Mañana' : `En ${n} días`

  // Contenido de la lista derecha
  const listaVisitas = diaSeleccionado
    ? (visitasPorDia[keyDia(diaSeleccionado)] || [])
    : filtro === 'Todas' ? visitas : visitas.filter(v => (v.estado || 'Pendiente') === filtro)

  const listaTitulo = diaSeleccionado
    ? `${diaSeleccionado} de ${MESES[mes]}`
    : filtro === 'Todas' ? 'Todas las visitas'
    : `Visitas ${filtro.toLowerCase()}s`

  const stats = [
    { label: 'Pendientes', valor: visitas.filter(v => (v.estado||'Pendiente')==='Pendiente').length, f: 'Pendiente', c: ESTADO.Pendiente },
    { label: 'Finalizadas', valor: visitas.filter(v => v.estado==='Finalizada').length, f: 'Finalizada', c: ESTADO.Finalizada },
    { label: 'Aprobadas',  valor: visitas.filter(v => v.estado==='Aprobada').length,  f: 'Aprobada',  c: ESTADO.Aprobada },
    { label: 'Rechazadas', valor: visitas.filter(v => v.estado==='Rechazada').length, f: 'Rechazada', c: ESTADO.Rechazada },
    { label: 'Total',      valor: visitas.length, f: 'Todas', c: { bg: '#e8f5e9', color: '#1a4d2e', dot: '#1a4d2e' } },
  ]

  const cambiarMes = (d) => {
    let nm = mes + d, na = anio
    if (nm < 0) { nm = 11; na-- }
    if (nm > 11) { nm = 0; na++ }
    setMes(nm); setAnio(na); setDiaSeleccionado(null)
  }

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .vcard { transition: transform 0.2s, box-shadow 0.2s; }
        .vcard:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important; }
        .stat-btn { transition: all 0.18s; }
        .stat-btn:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.12) !important; }
        .dia-c { transition: all 0.12s; cursor: pointer; }
        .dia-c:hover { filter: brightness(0.9); }
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
          <span style={s.navRol}>Inspector — {usuario.nombre_completo}</span>
          <button style={s.navLogout} onClick={() => { localStorage.clear(); window.location.href = '/' }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div style={s.contenido}>

        {/* HEADER */}
        <div style={s.header}>
          <p style={s.headerSub}>Panel del Inspector</p>
          <h1 style={s.headerTitulo}>Mi Agenda de Visitas</h1>
        </div>

        {/* STATS — FILA COMPLETA, CLICKEABLES */}
        <div style={s.statsRow}>
          {stats.map((st, i) => {
            const sel = filtro === st.f && !diaSeleccionado
            return (
              <div key={i} className="stat-btn"
                onClick={() => { setFiltro(st.f); setDiaSeleccionado(null) }}
                style={{
                  ...s.statCard,
                  background: sel ? st.c.dot || st.c.color : 'white',
                  border: `2px solid ${sel ? (st.c.dot || st.c.color) : '#e8efe8'}`,
                  boxShadow: sel
                    ? `0 4px 18px ${st.c.dot || st.c.color}44`
                    : '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                <div>
                  <p style={{ ...s.statNum, color: sel ? 'white' : (st.c.color) }}>{st.valor}</p>
                  <p style={{ ...s.statLbl, color: sel ? 'rgba(255,255,255,0.85)' : '#999' }}>{st.label}</p>
                </div>
                <span style={{
                  fontSize: '1.4rem', lineHeight: 1,
                  color: sel ? 'white' : (st.c.dot || st.c.color),
                  opacity: sel ? 0.8 : 0.35,
                }}>›</span>
              </div>
            )
          })}
        </div>

        {/* LAYOUT DOS COLUMNAS */}
        <div style={s.twoCol}>

          {/* ── IZQUIERDA: CALENDARIO COMPACTO ── */}
          <div>
            <div style={s.calCard}>
              {/* Navegación mes */}
              <div style={s.calHead}>
                <button className="btn" style={s.navBtn} onClick={() => cambiarMes(-1)}>‹</button>
                <div style={{ textAlign: 'center' }}>
                  <p style={s.calMes}>{MESES[mes]}</p>
                  <p style={s.calAnio}>{anio}</p>
                </div>
                <button className="btn" style={s.navBtn} onClick={() => cambiarMes(1)}>›</button>
              </div>

              {/* Cabecera días */}
              <div style={s.calDiasRow}>
                {DIAS.map(d => <div key={d} style={s.calDH}>{d}</div>)}
              </div>

              {/* Grid de días */}
              <div style={s.calGrid}>
                {celdas.map((dia, idx) => {
                  if (!dia) return <div key={idx} />
                  const k = keyDia(dia)
                  const vsDia = visitasPorDia[k] || []
                  const esHoy = k === hoyStr
                  const sel = diaSeleccionado === dia
                  return (
                    <div key={idx} className="dia-c"
                      onClick={() => setDiaSeleccionado(sel ? null : dia)}
                      style={{
                        ...s.diaCelda,
                        background: sel ? '#1a4d2e' : esHoy ? '#e8f5e9' : 'transparent',
                        border: esHoy && !sel ? '1.5px solid #40916c' : 'none',
                        borderRadius: '9px',
                      }}>
                      <span style={{
                        ...s.diaN,
                        color: sel ? 'white' : esHoy ? '#1a4d2e' : '#444',
                        fontWeight: esHoy ? '700' : '400',
                      }}>{dia}</span>
                      {vsDia.length > 0 && (
                        <div style={s.dots}>
                          {vsDia.slice(0, 3).map((v, i) => {
                            const st = eStyle(v.estado || 'Pendiente')
                            return <div key={i} style={{ ...s.dot, background: sel ? 'rgba(255,255,255,0.75)' : st.dot }} />
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Leyenda */}
              <div style={s.leyenda}>
                {[
                  { dot: '#f59e0b', label: 'Pendiente' },
                  { dot: '#3b82f6', label: 'Finalizada' },
                  { dot: '#22c55e', label: 'Aprobada' },
                  { dot: '#ef4444', label: 'Rechazada' },
                ].map(l => (
                  <div key={l.label} style={s.leyItem}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.dot, flexShrink: 0 }} />
                    <span style={s.leyTxt}>{l.label}</span>
                  </div>
                ))}
              </div>

              {/* Hint */}
              <p style={s.calHint}>Toca un día para ver sus visitas</p>
            </div>
          </div>

          {/* ── DERECHA: BANNER + LISTA ── */}
          <div style={s.rightCol}>

            {/* Banner próxima visita (solo cuando filtro=Pendiente y no hay día seleccionado) */}
            {proximaVisita && !diaSeleccionado && filtro === 'Pendiente' && (
              <div style={s.proximaBanner}>
                <div>
                  <p style={s.proximaLabel}>Próxima inspección</p>
                  <p style={s.proximaTitulo}>{proximaVisita.nombre_lugar}</p>
                  <p style={s.proximaInfo}>
                    {new Date(toDateStr(proximaVisita.fecha) + 'T12:00:00').toLocaleDateString('es-CO', {
                      weekday: 'long', day: 'numeric', month: 'long'
                    })} · {proximaVisita.hora_inicio} – {proximaVisita.hora_fin}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                  <span style={s.diasPill}>{labelDias(diasParaProxima)}</span>
                  <button className="btn" style={s.btnIrA}
                    onClick={() => {
                      localStorage.setItem('visita_activa', JSON.stringify(proximaVisita))
                      navigate('/inspector/informe')
                    }}>
                    Ir a inspección →
                  </button>
                </div>
              </div>
            )}

            {/* Encabezado de la lista */}
            <div style={s.listaHead}>
              <h2 style={s.listaTitulo}>{listaTitulo}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {diaSeleccionado && (
                  <button className="btn" style={s.btnLimpiar} onClick={() => setDiaSeleccionado(null)}>
                    × Limpiar día
                  </button>
                )}
                <span style={s.listaCount}>
                  {listaVisitas.length} visita{listaVisitas.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Visitas */}
            {listaVisitas.length === 0 ? (
              <div style={s.vacio}>
                <p style={s.vacioTxt}>
                  {diaSeleccionado
                    ? `Sin visitas el ${diaSeleccionado} de ${MESES[mes]}`
                    : filtro === 'Todas'
                    ? 'No tienes visitas asignadas'
                    : `Sin visitas ${filtro.toLowerCase()}s`}
                </p>
                {!diaSeleccionado && filtro !== 'Todas' && (
                  <p style={s.vacioSub}>El administrador te asignará visitas próximamente</p>
                )}
              </div>
            ) : (
              <div style={s.lista}>
                {listaVisitas.map((v, i) => <VisitaCard key={i} v={v} navigate={navigate} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#f5f7f5', fontFamily: "'DM Sans', sans-serif" },

  // Navbar
  navbar: { background: '#1a4d2e', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  navLogo: { color: 'white', fontSize: '1.4rem', fontFamily: "'DM Serif Display', serif", letterSpacing: '1px' },
  navSep: { color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' },
  navSub: { color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  navRol: { color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' },
  navLogout: { background: 'transparent', color: 'rgba(255,255,255,0.6)', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem' },

  contenido: { maxWidth: '1200px', margin: '0 auto', padding: '40px 40px 60px' },

  header: { marginBottom: '28px' },
  headerSub: { fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#40916c', marginBottom: '6px', fontWeight: '600' },
  headerTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2.2rem', color: '#1a4d2e', fontWeight: 'normal' },

  // Stats row - clickeables
  statsRow: { display: 'flex', gap: '10px', marginBottom: '28px' },
  statCard: {
    flex: 1, padding: '16px 18px', borderRadius: '14px', cursor: 'pointer',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    transition: 'all 0.18s',
  },
  statNum: { fontSize: '1.9rem', fontFamily: "'DM Serif Display', serif", lineHeight: 1, marginBottom: '3px' },
  statLbl: { fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' },

  // Dos columnas
  twoCol: { display: 'grid', gridTemplateColumns: '310px 1fr', gap: '24px', alignItems: 'start' },

  // Calendario compacto
  calCard: { background: 'white', borderRadius: '18px', padding: '18px', border: '1px solid #e8efe8', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  calHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  calMes: { fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: '#1a4d2e', lineHeight: 1 },
  calAnio: { fontSize: '0.75rem', color: '#bbb', textAlign: 'center', marginTop: '2px' },
  navBtn: {
    background: '#f5f7f5', border: '1px solid #e8efe8',
    width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '1.1rem', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif", lineHeight: 1,
  },
  calDiasRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' },
  calDH: { textAlign: 'center', fontSize: '0.68rem', fontWeight: '700', color: '#c0c0c0', padding: '3px 0', textTransform: 'uppercase' },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' },
  diaCelda: { height: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' },
  diaN: { fontSize: '0.8rem', lineHeight: 1 },
  dots: { display: 'flex', gap: '2px', alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: '50%', flexShrink: 0 },
  leyenda: { display: 'flex', flexWrap: 'wrap', gap: '6px 10px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' },
  leyItem: { display: 'flex', alignItems: 'center', gap: '4px' },
  leyTxt: { fontSize: '0.68rem', color: '#aaa' },
  calHint: { fontSize: '0.68rem', color: '#ccc', textAlign: 'center', marginTop: '8px' },

  // Columna derecha
  rightCol: { display: 'flex', flexDirection: 'column', gap: '16px' },

  proximaBanner: {
    background: 'linear-gradient(135deg, #1a4d2e 0%, #2d7a4f 100%)',
    borderRadius: '14px', padding: '18px 22px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
    boxShadow: '0 4px 16px rgba(26,77,46,0.2)',
  },
  proximaLabel: { fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.5)', marginBottom: '3px', fontWeight: '600' },
  proximaTitulo: { color: 'white', fontSize: '1rem', fontFamily: "'DM Serif Display', serif", marginBottom: '3px' },
  proximaInfo: { color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', textTransform: 'capitalize' },
  diasPill: { background: 'rgba(255,255,255,0.18)', color: 'white', padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600' },
  btnIrA: { background: 'white', color: '#1a4d2e', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },

  listaHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' },
  listaTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem', color: '#1a4d2e', fontWeight: 'normal' },
  btnLimpiar: { background: '#f5f5f5', border: '1px solid #e0e0e0', color: '#666', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: "'DM Sans', sans-serif" },
  listaCount: { fontSize: '0.78rem', color: '#bbb', whiteSpace: 'nowrap' },

  lista: { display: 'flex', flexDirection: 'column', gap: '10px' },
  vacio: { background: 'white', borderRadius: '14px', padding: '48px', textAlign: 'center', border: '1px solid #e8efe8' },
  vacioTxt: { fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: '#ccc', marginBottom: '6px' },
  vacioSub: { fontSize: '0.82rem', color: '#ddd' },

  // Tarjeta de visita
  card: { background: 'white', borderRadius: '14px', padding: '16px 18px', border: '1px solid #e8efe8', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '9px' },
  cardTop: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
  cardNombre: { fontSize: '0.92rem', fontWeight: '700', color: '#1a4d2e', marginBottom: '2px' },
  cardFecha: { fontSize: '0.78rem', color: '#888', textTransform: 'capitalize' },
  pill: { padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 },
  cardPeriodo: { fontSize: '0.76rem', color: '#aaa' },
  cardBtns: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  btnUbicacion: { padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s', flexShrink: 0 },
  btnIniciar: { background: '#1a4d2e', color: 'white', border: 'none', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", flex: 1 },
  doneBadge: { background: '#dbeafe', color: '#1e40af', borderRadius: '8px', padding: '7px 12px', fontSize: '0.78rem', fontWeight: '600', textAlign: 'center' },
}
