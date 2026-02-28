// src/components/PatientEdit.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "../auth/firebase";
import Field from "./Field";
import { useToast } from "../context/ToastContext";
import { TOAST_TYPES } from "../constants/toastTypes";
import { useRowsPerPage } from "../utils/rowsPerPage";
import SendMessage from "./SendMessage";

export default function PatientEdit({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [followups, setFollowups] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [followupCurrentPage, setFollowupCurrentPage] = useState(1);

  const [rowsPerPage, , handleRowsPerPageChange] = useRowsPerPage(user);

  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const [followForm, setFollowForm] = useState({
    presentingComplains: "",
    investigation: "",
    medicalHistory: "",
    medicine: "",
    bill: "",
    paid: "",
  });

  useEffect(() => {
    const fetchPatient = async () => {
      const ref = doc(db, "patients", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        showToast("Patient not found", TOAST_TYPES.ERROR);
        navigate("/dashboard");
        return;
      }

      const data = snap.data();

      if (data.editing?.by && data.editing.by !== user.uid) {
        showToast(
          "This record is currently being edited by another admin",
          TOAST_TYPES.WARNING,
        );
        navigate("/patients");
        return;
      }

      await updateDoc(ref, {
        editing: { by: user.uid, at: serverTimestamp() },
      });

      setPatient(data);
      setForm(data);

      // ✅ move loadFollowups logic here
      const q = query(
        collection(db, "followups"),
        where("patientId", "==", id),
      );

      const snapFollow = await getDocs(q);

      const followData = snapFollow.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      followData.sort(
        (a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0),
      );

      setFollowups(followData);

      const balance = followData.reduce(
        (sum, f) => sum + (Number(f.paid || 0) - Number(f.bill || 0)),
        0,
      );

      setTotalBalance(balance);

      setLoading(false);
    };

    fetchPatient();

    return async () => {
      const ref = doc(db, "patients", id);
      await updateDoc(ref, { editing: null });
    };
  }, [id, user.uid, navigate, showToast]);

  const loadFollowups = async () => {
    const q = query(collection(db, "followups"), where("patientId", "==", id));

    const snapFollow = await getDocs(q);

    const followData = snapFollow.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // Sort latest first
    followData.sort(
      (a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0),
    );

    setFollowups(followData);

    const balance = followData.reduce(
      (sum, f) => sum + (Number(f.paid || 0) - Number(f.bill || 0)),
      0,
    );

    setTotalBalance(balance);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const ref = doc(db, "patients", id);

    await updateDoc(ref, {
      ...form,
      editing: null,
      updatedAt: serverTimestamp(),
    });

    showToast("Patient updated successfully", TOAST_TYPES.SUCCESS);
    navigate("/patients");
  };

  const handleFollowChange = (e) => {
    const { name, value } = e.target;
    setFollowForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFollowup = async () => {
    await addDoc(collection(db, "followups"), {
      patientId: id,
      patientName: form.Name,
      ...followForm,
      bill: Number(followForm.bill || 0),
      paid: Number(followForm.paid || 0),
      createdAt: serverTimestamp(),
    });

    showToast("Follow-up added", TOAST_TYPES.SUCCESS);

    setShowFollowupModal(false);

    setFollowForm({
      presentingComplains: "",
      investigation: "",
      medicalHistory: "",
      medicine: "",
      bill: "",
      paid: "",
    });

    // await loadFollowups();
    navigate(`/patients`); // Refresh the page to show the new follow-up and reset pagination
  };

  useEffect(() => {
    setFollowupCurrentPage(1);
  }, [followups.length]);

  const followupTotalPages = Math.max(
    1,
    Math.ceil(followups.length / rowsPerPage),
  );
  const followupStartIndex = (followupCurrentPage - 1) * rowsPerPage;
  const paginatedFollowups = followups.slice(
    followupStartIndex,
    followupStartIndex + rowsPerPage,
  );

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading patient...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/patients")}
            className="p-3 -ml-1 rounded-lg hover:bg-white/80 transition-colors text-gray-600 hover:text-primary min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Back to patients"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Patient Details
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              View and edit patient information
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFollowupModal(true)}
            className="px-4 py-3 sm:py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium shadow-sm hover:shadow transition-all min-h-[44px] touch-manipulation"
          >
            Add Follow-Up
          </button>
          {showMessage && (
            <SendMessage
              patient={patient}
              onClose={() => setShowMessage(false)}
            />
          )}

          <button
            onClick={() => setShowMessage(true)}
            className="px-4 py-3 sm:py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium shadow-sm hover:shadow transition-all min-h-[44px] touch-manipulation"
          >
            Send Message
          </button>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-3 sm:py-2.5 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-medium transition-all min-h-[44px] touch-manipulation"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-3 sm:py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium shadow-sm hover:shadow transition-all min-h-[44px] touch-manipulation"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setForm(patient);
                  setEditing(false);
                }}
                className="px-4 py-3 sm:py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all min-h-[44px] touch-manipulation"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-primary/10">
          <h2 className="font-semibold text-gray-800">Personal Information</h2>
          <p className="text-sm text-gray-500">Basic patient details</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label="Patient Name"
              name="Name"
              value={form.Name || ""}
              disabled={!editing}
              onChange={handleChange}
            />
            <Field
              label="Age"
              name="Age"
              type="number"
              value={form.Age || ""}
              disabled={!editing}
              onChange={handleChange}
            />
            <Field
              label="Mobile"
              name="Mobile"
              value={form.Mobile || ""}
              disabled={!editing}
              onChange={handleChange}
            />
            <Field
              label="Clinic"
              name="Clinic"
              value={form.Clinic || ""}
              disabled={!editing}
              onChange={handleChange}
            />
            <Field
              label="Address"
              name="Address"
              as="textarea"
              rows={2}
              value={form.Address || ""}
              disabled={!editing}
              onChange={handleChange}
            />
            <Field
              label="Medical History"
              name="MedicalHistory"
              as="textarea"
              rows={3}
              value={form.MedicalHistory || ""}
              disabled={!editing}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Follow-Up Table */}
      {followups.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-primary/10 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:justify-between sm:items-center">
            <div>
              <h2 className="font-semibold text-gray-800">
                Patient Follow-Ups
              </h2>
              <p className="text-sm text-gray-500">
                {followups.length} visit(s) recorded
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-xl font-semibold text-sm shrink-0 ${
                totalBalance < 0
                  ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                  : totalBalance > 0
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              Balance: ₹{Math.abs(totalBalance)}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left py-3 px-6 font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-600">
                    Complains
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-600">
                    Investigation
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-600">
                    Medicine
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-600">
                    Bill
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-600">
                    Paid
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedFollowups.map((f, i) => (
                  <tr
                    key={f.id}
                    className={`border-b border-gray-100 hover:bg-primary/5 transition-colors ${
                      i % 2 === 1 ? "bg-gray-50/30" : ""
                    }`}
                  >
                    <td className="py-3 px-6 text-gray-600">
                      {f.createdAt?.toDate().toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6">{f.presentingComplains}</td>
                    <td className="py-3 px-6">{f.investigation}</td>
                    <td
                      className="py-3 px-6 max-w-[200px] truncate"
                      title={f.medicine}
                    >
                      {f.medicine}
                    </td>
                    <td className="py-3 px-6 font-medium text-gray-700">
                      ₹{f.bill}
                    </td>
                    <td className="py-3 px-6 font-medium text-gray-700">
                      ₹{f.paid}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-4 bg-gray-50/50">
            {paginatedFollowups.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-md p-4"
              >
                <div className="font-semibold text-gray-800 mb-3">
                  {f.createdAt?.toDate().toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600 space-y-1.5">
                  {f.presentingComplains && (
                    <p>
                      <span className="font-medium text-gray-700">
                        Complains:
                      </span>{" "}
                      {f.presentingComplains}
                    </p>
                  )}
                  {f.investigation && (
                    <p>
                      <span className="font-medium text-gray-700">
                        Investigation:
                      </span>{" "}
                      {f.investigation}
                    </p>
                  )}
                  {f.medicalHistory && (
                    <p>
                      <span className="font-medium text-gray-700">
                        Medical History:
                      </span>{" "}
                      {f.medicalHistory}
                    </p>
                  )}
                  {f.medicine && (
                    <p>
                      <span className="font-medium text-gray-700">
                        Medicine:
                      </span>{" "}
                      {f.medicine}
                    </p>
                  )}
                  <div className="flex gap-4 pt-2">
                    <p>
                      <span className="font-medium text-gray-700">Bill:</span> ₹
                      {f.bill}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Paid:</span> ₹
                      {f.paid}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <p>
                Showing {followupStartIndex + 1}–
                {Math.min(followupStartIndex + rowsPerPage, followups.length)}{" "}
                of {followups.length} follow-ups
              </p>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="followup-rows-per-page"
                  className="text-gray-600 whitespace-nowrap"
                >
                  Rows:
                </label>
                <input
                  id="followup-rows-per-page"
                  type="number"
                  min={1}
                  max={100}
                  value={rowsPerPage}
                  onChange={(e) => {
                    handleRowsPerPageChange(e);
                    setFollowupCurrentPage(1);
                  }}
                  className="w-14 sm:w-16 px-2 py-2 rounded-lg border border-gray-200 bg-white text-center text-base
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px] touch-manipulation"
                />
              </div>
            </div>
            {followups.length > rowsPerPage && (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFollowupCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={followupCurrentPage === 1}
                  className="px-4 py-3 sm:py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-h-[44px] touch-manipulation font-medium"
                >
                  Previous
                </button>
                <span className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 shrink-0">
                  Page {followupCurrentPage} of {followupTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFollowupCurrentPage((p) =>
                      Math.min(followupTotalPages, p + 1),
                    )
                  }
                  disabled={followupCurrentPage === followupTotalPages}
                  className="px-4 py-3 sm:py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 min-h-[44px] touch-manipulation font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {followups.length === 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
          <div className="text-gray-400 mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-gray-500 font-medium mb-1">No follow-ups yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Add the first follow-up visit for this patient
          </p>
          <button
            onClick={() => setShowFollowupModal(true)}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium inline-flex items-center gap-2"
          >
            Add Follow-Up
          </button>
        </div>
      )}

      {/* Follow-Up Modal */}
      {showFollowupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full max-h-[95vh] sm:max-h-[85vh] sm:max-w-3xl sm:rounded-2xl rounded-t-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-primary/10">
              <h2 className="text-xl font-semibold text-gray-800">
                Add New Follow-Up
              </h2>
              <p className="text-sm text-gray-500">
                Record a new visit for {form.Name || "this patient"}
              </p>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <Field
                label="Presenting Complains"
                name="presentingComplains"
                value={followForm.presentingComplains}
                onChange={handleFollowChange}
              />
              <Field
                label="Investigation"
                name="investigation"
                value={followForm.investigation}
                onChange={handleFollowChange}
              />
              <Field
                label="Medical History"
                name="medicalHistory"
                as="textarea"
                rows={3}
                value={followForm.medicalHistory}
                onChange={handleFollowChange}
              />
              <Field
                label="Medicine"
                name="medicine"
                as="textarea"
                rows={3}
                value={followForm.medicine}
                onChange={handleFollowChange}
              />

              <div className="grid grid-cols-2 gap-4 pt-2">
                <Field
                  label="Bill Amount (₹)"
                  name="bill"
                  type="number"
                  value={followForm.bill}
                  onChange={handleFollowChange}
                />
                <Field
                  label="Paid Amount (₹)"
                  name="paid"
                  type="number"
                  value={followForm.paid}
                  onChange={handleFollowChange}
                />
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-3">
              <button
                onClick={() => setShowFollowupModal(false)}
                className="px-5 py-3 sm:py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all min-h-[48px] touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFollowup}
                className="px-5 py-3 sm:py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium shadow-sm hover:shadow transition-all min-h-[48px] touch-manipulation"
              >
                Save Follow-Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
