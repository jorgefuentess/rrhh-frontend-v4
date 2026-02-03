import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../views/Home";
import Personas from "../views/Personas"; // ✅ agregado
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
          <ProtectedRoute>
            <DashboardLayout>
              <Personas />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/servicios"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Servicios />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ddjj"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DDJJ />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/licencias"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Licencias />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/auth-users"
        element={
          <ProtectedRoute roles={["admin"]}>
            <DashboardLayout>
              <AuthUsers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/milicencia"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MiLicencia />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/nodocente"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <NoDocente />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/servicionodocente"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ServicioNoDocente />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/novedadesdelmes"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <NovedadesDelMes />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
