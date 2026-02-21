// src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import Login from "../auth/Login";
import Register from "../auth/Register";
import Admin from "../components/Admin";
import PatientRegistrationForm from "../components/PatientRegistrationForm";
import { ROLES } from "../constants/roles";
import PatientsList from "../components/PatientsList";
import PatientEdit from "../components/PatientEdit";

export default function AppRoutes({ user }) {
  const role = user?.role; // ✅ SAFE

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" /> : <Register />}
        />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard role={role} /> : <Navigate to="/login" />}
        />

        <Route
          path="/admin"
          element={
            user && role === ROLES.ADMIN ? (
              <Admin />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        <Route
          path="/patients/new"
          element={
            user && role === ROLES.ADMIN ? (
              <PatientRegistrationForm />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/patients"
          element={user ? <PatientsList /> : <Navigate to="/login" />}
        />

        <Route
  path="/patients/:id/edit"
  element={user ? <PatientEdit user={user} /> : <Navigate to="/login" />}
/>
      </Routes>
    </BrowserRouter>
  );
}
