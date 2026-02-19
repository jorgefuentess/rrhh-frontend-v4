import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../views/Home";
import Personas from "../views/Personas";
import Servicios from "../views/Servicios";
import DDJJ from "../views/DDJJ";
import Licencias from "../views/Licencias";
import AuthUsers from "../views/AuthUsers";
import Login from "../views/Login";
import ProtectedRoute from "../components/ProtectedRoute";
import MiLicencia from "../views/MiLicencia";
import NoDocente from "../views/NoDocente";
import ServicioNoDocente from "../views/ServicioNoDocente";
import NovedadesDelMes from "../views/NovedadesDelMes";
import { ROLES } from "../config/roles";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Home />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/personas"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SECRETARIO]}>
            <DashboardLayout>
              <Personas />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/servicios"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SECRETARIO]}>
            <DashboardLayout>
              <Servicios />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ddjj"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN, ROLES.DOCENTE]}>
            <DashboardLayout>
              <DDJJ />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/licencias"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SECRETARIO]}>
            <DashboardLayout>
              <Licencias />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/auth-users"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <DashboardLayout>
              <AuthUsers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/milicencia"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN, ROLES.DOCENTE]}>
            <DashboardLayout>
              <MiLicencia />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/nodocente"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SECRETARIO]}>
            <DashboardLayout>
              <NoDocente />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/servicionodocente"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN, ROLES.SECRETARIO]}>
            <DashboardLayout>
              <ServicioNoDocente />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/novedadesdelmes"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <DashboardLayout>
              <NovedadesDelMes />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
