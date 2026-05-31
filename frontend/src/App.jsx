import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Registro from './pages/Registro'
import DashboardAdmin from './pages/admin/DashboardAdmin'
import GestionLugares from './pages/admin/GestionLugares'
import GestionInspecciones from './pages/admin/GestionInspecciones'
import CalendarioVisitas from './pages/inspector/CalendarioVisitas'
import RegistrarInforme from './pages/inspector/RegistrarInforme'
import MisLotes from './pages/productor/MisLotes'
import SolicitarInspeccion from './pages/productor/SolicitarInspeccion'
import AsignarInspector from './pages/admin/AsignarInspector'
import CrearInspector from './pages/admin/CrearInspector'
import GestionProductores from './pages/admin/GestionProductores'
import MisLotesDetalle from './pages/productor/MisLotes_Detalle'
import RegistrarLugar from './pages/productor/RegistrarLugar'
import MisInspecciones from './pages/productor/MisInspecciones'
import CertificadoInspeccion from './pages/productor/CertificadoInspeccion'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/admin/lugares" element={<GestionLugares />} />
        <Route path="/admin/inspecciones" element={<GestionInspecciones />} />
        <Route path="/inspector/calendario" element={<CalendarioVisitas />} />
        <Route path="/inspector/informe" element={<RegistrarInforme />} />
        <Route path="/productor/lotes" element={<MisLotes />} />
        <Route path="/admin/asignar" element={<AsignarInspector />} />
        <Route path="/productor/solicitar" element={<SolicitarInspeccion />} />
        <Route path="/admin/inspectores" element={<CrearInspector />} />
        <Route path="/admin/productores" element={<GestionProductores />} />
        <Route path="/productor/lotes/:id" element={<MisLotesDetalle />} />
        <Route path="/productor/registrar-lugar" element={<RegistrarLugar />} />
        <Route path="/productor/inspecciones" element={<MisInspecciones />} />
        <Route path="/productor/certificado/:id" element={<CertificadoInspeccion />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App