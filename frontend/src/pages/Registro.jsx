import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Registro() {
  const navigate = useNavigate()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre_completo: '',
    correo: '',
    password: '',
    identificacion: '',
    direccion: '',
    telefono: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      await axios.post('http://localhost:3000/api/auth/registro-productor', form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.overlay} />
        <div style={styles.leftContent}>
          <h1 style={styles.titulo}>UdiFica</h1>
          <p style={styles.subtitulo}>
            Sistema de Inspección Fitosanitaria de Vegetales para Exportación en Fresco
          </p>
          <div style={styles.badge}>Instituto Colombiano Agropecuario — ICA</div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.cardTitulo}>Registro de Productor</h2>
          <p style={styles.cardSub}>Crea tu cuenta para gestionar tus lugares de producción</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.campo}>
              <label style={styles.label}>Nombre completo</label>
              <input style={styles.input} name="nombre_completo"
                placeholder="Tu nombre completo"
                value={form.nombre_completo} onChange={handleChange} required />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Número de identificación</label>
              <input style={styles.input} name="identificacion"
                placeholder="Cédula o NIT"
                value={form.identificacion} onChange={handleChange} required />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Correo electrónico</label>
              <input style={styles.input} name="correo" type="email"
                placeholder="correo@ejemplo.com"
                value={form.correo} onChange={handleChange} required />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Contraseña</label>
              <input style={styles.input} name="password" type="password"
                placeholder="••••••••"
                value={form.password} onChange={handleChange} required />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Teléfono</label>
              <input style={styles.input} name="telefono"
                placeholder="3001234567"
                value={form.telefono} onChange={handleChange} />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Dirección</label>
              <input style={styles.input} name="direccion"
                placeholder="Tu dirección"
                value={form.direccion} onChange={handleChange} required />
            </div>

            <button
              style={{
                ...styles.boton,
                opacity: cargando ? 0.7 : 1,
                cursor: cargando ? 'not-allowed' : 'pointer'
              }}
              type="submit"
              disabled={cargando}
            >
              {cargando ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          <div style={styles.loginLink}>
            <p style={styles.loginTexto}>
              ¿Ya tienes cuenta?{' '}
              <span style={styles.loginSpan} onClick={() => navigate('/')}>
                Inicia sesión aquí
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', height: '100vh' },
  left: {
    flex: 1.2,
    backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200')`,
    backgroundSize: 'cover', backgroundPosition: 'center',
    position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '48px',
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
  },
  leftContent: { position: 'relative', zIndex: 1, color: 'white' },
  titulo: { fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '12px', letterSpacing: '2px' },
  subtitulo: { fontSize: '1rem', opacity: 0.9, marginBottom: '20px', maxWidth: '360px', lineHeight: '1.7' },
  badge: {
    display: 'inline-block', background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px 18px', borderRadius: '20px', fontSize: '0.85rem',
  },
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    background: '#f0f4f0',
    padding: '40px 20px',
    overflowY: 'auto',
  },
  card: {
    background: 'white', padding: '40px', borderRadius: '20px',
    width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    marginTop: '20px', marginBottom: '40px',
  },
  cardTitulo: { fontSize: '1.8rem', fontWeight: 'bold', color: '#1a4d2e', marginBottom: '6px' },
  cardSub: { color: '#666', fontSize: '0.9rem', marginBottom: '24px' },
  error: {
    background: '#fee2e2', color: '#dc2626', padding: '12px',
    borderRadius: '10px', marginBottom: '16px', fontSize: '0.9rem',
  },
  campo: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '0.85rem' },
  input: {
    width: '100%', padding: '12px 14px', border: '2px solid #e5e7eb',
    borderRadius: '10px', fontSize: '1rem', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  boton: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #1a4d2e, #2d7a4f)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '1rem', fontWeight: 'bold', marginTop: '8px', fontFamily: 'inherit',
  },
  loginLink: { marginTop: '24px', textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '20px' },
  loginTexto: { fontSize: '0.9rem', color: '#666' },
  loginSpan: { color: '#1a4d2e', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' },
}