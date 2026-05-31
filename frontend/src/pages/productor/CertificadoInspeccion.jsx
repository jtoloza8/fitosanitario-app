import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function CertificadoInspeccion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get(`http://localhost:3000/api/visitas/${id}`)
      .then(r => {
        if (r.data.estado !== 'Aprobada') setError('Este certificado solo está disponible cuando la inspección es aprobada.')
        else setData(r.data)
      })
      .catch(() => setError('No se pudo cargar el certificado. Verifica el enlace.'))
  }, [id])

  const certNum = `CERT-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`
  const hoy = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7f5', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>
          <button onClick={() => navigate('/productor/inspecciones')} style={{ background: '#1a4d2e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: '600' }}>
            Volver a mis inspecciones
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f7f5', fontFamily: 'DM Sans, sans-serif' }}>
        <p style={{ color: '#aaa' }}>Cargando certificado...</p>
      </div>
    )
  }

  const fechaInspeccion = data.fecha
    ? new Date(String(data.fecha).split('T')[0] + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; }
        .no-print { }
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .cert-page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
          @page { size: A4; margin: 15mm; }
        }
      `}</style>

      {/* Barra de acciones — solo en pantalla */}
      <div className="no-print" style={s.toolbar}>
        <button style={s.btnVolver} onClick={() => navigate('/productor/inspecciones')}>
          ← Volver
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={s.toolbarTxt}>Puedes imprimir o guardar como PDF</span>
          <button style={s.btnImprimir} onClick={() => window.print()}>
            🖨️ Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {/* CERTIFICADO */}
      <div style={s.wrapper}>
        <div className="cert-page" style={s.cert}>

          {/* Encabezado ICA */}
          <div style={s.certHeader}>
            <div style={s.certHeaderLeft}>
              <div style={s.certLogo}>🌿</div>
              <div>
                <p style={s.certLogoTxt}>UdiFica</p>
                <p style={s.certLogoSub}>Instituto Colombiano Agropecuario — ICA</p>
              </div>
            </div>
            <div style={s.certHeaderRight}>
              <p style={s.certNumLabel}>N° de Certificado</p>
              <p style={s.certNum}>{certNum}</p>
              <p style={s.certFechaEmision}>Emitido: {hoy}</p>
            </div>
          </div>

          {/* Título */}
          <div style={s.certTitulo}>
            <div style={s.certTituloLine} />
            <h1 style={s.certTituloTxt}>CERTIFICADO DE INSPECCIÓN FITOSANITARIA</h1>
            <div style={s.certTituloLine} />
          </div>

          <p style={s.certIntro}>
            El Instituto Colombiano Agropecuario (ICA) certifica que el predio descrito a continuación
            fue debidamente inspeccionado por un funcionario autorizado y cumple con las condiciones
            fitosanitarias establecidas en la normativa vigente.
          </p>

          {/* Sección 1: Productor */}
          <Seccion titulo="1. DATOS DEL PRODUCTOR">
            <Fila label="Nombre completo" valor={data.nombre_productor || '—'} />
            <Fila label="Cédula / Identificación" valor={data.cedula_productor || '—'} />
            <Fila label="Teléfono" valor={data.telefono_productor || '—'} />
          </Seccion>

          {/* Sección 2: Predio */}
          <Seccion titulo="2. DATOS DEL PREDIO">
            <Fila label="Nombre del predio" valor={data.nombre_lugar || '—'} />
            <Fila label="Municipio" valor={data.lugar_municipio || data.municipio || '—'} />
            <Fila label="Departamento" valor={data.lugar_departamento || data.departamento || '—'} />
            <Fila label="Área total" valor={data.area_total_ha ? `${data.area_total_ha} hectáreas` : '—'} />
            {data.latitud && data.longitud && (
              <Fila label="Coordenadas GPS" valor={`${parseFloat(data.latitud).toFixed(5)}, ${parseFloat(data.longitud).toFixed(5)}`} />
            )}
          </Seccion>

          {/* Sección 3: Inspección */}
          <Seccion titulo="3. DATOS DE LA INSPECCIÓN">
            <Fila label="Fecha de la visita" valor={fechaInspeccion} />
            <Fila label="Horario" valor={data.hora_inicio && data.hora_fin ? `${data.hora_inicio} – ${data.hora_fin}` : '—'} />
            <Fila label="Inspector responsable" valor={data.nombre_inspector || '—'} />
            <Fila label="Periodo reportado" valor={data.periodo_reportado || '—'} />
          </Seccion>

          {/* Sección 4: Evaluación ICA */}
          {(data.condicion_cultivo || data.riesgo_fitosanitario) && (
            <Seccion titulo="4. EVALUACIÓN FITOSANITARIA">
              {data.condicion_cultivo && (
                <Fila label="Condición del cultivo" valor={data.condicion_cultivo} />
              )}
              {data.riesgo_fitosanitario && (
                <Fila label="Nivel de riesgo" valor={data.riesgo_fitosanitario} />
              )}
              {data.medidas_recomendadas && (
                <Fila label="Medidas recomendadas" valor={data.medidas_recomendadas} />
              )}
              {data.proxima_visita_sugerida && (
                <Fila label="Próxima visita sugerida" valor={
                  new Date(String(data.proxima_visita_sugerida).split('T')[0] + 'T12:00:00')
                    .toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
                } />
              )}
              {data.conclusion_inspector && (
                <div style={s.conceptoBox}>
                  <p style={s.conceptoLabel}>Concepto del inspector:</p>
                  <p style={s.conceptoTxt}>"{data.conclusion_inspector}"</p>
                </div>
              )}
            </Seccion>
          )}

          {/* Resultado */}
          <div style={s.resultadoBox}>
            <div style={s.resultadoCheck}>✅</div>
            <div>
              <p style={s.resultadoTitulo}>PREDIO APROBADO</p>
              <p style={s.resultadoSub}>
                {data.observacion_admin || 'La inspección fue revisada y aprobada por el administrador del ICA.'}
              </p>
            </div>
          </div>

          {/* Firmas */}
          <div style={s.firmasRow}>
            {[
              { titulo: 'Inspector ICA', nombre: data.nombre_inspector || '—' },
              { titulo: 'Administrador ICA', nombre: 'Sistema UdiFica' },
            ].map((f, i) => (
              <div key={i} style={s.firmaBox}>
                <div style={s.firmaLinea} />
                <p style={s.firmaTitulo}>{f.titulo}</p>
                <p style={s.firmaNombre}>{f.nombre}</p>
              </div>
            ))}
          </div>

          {/* Footer del certificado */}
          <div style={s.certFooter}>
            <p>Este certificado fue emitido digitalmente por el Sistema UdiFica del ICA.</p>
            <p>Número: <strong>{certNum}</strong> · Fecha de emisión: {hoy}</p>
          </div>

        </div>
      </div>
    </>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div style={s.seccion}>
      <div style={s.seccionHeader}>
        <div style={s.seccionLine} />
        <h2 style={s.seccionTitulo}>{titulo}</h2>
        <div style={{ ...s.seccionLine, flex: 1 }} />
      </div>
      <div style={s.seccionBody}>{children}</div>
    </div>
  )
}

function Fila({ label, valor }) {
  return (
    <div style={s.fila}>
      <span style={s.filaLabel}>{label}:</span>
      <span style={s.filaValor}>{valor}</span>
    </div>
  )
}

const s = {
  toolbar: { background: '#1a4d2e', padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'DM Sans', sans-serif" },
  btnVolver: { background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'DM Sans', sans-serif" },
  toolbarTxt: { color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' },
  btnImprimir: { background: 'white', color: '#1a4d2e', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700', fontFamily: "'DM Sans', sans-serif" },

  wrapper: { background: '#f0f0f0', minHeight: '100vh', padding: '32px 24px 60px', display: 'flex', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" },
  cert: { background: 'white', width: '100%', maxWidth: '800px', borderRadius: '8px', padding: '48px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },

  // Header
  certHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', paddingBottom: '24px', borderBottom: '3px solid #1a4d2e' },
  certHeaderLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  certLogo: { fontSize: '2.5rem', lineHeight: 1 },
  certLogoTxt: { fontFamily: "'DM Serif Display', serif", fontSize: '1.6rem', color: '#1a4d2e', lineHeight: 1 },
  certLogoSub: { fontSize: '0.78rem', color: '#666', marginTop: '2px' },
  certHeaderRight: { textAlign: 'right' },
  certNumLabel: { fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' },
  certNum: { fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: '#1a4d2e' },
  certFechaEmision: { fontSize: '0.75rem', color: '#888', marginTop: '4px' },

  // Título principal
  certTitulo: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  certTituloLine: { height: '2px', background: '#c8e6c9', width: '40px', flexShrink: 0 },
  certTituloTxt: { fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: '#1a4d2e', fontWeight: 'normal', textAlign: 'center', flex: 1, letterSpacing: '0.5px' },
  certIntro: { fontSize: '0.85rem', color: '#555', lineHeight: 1.7, marginBottom: '28px', textAlign: 'justify' },

  // Secciones
  seccion: { marginBottom: '24px' },
  seccionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  seccionLine: { height: '1px', background: '#e0e0e0', width: '20px' },
  seccionTitulo: { fontSize: '0.78rem', fontWeight: '700', color: '#1a4d2e', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' },
  seccionBody: { background: '#f9fafb', borderRadius: '8px', padding: '14px 18px', border: '1px solid #e8efe8' },
  fila: { display: 'flex', gap: '8px', padding: '6px 0', borderBottom: '1px solid #f0f0f0' },
  filaLabel: { fontSize: '0.82rem', color: '#888', minWidth: '200px', flexShrink: 0 },
  filaValor: { fontSize: '0.88rem', color: '#1a1a1a', fontWeight: '500', textTransform: 'capitalize' },

  // Concepto
  conceptoBox: { marginTop: '10px', background: 'white', borderRadius: '8px', padding: '12px 14px', border: '1px solid #e8efe8' },
  conceptoLabel: { fontSize: '0.72rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: '4px' },
  conceptoTxt: { fontSize: '0.85rem', color: '#555', fontStyle: 'italic', lineHeight: 1.6 },

  // Resultado
  resultadoBox: { background: '#dcfce7', border: '2px solid #86efac', borderRadius: '12px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', margin: '28px 0' },
  resultadoCheck: { fontSize: '2.5rem', lineHeight: 1, flexShrink: 0 },
  resultadoTitulo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.3rem', color: '#14532d', marginBottom: '4px' },
  resultadoSub: { fontSize: '0.85rem', color: '#166534' },

  // Firmas
  firmasRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', margin: '32px 0 24px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' },
  firmaBox: { textAlign: 'center' },
  firmaLinea: { height: '1px', background: '#333', margin: '0 20px 8px' },
  firmaTitulo: { fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' },
  firmaNombre: { fontSize: '0.88rem', color: '#333', fontWeight: '600', marginTop: '2px' },

  // Footer
  certFooter: { textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #e8efe8' },
}
