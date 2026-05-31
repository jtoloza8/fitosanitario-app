export default function Footer() {
  return (
    <footer style={s.footerMain}>
      <div style={s.footerColumns}>

        {/* Columna 1: Logo y Contacto */}
        <div style={s.footerCol}>
          <div style={s.footerLogo}>UdiFica</div>
          <p style={s.footerInfoText}>Sistema de Gestión Fitosanitaria</p>
          <a href="https://www.ica.gov.co" target="_blank" rel="noopener noreferrer" style={s.icaBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Visitar sitio oficial ICA
          </a>
          <div style={s.contactItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 18.92z"></path></svg>
            <span>+57 (601) 332 3700</span>
          </div>
          <div style={s.contactItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <span>contacto@ica.gov.co</span>
          </div>
        </div>

        {/* Columna 2: Enlaces */}
        <div style={s.footerCol}>
          <h4 style={s.footerColTitle}>ENLACES</h4>
          <div style={s.footerLinkList}>
            <a href="https://www.ica.gov.co" target="_blank" rel="noopener noreferrer" style={s.footerLink}>
              Sitio oficial ICA
            </a>
            <a href="https://www.ica.gov.co/normatividad" target="_blank" rel="noopener noreferrer" style={s.footerLink}>
              Normatividad ICA
            </a>
            <a href="https://www.ica.gov.co/servicios" target="_blank" rel="noopener noreferrer" style={s.footerLink}>
              Servicios en línea ICA
            </a>
            <a href="mailto:contacto@ica.gov.co" style={s.footerLink}>
              Soporte Técnico
            </a>
          </div>
        </div>

        {/* Columna 3: Soporte */}
        <div style={s.footerCol}>
          <h4 style={s.footerColTitle}>SOPORTE</h4>
          <p style={s.footerText}>
            Para asistencia técnica sobre el uso de la plataforma, por favor comuníquese con la mesa de ayuda institucional del ICA.
          </p>
          <div style={s.statusBadge}>
            <div style={s.statusDot}></div>
            <span>Servidores activos</span>
          </div>
          <p style={s.footerTextSmall}>
            Plataforma desarrollada en cumplimiento de la normativa fitosanitaria colombiana bajo supervisión del ICA.
          </p>
        </div>
      </div>

      {/* Barra inferior copyright */}
      <div style={s.footerBottom}>
        <p>
          © {new Date().getFullYear()} UdiFica — Sistema Fitosanitario ICA. Todos los derechos reservados. &nbsp;|&nbsp;{' '}
          <a href="https://www.ica.gov.co" target="_blank" rel="noopener noreferrer" style={s.footerBottomLink}>
            Instituto Colombiano Agropecuario (ICA)
          </a>
        </p>
      </div>
    </footer>
  )
}

const s = {
  footerMain: { background: '#143420', color: 'white', marginTop: '60px', width: '100%' },
  footerColumns: {
    maxWidth: '1200px', margin: '0 auto', padding: '60px 40px',
    display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '60px',
  },
  footerCol: { display: 'flex', flexDirection: 'column', gap: '18px' },
  footerLogo: { fontFamily: "'DM Serif Display', serif", fontSize: '1.8rem', letterSpacing: '1px' },
  footerInfoText: { color: '#a5d6a7', fontSize: '0.9rem', marginTop: '-6px' },
  icaBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'rgba(165,214,167,0.15)', border: '1px solid rgba(165,214,167,0.3)',
    color: '#a5d6a7', padding: '6px 14px', borderRadius: '50px',
    fontSize: '0.8rem', fontWeight: '600', textDecoration: 'none',
    width: 'fit-content', transition: 'background 0.2s',
  },
  contactItem: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: '#ccc' },
  footerColTitle: { fontSize: '0.9rem', letterSpacing: '2px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' },
  footerLinkList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  footerLink: { color: '#aaa', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' },
  footerText: { color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6' },
  footerTextSmall: { color: '#666', fontSize: '0.8rem', lineHeight: '1.5', marginTop: '4px' },
  statusBadge: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(255,255,255,0.05)', padding: '8px 15px',
    borderRadius: '50px', width: 'fit-content', fontSize: '0.8rem', color: '#a5d6a7',
  },
  statusDot: { width: '8px', height: '8px', background: '#4caf50', borderRadius: '50%', boxShadow: '0 0 10px #4caf50' },
  footerBottom: {
    background: '#0d2114', padding: '22px 40px', textAlign: 'center',
    fontSize: '0.85rem', color: '#555', borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  footerBottomLink: { color: '#a5d6a7', textDecoration: 'none' },
}
