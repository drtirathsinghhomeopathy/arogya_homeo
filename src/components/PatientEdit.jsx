import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../auth/firebase";

export default function PatientEdit({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      const ref = doc(db, "patients", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("Patient not found");
        navigate("/dashboard");
        return;
      }

      const data = snap.data();

      // 🔒 If someone else is editing
      if (data.editing?.by && data.editing.by !== user.uid) {
        alert("This record is currently being edited by another admin");
        navigate("/patients");
        return;
      }

      // 🔐 lock record
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
      // 🔓 unlock on exit
      const ref = doc(db, "patients", id);
      await updateDoc(ref, { editing: null });
    };
  }, [id, user.uid, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const ref = doc(db, "patients", id);
    await updateDoc(ref, {
      ...form,
      editing: null,
      updatedAt: serverTimestamp(),
    });
    alert("Patient updated");
    navigate("/patients");
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const Field = ({ label, name, type = "text" }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={form[name] || ""}
        disabled={!editing}
        onChange={handleChange}
        className={`w-full rounded-md border px-3 py-2 text-sm
          ${editing ? "border-gray-300" : "bg-gray-100 cursor-not-allowed"}
        `}
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Patient Details</h1>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Clinic" name="Clinic" />
        <Field label="Patient Name" name="Name" />
        <Field label="Gender" name="Gender" />
        <Field label="Age" name="Age" type="number" />
        <Field label="Mobile" name="Mobile" />
        <Field label="Date" name="Date" type="date" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <textarea
          name="Address"
          rows={3}
          value={form.Address || ""}
          disabled={!editing}
          onChange={handleChange}
          className={`w-full rounded-md border px-3 py-2 text-sm
            ${editing ? "border-gray-300" : "bg-gray-100 cursor-not-allowed"}
          `}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Medical History
        </label>
        <textarea
          name="MedicalHistory"
          rows={3}
          value={form.MedicalHistory || ""}
          disabled={!editing}
          onChange={handleChange}
          className={`w-full rounded-md border px-3 py-2 text-sm
            ${editing ? "border-gray-300" : "bg-gray-100 cursor-not-allowed"}
          `}
        />
      </div>
    </div>
  );
}