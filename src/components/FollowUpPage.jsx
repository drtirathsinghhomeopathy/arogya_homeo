import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../auth/firebase";
import { useToast } from "../context/ToastContext";
import { TOAST_TYPES } from "../constants/toastTypes";

/* 🔹 Field component OUTSIDE (fixes focus issue) */
function Field({ label, name, type = "text", rows = 1, value, onChange }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {type === "textarea" ? (
        <textarea
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
}

export default function FollowUpPage() {
  const { id: patientId } = useParams();
  const { showToast } = useToast();

  const formRef = useRef(null);

  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    presentingComplains: "",
    investigation: "",
    medicalHistory: "",
    medicine: "",
    bill: "",
    paid: "",
  });

  const [totalBalance, setTotalBalance] = useState(0);

  /* 🔹 Fetch follow-ups */
  useEffect(() => {
    const fetchFollowUps = async () => {
      const q = query(
        collection(db, "followups"),
        where("patientId", "==", patientId)
      );

      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setFollowups(data);

      const balance = data.reduce(
        (sum, f) => sum + (Number(f.bill) - Number(f.paid)),
        0
      );
      setTotalBalance(balance);

      setLoading(false);

      // 🔽 Auto-scroll if no followups
      if (data.length === 0) {
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    };

    fetchFollowUps();
  }, [patientId]);

  /* 🔹 Input handler (NO focus loss) */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "bill" || name === "paid" ? Number(value) : value,
    }));
  };

  /* 🔹 Save follow-up */
  const handleSave = async () => {
    await addDoc(collection(db, "followups"), {
      patientId,
      ...form,
      createdAt: serverTimestamp(),
    });

    showToast("Follow-up saved successfully", TOAST_TYPES.SUCCESS);

    window.location.reload();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const balanceColor =
    totalBalance > 0 ? "text-red-600" : "text-green-600";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Patient Follow-Ups</h1>

      {/* 🔹 Past Follow-Ups Table */}
      {followups.length > 0 && (
        <div className="overflow-x-auto">
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
              {followups.map(f => (
                <tr key={f.id}>
                  <td className="border p-2">
                    {f.createdAt?.toDate().toLocaleDateString()}
                  </td>
                  <td className="border p-2">{f.presentingComplains}</td>
                  <td className="border p-2">{f.investigation}</td>
                  <td className="border p-2">{f.medicine}</td>
                  <td className="border p-2">{f.bill}</td>
                  <td className="border p-2">{f.paid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔹 Balance */}
      <div className={`font-semibold ${balanceColor}`}>
        Balance: {totalBalance > 0 ? `+${totalBalance}` : totalBalance}
      </div>

      {/* 🔹 New Follow-Up Form */}
      <div ref={formRef} className="border rounded p-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Add New Follow-Up</h2>

        <Field
          label="Presenting Complains"
          name="presentingComplains"
          value={form.presentingComplains}
          onChange={handleChange}
        />

        <Field
          label="Investigation"
          name="investigation"
          value={form.investigation}
          onChange={handleChange}
        />

        <Field
          label="Medical History"
          name="medicalHistory"
          type="textarea"
          rows={3}
          value={form.medicalHistory}
          onChange={handleChange}
        />

        <Field
          label="Medicine"
          name="medicine"
          type="textarea"
          rows={3}
          value={form.medicine}
          onChange={handleChange}
        />

        <Field
          label="Bill Amount"
          name="bill"
          type="number"
          value={form.bill}
          onChange={handleChange}
        />

        <Field
          label="Paid Amount"
          name="paid"
          type="number"
          value={form.paid}
          onChange={handleChange}
        />

        <button
          onClick={handleSave}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Follow-Up
        </button>
      </div>
    </div>
  );
}