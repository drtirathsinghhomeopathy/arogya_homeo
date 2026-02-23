import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import { COLLECTIONS } from "../constants/firestore";
import { auth, db } from "../auth/firebase";

export default function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const uid = auth.currentUser?.uid;

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    const q = query(
      collection(db, COLLECTIONS.PATIENTS),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    setPatients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  const filtered = patients.filter((p) =>
    `${p.Name} ${p.Mobile}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Patients
          <span className="ml-2 text-sm text-gray-500 font-normal">
            ({filtered.length})
          </span>
        </h1>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name or mobile"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200
              bg-white shadow-sm
              focus:outline-none focus:ring-2 focus:ring-green-500
              transition"
          />

          {/* Search icon */}
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2
                text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="text-gray-600">
              <th className="p-4 text-left font-medium">Patient</th>
              <th className="p-4 text-left font-medium">Age</th>
              <th className="p-4 text-left font-medium">Mobile</th>
              <th className="p-4 text-left font-medium">Clinic</th>
              <th className="p-4 text-right font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => {
              const locked = p.editingBy && p.editingBy !== uid;

              return (
                <tr
                  key={p.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium text-gray-800">
                    {p.Name}
                  </td>
                  <td className="p-4">{p.Age}</td>
                  <td className="p-4">{p.Mobile}</td>
                  <td className="p-4">{p.Clinic}</td>
                  <td className="p-4 text-right">
                    {locked ? (
                      <span className="inline-flex items-center gap-1
                        px-3 py-1 rounded-full text-xs
                        bg-gray-100 text-gray-500">
                        🔒 Locked
                      </span>
                    ) : (
                      <Link
                        to={`/patients/${p.id}/edit`}
                        className="inline-flex items-center gap-1
                          px-4 py-1.5 rounded-full text-sm
                          bg-green-600 text-white
                          hover:bg-green-700 transition"
                      >
                        Edit →
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filtered.map((p) => {
          const locked = p.editingBy && p.editingBy !== uid;

          return (
            <div
              key={p.id}
              className="bg-white rounded-xl border shadow-sm p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-lg">{p.Name}</h2>
                  <p className="text-sm text-gray-500">{p.Clinic}</p>
                </div>

                {locked ? (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                    🔒 Locked
                  </span>
                ) : (
                  <Link
                    to={`/patients/${p.id}/edit`}
                    className="text-sm text-green-600 font-medium"
                  >
                    Edit →
                  </Link>
                )}
              </div>

              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Age:</span> {p.Age}</p>
                <p><span className="font-medium">Mobile:</span> {p.Mobile}</p>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center mt-10 text-gray-500">
          No patients found
        </p>
      )}
    </div>
  );
}