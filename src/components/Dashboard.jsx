// src/components/Dashboard.jsx
import { Link } from "react-router-dom";
import { ROLES } from "../constants/roles";

export default function Dashboard({ role }) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>

      <ul className="mb-4">
        <li>
          <Link to="/patients"
          
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded"
              >
                View Patients</Link>
        </li>

        <li>
          {role === ROLES.ADMIN && (
            <Link
              to="/patients/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded"
            >
              Register Patient
            </Link>
          )}
        </li>
      </ul>

      <p>Role: {role}</p>
      {role === ROLES.USER && (
        <p className="text-gray-600">
          Welcome! You can view your appointments here.
        </p>
      )}
    </div>
  );
}
