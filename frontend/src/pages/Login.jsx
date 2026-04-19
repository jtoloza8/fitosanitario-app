import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      let res
      try {
        res = await axios.post('http://localhost:3000/api/auth/login', { correo, password })
      } catch {
        res = await axios.post('http://localhost:3000/api/auth/login-productor', { correo, password })
      }
      const { token, rol, usuario } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('rol', rol)
      localStorage.setItem('usuario', JSON.stringify(usuario))
      if (rol === 'Administrador') navigate('/admin')
      else if (rol === 'Inspector') navigate('/inspector/calendario')
      else if (rol === 'Productor') navigate('/productor/lotes')
    } catch (err) {
      setError('Correo o contraseña incorrectos')
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
          <h2 style={styles.cardTitulo}>Iniciar Sesión</h2>
          <p style={styles.cardSub}>Ingresa tus credenciales para continuar</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div style={styles.campo}>
              <label style={styles.label}>Correo electrónico</label>
              <input
                style={styles.input}
                type="email"
                placeholder="correo@ejemplo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Contraseña</label>
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
              {cargando ? 'Ingresando...' : 'Ingresar al Sistema'}
            </button>
          </form>

          <div style={styles.registro}>
            <p style={styles.registroTexto}>
              ¿No tienes cuenta?{' '}
              <span
                style={styles.registroLink}
                onClick={() => navigate('/registro')}
              >
                Regístrate aquí
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
  },
  left: {
    flex: 1.2,
    backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '48px',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
  },
  leftContent: {
    position: 'relative',
    zIndex: 1,
    color: 'white',
  },
  titulo: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    marginBottom: '12px',
    letterSpacing: '2px',
  },
  subtitulo: {
    fontSize: '1rem',
    opacity: 0.9,
    marginBottom: '20px',
    maxWidth: '360px',
    lineHeight: '1.7',
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px 18px',
    borderRadius: '20px',
    fontSize: '0.85rem',
  },
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f0f4f0',
    padding: '20px',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
  },
  cardTitulo: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#1a4d2e',
    marginBottom: '6px',
  },
  cardSub: {
    color: '#666',
    fontSize: '0.9rem',
    marginBottom: '28px',
  },
  error: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '0.9rem',
  },
  campo: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    color: '#333',
    fontSize: '0.85rem',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  boton: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #1a4d2e, #2d7a4f)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 'bold',
    marginTop: '8px',
  },
  registro: {
    marginTop: '24px',
    textAlign: 'center',
    borderTop: '1px solid #f0f0f0',
    paddingTop: '20px',
  },
  registroTexto: {
    fontSize: '0.9rem',
    color: '#666',
  },
  registroLink: {
    color: '#1a4d2e',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
}