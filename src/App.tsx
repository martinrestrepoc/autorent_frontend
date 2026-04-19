import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import VehiclesCreatePage from "./pages/VehiclesCreatePage";
import VehiclesEditPage from "./pages/VehiclesEditPage";
import ClientsPage from "./pages/ClientsPage";
import ClientsCreatePage from "./pages/ClientsCreatePage";
import VehiclesPage from "./pages/VehiclesPage";
import RentalsCreatePage from "./pages/RentalsCreatePage";
import RentalsPage from "./pages/RentalsPage";
import RentalsHistoryPage from "./pages/RentalsHistoryPage";
import { RequireAuth } from "./auth/RequireAuth";
import AdminLayout from "./layout/AdminLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/vehicles/new" element={<VehiclesCreatePage />} />
        <Route path="/vehicles/:id/edit" element={<VehiclesEditPage />} />
        <Route path="/vehicles/:id/rentals" element={<RentalsHistoryPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/new" element={<ClientsCreatePage />} />
        <Route path="/rentals" element={<RentalsPage />} />
        <Route path="/rentals/new" element={<RentalsCreatePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
