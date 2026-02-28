// src/components/PatientRegistrationForm.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../auth/firebase";
import { COLLECTIONS } from "../constants/firestore";
import { useToast } from "../context/ToastContext";
import { TOAST_TYPES } from "../constants/toastTypes";

export default function PatientRegistrationForm() {
  const { showToast } = useToast();

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

    if (!formData.Clinic) {
      showToast("Please select a clinic", TOAST_TYPES.ERROR);
      return;
    }

    if (!/^[789][0-9]{9}$/.test(formData.Mobile)) {
      showToast("Mobile number must be 10 digits", TOAST_TYPES.ERROR);
      return;
    }

    try {
      await addDoc(collection(db, COLLECTIONS.PATIENTS), {
        ...formData,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
      });

      showToast("Patient registered successfully", TOAST_TYPES.SUCCESS);
      handleReset();
    } catch (err) {
      console.error(err);
      showToast("Failed to save patient data", TOAST_TYPES.ERROR);
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
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4 py-4 sm:py-6 md:py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden my-4"
      >
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-primary/10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Patient Registration</h2>
          <p className="text-sm text-gray-500 mt-0.5">Add a new patient to the system</p>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Hidden */}
          <input type="hidden" name="P_Id" value={formData.P_Id} />
          <input type="hidden" name="Date" value={formData.Date} />

          {/* Clinic + Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinic</label>
              <select
                name="Clinic"
                value={formData.Clinic}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              >
              <option value="">Select Clinic</option>
              <option value="Clinic A">Jagat Farm, Greater Noida</option>
              <option value="Clinic B">Lajpat Nagar, New Delhi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
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
                />
                Male
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="Gender"
                  value="female"
                  checked={formData.Gender === "female"}
                  onChange={handleChange}
                />
                Female
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              name="Age"
              value={formData.Age}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
          <input
            type="text"
            name="Mobile"
            value={formData.Mobile}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        {/* Address + Medical History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="Address"
              value={formData.Address}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 sm:justify-between">
          <button
            type="submit"
            className="px-6 py-3 sm:py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition order-1 min-h-[48px] touch-manipulation w-full sm:w-auto"
          >
            Submit
          </button>
          <div className="flex flex-col sm:flex-row gap-3 order-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 sm:py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition min-h-[48px] touch-manipulation"
            >
              Reset
            </button>
            <Link
              to="/patients"
              className="px-6 py-3 sm:py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition inline-block text-center min-h-[48px] flex items-center justify-center touch-manipulation"
            >
              Cancel
            </Link>
          </div>
        </div>
        </div>
      </form>
    </div>
  );
}