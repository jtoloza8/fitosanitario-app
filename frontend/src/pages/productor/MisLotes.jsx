import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function MisLotes() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const [lugares, setLugares] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [subiendoArchivo, setSubiendoArchivo] = useState(false)
  const [archivoSubido, setArchivoSubido] = useState(null)
  const [form, setForm] = useState({
    nombre_lugar: '',
    numero_registroica: '',
    municipio: '',
    departamento: '',
    area_total_ha: '',
    fecha_proxima_visita: '',
    id_productor: usuario.id_productor || 1
  })

  useEffect(() => { fetchLugares() }, [])

  const fetchLugares = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/lugares')
      const misLugares = res.data.filter(l => l.id_productor === usuario.id_productor)
      setLugares(misLugares)
    } catch (err) { console.error(err) }
  }

  const handleArchivo = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setMensaje('❌ El archivo supera el límite de 5MB')
      return
    }
    setArchivo(file)
    setSubiendoArchivo(true)
    try {
      const formData = new FormData()
      formData.append('archivo', file)
      const res = await axios.post('http://localhost:3000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setArchivoSubido(res.data)
    } catch (err) {
      setMensaje('❌ Error al subir el archivo')
    } finally {
      setSubiendoArchivo(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      const resLugar = await axios.post('http://localhost:3000/api/lugares', {
        ...form,
        id_productor: usuario.id_productor
      })
      const idLugar = resLugar.data.id_lugar_produccion

      if (archivoSubido) {
        await axios.post('http://localhost:3000/api/evidencias', {
          id_lugar_produccion: idLugar,
          tipo: archivoSubido.tipo?.includes('pdf') ? 'certificado' : 'foto',
          nombre_archivo: archivoSubido.nombre,
          url_archivo: archivoSubido.url,
          observacion: ''
        })
      }

      setMensaje('✅ ¡Finca registrada! El administrador la revisará pronto')
      setMostrarForm(false)
      setArchivoSubido(null)
      setArchivo(null)
      fetchLugares()
      setForm({
        nombre_lugar: '', numero_registroica: '', municipio: '',
        departamento: '', area_total_ha: '', fecha_proxima_visita: '',
        id_productor: usuario.id_productor
      })
    } catch (err) {
      setMensaje('❌ Error al registrar la finca')
    } finally {
      setCargando(false)
    }
  }

  const estadoInfo = (estado) => {
    if (estado === 'Aprobado') return { bg: '#dcfce7', color: '#16a34a', texto: '✅ Aprobado', desc: 'Puedes gestionar tus lotes' }
    if (estado === 'Rechazado') return { bg: '#fee2e2', color: '#dc2626', texto: '❌ Rechazado', desc: 'Contacta al administrador' }
    return { bg: '#fef9c3', color: '#ca8a04', texto: '⏳ En revisión', desc: 'El ICA está revisando tu finca' }
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .lugar-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important; }
        input:focus, select:focus, textarea:focus { border-color: #1a4d2e !important; outline: none; }
        .upload-label:hover { background: #145a32 !important; }
      `}</style>

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <span style={styles.navLogo}>UdiFica</span>
        <div style={styles.navRight}>
          <span style={styles.navRol}>Hola, {usuario.nombre_completo?.split(' ')[0]}</span>
          <button style={styles.navBtn} onClick={() => navigate('/productor/solicitar')}>
            Ver Inspecciones
          </button>
          <button style={styles.navLogout}
            onClick={() => { localStorage.clear(); window.location.href = '/' }}>
            Salir
          </button>
        </div>
      </nav>

      <div style={styles.contenido}>

        {/* BIENVENIDA */}
        <div style={styles.bienvenida}>
          <div style={styles.bienvenidaTexto}>
            <h1 style={styles.bienvenidaTitulo}>
              Bienvenido, {usuario.nombre_completo?.split(' ')[0]}
            </h1>
            <p style={styles.bienvenidaSub}>
              Aquí puedes registrar tus fincas y gestionar tus lotes para las inspecciones del ICA
            </p>
          </div>
          <button style={styles.btnNuevo}
            onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? '✕ Cancelar' : '+ Registrar nueva finca'}
          </button>
        </div>

        {/* MENSAJE */}
        {mensaje && (
          <div style={{
            ...styles.mensajeBox,
            background: mensaje.includes('❌') ? '#fee2e2' : '#dcfce7',
            color: mensaje.includes('❌') ? '#dc2626' : '#16a34a',
          }}>
            {mensaje}
            <span style={{ cursor: 'pointer', marginLeft: '12px' }}
              onClick={() => setMensaje('')}>✕</span>
          </div>
        )}

        {/* FORMULARIO */}
        {mostrarForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitulo}>Registrar nueva finca</h2>
            <p style={styles.formSub}>Llena los datos de tu finca para que el ICA pueda registrarla</p>

            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.campo}>
                  <label style={styles.label}>¿Cómo se llama tu finca?</label>
                  <input style={styles.input} placeholder="Ej: Finca El Paraíso"
                    value={form.nombre_lugar}
                    onChange={e => setForm({ ...form, nombre_lugar: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Número de registro ICA</label>
                  <input style={styles.input} placeholder="Ej: ICA-2026-001"
                    value={form.numero_registroica}
                    onChange={e => setForm({ ...form, numero_registroica: e.target.value })} required />
                  <span style={styles.ayuda}>Este número está en tu certificado del ICA</span>
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>¿En qué municipio está?</label>
                  <input style={styles.input} placeholder="Ej: Mosquera"
                    value={form.municipio}
                    onChange={e => setForm({ ...form, municipio: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>¿En qué departamento?</label>
                  <input style={styles.input} placeholder="Ej: Cundinamarca"
                    value={form.departamento}
                    onChange={e => setForm({ ...form, departamento: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>¿Cuántas hectáreas tiene tu finca?</label>
                  <input style={styles.input} type="number" step="0.1" placeholder="Ej: 5.5"
                    value={form.area_total_ha}
                    onChange={e => setForm({ ...form, area_total_ha: e.target.value })} required />
                  <span style={styles.ayuda}>Ingresa el área en hectáreas</span>
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>¿Cuándo quieres la próxima visita?</label>
                  <input style={styles.input} type="date"
                    value={form.fecha_proxima_visita}
                    onChange={e => setForm({ ...form, fecha_proxima_visita: e.target.value })} />
                </div>
              </div>

              {/* SUBIDA DE ARCHIVO */}
              <div style={styles.separador}>
                <span style={styles.separadorTexto}>Documento del ICA (opcional pero recomendado)</span>
              </div>

              <div style={styles.uploadBox}>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleArchivo}
                  style={{ display: 'none' }}
                  id="archivo-input"
                />
                {!archivoSubido ? (
                  <label htmlFor="archivo-input" className="upload-label" style={styles.uploadBtn}>
                    {subiendoArchivo ? '⏳ Subiendo archivo...' : '📎 Adjuntar certificado o foto'}
                  </label>
                ) : (
                  <div style={styles.archivoSubido}>
                    <span>✅ Archivo listo: {archivoSubido.nombre}</span>
                    <span style={{ cursor: 'pointer', marginLeft: '12px', color: '#dc2626' }}
                      onClick={() => { setArchivoSubido(null); setArchivo(null) }}>
                      Quitar
                    </span>
                  </div>
                )}
                <p style={styles.uploadInfo}>
                  Puedes subir tu certificado del ICA, una foto de la finca o cualquier documento relacionado.
                  Máximo 5MB. Formatos: PDF, JPG, PNG.
                </p>
              </div>

              <button style={{
                ...styles.btnSubmit,
                opacity: cargando ? 0.7 : 1,
                cursor: cargando ? 'not-allowed' : 'pointer'
              }} type="submit" disabled={cargando}>
                {cargando ? '⏳ Registrando...' : '✅ Registrar mi finca'}
              </button>
            </form>
          </div>
        )}

        {/* LISTA DE LUGARES */}
        {lugares.length === 0 && !mostrarForm ? (
          <div style={styles.vacioGrande}>
            <div style={styles.vacioIcono}>🌱</div>
            <h2 style={styles.vacioTitulo}>Aún no tienes fincas registradas</h2>
            <p style={styles.vacioSub}>Registra tu primera finca para comenzar el proceso de inspección del ICA</p>
            <button style={styles.btnNuevo} onClick={() => setMostrarForm(true)}>
              + Registrar mi primera finca
            </button>
          </div>
        ) : (
          <>
            <h2 style={styles.seccionTitulo}>Mis fincas ({lugares.length})</h2>
            <div style={styles.listaGrid}>
              {lugares.map((l, i) => {
                const est = estadoInfo(l.estado)
                return (
                  <div key={i} className="lugar-card" style={styles.lugarCard}>
                    <div style={{ ...styles.estadoStripe, background: est.color }} />
                    <div style={styles.lugarBody}>
                      <div style={styles.lugarHeader}>
                        <h3 style={styles.lugarNombre}>{l.nombre_lugar}</h3>
                        <span style={{ ...styles.estadoBadge, background: est.bg, color: est.color }}>
                          {est.texto}
                        </span>
                      </div>
                      <p style={styles.estadoDesc}>{est.desc}</p>
                      <div style={styles.lugarInfo}>
                        <div style={styles.infoFila}>
                          <span style={styles.infoLabel}>📍 Ubicación</span>
                          <span style={styles.infoValor}>{l.municipio}, {l.departamento}</span>
                        </div>
                        <div style={styles.infoFila}>
                          <span style={styles.infoLabel}>📋 Registro ICA</span>
                          <span style={styles.infoValor}>{l.numero_registroica}</span>
                        </div>
                        <div style={styles.infoFila}>
                          <span style={styles.infoLabel}>📐 Área</span>
                          <span style={styles.infoValor}>{l.area_total_ha} ha</span>
                        </div>
                      </div>
                      {l.estado === 'Aprobado' && (
                        <button style={styles.btnSolicitar}
                          onClick={() => {
                            localStorage.setItem('lugar_activo', JSON.stringify(l))
                            navigate(`/productor/lotes/${l.id_lugar_produccion}`)
                          }}>
                          Gestionar lotes →
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
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
  navRol: { color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '500' },
  navBtn: {
    background: 'rgba(255,255,255,0.12)', color: 'white',
    border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif",
  },
  navLogout: {
    background: 'transparent', color: 'rgba(255,255,255,0.6)',
    border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem',
  },
  contenido: { maxWidth: '1100px', margin: '0 auto', padding: '40px' },
  bienvenida: {
    background: 'linear-gradient(135deg, #1a4d2e, #2d7a4f)',
    borderRadius: '20px', padding: '32px 40px', marginBottom: '32px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white',
  },
  bienvenidaTexto: { flex: 1 },
  bienvenidaTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2rem', marginBottom: '8px', fontWeight: 'normal' },
  bienvenidaSub: { fontSize: '0.95rem', opacity: 0.85, lineHeight: '1.5' },
  btnNuevo: {
    background: 'white', color: '#1a4d2e', border: 'none',
    padding: '14px 28px', borderRadius: '12px', cursor: 'pointer',
    fontSize: '1rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap', marginLeft: '24px',
  },
  mensajeBox: {
    padding: '14px 20px', borderRadius: '10px', marginBottom: '24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem',
  },
  formCard: {
    background: 'white', borderRadius: '20px', padding: '36px',
    marginBottom: '32px', border: '1px solid #e8efe8',
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
  },
  formTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: '#1a4d2e', marginBottom: '6px' },
  formSub: { color: '#888', fontSize: '0.9rem', marginBottom: '28px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  campo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.9rem', fontWeight: '600', color: '#333' },
  ayuda: { fontSize: '0.78rem', color: '#aaa', fontStyle: 'italic' },
  input: {
    padding: '13px 16px', border: '2px solid #e5e7eb', borderRadius: '12px',
    fontSize: '1rem', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s', width: '100%',
  },
  separador: { margin: '28px 0 16px', borderTop: '1px solid #e8efe8', paddingTop: '20px' },
  separadorTexto: { fontSize: '0.85rem', color: '#888', fontWeight: '600' },
  uploadBox: {
    border: '2px dashed #a5d6a7', borderRadius: '16px',
    padding: '28px', textAlign: 'center', background: '#f9fffe',
    marginBottom: '24px',
  },
  uploadBtn: {
    display: 'inline-block', background: '#1a4d2e', color: 'white',
    padding: '12px 28px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '1rem', fontWeight: '600', marginBottom: '12px',
    transition: 'background 0.2s',
  },
  archivoSubido: {
    background: '#dcfce7', color: '#16a34a', padding: '12px 20px',
    borderRadius: '10px', fontSize: '0.9rem', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px',
  },
  uploadInfo: { fontSize: '0.82rem', color: '#aaa', lineHeight: '1.5', marginTop: '8px' },
  btnSubmit: {
    width: '100%', background: '#1a4d2e', color: 'white',
    border: 'none', padding: '16px', borderRadius: '12px',
    cursor: 'pointer', fontSize: '1.1rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif",
  },
  vacioGrande: {
    textAlign: 'center', padding: '80px 40px', background: 'white',
    borderRadius: '20px', border: '1px solid #e8efe8',
  },
  vacioIcono: { fontSize: '4rem', marginBottom: '16px' },
  vacioTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', color: '#1a4d2e', marginBottom: '12px', fontWeight: 'normal' },
  vacioSub: { fontSize: '0.95rem', color: '#888', marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px' },
  seccionTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#1a4d2e', marginBottom: '20px', fontWeight: 'normal' },
  listaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  lugarCard: {
    background: 'white', borderRadius: '16px', overflow: 'hidden',
    border: '1px solid #e8efe8', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  estadoStripe: { height: '6px', width: '100%' },
  lugarBody: { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' },
  lugarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' },
  lugarNombre: { fontFamily: "'DM Serif Display', serif", fontSize: '1.2rem', color: '#1a4d2e', fontWeight: 'normal' },
  estadoBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', whiteSpace: 'nowrap' },
  estadoDesc: { fontSize: '0.82rem', color: '#888', marginTop: '-4px' },
  lugarInfo: { display: 'flex', flexDirection: 'column', gap: '8px' },
  infoFila: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: '0.82rem', color: '#aaa' },
  infoValor: { fontSize: '0.88rem', color: '#333', fontWeight: '500' },
  btnSolicitar: {
    background: '#1a4d2e', color: 'white', border: 'none',
    padding: '12px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '0.9rem', fontWeight: '600', fontFamily: "'DM Sans', sans-serif",
    marginTop: '4px', width: '100%',
  },
}