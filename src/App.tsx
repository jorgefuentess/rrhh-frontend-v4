import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './views/Home'
import Servicios from './views/Servicios'
import Usuarios from './views/Users'
import Licencias from './views/Licencias'
import AuthUsers from './views/AuthUsers'
import Personas from './views/Personas'   // 👈 IMPORTANTE: nuevo import

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/personas" element={<Personas />} /> {/* 👈 nueva ruta */}
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/licencias" element={<Licencias />} />
          <Route path="/authusers" element={<AuthUsers />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}