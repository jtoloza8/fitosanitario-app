import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Footer from '../../components/Footer'

export default function CrearInspector() {
  const navigate = useNavigate()
  const [funcionarios, setFuncionarios] = useState([])
  const [tab, setTab] = useState('Todos')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [editando, setEditando] = useState(null)
  const [guardandoEdit, setGuardandoEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const [form, setForm] = useState({
    nombre_completo: '', cedula: '', correo: '', password: '',
    telefono: '', tarjeta_profesional: '', rol_funcionario: 'Inspector',
  })
  const [formEdit, setFormEdit] = useState({
    nombre_completo: '', correo: '', telefono: '', tarjeta_profesional: '', rol_funcionario: 'Inspector',
  })

  useEffect(() => { fetchFuncionarios() }, [])

  const fetchFuncionarios = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/funcionarios')
      setFuncionarios(res.data)
    } catch (err) { console.error(err) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      await axios.post('http://localhost:3000/api/auth/registro', form)
      setMensaje(`Funcionario ${form.nombre_completo} creado correctamente`)
      setMostrarForm(false)
      setForm({ nombre_completo: '', cedula: '', correo: '', password: '', telefono: '', tarjeta_profesional: '', rol_funcionario: 'Inspector' })
      fetchFuncionarios()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el funcionario')
    } finally {
      setCargando(false)
    }
  }

  const abrirEdicion = (f) => {
    setEditando(f)
    setFormEdit({
      nombre_completo: f.nombre_completo || '',
      correo: f.correo || '',
      telefono: f.telefono || '',
      tarjeta_profesional: f.tarjeta_profesional || '',
      rol_funcionario: f.rol_funcionario || 'Inspector',
    })
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setGuardandoEdit(true)
    try {
      await axios.put(`http://localhost:3000/api/funcionarios/${editando.id_funcionario}`, formEdit)
      setMensaje('Funcionario actualizado correctamente')
      setEditando(null)
      fetchFuncionarios()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar')
    } finally {
      setGuardandoEdit(false)
    }
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/funcionarios/${confirmDelete.id_funcionario}`)
      setMensaje(`Funcionario ${confirmDelete.nombre_completo} eliminado`)
      setConfirmDelete(null)
      fetchFuncionarios()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar')
      setConfirmDelete(null)
    }
  }

  const funcionariosFiltrados = funcionarios.filter(f => {
    if (tab === 'Todos') return true
    return f.rol_funcionario === tab
  })

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus { border-color: #1a4d2e !important; outline: none; }
        .btn-hover:hover { opacity: 0.82; }
        .fila:hover { background: #f9fafb !important; }
        .btn-edit:hover { background: #e3f2fd !important; }
        .btn-del:hover { background: #fee2e2 !important; }
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
            <h1 style={styles.headerTitulo}>Gestión de Funcionarios</h1>
          </div>
          <button className="btn-hover" style={styles.btnNuevo}
            onClick={() => { setMostrarForm(!mostrarForm); setError('') }}>
            {mostrarForm ? 'Cancelar' : '+ Nuevo Funcionario'}
          </button>
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

        {/* FORMULARIO CREAR */}
        {mostrarForm && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitulo}>Registrar nuevo funcionario</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.campo}>
                  <label style={styles.label}>Nombre completo</label>
                  <input style={styles.input} placeholder="Nombre completo"
                    value={form.nombre_completo} onChange={e => setForm({ ...form, nombre_completo: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Cédula</label>
                  <input style={styles.input} placeholder="Número de cédula"
                    value={form.cedula} onChange={e => setForm({ ...form, cedula: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Correo electrónico</label>
                  <input style={styles.input} type="email" placeholder="correo@ica.gov.co"
                    value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Contraseña temporal</label>
                  <input style={styles.input} type="password" placeholder="••••••••"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Teléfono</label>
                  <input style={styles.input} placeholder="3001234567"
                    value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                </div>
                <div style={styles.campo}>
                  <label style={styles.label}>Tarjeta profesional</label>
                  <input style={styles.input} placeholder="Número de tarjeta"
                    value={form.tarjeta_profesional} onChange={e => setForm({ ...form, tarjeta_profesional: e.target.value })} required />
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
              <button className="btn-hover" style={{ ...styles.btnSubmit, opacity: cargando ? 0.7 : 1 }}
                type="submit" disabled={cargando}>
                {cargando ? 'Creando...' : 'Crear Funcionario'}
              </button>
            </form>
          </div>
        )}

        {/* TABS */}
        <div style={styles.tabs}>
          {['Todos', 'Inspector', 'Administrador'].map(t => (
            <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
              onClick={() => setTab(t)}>
              {t === 'Todos' ? `Todos (${funcionarios.length})` :
               t === 'Inspector' ? `Inspectores (${funcionarios.filter(f => f.rol_funcionario === 'Inspector').length})` :
               `Administradores (${funcionarios.filter(f => f.rol_funcionario === 'Administrador').length})`}
            </button>
          ))}
        </div>

        {/* TABLA */}
        <div style={styles.tabla}>
          <div style={styles.tablaHeader}>
            <span style={styles.tablaCol}>Nombre</span>
            <span style={styles.tablaCol}>Cédula</span>
            <span style={styles.tablaCol}>Correo</span>
            <span style={styles.tablaCol}>Tarjeta prof.</span>
            <span style={styles.tablaCol}>Teléfono</span>
            <span style={styles.tablaCol}>Rol</span>
            <span style={styles.tablaCol}>Acciones</span>
          </div>

          {funcionariosFiltrados.length === 0 ? (
            <div style={styles.vacio}>No hay funcionarios en esta categoría</div>
          ) : (
            funcionariosFiltrados.map((f, idx) => (
              <div key={idx} className="fila" style={styles.tablaFila}>
                <span style={styles.tablaCell}>
                  <b style={{ color: '#1a4d2e' }}>{f.nombre_completo}</b>
                </span>
                <span style={styles.tablaCell}>{f.cedula}</span>
                <span style={styles.tablaCell}>{f.correo}</span>
                <span style={styles.tablaCell}>{f.tarjeta_profesional || '—'}</span>
                <span style={styles.tablaCell}>{f.telefono || '—'}</span>
                <span style={styles.tablaCell}>
                  <span style={{
                    background: f.rol_funcionario === 'Administrador' ? '#e3f2fd' : '#e8f5e9',
                    color: f.rol_funcionario === 'Administrador' ? '#1565c0' : '#1a4d2e',
                    padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600'
                  }}>
                    {f.rol_funcionario}
                  </span>
                </span>
                <span style={{ ...styles.tablaCell, gap: '6px' }}>
                  <button className="btn-edit" style={styles.btnAccion}
                    onClick={() => abrirEdicion(f)} title="Editar">
                    ✏️
                  </button>
                  <button className="btn-del" style={styles.btnAccion}
                    onClick={() => setConfirmDelete(f)} title="Eliminar">
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
              <h2 style={styles.modalTitulo}>Editar funcionario</h2>
              <button style={styles.modalClose} onClick={() => setEditando(null)}>✕</button>
            </div>
            <p style={styles.modalSub}>{editando.nombre_completo} · Cédula {editando.cedula}</p>
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
                  <label style={styles.label}>Tarjeta profesional</label>
                  <input style={styles.input} value={formEdit.tarjeta_profesional}
                    onChange={e => setFormEdit({ ...formEdit, tarjeta_profesional: e.target.value })} />
                </div>
                <div style={{ ...styles.campo, gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Rol</label>
                  <select style={styles.input} value={formEdit.rol_funcionario}
                    onChange={e => setFormEdit({ ...formEdit, rol_funcionario: e.target.value })}>
                    <option value="Inspector">Inspector</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
              </div>
              <div style={styles.modalBtns}>
                <button type="button" style={styles.btnCancelar} onClick={() => setEditando(null)}>
                  Cancelar
                </button>
                <button className="btn-hover" type="submit" style={{ ...styles.btnSubmit, margin: 0 }}
                  disabled={guardandoEdit}>
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
              ¿Deseas eliminar a <b style={{ color: '#dc2626' }}>{confirmDelete.nombre_completo}</b>? Esta acción no se puede deshacer.
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
  headerSub: { fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#c62828', marginBottom: '8px', fontWeight: '600' },
  headerTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '2.4rem', color: '#1a4d2e', fontWeight: 'normal' },
  btnNuevo: { background: '#1a4d2e', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', fontFamily: "'DM Sans', sans-serif" },
  alerta: { background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' },
  exito: { background: '#dcfce7', color: '#16a34a', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' },
  formCard: { background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '28px', border: '1px solid #e8efe8', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  formTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#1a4d2e', marginBottom: '24px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  campo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.82rem', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s', width: '100%' },
  btnSubmit: { marginTop: '20px', background: '#1a4d2e', color: 'white', border: 'none', padding: '13px 32px', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '16px' },
  tab: { padding: '8px 18px', borderRadius: '50px', border: '2px solid #e5e7eb', background: 'white', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", color: '#666', transition: '0.2s' },
  tabActive: { background: '#1a4d2e', color: 'white', borderColor: '#1a4d2e' },
  tabla: { background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e8efe8', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
  tablaHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr 1fr 100px', padding: '14px 20px', background: '#f5f7f5', borderBottom: '1px solid #e8efe8' },
  tablaCol: { fontSize: '0.75rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tablaFila: { display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr 1fr 100px', padding: '14px 20px', borderBottom: '1px solid #f0f0f0', background: 'white', transition: 'background 0.15s' },
  tablaCell: { fontSize: '0.88rem', color: '#333', display: 'flex', alignItems: 'center' },
  btnAccion: { background: 'transparent', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '5px 9px', cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.15s' },
  vacio: { textAlign: 'center', padding: '48px', color: '#aaa' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '580px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  modalTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', color: '#1a4d2e' },
  modalClose: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999', padding: '4px 8px' },
  modalSub: { fontSize: '0.85rem', color: '#888', marginBottom: '24px' },
  modalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  modalBtns: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' },
  btnCancelar: { background: 'white', color: '#555', border: '2px solid #e5e7eb', padding: '11px 22px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif" },
  btnEliminar: { background: '#dc2626', color: 'white', border: 'none', padding: '11px 22px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif" },
}
