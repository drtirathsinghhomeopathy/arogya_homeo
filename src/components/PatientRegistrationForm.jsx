// src/components/PatientRegistrationForm.jsx
import { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../auth/firebase";
import { COLLECTIONS } from "../constants/firestore";

export default function PatientRegistrationForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    P_Id: "",
    Date: "",
    Clinic: "",
    Name: "",
    Gender: "male",
    Age: "",
    Mobile: "",
    Address: "",
    MedicalHistory: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({ ...prev, Date: today }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  if (!formData.Clinic) {
    setError("Please select a clinic");
    return;
  }

  if (!/^[789][0-9]{9}$/.test(formData.Mobile)) {
    setError("Mobile number must be 10 digits");
    return;
  }

  try {
    await addDoc(collection(db, COLLECTIONS.PATIENTS), {
      ...formData,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser.uid,
    });

    setSuccess("Patient registered successfully");
    handleReset();
  } catch (err) {
    console.error(err);
    setError("Failed to save patient data");
  }
};

  const handleReset = () => {
    setFormData((prev) => ({
      ...prev,
      P_Id: "",
      Clinic: "",
      Name: "",
      Gender: "male",
      Age: "",
      Mobile: "",
      Address: "",
      MedicalHistory: "",
    }));
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white rounded-xl shadow-md p-6 space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Patient Registration
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded">
            {success}
          </div>
        )}

        {/* Hidden */}
        <input type="hidden" name="P_Id" value={formData.P_Id} />
        <input type="hidden" name="Date" value={formData.Date} />

        {/* Clinic + Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clinic
            </label>
            <select
              name="Clinic"
              value={formData.Clinic}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Select Clinic</option>
              <option value="Clinic A">Clinic A</option>
              <option value="Clinic B">Clinic B</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              placeholder="Patient Name"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
        </div>

        {/* Gender + Age */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Gender</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="Gender"
                  value="male"
                  checked={formData.Gender === "male"}
                  onChange={handleChange}
                  className="accent-blue-600"
                />
                <span>Male</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="Gender"
                  value="female"
                  checked={formData.Gender === "female"}
                  onChange={handleChange}
                  className="accent-blue-600"
                />
                <span>Female</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              name="Age"
              value={formData.Age}
              onChange={handleChange}
              min="0"
              placeholder="Age"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile
          </label>
          <input
            type="text"
            name="Mobile"
            value={formData.Mobile}
            onChange={handleChange}
            placeholder="10 digit mobile number"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        {/* Address + Medical History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="Address"
              value={formData.Address}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical History
            </label>
            <textarea
              name="MedicalHistory"
              value={formData.MedicalHistory}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}