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

  const [showFollowupModal, setShowFollowupModal] = useState(false);

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
        TOAST_TYPES.WARNING
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
      where("patientId", "==", id)
    );

    const snapFollow = await getDocs(q);

    const followData = snapFollow.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    followData.sort(
      (a, b) =>
        (b.createdAt?.toDate() || 0) -
        (a.createdAt?.toDate() || 0)
    );

    setFollowups(followData);

    const balance = followData.reduce(
      (sum, f) => sum + (Number(f.paid || 0) - Number(f.bill || 0)),
      0
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
    const q = query(
      collection(db, "followups"),
      where("patientId", "==", id)
    );

    const snapFollow = await getDocs(q);

    const followData = snapFollow.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // Sort latest first
    followData.sort(
      (a, b) =>
        (b.createdAt?.toDate() || 0) -
        (a.createdAt?.toDate() || 0)
    );

    setFollowups(followData);

    const balance = followData.reduce(
      (sum, f) => sum + (Number(f.paid || 0) - Number(f.bill || 0)),
      0
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

    await loadFollowups();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Patient Details</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFollowupModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            Add Follow-Up
          </button>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setForm(patient);
                  setEditing(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Patient Info (UNCHANGED STRUCTURE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

  {/* ✅ Medical History Added Properly */}
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

      {/* Follow-Up Table */}
      {followups.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Patient Follow-Ups</h2>

          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Complains</th>
                <th className="border p-2">Investigation</th>
                <th className="border p-2">Medicine</th>
                <th className="border p-2">Bill</th>
                <th className="border p-2">Paid</th>
              </tr>
            </thead>
            <tbody>
              {followups.map((f) => (
                <tr key={f.id}>
                  <td className="border p-2">
                    {f.createdAt?.toDate().toLocaleDateString()}
                  </td>
                  <td className="border p-2">{f.presentingComplains}</td>
                  <td className="border p-2">{f.investigation}</td>
                  <td className="border p-2">{f.medicine}</td>
                  <td className="border p-2">₹{f.bill}</td>
                  <td className="border p-2">₹{f.paid}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            className={`mt-4 font-semibold text-lg ${
              totalBalance < 0
                ? "text-red-600"
                : totalBalance > 0
                ? "text-green-600"
                : "text-gray-500"
            }`}
          >
            Balance: ₹{Math.abs(totalBalance)}
          </div>
        </div>
      )}

      {/* Follow-Up Modal */}
      {showFollowupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Add New Follow-Up</h2>

            <Field label="Presenting Complains" name="presentingComplains" value={followForm.presentingComplains} onChange={handleFollowChange} />
            <Field label="Investigation" name="investigation" value={followForm.investigation} onChange={handleFollowChange} />
            <Field label="Medical History" name="medicalHistory" as="textarea" rows={3} value={followForm.medicalHistory} onChange={handleFollowChange} />
            <Field label="Medicine" name="medicine" as="textarea" rows={3} value={followForm.medicine} onChange={handleFollowChange} />

            <div className="grid grid-cols-2 gap-4">
              <Field label="Bill Amount" name="bill" type="number" value={followForm.bill} onChange={handleFollowChange} />
              <Field label="Paid Amount" name="paid" type="number" value={followForm.paid} onChange={handleFollowChange} />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setShowFollowupModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded">
                Cancel
              </button>
              <button onClick={handleAddFollowup} className="px-4 py-2 bg-green-600 text-white rounded">
                Save Follow-Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}