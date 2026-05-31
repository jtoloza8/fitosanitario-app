import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Footer from '../../components/Footer'

export default function GestionProductores() {
  const navigate = useNavigate()
  const [productores, setProductores] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [editando, setEditando] = useState(null)
  const [guardandoEdit, setGuardandoEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [formEdit, setFormEdit] = useState({
    nombre_completo: '', correo: '', telefono: '', direccion: '',
  })

  useEffect(() => { fetchProductores() }, [])

  const fetchProductores = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/productores')
      setProductores(res.data)
    } catch (err) { console.error(err) }
  }

  const abrirEdicion = (p) => {
    setEditando(p)
    setFormEdit({
      nombre_completo: p.nombre_completo || '',
      correo: p.correo || '',
      telefono: p.telefono || '',
      direccion: p.direccion || '',
    })
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setGuardandoEdit(true)
    try {
      await axios.put(`http://localhost:3000/api/productores/${editando.id_productor}`, formEdit)
      setMensaje('Productor actualizado correctamente')
      setEditando(null)
      fetchProductores()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar')
    } finally {
      setGuardandoEdit(false)
    }
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/productores/${confirmDelete.id_productor}`)
      setMensaje(`Productor ${confirmDelete.nombre_completo} eliminado`)
      setConfirmDelete(null)
      fetchProductores()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar')
      setConfirmDelete(null)
    }
  }

  const productoresFiltrados = productores.filter(p =>
    p.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.identificacion?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus { border-color: #1a4d2e !important; outline: none; }
        .fila:hover { background: #f9fafb !important; }
        .btn-edit:hover { background: #e3f2fd !important; }
        .btn-del:hover { background: #fee2e2 !important; }
        .btn-hover:hover { opacity: 0.82; }
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
          <button style={styles.navLogout} onClick={() => { localStorage.clear(); window.location.href = '/' }}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div style={styles.contenido}>

        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <p style={styles.headerSub}>Administración</p>
            <h1 style={styles.headerTitulo}>Gestión de Productores</h1>
          </div>
          <div style={styles.headerDerecha}>
            <span style={styles.counter}>{productores.length} productores registrados</span>
          </div>
        </div>

        {error && (
          <div style={styles.alerta}>
            {error} <span style={{ cursor: 'pointer', fontWeight: 700 }} onClick={() => setError('')}>✕</span>
          </div>
        )}
        {mensaje && (
          <div style={styles.exito}>
            {mensaje} <span style={{ cursor: 'pointer', fontWeight: 700 }} onClick={() => setMensaje('')}>✕</span>
          </div>
        )}

        {/* BUSCADOR */}
        <div style={styles.buscadorWrap}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            style={styles.buscador}
            placeholder="Buscar por nombre, correo o identificación..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button style={styles.clearBtn} onClick={() => setBusqueda('')}>✕</button>
          )}
        </div>

        {/* TABLA */}
        <div style={styles.tabla}>
          <div style={styles.tablaHeader}>
            <span style={styles.tablaCol}>Nombre</span>
            <span style={styles.tablaCol}>Identificación</span>
            <span style={styles.tablaCol}>Correo</span>
            <span style={styles.tablaCol}>Teléfono</span>
            <span style={styles.tablaCol}>Dirección</span>
            <span style={styles.tablaCol}>Acciones</span>
          </div>

          {productoresFiltrados.length === 0 ? (
            <div style={styles.vacio}>
              {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay productores registrados'}
            </div>
          ) : (
            productoresFiltrados.map((p, idx) => (
              <div key={idx} className="fila" style={styles.tablaFila}>
                <span style={styles.tablaCell}>
                  <div>
                    <b style={{ color: '#1a4d2e', display: 'block' }}>{p.nombre_completo}</b>
                  </div>
                </span>
                <span style={styles.tablaCell}>{p.identificacion || '—'}</span>
                <span style={styles.tablaCell}>{p.correo || '—'}</span>
                <span style={styles.tablaCell}>{p.telefono || '—'}</span>
                <span style={{ ...styles.tablaCell, fontSize: '0.82rem', color: '#777' }}>
                  {p.direccion || '—'}
                </span>
                <span style={{ ...styles.tablaCell, gap: '6px' }}>
                  <button className="btn-edit" style={styles.btnAccion}
                    onClick={() => abrirEdicion(p)} title="Editar">
                    ✏️
                  </button>
                  <button className="btn-del" style={styles.btnAccion}
                    onClick={() => setConfirmDelete(p)} title="Eliminar">
                    🗑️
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL EDITAR */}
      {editando && (
        <div style={styles.overlay} onClick={() => setEditando(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitulo}>Editar productor</h2>
              <button style={styles.modalClose} onClick={() => setEditando(null)}>✕</button>
            </div>
            <p style={styles.modalSub}>ID: {editando.identificacion}</p>
            <form onSubmit={handleEdit}>
              <div style={styles.modalGrid}>
                <div style={styles.campo}>
                  <label style={styles.label}>Nombre completo</label>
                  <input style={styles.input} value={formEdit.nombre_completo}
                    onChange={e => setFormEdit({ ...formEdit, nombre_completo: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Correo electrónico</label>
                  <input style={styles.input} type="email" value={formEdit.correo}
                    onChange={e => setFormEdit({ ...formEdit, correo: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Teléfono</label>
                  <input style={styles.input} value={formEdit.telefono}
                    onChange={e => setFormEdit({ ...formEdit, telefono: e.target.value })} />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Dirección</label>
                  <input style={styles.input} value={formEdit.direccion}
                    onChange={e => setFormEdit({ ...formEdit, direccion: e.target.value })} />
                </div>
              </div>
              <div style={styles.modalBtns}>
                <button type="button" style={styles.btnCancelar} onClick={() => setEditando(null)}>
                  Cancelar
                </button>
                <button className="btn-hover" type="submit" style={styles.btnGuardar} disabled={guardandoEdit}>
                  {guardandoEdit ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINAR */}
      {confirmDelete && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: '420px' }}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitulo}>Confirmar eliminación</h2>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#555', margin: '16px 0' }}>
              ¿Deseas eliminar al productor <b style={{ color: '#dc2626' }}>{confirmDelete.nombre_completo}</b>? Esta acción no se puede deshacer.
            </p>
            <div style={styles.modalBtns}>
              <button style={styles.btnCancelar} onClick={() => setConfirmDelete(null)}>
                Cancelar
              </button>
              <button className="btn-hover" style={styles.btnEliminar} onClick={handleDelete}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f7f5', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column' },
  navbar: { background: '#1a4d2e', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  navLogo: { color: 'white', fontSize: '1.4rem', fontFamily: "'DM Serif Display', serif", letterSpacing: '1px' },
  navSep: { color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' },
  navSub: { color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  navBack: { background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif" },
  navLogout: { background: 'transparent', color: 'rgba(255,255,255,0.6)', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem' },
  contenido: { maxWidth: '1200px', margin: '0 auto', padding: '48px 40px', flex: 1 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #dde8dd' },
  headerSub: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#e65100', marginBottom: '8px', fontWeight: '600' },
  headerTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2.4rem', color: '#1a4d2e', fontWeight: 'normal' },
  headerDerecha: { display: 'flex', alignItems: 'center' },
  counter: { background: '#fff8e1', color: '#e65100', border: '2px solid #ffcc80', padding: '8px 18px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '700' },
  alerta: { background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' },
  exito: { background: '#dcfce7', color: '#16a34a', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' },
  buscadorWrap: { display: 'flex', alignItems: 'center', gap: '10px', background: 'white', border: '2px solid #e5e7eb', borderRadius: '12px', padding: '10px 16px', marginBottom: '16px' },
  buscador: { flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", color: '#333' },
  clearBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '0.9rem', padding: '0 4px' },
  tabla: { background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e8efe8', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  tablaHeader: { display: 'grid', gridTemplateColumns: '2fr 1.2fr 2fr 1fr 2fr 100px', padding: '14px 20px', background: '#f5f7f5', borderBottom: '1px solid #e8efe8' },
  tablaCol: { fontSize: '0.75rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tablaFila: { display: 'grid', gridTemplateColumns: '2fr 1.2fr 2fr 1fr 2fr 100px', padding: '14px 20px', borderBottom: '1px solid #f0f0f0', background: 'white', transition: 'background 0.15s' },
  tablaCell: { fontSize: '0.88rem', color: '#333', display: 'flex', alignItems: 'center' },
  btnAccion: { background: 'transparent', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '5px 9px', cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.15s' },
  vacio: { textAlign: 'center', padding: '60px', color: '#aaa', fontSize: '0.95rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '580px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  modalTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', color: '#1a4d2e' },
  modalClose: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999', padding: '4px 8px' },
  modalSub: { fontSize: '0.85rem', color: '#888', marginBottom: '24px' },
  modalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  campo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.82rem', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s', width: '100%' },
  modalBtns: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' },
  btnCancelar: { background: 'white', color: '#555', border: '2px solid #e5e7eb', padding: '11px 22px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif" },
  btnGuardar: { background: '#1a4d2e', color: 'white', border: 'none', padding: '11px 22px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif" },
  btnEliminar: { background: '#dc2626', color: 'white', border: 'none', padding: '11px 22px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif" },
}
