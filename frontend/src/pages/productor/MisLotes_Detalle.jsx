import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function MisLotesDetalle() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const lugar = JSON.parse(localStorage.getItem('lugar_activo') || 'null')
  const [lotes, setLotes] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre_lote: '',
    area_ha: '',
    total_plantas_lote: '',
    especie: '',
    id_lugar_produccion: lugar?.id_lugar_produccion || null
  })

  useEffect(() => {
    if (!lugar) {
      navigate('/productor/lotes')
      return
    }
    fetchLotes()
  }, [])

  const fetchLotes = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/lotes/lugar/${lugar.id_lugar_produccion}`)
      setLotes(res.data)
    } catch (err) { console.error(err) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validar que la suma de áreas no supere el total de la finca
    const areaActual = lotes.reduce((sum, l) => sum + parseFloat(l.area_ha), 0)
    const areaNueva = parseFloat(form.area_ha)
    if (areaActual + areaNueva > parseFloat(lugar.area_total_ha)) {
      setError(`La suma de áreas (${areaActual + areaNueva} ha) supera el área total de la finca (${lugar.area_total_ha} ha)`)
      return
    }

    setCargando(true)
    try {
      await axios.post('http://localhost:3000/api/lotes', {
        ...form,
        id_lugar_produccion: lugar.id_lugar_produccion
      })
      setMensaje('Lote creado correctamente')
      setMostrarForm(false)
      setForm({
        nombre_lote: '', area_ha: '', total_plantas_lote: '', especie: '',
        id_lugar_produccion: lugar.id_lugar_produccion
      })
      fetchLotes()
    } catch (err) {
      setError('Error al crear el lote')
    } finally {
      setCargando(false)
    }
  }

  const areaUsada = lotes.reduce((sum, l) => sum + parseFloat(l.area_ha), 0)
  const areaDisponible = lugar ? parseFloat(lugar.area_total_ha) - areaUsada : 0
  const porcentajeUso = lugar ? (areaUsada / parseFloat(lugar.area_total_ha)) * 100 : 0

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus { border-color: #1a4d2e !important; outline: none; }
        .lote-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .btn:hover { opacity: 0.85; }
      `}</style>

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <span style={styles.navLogo}>UdiFica</span>
        <div style={styles.navRight}>
          <span style={styles.navRol}>Hola, {usuario.nombre_completo?.split(' ')[0]}</span>
          <button style={styles.navBack} onClick={() => navigate('/productor/lotes')}>
            ← Mis fincas
          </button>
          <button style={styles.navLogout}
            onClick={() => { localStorage.clear(); window.location.href = '/' }}>
            Salir
          </button>
        </div>
      </nav>

      <div style={styles.contenido}>

        {/* INFO DE LA FINCA */}
        <div style={styles.fincaInfo}>
          <div style={styles.fincaTexto}>
            <p style={styles.fincaSub}>Gestión de lotes</p>
            <h1 style={styles.fincaTitulo}>{lugar?.nombre_lugar}</h1>
            <p style={styles.fincaDato}>{lugar?.municipio}, {lugar?.departamento} — Registro ICA: {lugar?.numero_registroica}</p>
          </div>
          <div style={styles.fincaStats}>
            <div style={styles.statItem}>
              <span style={styles.statNum}>{lugar?.area_total_ha}</span>
              <span style={styles.statLabel}>Hectáreas totales</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={styles.statNum}>{areaUsada.toFixed(1)}</span>
              <span style={styles.statLabel}>Ha asignadas</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={{ ...styles.statNum, color: areaDisponible <= 0 ? '#dc2626' : '#16a34a' }}>
                {areaDisponible.toFixed(1)}
              </span>
              <span style={styles.statLabel}>Ha disponibles</span>
            </div>
          </div>
        </div>

        {/* BARRA DE PROGRESO */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${Math.min(porcentajeUso, 100)}%`,
              background: porcentajeUso >= 100 ? '#dc2626' : porcentajeUso >= 80 ? '#ca8a04' : '#1a4d2e'
            }} />
          </div>
          <span style={styles.progressLabel}>{porcentajeUso.toFixed(1)}% del área asignada</span>
        </div>

        {/* HEADER ACCIONES */}
        <div style={styles.header}>
          <h2 style={styles.seccionTitulo}>Lotes de la finca ({lotes.length})</h2>
          <button className="btn" style={styles.btnNuevo}
            onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? '✕ Cancelar' : '+ Nuevo lote'}
          </button>
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

        {/* FORMULARIO */}
        {mostrarForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitulo}>Registrar nuevo lote</h3>
            <p style={styles.formSub}>Divide tu finca en lotes según el cultivo</p>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.campo}>
                  <label style={styles.label}>¿Cómo se llama este lote?</label>
                  <input style={styles.input} placeholder="Ej: Lote Norte, Sector A"
                    value={form.nombre_lote}
                    onChange={e => setForm({ ...form, nombre_lote: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>¿Qué cultivo tiene?</label>
                  <input style={styles.input} placeholder="Ej: Tomate, Fresa, Mora"
                    value={form.especie}
                    onChange={e => setForm({ ...form, especie: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Área del lote (hectáreas)</label>
                  <input style={styles.input} type="number" step="0.1" min="0.1"
                    placeholder={`Máx: ${areaDisponible.toFixed(1)} ha disponibles`}
                    value={form.area_ha}
                    onChange={e => setForm({ ...form, area_ha: e.target.value })} required />
                  <span style={styles.ayuda}>Tienes {areaDisponible.toFixed(1)} hectáreas disponibles</span>
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>¿Cuántas plantas tiene el lote?</label>
                  <input style={styles.input} type="number" min="1"
                    placeholder="Ej: 500"
                    value={form.total_plantas_lote}
                    onChange={e => setForm({ ...form, total_plantas_lote: e.target.value })} required />
                </div>
              </div>
              <button className="btn" style={{
                ...styles.btnSubmit,
                opacity: cargando ? 0.7 : 1,
                cursor: cargando ? 'not-allowed' : 'pointer'
              }} type="submit" disabled={cargando}>
                {cargando ? 'Guardando...' : '✅ Crear lote'}
              </button>
            </form>
          </div>
        )}

        {/* LISTA DE LOTES */}
        {lotes.length === 0 ? (
          <div style={styles.vacio}>
            <div style={styles.vacioIcono}>🌱</div>
            <h3 style={styles.vacioTitulo}>Esta finca no tiene lotes todavía</h3>
            <p style={styles.vacioSub}>Crea lotes para dividir tu finca por cultivo</p>
          </div>
        ) : (
          <div style={styles.lotesGrid}>
            {lotes.map((l, i) => (
              <div key={i} className="lote-card" style={styles.loteCard}>
                <div style={styles.loteStripe} />
                <div style={styles.loteBody}>
                  <h3 style={styles.loteNombre}>{l.nombre_lote}</h3>
                  <div style={styles.loteCultivo}>
                    🌿 {l.especie}
                  </div>
                  <div style={styles.loteInfo}>
                    <div style={styles.infoFila}>
                      <span style={styles.infoLabel}>Área</span>
                      <span style={styles.infoValor}>{l.area_ha} ha</span>
                    </div>
                    <div style={styles.infoFila}>
                      <span style={styles.infoLabel}>Plantas</span>
                      <span style={styles.infoValor}>{l.total_plantas_lote} plantas</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
  navBack: {
    background: 'rgba(255,255,255,0.12)', color: 'white',
    border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif",
  },
  navLogout: {
    background: 'transparent', color: 'rgba(255,255,255,0.6)',
    border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem',
  },
  contenido: { maxWidth: '1100px', margin: '0 auto', padding: '40px' },
  fincaInfo: {
    background: 'linear-gradient(135deg, #1a4d2e, #2d7a4f)',
    borderRadius: '20px', padding: '32px 40px', marginBottom: '20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white',
  },
  fincaTexto: { flex: 1 },
  fincaSub: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.7, marginBottom: '8px' },
  fincaTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2rem', marginBottom: '8px', fontWeight: 'normal' },
  fincaDato: { fontSize: '0.88rem', opacity: 0.8 },
  fincaStats: {
    display: 'flex', alignItems: 'center', gap: '24px',
    background: 'rgba(255,255,255,0.1)', borderRadius: '16px',
    padding: '20px 28px', backdropFilter: 'blur(10px)',
  },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  statNum: { fontSize: '2rem', fontFamily: "'DM Serif Display', serif", lineHeight: 1 },
  statLabel: { fontSize: '0.72rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' },
  statDivider: { width: '1px', height: '40px', background: 'rgba(255,255,255,0.3)' },
  progressContainer: { marginBottom: '32px' },
  progressBar: {
    background: '#e5e7eb', borderRadius: '10px', height: '10px',
    overflow: 'hidden', marginBottom: '6px',
  },
  progressFill: { height: '100%', borderRadius: '10px', transition: 'width 0.3s' },
  progressLabel: { fontSize: '0.78rem', color: '#888' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '20px',
  },
  seccionTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#1a4d2e', fontWeight: 'normal' },
  btnNuevo: {
    background: '#1a4d2e', color: 'white', border: 'none',
    padding: '12px 24px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.95rem', fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
  },
  error: {
    background: '#fee2e2', color: '#dc2626', padding: '12px 16px',
    borderRadius: '10px', marginBottom: '16px', fontSize: '0.9rem',
    display: 'flex', justifyContent: 'space-between',
  },
  exito: {
    background: '#dcfce7', color: '#16a34a', padding: '12px 16px',
    borderRadius: '10px', marginBottom: '16px', fontSize: '0.9rem',
    display: 'flex', justifyContent: 'space-between',
  },
  formCard: {
    background: 'white', borderRadius: '16px', padding: '32px',
    marginBottom: '24px', border: '1px solid #e8efe8',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  formTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', color: '#1a4d2e', marginBottom: '4px' },
  formSub: { color: '#888', fontSize: '0.88rem', marginBottom: '24px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  campo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.9rem', fontWeight: '600', color: '#333' },
  ayuda: { fontSize: '0.78rem', color: '#40916c', fontStyle: 'italic' },
  input: {
    padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: '10px',
    fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s', width: '100%',
  },
  btnSubmit: {
    marginTop: '20px', background: '#1a4d2e', color: 'white',
    border: 'none', padding: '13px 32px', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
  },
  vacio: {
    textAlign: 'center', padding: '60px', background: 'white',
    borderRadius: '16px', border: '1px solid #e8efe8',
  },
  vacioIcono: { fontSize: '3rem', marginBottom: '12px' },
  vacioTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.4rem', color: '#1a4d2e', marginBottom: '8px', fontWeight: 'normal' },
  vacioSub: { fontSize: '0.88rem', color: '#aaa' },
  lotesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' },
  loteCard: {
    background: 'white', borderRadius: '14px', overflow: 'hidden',
    border: '1px solid #e8efe8', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  loteStripe: { height: '5px', background: '#1a4d2e', width: '100%' },
  loteBody: { padding: '20px' },
  loteNombre: { fontFamily: "'DM Serif Display', serif", fontSize: '1.15rem', color: '#1a4d2e', marginBottom: '6px', fontWeight: 'normal' },
  loteCultivo: { fontSize: '0.9rem', color: '#40916c', fontWeight: '600', marginBottom: '14px' },
  loteInfo: { display: 'flex', flexDirection: 'column', gap: '8px' },
  infoFila: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: '0.8rem', color: '#aaa' },
  infoValor: { fontSize: '0.88rem', color: '#333', fontWeight: '500' },
}