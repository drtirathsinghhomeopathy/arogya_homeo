// src/components/Dashboard.jsx
import { Link } from "react-router-dom";
import { ROLES } from "../constants/roles";
import ClinicAddress from "./ClinicAddress";

export default function Dashboard({ role }) {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard
        </h1>

        <span
          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium w-fit ${
            role === ROLES.ADMIN
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {role}
        </span>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* View Patients */}
        {role === ROLES.ADMIN && (
        <div className="p-6 rounded-lg border bg-white shadow-sm hover:shadow transition">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Patients
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            View and manage registered patients.
          </p>
          <Link
            to="/patients"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View Patients
          </Link>
        </div>
        )}
        {/* Register Patient (ADMIN only) */}
        {role === ROLES.ADMIN && (
          <div className="p-6 rounded-lg border bg-white shadow-sm hover:shadow transition">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Register New Patient
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Add a new patient to the system.
            </p>
            <Link
              to="/patients/new"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Register Patient
            </Link>
          </div>
        )}
      </div>

      {/* USER Info */}
      {role === ROLES.USER && (
        <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-800">
          Welcome! You can view your appointments and history here.
        </div>
      )}

      {/* Clinic Addresses */}
      <div>
        <ClinicAddress />
      </div>
    </div>
  );
}