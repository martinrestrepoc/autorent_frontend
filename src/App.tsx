import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import VehiclesCreatePage from "./pages/VehiclesCreatePage";
import { RequireAuth } from "./auth/RequireAuth";

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
    </Routes>
  );
}