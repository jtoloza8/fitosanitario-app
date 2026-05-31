import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Mapa de solo lectura para mostrar la ubicación de una finca.
// scrollWheelZoom desactivado para no interferir con el scroll de la página.
export default function MapaFinca({ latitud, longitud, nombre, municipio, departamento, altura = 220 }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Si no hay coordenadas no montamos el mapa
    const lat = parseFloat(latitud)
    const lng = parseFloat(longitud)
    if (!latitud || !longitud || isNaN(lat) || isNaN(lng)) return

    // Destruir mapa anterior si existe
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      dragging: true,
    }).setView([lat, lng], 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // Marcador con divIcon (evita problemas con rutas de assets en Vite)
    const icono = L.divIcon({
      html: '<div style="font-size:2rem;line-height:1;filter:drop-shadow(0 2px 5px rgba(0,0,0,0.45))">📍</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      className: '',
    })

    L.marker([lat, lng], { icon: icono })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:'DM Sans',sans-serif;min-width:140px">
          <strong style="color:#1a4d2e;font-size:0.92rem">${nombre || 'Finca'}</strong>
          <br><span style="font-size:0.8rem;color:#666">${municipio || ''}, ${departamento || ''}</span>
          <br><span style="font-size:0.72rem;color:#aaa;font-family:monospace">${lat.toFixed(5)}, ${lng.toFixed(5)}</span>
        </div>`,
        { maxWidth: 220 }
      )
      .openPopup()

    mapRef.current = map

    // Asegurar tamaño correcto si el contenedor acaba de aparecer
    setTimeout(() => map.invalidateSize(), 120)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [latitud, longitud, nombre, municipio, departamento])

  // Sin coordenadas: placeholder
  if (!latitud || !longitud) {
    return (
      <div style={{
        height: altura, borderRadius: '12px', background: '#f8faf8',
        border: '2px dashed #dde8dd', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}>
        <span style={{ fontSize: '2rem', opacity: 0.4 }}>🗺️</span>
        <p style={{ fontSize: '0.8rem', color: '#bbb', textAlign: 'center', lineHeight: 1.4 }}>
          Sin ubicación GPS<br />registrada para esta finca
        </p>
      </div>
    )
  }

  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #dde8dd', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
      <div ref={containerRef} style={{ height: altura, width: '100%' }} />
      <div style={{
        background: '#1a4d2e', padding: '6px 12px',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>📍</span>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace' }}>
          {parseFloat(latitud).toFixed(5)}, {parseFloat(longitud).toFixed(5)}
        </span>
        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginLeft: 'auto' }}>
          {municipio}, {departamento}
        </span>
      </div>
    </div>
  )
}
