// src/components/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../auth/firebase";
import { ROLES } from "../constants/roles";
import ClinicAddress from "./ClinicAddress";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Dashboard({ role }) {
  const [todayPatients, setTodayPatients] = useState([]);

  useEffect(() => {
    fetchTodayPatients();
  }, []);

  async function fetchTodayPatients() {
    const snap = await getDocs(collection(db, "followups"));

    const map = {};

    snap.docs.forEach((doc) => {
      const f = doc.data();
      const patientId = f.patientId;
      const createdAt = f.createdAt?.toDate?.();

      if (!createdAt) return;

      if (!map[patientId] || createdAt > map[patientId].createdAt) {
        map[patientId] = {
          patientId,
          patientName: f.patientName || "Unknown",
          createdAt,
        };
      }
    });

    const today = new Date();
    const todayString = today.toDateString();

    const filtered = Object.values(map).filter(
      (p) => p.createdAt.toDateString() === todayString
    );

    setTodayPatients(filtered);
  }

  // ✅ DOWNLOAD COMPLETE DATABASE
  async function downloadCompleteDatabase() {
  try {
    const patientsSnap = await getDocs(collection(db, "patients"));
    const followupsSnap = await getDocs(collection(db, "followups"));

    const patientsMap = {};
    const rows = [];

    // 1️⃣ Build Patients Map using Document ID
    patientsSnap.forEach((doc) => {
      const p = doc.data();

      patientsMap[doc.id] = {
        name: p.Name || "",
        age: p.Age || "",
        gender: p.Gender || "",
        mobile: p.Mobile || "",
        address: p.Address || "",
        medicalHistory: p.MedicalHistory || "",
      };
    });

    // 2️⃣ Combine Followups with Patients
    followupsSnap.forEach((doc) => {
      const f = doc.data();
      const patient = patientsMap[f.patientId];

      if (!patient) return; // safety check

      rows.push({
        Patient_Name: patient.name,
        Age: patient.age,
        Gender: patient.gender,
        Mobile: patient.mobile,
        Address: patient.address,
        FollowUp_Date:
          f.createdAt?.toDate?.().toLocaleDateString() || "",

        Complains: f.presentingComplains || "",
        Investigation: f.investigation || "",
        Medical_History: f.medicalHistory || "",
        Medicine: f.medicine || "",

        Bill_Amount: Number(f.bill) || 0,
        Paid_Amount: Number(f.paid) || 0,
      });
    });

    // 3️⃣ Sort by Date (Newest First)
    rows.sort((a, b) =>
      new Date(b.FollowUp_Date) - new Date(a.FollowUp_Date)
    );

    // 4️⃣ Create Excel
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Complete_Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(data, "Complete_Patient_Database.xlsx");

    alert("Database downloaded successfully ✅");
  } catch (error) {
    console.error("Download failed:", error);
    alert("Download failed ❌");
  }
}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8">
      {/* Role Badge */}
      <span
        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium w-fit ${
          role === ROLES.ADMIN
            ? "bg-red-100 text-red-700 ring-1 ring-red-200"
            : "bg-primary/10 text-primary ring-1 ring-primary/20"
        }`}
      >
        {role}
      </span>

      {role === ROLES.ADMIN && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT SIDE - Actions */}
          <div className="space-y-6">
            {/* View Patients */}
            <div className="p-4 sm:p-6 rounded-2xl border border-gray-100 bg-white shadow-md hover:shadow transition overflow-hidden">
              <div className="border-b border-gray-100 bg-gradient-to-r from-primary/5 to-primary/10 -mx-6 -mt-6 px-6 py-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Patients</h2>
                <p className="text-sm text-gray-500">View and manage registered patients</p>
              </div>
              <Link
                to="/patients"
                className="inline-block px-5 py-3 sm:py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition shadow-sm min-h-[48px] flex items-center touch-manipulation"
              >
                View Patients
              </Link>
            </div>

            {/* Register Patient */}
            <div className="p-4 sm:p-6 rounded-2xl border border-gray-100 bg-white shadow-md hover:shadow transition overflow-hidden">
              <div className="border-b border-gray-100 bg-gradient-to-r from-primary/5 to-primary/10 -mx-6 -mt-6 px-6 py-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Register New Patient</h2>
                <p className="text-sm text-gray-500">Add a new patient to the system</p>
              </div>
              <Link
                to="/patients/new"
                className="inline-block px-5 py-3 sm:py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition shadow-sm min-h-[48px] flex items-center touch-manipulation"
              >
                Register Patient
              </Link>
            </div>

            {/* Download Database Card */}
            <div className="p-4 sm:p-6 rounded-2xl border border-gray-100 bg-white shadow-md overflow-hidden">
              <div className="border-b border-gray-100 bg-gradient-to-r from-primary/5 to-primary/10 -mx-6 -mt-6 px-6 py-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Download Data</h2>
                <p className="text-sm text-gray-500">Download complete patient database with follow-ups</p>
              </div>
              <button
                onClick={downloadCompleteDatabase}
                className="px-5 py-3 sm:py-2.5 bg-primary/90 text-white rounded-lg font-medium hover:bg-primary transition shadow-sm min-h-[48px] touch-manipulation"
              >
                Download Complete Database
              </button>
            </div>
          </div>

          {/* RIGHT SIDE - Today's Patients */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-primary/10">
              <h2 className="text-lg font-semibold text-gray-800">
                Patients Seen Today ({todayPatients.length})
              </h2>
              <p className="text-sm text-gray-500">Recent visits today</p>
            </div>
            <div className="p-6">
              {todayPatients.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No patients seen today.
                </p>
              ) : (
                <div className="space-y-2">
                  {todayPatients.map((p) => (
                    <div
                      key={p.patientId}
                      className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:bg-primary/5 transition"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {p.patientName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {p.createdAt.toLocaleTimeString()}
                        </p>
                      </div>

                      <Link
                        to={`/patients/${p.patientId}/edit`}
                        className="text-sm text-primary font-medium hover:underline py-2 px-3 -mr-1 min-h-[44px] flex items-center touch-manipulation"
                      >
                        View →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {role === ROLES.USER && (
        <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 -mx-6 -mt-6 px-6 py-4 rounded-t-2xl">
            <h2 className="font-semibold text-gray-800">Welcome!</h2>
            <p className="text-sm text-gray-600">You can view your appointments and history here.</p>
          </div>
        </div>
      )}

      <ClinicAddress />
    </div>
  );
}