import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";
import { COLLECTIONS } from "../constants/firestore";
import { db } from "../auth/firebase";
import { useRowsPerPage } from "../utils/rowsPerPage";
import { MIN_ROWS, MAX_ROWS } from "../utils/rowsPerPage";

export default function PatientsList({ user }) {
  const [patients, setPatients] = useState([]);
  const [patientMeta, setPatientMeta] = useState({});
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, , handleRowsPerPageChange] = useRowsPerPage(user);


  useEffect(() => {
    fetchPatients();
    fetchBalances();
  }, []);

  /* Balance color helper */
  const getBalanceClass = (balance) => {
    if (balance < 0) return "text-red-600";
    if (balance > 0) return "text-primary";
    return "text-gray-500";
  };

  /* 🔹 Fetch balances + first/last visit */
  async function fetchBalances() {
    const snap = await getDocs(collection(db, "followups"));
    const metaMap = {};

    snap.docs.forEach((doc) => {
      const f = doc.data();
      const patientId = f.patientId;

      const bill = Number(f.bill || 0);
      const paid = Number(f.paid || 0);
      const createdAt = f.createdAt?.toDate?.() || null;

      if (!metaMap[patientId]) {
        metaMap[patientId] = {
          balance: 0,
          firstVisit: null,
          lastVisit: null,
        };
      }

      // Balance calculation
      metaMap[patientId].balance += paid - bill;

      if (createdAt) {
        // First Visit (earliest)
        if (
          !metaMap[patientId].firstVisit ||
          createdAt < metaMap[patientId].firstVisit
        ) {
          metaMap[patientId].firstVisit = createdAt;
        }

        // Last Visit (latest)
        if (
          !metaMap[patientId].lastVisit ||
          createdAt > metaMap[patientId].lastVisit
        ) {
          metaMap[patientId].lastVisit = createdAt;
        }
      }
    });

    setPatientMeta(metaMap);
  }

  /* 🔹 Fetch patients */
  async function fetchPatients() {
    const q = query(
      collection(db, COLLECTIONS.PATIENTS),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    setPatients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  const filtered = patients.filter((p) =>
    `${p.Name || ""} ${p.Mobile || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalRecords = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + rowsPerPage);

  const onRowsPerPageChange = (e) => {
    handleRowsPerPageChange(e);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Patients
            <span className="ml-2 text-sm text-gray-500 font-normal">
              ({filtered.length})
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Search and manage patient records</p>
        </div>

        <input
          type="text"
          placeholder="Search by name or mobile"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:max-w-sm pl-4 pr-4 py-3 sm:py-2.5 rounded-lg border border-gray-200
              bg-white shadow-sm text-base
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-200 text-gray-600">
              <th className="p-4 text-left font-medium">Patient</th>
              <th className="p-4 text-left font-medium">Age</th>
              <th className="p-4 text-left font-medium">Mobile</th>
              <th className="p-4 text-left font-medium">Clinic</th>
              <th className="p-4 text-right font-medium">Balance</th>
              <th className="p-4 text-left font-medium">First Visit</th>
              <th className="p-4 text-left font-medium">Last Visit</th>
              <th className="p-4 text-right font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((p) => {

              const meta = patientMeta[p.id] || {};
              const balance = meta.balance || 0;
              const firstVisit = meta.firstVisit;
              const lastVisit = meta.lastVisit;

              return (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-primary/5 transition">
                  <td className="p-4 font-medium text-gray-800">
                    {p.Name}
                  </td>
                  <td className="p-4">{p.Age}</td>
                  <td className="p-4">{p.Mobile}</td>
                  <td className="p-4">{p.Clinic}</td>
                  <td
                    className={`p-4 text-right font-semibold ${getBalanceClass(
                      balance
                    )}`}
                  >
                    ₹{Math.abs(balance)}
                  </td>
                  <td className="p-4 text-gray-600">
                    {firstVisit
                      ? firstVisit.toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-4 text-gray-600">
                    {lastVisit
                      ? lastVisit.toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-4 text-right">
                    {
                      <Link
                        to={`/patients/${p.id}/edit`}
                        className="px-4 py-2 rounded-lg text-sm font-medium
                          bg-primary text-white hover:bg-primary/90 transition"
                      >
                        Edit →
                      </Link>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {paginated.map((p) => {

          const meta = patientMeta[p.id] || {};
          const balance = meta.balance || 0;
          const firstVisit = meta.firstVisit;
          const lastVisit = meta.lastVisit;

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-md p-4 overflow-hidden"
            >
              <div className="border-b border-gray-100 pb-3 mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-lg text-gray-800">{p.Name}</h2>
                    <p className="text-sm text-gray-500">{p.Clinic}</p>
                  </div>

                  <Link
                    to={`/patients/${p.id}/edit`}
                    className="px-4 py-3 sm:py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 min-h-[44px] flex items-center touch-manipulation"
                  >
                    Edit →
                  </Link>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Age:</span> {p.Age}</p>
                <p><span className="font-medium">Mobile:</span> {p.Mobile}</p>
                <p>
                  <span className="font-medium">First Visit:</span>{" "}
                  {firstVisit
                    ? firstVisit.toLocaleDateString()
                    : "—"}
                </p>
                <p>
                  <span className="font-medium">Last Visit:</span>{" "}
                  {lastVisit
                    ? lastVisit.toLocaleDateString()
                    : "—"}
                </p>
                <p className={`font-semibold ${getBalanceClass(balance)}`}>
                  Balance: ₹{Math.abs(balance)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-12 text-center">
          <p className="text-gray-500 font-medium">No patients found</p>
          <p className="text-sm text-gray-400 mt-1">Try a different search or register a new patient</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="mt-4 sm:mt-6 p-4 sm:p-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 text-sm text-gray-600 bg-white rounded-2xl sm:bg-transparent border border-gray-100 sm:border-0 shadow-md sm:shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="order-2 sm:order-1">
              Showing {startIndex + 1}–
              {Math.min(startIndex + rowsPerPage, totalRecords)} of {totalRecords} patients
            </p>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <label htmlFor="rows-per-page" className="text-gray-600 whitespace-nowrap">
                Rows:
              </label>
              <input
                id="rows-per-page"
                type="number"
                min={MIN_ROWS}
                max={MAX_ROWS}
                value={rowsPerPage}
                onChange={onRowsPerPageChange}
                className="w-14 sm:w-16 px-2 py-2 rounded-lg border border-gray-200 bg-white text-center text-base
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px] touch-manipulation"
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-3 sm:py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-h-[44px] touch-manipulation font-medium"
            >
              Previous
            </button>
            <span className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 shrink-0">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-3 sm:py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-h-[44px] touch-manipulation font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}