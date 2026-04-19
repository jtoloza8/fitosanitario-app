import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function AsignarInspector() {
  const navigate = useNavigate()
  const [lugares, setLugares] = useState([])
  const [inspectores, setInspectores] = useState([])
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    id_inspector: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    periodo_reportado: '',
  })

  useEffect(() => {
    fetchLugares()
    fetchInspectores()
  }, [])

  const fetchLugares = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/lugares')
      setLugares(res.data.filter(l => l.estado === 'Aprobado'))
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
    if (!lugarSeleccionado) return setError('Selecciona un lugar de producción')
    if (!form.id_inspector) return setError('Selecciona un inspector')
    if (!form.fecha) return setError('Selecciona una fecha')

    try {
      await axios.post('http://localhost:3000/api/visitas', {
        fecha: form.fecha,
        hora_inicio: form.hora_inicio || '08:00',
        hora_fin: form.hora_fin || '12:00',
        periodo_reportado: form.periodo_reportado || `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${new Date().getFullYear()}`,
        id_inspector: parseInt(form.id_inspector),
        id_lugar_produccion: lugarSeleccionado.id_lugar_produccion,
      })
      setMensaje(`Visita asignada correctamente a ${lugarSeleccionado.nombre_lugar}`)
      setLugarSeleccionado(null)
      setForm({ id_inspector: '', fecha: '', hora_inicio: '', hora_fin: '', periodo_reportado: '' })
    } catch (err) {
      setError('Error al asignar la visita')
    }
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .lugar-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        select:focus, input:focus { border-color: #1a4d2e !important; outline: none; }
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
            <h1 style={styles.headerTitulo}>Asignar Inspecciones</h1>
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

          {/* LISTA DE LUGARES APROBADOS */}
          <div>
            <h2 style={styles.seccionTitulo}>Lugares aprobados</h2>
            <p style={styles.seccionSub}>Selecciona un lugar para asignarle una inspección</p>

            {lugares.length === 0 ? (
              <div style={styles.vacio}>
                No hay lugares aprobados aún
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
                  }} onClick={() => setLugarSeleccionado(l)}>
                    <h3 style={styles.lugarNombre}>{l.nombre_lugar}</h3>
                    <p style={styles.lugarDato}>{l.municipio}, {l.departamento}</p>
                    <p style={styles.lugarDato}>Registro ICA: {l.numero_registroica}</p>
                    <p style={styles.lugarDato}>Área: {l.area_total_m2} m²</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FORMULARIO DE ASIGNACIÓN */}
          <div>
            <h2 style={styles.seccionTitulo}>Programar visita</h2>
            <p style={styles.seccionSub}>
              {lugarSeleccionado
                ? `Asignando inspección para: ${lugarSeleccionado.nombre_lugar}`
                : 'Selecciona un lugar primero'}
            </p>

            <div style={styles.formCard}>
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

                <button className="btn" style={{
                  ...styles.btnAsignar,
                  opacity: !lugarSeleccionado ? 0.5 : 1,
                  cursor: !lugarSeleccionado ? 'not-allowed' : 'pointer',
                }} type="submit" disabled={!lugarSeleccionado}>
                  Asignar Inspección
                </button>
              </form>
            </div>
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
  seccionSub: { fontSize: '0.85rem', color: '#888', marginBottom: '16px' },
  vacio: {
    textAlign: 'center', padding: '48px', background: 'white',
    borderRadius: '12px', border: '1px solid #e8efe8', color: '#aaa',
  },
  lugaresList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  lugarCard: {
    background: 'white', borderRadius: '12px', padding: '18px 20px',
    cursor: 'pointer', border: '1px solid #e8efe8', transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  lugarNombre: { fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: '#1a4d2e', marginBottom: '6px' },
  lugarDato: { fontSize: '0.82rem', color: '#888', marginTop: '2px' },
  formCard: {
    background: 'white', borderRadius: '16px', padding: '28px',
    border: '1px solid #e8efe8', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  campo: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb',
    borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s',
  },
  gridDos: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  btnAsignar: {
    width: '100%', background: '#1a4d2e', color: 'white', border: 'none',
    padding: '13px', borderRadius: '10px', fontSize: '0.95rem',
    fontWeight: '700', fontFamily: "'DM Sans', sans-serif", marginTop: '8px',
  },
}