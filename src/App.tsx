import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import VehiclesCreatePage from "./pages/VehiclesCreatePage";
import VehiclesEditPage from "./pages/VehiclesEditPage";
import VehiclesDocumentsPage from "./pages/VehiclesDocumentsPage";
import { RequireAuth } from "./auth/RequireAuth";
import ClientsPage from "./pages/ClientsPage";
import ClientsCreatePage from "./pages/ClientsCreatePage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />

      <Route
        path="/vehicles/new"
        element={
          <RequireAuth>
            <VehiclesCreatePage />
          </RequireAuth>
        }
      />

      <Route
        path="/vehicles/:id/edit"
        element={
          <RequireAuth>
            <VehiclesEditPage />
          </RequireAuth>
        }
      />

<Route path="/clients" element={<ClientsPage />} />
<Route path="/clients/new" element={<ClientsCreatePage />} />
      <Route
        path="/vehicles/:id/documents"
        element={
          <RequireAuth>
            <VehiclesDocumentsPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
