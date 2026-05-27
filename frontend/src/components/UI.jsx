// Componentes UI compartidos UdiFica
// Importa desde '../components/UI' en cada página.
import React from 'react'
import { useNavigate } from 'react-router-dom'

/* -------------------- Iconos -------------------- */
const ICON_PATHS = {
  'leaf':       <><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c.43 7.45-2 12.96-5 15.74A7.04 7.04 0 0 1 11 20Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></>,
  'sprout':     <><path d="M7 20h10"/><path d="M10 20c5.5-2.5 9.5-9 9.5-15-5.5 0-9.5 4-9.5 9V20Z"/><path d="M10 20c0-3-3-5.5-6.5-6 0 3 1.5 5 6.5 6Z"/></>,
  'home':       <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/></>,
  'user':       <><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></>,
  'users':      <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  'mail':       <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></>,
  'lock':       <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
  'eye':        <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
  'eye-off':    <><path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-6.5 0-10-7-10-7a17.69 17.69 0 0 1 4.06-5.06"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a17.4 17.4 0 0 1-2.16 3.19"/><path d="m9.88 9.88-.61.61a3 3 0 0 0 4.24 4.24l.61-.61"/><path d="M2 2l20 20"/></>,
  'arrow-right':<path d="M5 12h14M13 5l7 7-7 7"/>,
  'arrow-left': <path d="M19 12H5M12 19l-7-7 7-7"/>,
  'chevron-right': <path d="m9 18 6-6-6-6"/>,
  'chevron-down': <path d="m6 9 6 6 6-6"/>,
  'plus':       <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  'close':      <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
  'check':      <path d="M20 6 9 17l-5-5"/>,
  'check-circle':<><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></>,
  'alert':      <><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></>,
  'calendar':   <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
  'clock':      <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
  'pin':        <><path d="M12 22s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12Z"/><circle cx="12" cy="10" r="3"/></>,
  'search':     <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
  'filter':     <path d="M3 6h18M7 12h10M10 18h4"/>,
  'logout':     <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></>,
  'clipboard':  <><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></>,
  'file':       <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
  'image':      <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></>,
  'send':       <><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></>,
  'phone':      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.35 1.84.59 2.8.72A2 2 0 0 1 22 16.92Z"/>,
  'arrow-up-right': <><path d="M7 17 17 7"/><path d="M7 7h10v10"/></>,
  'shield-check':<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
  'map':        <><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2Z"/><path d="M9 4v16M15 6v16"/></>,
}

export function Icon({ name, className = 'udi-icon', ...rest }) {
  const paths = ICON_PATHS[name]
  if (!paths) return null
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {paths}
    </svg>
  )
}

/* -------------------- Logo -------------------- */
export function Logo({ size = 28, variant = 'light' }) {
  const fg = variant === 'light' ? '#fff' : 'var(--green-800)'
  const accent = variant === 'light' ? 'var(--gold-300)' : 'var(--gold-500)'
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 3C9 3 5 9 5 16c0 6 4 11 11 13 7-2 11-7 11-13 0-7-4-13-11-13Z" fill={fg} opacity="0.95"/>
      <path d="M11 17c3 0 5-2 5-5 0 5 3 8 7 8-3 0-5 2-5 5 0-5-3-8-7-8Z" fill={accent}/>
    </svg>
  )
}

/* -------------------- Botones -------------------- */
export function Btn({ kind = 'primary', size, icon, iconRight, children, className = '', ...rest }) {
  const cls = ['udi-btn', `udi-btn-${kind}`, size && `udi-btn-${size}`, className].filter(Boolean).join(' ')
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} className="udi-icon-sm" />}
      {children}
      {iconRight && <Icon name={iconRight} className="udi-icon-sm" />}
    </button>
  )
}

/* -------------------- Form helpers -------------------- */
export function Field({ label, hint, error, children }) {
  return (
    <div className="udi-field">
      {label && <label className="udi-field-label">{label}</label>}
      {children}
      {error ? <span className="udi-field-hint" style={{ color: 'var(--err-fg)' }}>{error}</span>
        : hint ? <span className="udi-field-hint">{hint}</span> : null}
    </div>
  )
}

export function Input({ icon, ...rest }) {
  if (!icon) return <input className="udi-input" {...rest} />
  return (
    <div style={{ position: 'relative' }}>
      <Icon name={icon} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }} />
      <input className="udi-input" style={{ paddingLeft: 42 }} {...rest} />
    </div>
  )
}

export function PasswordInput({ value, onChange, ...rest }) {
  const [show, setShow] = React.useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <Icon name="lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }} />
      <input className="udi-input" type={show ? 'text' : 'password'} value={value} onChange={onChange}
        style={{ paddingLeft: 42, paddingRight: 44 }} {...rest} />
      <button type="button" onClick={() => setShow(!show)} tabIndex={-1}
        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'var(--ink-500)', display: 'flex' }}>
        <Icon name={show ? 'eye-off' : 'eye'} />
      </button>
    </div>
  )
}

/* -------------------- Badge -------------------- */
export function Badge({ kind = 'default', dot, children, style }) {
  const cls = ['udi-badge', kind !== 'default' && `udi-badge-${kind}`, dot && 'udi-badge-dot'].filter(Boolean).join(' ')
  return <span className={cls} style={style}>{children}</span>
}

/* -------------------- Avatar -------------------- */
export function Avatar({ name, size = 36, bg = 'var(--green-700)' }) {
  const initials = (name || '?').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="udi-avatar" style={{ width: size, height: size, fontSize: size * 0.36, background: bg }}>
      {initials}
    </div>
  )
}

/* -------------------- TopBar -------------------- */
export function TopBar({ variant = 'dark', actions, backTo }) {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const rol = localStorage.getItem('rol') || 'Usuario'
  const name = usuario.nombre_completo || usuario.nombre || 'Usuario'

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  const isLight = variant === 'light'
  return (
    <header className="udi-topbar" style={isLight ? {
      background: 'white', color: 'var(--ink-900)', borderBottom: '1px solid var(--ink-100)'
    } : null}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {backTo && (
          <button onClick={() => navigate(backTo)} className="udi-btn udi-btn-icon udi-btn-ghost"
            style={isLight ? null : { color: 'white' }}>
            <Icon name="arrow-left" className="udi-icon-sm" />
          </button>
        )}
        <Logo size={28} variant={isLight ? 'dark' : 'light'} />
        <span className="brand" style={isLight ? { color: 'var(--green-900)' } : null}>
          UdiFica
          <small style={isLight ? { color: 'var(--ink-500)', borderLeftColor: 'var(--ink-200)' } : null}>Sistema ICA</small>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {actions}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 4px 0 12px',
          borderLeft: isLight ? '1px solid var(--ink-200)' : '1px solid rgba(255,255,255,0.18)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isLight ? 'var(--ink-900)' : 'white' }}>{name.split(' ').slice(0, 2).join(' ')}</span>
            <span style={{ fontSize: '0.7rem', color: isLight ? 'var(--ink-500)' : 'rgba(255,255,255,0.6)' }}>{rol}</span>
          </div>
          <Avatar name={name} size={36} bg={isLight ? 'var(--green-800)' : 'var(--green-600)'} />
          <button onClick={logout} className="udi-btn udi-btn-icon udi-btn-ghost" title="Cerrar sesión"
            style={isLight ? null : { color: 'rgba(255,255,255,0.7)' }}>
            <Icon name="logout" className="udi-icon-sm" />
          </button>
        </div>
      </div>
    </header>
  )
}

/* -------------------- Stat card -------------------- */
export function Stat({ value, label, color = 'var(--green-800)', bg = 'var(--green-50)', icon, trend }) {
  return (
    <div className="udi-card udi-card-padded" style={{ background: bg, border: 'none', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="eyebrow" style={{ color }}>{label}</span>
        {icon && <Icon name={icon} className="udi-icon" style={{ color, opacity: 0.6 }} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span className="num" style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', lineHeight: 1, color }}>{value}</span>
        {trend && <span style={{ fontSize: '0.78rem', fontWeight: 600, color: trend.startsWith('+') ? 'var(--ok-fg)' : 'var(--err-fg)' }}>{trend}</span>}
      </div>
    </div>
  )
}

/* -------------------- Message Toast -------------------- */
export function Toast({ kind = 'ok', children, onClose }) {
  if (!children) return null
  const styles = {
    ok: { bg: 'var(--ok-bg)', fg: 'var(--ok-fg)', icon: 'check-circle' },
    err: { bg: 'var(--err-bg)', fg: 'var(--err-fg)', icon: 'alert' },
    warn: { bg: 'var(--warn-bg)', fg: 'var(--warn-fg)', icon: 'alert' },
    info: { bg: 'var(--info-bg)', fg: 'var(--info-fg)', icon: 'alert' },
  }[kind]
  return (
    <div style={{
      background: styles.bg, color: styles.fg,
      padding: '14px 18px', borderRadius: 'var(--r-md)',
      marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.9rem',
    }}>
      <Icon name={styles.icon} className="udi-icon-sm" />
      <span style={{ flex: 1 }}>{children}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, display: 'flex' }}>
          <Icon name="close" className="udi-icon-sm" />
        </button>
      )}
    </div>
  )
}

/* -------------------- Page wrapper -------------------- */
export function Page({ children, bg = 'var(--bg)' }) {
  return (
    <div className="udi" style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  )
}

/* -------------------- Container -------------------- */
export function Container({ children, maxWidth = 1200, style }) {
  return (
    <div style={{ maxWidth, margin: '0 auto', padding: '32px 32px', width: '100%', ...style }}>
      {children}
    </div>
  )
}

/* -------------------- Empty state -------------------- */
export function EmptyState({ icon = 'sprout', title, subtitle, action }) {
  return (
    <div style={{
      textAlign: 'center', padding: '80px 40px',
      background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--ink-100)',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'var(--green-50)', color: 'var(--green-700)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18,
      }}>
        <Icon name={icon} className="udi-icon-lg" />
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--green-900)', marginBottom: 8 }}>{title}</h2>
      {subtitle && <p style={{ color: 'var(--ink-500)', marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>{subtitle}</p>}
      {action}
    </div>
  )
}

/* -------------------- Calendar -------------------- */
const MES_LARGO = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const ymdKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const parseFecha = (str) => {
  // Acepta '2026-05-22', '2026-05-22T...', Date
  if (!str) return null
  if (str instanceof Date) return str
  const s = String(str).slice(0, 10)
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

/**
 * Calendar
 *   visits: array de objetos con { fecha, id_visita_inspeccion?, nombre_lugar?, estado? }
 *   onSelectDay(date, visitsOfDay): callback al click
 *   selectedDay: Date | null
 */
export function Calendar({ visits = [], onSelectDay, selectedDay }) {
  const [cursor, setCursor] = React.useState(() => {
    const d = new Date(); d.setDate(1); return d
  })

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const todayKey = ymdKey(today)

  // Mapa de visitas por día
  const byDay = React.useMemo(() => {
    const m = {}
    visits.forEach(v => {
      const f = parseFecha(v.fecha)
      if (!f) return
      const k = ymdKey(f)
      if (!m[k]) m[k] = []
      m[k].push(v)
    })
    return m
  }, [visits])

  // Construir grid de 6 filas × 7 cols
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const primero = new Date(year, month, 1)
  // Lunes = 0, Domingo = 6
  const offset = (primero.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < offset; i++) {
    const d = new Date(year, month, -(offset - i - 1))
    cells.push({ date: d, outside: true })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: new Date(year, month, i), outside: false })
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date
    const d = new Date(last); d.setDate(d.getDate() + 1)
    cells.push({ date: d, outside: true })
  }

  const goPrev = () => setCursor(new Date(year, month - 1, 1))
  const goNext = () => setCursor(new Date(year, month + 1, 1))
  const goToday = () => { const d = new Date(); d.setDate(1); setCursor(d) }

  const selKey = selectedDay ? ymdKey(selectedDay) : null

  return (
    <div className="udi-card" style={{ padding: 20, background: 'white', border: '1px solid var(--green-100)' }}>
      {/* Header del mes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--green-900)', lineHeight: 1, textTransform: 'capitalize' }}>
            {MES_LARGO[month]} <span style={{ color: 'var(--ink-400)' }}>{year}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)', marginTop: 4 }}>
            {visits.length} {visits.length === 1 ? 'visita programada' : 'visitas programadas'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={goToday} className="udi-btn udi-btn-ghost udi-btn-sm"
            style={{ padding: '6px 12px', fontWeight: 600, color: 'var(--green-700)' }}>
            Hoy
          </button>
          <button onClick={goPrev} className="udi-btn udi-btn-icon udi-btn-ghost"
            style={{ minWidth: 36, minHeight: 36 }}>
            <Icon name="arrow-left" className="udi-icon-sm" />
          </button>
          <button onClick={goNext} className="udi-btn udi-btn-icon udi-btn-ghost"
            style={{ minWidth: 36, minHeight: 36 }}>
            <Icon name="arrow-right" className="udi-icon-sm" />
          </button>
        </div>
      </div>

      {/* Header de días */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {DIAS_CORTOS.map(d => (
          <div key={d} style={{
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: 'var(--ink-500)', textAlign: 'center', padding: '4px 0',
          }}>{d}</div>
        ))}
      </div>

      {/* Grid de días */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((c, i) => {
          const k = ymdKey(c.date)
          const vs = byDay[k] || []
          const isToday = k === todayKey
          const isSelected = k === selKey
          const hasVisits = vs.length > 0
          return (
            <button key={i}
              onClick={() => onSelectDay && onSelectDay(c.date, vs)}
              style={{
                aspectRatio: '1', minHeight: 64,
                padding: '6px 8px', borderRadius: 10,
                border: isToday ? '2px solid var(--green-600)' : '1px solid transparent',
                background: isSelected
                  ? 'var(--green-700)'
                  : hasVisits && !c.outside
                    ? 'var(--green-50)'
                    : 'transparent',
                color: isSelected ? 'white' : c.outside ? 'var(--ink-300)' : 'var(--ink-900)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'flex-start', justifyContent: 'space-between',
                fontFamily: 'inherit',
                transition: 'all 0.12s',
              }}>
              <span style={{
                fontSize: isToday ? '1.05rem' : '0.92rem',
                fontWeight: isToday ? 700 : 500,
                fontFamily: isToday ? 'var(--font-display)' : 'inherit',
                color: isSelected ? 'white' : isToday ? 'var(--green-700)' : c.outside ? 'var(--ink-300)' : 'var(--ink-900)',
              }}>
                {c.date.getDate()}
              </span>
              {hasVisits && !c.outside && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, alignSelf: 'flex-end' }}>
                  {vs.length === 1 ? (
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: isSelected ? 'white' : 'var(--green-600)',
                    }} />
                  ) : (
                    <span style={{
                      padding: '1px 6px', borderRadius: 999,
                      fontSize: '0.65rem', fontWeight: 700,
                      background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--green-700)',
                      color: 'white',
                    }}>
                      {vs.length}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
