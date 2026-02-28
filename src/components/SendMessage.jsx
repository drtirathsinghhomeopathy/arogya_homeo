import React, { useState } from "react";
import { useToast } from "../context/ToastContext";
import { TOAST_TYPES } from "../constants/toastTypes";

function SendMessage({ patient, onClose }) {
  const { showToast } = useToast();

  const defaultMessage = `Hello ${patient?.Name || ""},\n
From Jagdeep
  `;

  const [message, setMessage] = useState(defaultMessage);

  const charCount = message.length;
  const isSmsLong = charCount > 160;

  if (!patient) return null;

  const phone = patient.Mobile?.replace(/\D/g, "");

  const handleWhatsApp = () => {
    if (!phone) {
      showToast("Patient mobile number is missing", TOAST_TYPES.ERROR);
      return;
    }

    const encodedMessage = encodeURIComponent(message);

    window.open(`https://wa.me/91${phone}?text=${encodedMessage}`, "_blank");

    showToast("Opening WhatsApp...", TOAST_TYPES.INFO);
    onClose();
  };

  const handleSMS = () => {
    if (!phone) {
      showToast("Patient mobile number is missing", TOAST_TYPES.INFO);
      return;
    }

    const encodedMessage = encodeURIComponent(message);

    window.location.href = `sms:${phone}?body=${encodedMessage}`;

    showToast("Opening SMS app...", TOAST_TYPES.SUCCESS);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-primary/10 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Send Message
            </h2>
            <p className="text-sm text-gray-500">Contact {patient.Name}</p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Type your message here..."
            />

            <div className="flex justify-between items-center mt-2 text-xs">
              <span
                className={
                  isSmsLong ? "text-red-500 font-medium" : "text-gray-400"
                }
              >
                {charCount} / 160 characters
              </span>

              {isSmsLong && (
                <span className="text-red-500">
                  SMS will be split into multiple messages
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleWhatsApp}
            className="w-full px-5 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium shadow-sm transition-all min-h-[48px]"
          >
            Send via WhatsApp
          </button>

          <button
            onClick={handleSMS}
            className="w-full px-5 py-3 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-medium transition-all min-h-[48px]"
          >
            Send via SMS
          </button>
        </div>
      </div>
    </div>
  );
}

export default SendMessage;
