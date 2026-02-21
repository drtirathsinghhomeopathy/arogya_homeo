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
      orderBy("createdAt", "desc"),
    );

    const snap = await getDocs(q);
    setPatients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  const filtered = patients.filter((p) =>
    `${p.Name} ${p.Mobile}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Patients</h1>

      <input
        placeholder="Search by name or mobile"
        className="border p-2 rounded w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Age</th>
              <th className="p-2 border">Mobile</th>
              <th className="p-2 border">Clinic</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => {
              const locked = p.editingBy && p.editingBy !== uid;

              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{p.Name}</td>
                  <td className="p-2 border">{p.Age}</td>
                  <td className="p-2 border">{p.Mobile}</td>
                  <td className="p-2 border">{p.Clinic}</td>

                  <td className="p-2 border space-x-2">
                    {locked ? (
                      <span className="text-gray-400 text-sm">Locked</span>
                    ) : (
                      <Link
                        to={`/patients/${p.id}/edit`}
                        className="text-green-600 underline"
                      >
                        <button className="text-blue-600 hover:text-blue-800">
                          📝
                        </button>
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center mt-4 text-gray-500">No patients found</p>
        )}
      </div>
    </div>
  );
}
