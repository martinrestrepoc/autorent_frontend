import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

import VehiclesCreatePage from "./pages/VehiclesCreatePage";
import VehiclesEditPage from "./pages/VehiclesEditPage";
import VehiclesDocumentsPage from "./pages/VehiclesDocumentsPage";

import ClientsPage from "./pages/ClientsPage";
import ClientsCreatePage from "./pages/ClientsCreatePage";
import VehiclesPage from "./pages/VehiclesPage";

import RentalsCreatePage from "./pages/RentalsCreatePage";

import { RequireAuth } from "./auth/RequireAuth";
import AdminLayout from "./layout/AdminLayout";

import RentalsPage from "./pages/RentalsPage";


export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected area */}
      <Route
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<DashboardPage />} />

        {/* Vehicles */}
        <Route path="/vehicles/new" element={<VehiclesCreatePage />} />
        <Route path="/vehicles/:id/edit" element={<VehiclesEditPage />} />
        <Route path="/vehicles/:id/documents" element={<VehiclesDocumentsPage />} />

        {/* Clients */}
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/new" element={<ClientsCreatePage />} />

        {/* Rentals */}
        <Route path="/rentals" element={<RentalsPage />} />
        <Route path="/rentals/new" element={<RentalsCreatePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}