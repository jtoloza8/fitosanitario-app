import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function CrearInspector() {
  const navigate = useNavigate()
  const [inspectores, setInspectores] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre_completo: '',
    cedula: '',
    correo: '',
    password: '',
    telefono: '',
    tarjeta_profesional: '',
    rol_funcionario: 'Inspector',
  })

  useEffect(() => { fetchInspectores() }, [])

  const fetchInspectores = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/funcionarios')
      setInspectores(res.data.filter(f => f.rol_funcionario === 'Inspector'))
    } catch (err) { console.error(err) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      await axios.post('http://localhost:3000/api/auth/registro', form)
      setMensaje(`Inspector ${form.nombre_completo} creado correctamente`)
      setMostrarForm(false)
      setForm({
        nombre_completo: '', cedula: '', correo: '', password: '',
        telefono: '', tarjeta_profesional: '', rol_funcionario: 'Inspector',
      })
      fetchInspectores()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el inspector')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus { border-color: #1a4d2e !important; outline: none; }
        .btn:hover { opacity: 0.85; }
        .fila:hover { background: #f9fafb !important; }
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
            <h1 style={styles.headerTitulo}>Gestión de Inspectores</h1>
          </div>
          <button className="btn" style={styles.btnNuevo}
            onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Nuevo Inspector'}
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
            <h2 style={styles.formTitulo}>Registrar nuevo inspector</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.campo}>
                  <label style={styles.label}>Nombre completo</label>
                  <input style={styles.input} placeholder="Nombre completo"
                    value={form.nombre_completo}
                    onChange={e => setForm({ ...form, nombre_completo: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Cédula</label>
                  <input style={styles.input} placeholder="Número de cédula"
                    value={form.cedula}
                    onChange={e => setForm({ ...form, cedula: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Correo electrónico</label>
                  <input style={styles.input} type="email" placeholder="correo@ica.gov.co"
                    value={form.correo}
                    onChange={e => setForm({ ...form, correo: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Contraseña temporal</label>
                  <input style={styles.input} type="password" placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Teléfono</label>
                  <input style={styles.input} placeholder="3001234567"
                    value={form.telefono}
                    onChange={e => setForm({ ...form, telefono: e.target.value })} />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Tarjeta profesional</label>
                  <input style={styles.input} placeholder="Número de tarjeta"
                    value={form.tarjeta_profesional}
                    onChange={e => setForm({ ...form, tarjeta_profesional: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Rol</label>
                  <select style={styles.input} value={form.rol_funcionario}
                    onChange={e => setForm({ ...form, rol_funcionario: e.target.value })}>
                    <option value="Inspector">Inspector</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
              </div>

              <button className="btn" style={{
                ...styles.btnSubmit,
                opacity: cargando ? 0.7 : 1,
                cursor: cargando ? 'not-allowed' : 'pointer'
              }} type="submit" disabled={cargando}>
                {cargando ? 'Creando...' : 'Crear Inspector'}
              </button>
            </form>
          </div>
        )}

        {/* TABLA DE INSPECTORES */}
        <div style={styles.tabla}>
          <div style={styles.tablaHeader}>
            <span style={styles.tablaCol}>Nombre</span>
            <span style={styles.tablaCol}>Cédula</span>
            <span style={styles.tablaCol}>Correo</span>
            <span style={styles.tablaCol}>Tarjeta</span>
            <span style={styles.tablaCol}>Teléfono</span>
            <span style={styles.tablaCol}>Rol</span>
          </div>

          {inspectores.length === 0 ? (
            <div style={styles.vacio}>No hay inspectores registrados</div>
          ) : (
            inspectores.map((i, idx) => (
              <div key={idx} className="fila" style={styles.tablaFila}>
                <span style={styles.tablaCell}>
                  <b style={{ color: '#1a4d2e' }}>{i.nombre_completo}</b>
                </span>
                <span style={styles.tablaCell}>{i.cedula}</span>
                <span style={styles.tablaCell}>{i.correo}</span>
                <span style={styles.tablaCell}>{i.tarjeta_profesional}</span>
                <span style={styles.tablaCell}>{i.telefono || '—'}</span>
                <span style={styles.tablaCell}>
                  <span style={{
                    background: i.rol_funcionario === 'Administrador' ? '#e3f2fd' : '#e8f5e9',
                    color: i.rol_funcionario === 'Administrador' ? '#1565c0' : '#1a4d2e',
                    padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600'
                  }}>
                    {i.rol_funcionario}
                  </span>
                </span>
              </div>
            ))
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
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #dde8dd',
  },
  headerSub: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#c62828', marginBottom: '8px', fontWeight: '600' },
  headerTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2.4rem', color: '#1a4d2e', fontWeight: 'normal' },
  btnNuevo: {
    background: '#1a4d2e', color: 'white', border: 'none',
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
  formCard: {
    background: 'white', borderRadius: '16px', padding: '32px',
    marginBottom: '28px', border: '1px solid #e8efe8',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  formTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#1a4d2e', marginBottom: '24px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  campo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.82rem', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: '10px',
    fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s', width: '100%',
  },
  btnSubmit: {
    marginTop: '20px', background: '#1a4d2e', color: 'white',
    border: 'none', padding: '13px 32px', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
  },
  tabla: {
    background: 'white', borderRadius: '16px', overflow: 'hidden',
    border: '1px solid #e8efe8', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  },
  tablaHeader: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr 1fr',
    padding: '14px 20px', background: '#f5f7f5',
    borderBottom: '1px solid #e8efe8',
  },
  tablaCol: { fontSize: '0.75rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tablaFila: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr 1fr',
    padding: '16px 20px', borderBottom: '1px solid #f0f0f0',
    background: 'white', transition: 'background 0.15s',
  },
  tablaCell: { fontSize: '0.88rem', color: '#333', display: 'flex', alignItems: 'center' },
  vacio: { textAlign: 'center', padding: '48px', color: '#aaa' },
}