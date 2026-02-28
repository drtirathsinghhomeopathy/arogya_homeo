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
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-primary/10">
        <h2 className="text-xl font-semibold text-gray-800">Clinic Addresses</h2>
        <p className="text-sm text-gray-500">Get directions or copy address</p>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Greater Noida */}
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
          <h3 className="font-semibold text-gray-800">Greater Noida</h3>

          <p className="text-gray-600 text-sm">
            Shop No. 2, 2nd Floor,
            <br />
            A K Plaza, Jagat Farm,
            <br />
            Gamma 1, Greater Noida
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
            <a
              href="https://share.google/FAX7sjAgsOmdE8uXT"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition py-2 min-h-[44px] items-center touch-manipulation"
            >
              📍 View on Google Maps
            </a>

            <button
              onClick={() => copyToClipboard(jagatFarmAddress)}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition py-2 min-h-[44px] touch-manipulation"
            >
              📋 Copy Address
            </button>
          </div>
        </div>

        {/* New Delhi */}
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
          <h3 className="font-semibold text-gray-800">New Delhi</h3>

          <p className="text-gray-600 text-sm">
            B-30, Basement,
            <br />
            Lajpat Nagar 1,
            <br />
            New Delhi – 110024
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
            <a
              href="https://maps.app.goo.gl/NZ7qek69aof3HpQ57"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition py-2 min-h-[44px] items-center touch-manipulation"
            >
              📍 View on Google Maps
            </a>

            <button
              onClick={() => copyToClipboard(lajpatNagarAddress)}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition py-2 min-h-[44px] touch-manipulation"
            >
              📋 Copy Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
