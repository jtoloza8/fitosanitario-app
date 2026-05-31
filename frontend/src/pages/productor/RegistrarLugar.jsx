import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Footer from '../../components/Footer'
import { DEPARTAMENTOS, DEPARTAMENTOS_MUNICIPIOS } from '../../data/colombiaDatos'

// Coordenadas aproximadas del centro de cada departamento
const DEPT_COORDS = {
  'Amazonas': [-1.00, -71.94], 'Antioquia': [7.00, -75.50], 'Arauca': [6.54, -70.76],
  'Atlántico': [10.80, -74.87], 'Bogotá D.C.': [4.71, -74.07], 'Bolívar': [8.67, -74.01],
  'Boyacá': [5.45, -73.36], 'Caldas': [5.30, -75.27], 'Caquetá': [1.00, -75.60],
  'Casanare': [5.33, -71.53], 'Cauca': [2.58, -76.58], 'Cesar': [9.84, -73.36],
  'Chocó': [5.69, -76.65], 'Córdoba': [8.31, -75.68], 'Cundinamarca': [4.95, -74.10],
  'Guainía': [2.58, -68.53], 'Guaviare': [2.04, -72.33], 'Huila': [2.54, -75.53],
  'La Guajira': [11.55, -72.37], 'Magdalena': [10.46, -74.40], 'Meta': [3.92, -73.10],
  'Nariño': [1.29, -77.36], 'Norte de Santander': [7.94, -72.50], 'Putumayo': [0.43, -76.48],
  'Quindío': [4.46, -75.66], 'Risaralda': [5.32, -75.99],
  'San Andrés y Providencia': [12.59, -81.70], 'Santander': [6.64, -73.13],
  'Sucre': [8.81, -74.72], 'Tolima': [3.80, -75.20],
  'Valle del Cauca': [3.80, -76.57], 'Vaupés': [0.85, -70.82], 'Vichada': [5.00, -69.60],
}

export default function RegistrarLugar() {
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const geocodeTimer = useRef(null)
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  const [coords, setCoords] = useState({ lat: 4.5709, lng: -74.2973 })
  const [moviendo, setMoviendo] = useState(false)
  const [cargandoGeo, setCargandoGeo] = useState(false)
  const [direccion, setDireccion] = useState('')
  const [form, setForm] = useState({
    nombre_lugar: '',
    departamento: '',
    municipio: '',
    area_total_ha: '',
    fecha_proxima_visita: '',
  })
  const [archivo, setArchivo] = useState(null)
  const [archivoSubido, setArchivoSubido] = useState(null)
  const [subiendoArchivo, setSubiendoArchivo] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  // Reverse geocoding con Nominatim
  const reverseGeocode = useCallback(async (lat, lng) => {
    setCargandoGeo(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
        { headers: { 'User-Agent': 'UdiFica-ICA-App/1.0' } }
      )
      const data = await res.json()
      if (data?.address) {
        const dept = data.address.state || ''
        const muni = data.address.city || data.address.town || data.address.village || data.address.county || ''
        const partes = data.display_name?.split(',') || []
        setDireccion(partes.slice(0, 3).join(',').trim())
        setForm(prev => ({
          ...prev,
          departamento: dept || prev.departamento,
          municipio: muni || prev.municipio,
        }))
      }
    } catch {
      // fallo silencioso, el usuario puede llenar manualmente
    } finally {
      setCargandoGeo(false)
    }
  }, [])

  // Inicializar mapa
  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return

    const map = L.map(mapRef.current, { zoomControl: true })
      .setView([4.5709, -74.2973], 7)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    map.on('movestart', () => setMoviendo(true))

    map.on('moveend', () => {
      setMoviendo(false)
      const c = map.getCenter()
      const lat = parseFloat(c.lat.toFixed(6))
      const lng = parseFloat(c.lng.toFixed(6))
      setCoords({ lat, lng })
      // Debounce para no spamear Nominatim
      clearTimeout(geocodeTimer.current)
      geocodeTimer.current = setTimeout(() => reverseGeocode(lat, lng), 800)
    })

    mapInstanceRef.current = map
    reverseGeocode(4.5709, -74.2973)

    return () => {
      clearTimeout(geocodeTimer.current)
      map.remove()
      mapInstanceRef.current = null
    }
  }, [reverseGeocode])

  // Zoom al departamento seleccionado
  const irADepartamento = (dept) => {
    const c = DEPT_COORDS[dept]
    if (c && mapInstanceRef.current) {
      mapInstanceRef.current.setView(c, 9, { animate: true, duration: 0.8 })
    }
  }

  // Zoom al municipio seleccionado
  const irAMunicipio = async (municipio, departamento) => {
    if (!municipio || !mapInstanceRef.current) return
    try {
      const q = encodeURIComponent(`${municipio}, ${departamento}, Colombia`)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
        { headers: { 'User-Agent': 'UdiFica-ICA-App/1.0' } }
      )
      const data = await res.json()
      if (data[0]) {
        mapInstanceRef.current.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 13, { animate: true, duration: 0.8 })
      }
    } catch { /* silencioso */ }
  }

  const handleArchivo = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('El archivo supera el límite de 5MB'); return }
    setArchivo(file)
    setSubiendoArchivo(true)
    try {
      const fd = new FormData()
      fd.append('archivo', file)
      const res = await axios.post('http://localhost:3000/api/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setArchivoSubido(res.data)
    } catch { setError('Error al subir el archivo') }
    finally { setSubiendoArchivo(false) }
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.nombre_lugar.trim()) return setError('Ingresa el nombre de tu finca')
    if (!form.departamento)        return setError('Selecciona el departamento')
    if (!form.municipio)           return setError('Selecciona el municipio')
    if (!form.area_total_ha)       return setError('Ingresa el área total en hectáreas')

    setCargando(true)
    try {
      const resLugar = await axios.post('http://localhost:3000/api/lugares', {
        nombre_lugar: form.nombre_lugar.trim(),
        departamento: form.departamento,
        municipio: form.municipio,
        area_total_ha: parseFloat(form.area_total_ha),
        fecha_proxima_visita: form.fecha_proxima_visita || null,
        latitud: coords.lat,
        longitud: coords.lng,
        id_productor: usuario.id_productor,
      })

      if (archivoSubido) {
        await axios.post('http://localhost:3000/api/evidencias', {
          id_lugar_produccion: resLugar.data.id_lugar_produccion,
          tipo: archivoSubido.tipo?.includes('pdf') ? 'certificado' : 'foto',
          nombre_archivo: archivoSubido.nombre,
          url_archivo: archivoSubido.url,
          observacion: '',
        })
      }

      navigate('/productor/lotes')
    } catch {
      setError('Error al registrar la finca. Inténtalo de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const municipiosDept = DEPARTAMENTOS_MUNICIPIOS[form.departamento] || []

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        select:focus, input:focus, textarea:focus { border-color: #1a4d2e !important; outline: none; }
        .btn:hover { opacity: 0.85; }
        .upload-lbl:hover { background: #145a32 !important; }
        .leaflet-container { font-family: 'DM Sans', sans-serif !important; }
      `}</style>

      {/* NAVBAR */}
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <span style={s.navLogo}>UdiFica</span>
          <span style={s.navSep}>|</span>
          <span style={s.navSub}>Sistema ICA</span>
        </div>
        <div style={s.navRight}>
          <button style={s.navBack} onClick={() => navigate('/productor/lotes')}>
            ← Volver a mis fincas
          </button>
          <button style={s.navLogout} onClick={() => { localStorage.clear(); window.location.href = '/' }}>
            Salir
          </button>
        </div>
      </nav>

      <div style={s.contenido}>

        {/* HEADER */}
        <div style={s.header}>
          <p style={s.headerSub}>Productor — Registro</p>
          <h1 style={s.headerTitulo}>Registrar nueva finca</h1>
          <p style={s.headerDesc}>
            Mueve el mapa hasta tu predio para ubicarlo con precisión.
            Usa los selectores para llegar más rápido a tu zona.
          </p>
        </div>

        {error && (
          <div style={s.msgError}>
            {error}
            <span style={{ cursor: 'pointer' }} onClick={() => setError('')}>✕</span>
          </div>
        )}

        {/* LAYOUT PRINCIPAL */}
        <div style={s.layout}>

          {/* ── IZQUIERDA: MAPA ── */}
          <div style={s.leftPanel}>

            {/* Selector de departamento / municipio */}
            <div style={s.navMapa}>
              <div style={s.navMapaCampo}>
                <label style={s.navMapaLabel}>Departamento</label>
                <select style={s.navMapaSelect}
                  value={form.departamento}
                  onChange={e => {
                    const dept = e.target.value
                    setForm(prev => ({ ...prev, departamento: dept, municipio: '' }))
                    if (dept) irADepartamento(dept)
                  }}>
                  <option value="">Selecciona un departamento</option>
                  {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={s.navMapaCampo}>
                <label style={s.navMapaLabel}>Municipio</label>
                <select style={s.navMapaSelect}
                  value={form.municipio}
                  disabled={!form.departamento}
                  onChange={e => {
                    const muni = e.target.value
                    setForm(prev => ({ ...prev, municipio: muni }))
                    if (muni) irAMunicipio(muni, form.departamento)
                  }}>
                  <option value="">
                    {form.departamento ? 'Selecciona un municipio' : 'Primero elige departamento'}
                  </option>
                  {municipiosDept.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Mapa con pin central */}
            <div style={s.mapaWrapper}>
              {/* Pin central fijo (estilo Rappi) */}
              <div style={{ ...s.pinContainer, transform: moviendo ? 'translate(-50%, -110%)' : 'translate(-50%, -100%)' }}>
                <div style={{ ...s.pinIcono, filter: moviendo ? 'drop-shadow(0 6px 8px rgba(0,0,0,0.35))' : 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))' }}>
                  📍
                </div>
              </div>
              {/* Sombra bajo el pin */}
              <div style={{ ...s.pinSombra, opacity: moviendo ? 0.15 : 0.25 }} />
              {/* Contenedor del mapa */}
              <div ref={mapRef} style={s.mapa} />
              {/* Indicador de carga geocoding */}
              {cargandoGeo && (
                <div style={s.geocodingBadge}>🔍 Obteniendo dirección...</div>
              )}
            </div>

            {/* Información de coordenadas */}
            <div style={s.coordsBox}>
              <div style={s.coordsLeft}>
                <p style={s.coordsLabel}>Ubicación del pin</p>
                <p style={s.coordsValor}>
                  {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </p>
                {direccion && (
                  <p style={s.coordsDireccion}>{direccion}</p>
                )}
              </div>
              <div style={s.coordsHint}>
                <span style={s.coordsHintIcono}>☝️</span>
                <span style={s.coordsHintTxt}>Arrastra el mapa<br />para mover el pin</span>
              </div>
            </div>
          </div>

          {/* ── DERECHA: FORMULARIO ── */}
          <div style={s.rightPanel}>
            <h2 style={s.formTitulo}>Datos de la finca</h2>

            <div style={s.campo}>
              <label style={s.label}>Nombre de la finca <span style={{ color: '#dc2626' }}>*</span></label>
              <input style={s.input}
                placeholder="Ej: Finca El Paraíso"
                value={form.nombre_lugar}
                onChange={e => setForm({ ...form, nombre_lugar: e.target.value })}
              />
            </div>

            <div style={s.gridDos}>
              <div style={s.campo}>
                <label style={s.label}>Departamento <span style={{ color: '#dc2626' }}>*</span></label>
                <select style={s.input}
                  value={form.departamento}
                  onChange={e => {
                    const dept = e.target.value
                    setForm(prev => ({ ...prev, departamento: dept, municipio: '' }))
                    if (dept) irADepartamento(dept)
                  }}>
                  <option value="">Selecciona...</option>
                  {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={s.campo}>
                <label style={s.label}>Municipio <span style={{ color: '#dc2626' }}>*</span></label>
                <select style={s.input}
                  value={form.municipio}
                  disabled={!form.departamento}
                  onChange={e => {
                    const muni = e.target.value
                    setForm(prev => ({ ...prev, municipio: muni }))
                    if (muni) irAMunicipio(muni, form.departamento)
                  }}>
                  <option value="">
                    {form.departamento ? 'Selecciona...' : '— Elige departamento —'}
                  </option>
                  {municipiosDept.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div style={s.gridDos}>
              <div style={s.campo}>
                <label style={s.label}>Área total <span style={{ color: '#dc2626' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...s.input, paddingRight: '40px' }}
                    type="number" step="0.1" min="0.1"
                    placeholder="0.0"
                    value={form.area_total_ha}
                    onChange={e => setForm({ ...form, area_total_ha: e.target.value })}
                  />
                  <span style={s.unidad}>ha</span>
                </div>
              </div>
              <div style={s.campo}>
                <label style={s.label}>Próxima visita</label>
                <input style={s.input}
                  type="date"
                  value={form.fecha_proxima_visita}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({ ...form, fecha_proxima_visita: e.target.value })}
                />
              </div>
            </div>

            {/* Coordenadas (solo lectura, viene del mapa) */}
            <div style={s.coordsFormBox}>
              <span style={s.coordsFormIcono}>📍</span>
              <div>
                <p style={s.coordsFormLabel}>Coordenadas del predio</p>
                <p style={s.coordsFormVal}>{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>
              </div>
              <span style={s.coordsAutoTag}>Auto</span>
            </div>

            {/* Separador */}
            <div style={s.separador}>
              <span style={s.separadorTxt}>Documento ICA (opcional)</span>
            </div>

            {/* Upload */}
            <div style={s.uploadBox}>
              <input type="file" id="archivo-input" accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleArchivo} style={{ display: 'none' }} />
              {!archivoSubido ? (
                <label htmlFor="archivo-input" className="upload-lbl" style={s.uploadBtn}>
                  {subiendoArchivo ? '⏳ Subiendo...' : '📎 Adjuntar certificado o foto'}
                </label>
              ) : (
                <div style={s.archivoListo}>
                  <span>✅ {archivoSubido.nombre}</span>
                  <span style={{ cursor: 'pointer', color: '#dc2626', marginLeft: '8px' }}
                    onClick={() => { setArchivoSubido(null); setArchivo(null) }}>Quitar</span>
                </div>
              )}
              <p style={s.uploadHint}>PDF, JPG o PNG · Máximo 5MB</p>
            </div>

            <button className="btn" style={{
              ...s.btnSubmit,
              opacity: cargando ? 0.7 : 1,
              cursor: cargando ? 'not-allowed' : 'pointer',
            }} onClick={handleSubmit} disabled={cargando}>
              {cargando ? '⏳ Registrando finca...' : '✅ Registrar mi finca'}
            </button>

            <p style={s.submitHint}>
              Tu finca quedará en estado <strong>Pendiente</strong> hasta que el administrador del ICA la apruebe.
            </p>
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
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  navBack: { background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif" },
  navLogout: { background: 'transparent', color: 'rgba(255,255,255,0.6)', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem' },

  contenido: { maxWidth: '1280px', margin: '0 auto', padding: '40px 40px 60px' },

  header: { marginBottom: '32px' },
  headerSub: { fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#40916c', marginBottom: '6px', fontWeight: '600' },
  headerTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2.2rem', color: '#1a4d2e', fontWeight: 'normal', marginBottom: '8px' },
  headerDesc: { fontSize: '0.9rem', color: '#888', maxWidth: '600px' },

  msgError: { background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' },

  layout: { display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '28px', alignItems: 'start' },

  // Panel izquierdo — mapa
  leftPanel: { display: 'flex', flexDirection: 'column', gap: '0' },
  navMapa: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'white', padding: '14px 16px', borderRadius: '14px 14px 0 0', border: '1px solid #e8efe8', borderBottom: 'none' },
  navMapaCampo: { display: 'flex', flexDirection: 'column', gap: '4px' },
  navMapaLabel: { fontSize: '0.72rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' },
  navMapaSelect: { border: '1.5px solid #e5e7eb', borderRadius: '8px', padding: '8px 10px', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif", background: 'white', cursor: 'pointer' },

  mapaWrapper: { position: 'relative', borderRadius: '0', overflow: 'hidden' },
  pinContainer: { position: 'absolute', top: '50%', left: '50%', zIndex: 1000, pointerEvents: 'none', transition: 'transform 0.15s ease' },
  pinIcono: { fontSize: '2.8rem', lineHeight: 1, display: 'block', transition: 'filter 0.15s' },
  pinSombra: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, 2px)', zIndex: 999, pointerEvents: 'none', width: '14px', height: '7px', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', filter: 'blur(3px)', transition: 'opacity 0.15s' },
  mapa: { height: '420px', width: '100%' },
  geocodingBadge: { position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(26,77,46,0.92)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', zIndex: 1000, pointerEvents: 'none', whiteSpace: 'nowrap' },

  coordsBox: { background: 'white', border: '1px solid #e8efe8', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  coordsLeft: {},
  coordsLabel: { fontSize: '0.7rem', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' },
  coordsValor: { fontSize: '0.88rem', fontWeight: '600', color: '#1a4d2e', fontFamily: 'monospace' },
  coordsDireccion: { fontSize: '0.78rem', color: '#888', marginTop: '2px', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  coordsHint: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', background: '#f5f7f5', borderRadius: '10px', padding: '8px 12px' },
  coordsHintIcono: { fontSize: '1.1rem' },
  coordsHintTxt: { fontSize: '0.68rem', color: '#aaa', textAlign: 'center', lineHeight: 1.4 },

  // Panel derecho — formulario
  rightPanel: { background: 'white', borderRadius: '18px', padding: '28px', border: '1px solid #e8efe8', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0' },
  formTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', color: '#1a4d2e', fontWeight: 'normal', marginBottom: '20px' },
  campo: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s', background: 'white' },
  gridDos: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  unidad: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.82rem', color: '#aaa', fontWeight: '600', pointerEvents: 'none' },

  coordsFormBox: { display: 'flex', alignItems: 'center', gap: '10px', background: '#f0f7f0', borderRadius: '10px', padding: '10px 14px', marginBottom: '20px', border: '1px solid #dde8dd' },
  coordsFormIcono: { fontSize: '1.2rem' },
  coordsFormLabel: { fontSize: '0.7rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' },
  coordsFormVal: { fontSize: '0.85rem', fontWeight: '600', color: '#1a4d2e', fontFamily: 'monospace' },
  coordsAutoTag: { marginLeft: 'auto', background: '#1a4d2e', color: 'white', fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.5px' },

  separador: { borderTop: '1px solid #f0f0f0', margin: '4px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  separadorTxt: { background: 'white', padding: '0 12px', fontSize: '0.75rem', color: '#bbb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },

  uploadBox: { marginBottom: '20px' },
  uploadBtn: { display: 'block', width: '100%', background: '#1a4d2e', color: 'white', border: 'none', padding: '11px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', fontFamily: "'DM Sans', sans-serif", textAlign: 'center' },
  archivoListo: { background: '#e8f5e9', color: '#1a4d2e', padding: '10px 14px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '600', display: 'flex', alignItems: 'center' },
  uploadHint: { fontSize: '0.72rem', color: '#bbb', marginTop: '6px', textAlign: 'center' },

  btnSubmit: { width: '100%', background: '#40916c', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", marginBottom: '12px' },
  submitHint: { fontSize: '0.75rem', color: '#aaa', textAlign: 'center', lineHeight: 1.5 },
}
