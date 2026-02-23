import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../auth/firebase";
import Field from "./Field";
import { useToast } from "../context/ToastContext";
import { TOAST_TYPES } from "../constants/toastTypes";
import { CLINICS } from "../constants/clinics";

export default function PatientEdit({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

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
        editing: {
          by: user.uid,
          at: serverTimestamp(),
        },
      });

      setPatient(data);
      setForm(data);
      setLoading(false);
    };

    fetchPatient();

    return async () => {
      const ref = doc(db, "patients", id);
      await updateDoc(ref, { editing: null });
    };
  }, [id, user.uid, navigate, showToast]);

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
    navigate("/patients"); // ✅ toast survives navigation
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Patient Details</h1>

        <div className="flex gap-2">
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

          <button
            onClick={() => navigate(`/patients/${id}/followups`)}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            Follow-Ups
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Clinic</label>

          <select
            name="Clinic"
            value={form.Clinic || ""}
            onChange={handleChange}
            disabled={!editing}
            className={`w-full rounded border px-3 py-2 ${
              editing
                ? "border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                : "bg-gray-100"
            }`}
          >
            <option value="">Select clinic</option>
            {Object.values(CLINICS).map((clinic) => (
              <option key={clinic} value={clinic}>
                {clinic}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Patient Name"
          name="Name"
          value={form.Name || ""}
          disabled={!editing}
          onChange={handleChange}
        />
        <Field
          label="Gender"
          name="Gender"
          value={form.Gender || ""}
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
          label="Date"
          name="Date"
          type="date"
          value={form.Date || ""}
          disabled={!editing}
          onChange={handleChange}
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <textarea
          name="Address"
          rows={3}
          value={form.Address || ""}
          disabled={!editing}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 ${
            editing ? "border-gray-300" : "bg-gray-100"
          }`}
        />
      </div>

      {/* Medical History */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Medical History
        </label>
        <textarea
          name="MedicalHistory"
          rows={3}
          value={form.MedicalHistory || ""}
          disabled={!editing}
          onChange={handleChange}
          className={`w-full border rounded px-3 py-2 ${
            editing ? "border-gray-300" : "bg-gray-100"
          }`}
        />
      </div>
    </div>
  );
}
