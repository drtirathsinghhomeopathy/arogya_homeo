// src/components/ClinicAddress.jsx

import { useToast } from "../context/ToastContext";
import { TOAST_TYPES } from "../constants/toastTypes";

export default function ClinicAddress() {
  const { showToast } = useToast();

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Address copied to clipboard", TOAST_TYPES.SUCCESS);
    } catch (err) {
      showToast("Failed to copy address", TOAST_TYPES.ERROR);
    }
  };

  const jagatFarmAddress = `Shop No. 2, 2nd Floor,
A K Plaza, Jagat Farm,
Gamma 1, Greater Noida`;

  const lajpatNagarAddress = `B-30, Basement,
Lajpat Nagar 1,
New Delhi – 110024`;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Clinic Addresses</h2>

      {/* Greater Noida */}
      <div className="p-4 border rounded bg-gray-50 space-y-2">
        <h3 className="font-medium text-gray-700">Greater Noida</h3>

        <p className="text-gray-600">
          Shop No. 2, 2nd Floor,
          <br />
          A K Plaza, Jagat Farm,
          <br />
          Gamma 1, Greater Noida
        </p>

        <div className="flex gap-4 flex-wrap">
          {/* Google Maps */}
          <a
            href="https://share.google/FAX7sjAgsOmdE8uXT"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            📍 View on Google Maps
          </a>

          {/* Copy Button */}
          <button
            onClick={() => copyToClipboard(jagatFarmAddress)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            📋 Copy Address
          </button>
        </div>
      </div>

      {/* New Delhi */}
      <div className="p-4 border rounded bg-gray-50 space-y-2">
        <h3 className="font-medium text-gray-700">New Delhi</h3>
        {/* https://maps.app.goo.gl/NZ7qek69aof3HpQ57 */}
        <p className="text-gray-600">
          B-30, Basement,
          <br />
          Lajpat Nagar 1,
          <br />
          New Delhi – 110024
        </p>

        <div className="flex gap-4 flex-wrap">
          {/* Google Maps */}
          <a
            href="https://maps.app.goo.gl/NZ7qek69aof3HpQ57"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            📍 View on Google Maps
          </a>

          <button
            onClick={() => copyToClipboard(lajpatNagarAddress)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            📋 Copy Address
          </button>
        </div>
      </div>
    </div>
  );
}
