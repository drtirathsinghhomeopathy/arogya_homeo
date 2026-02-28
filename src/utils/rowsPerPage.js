import { useState } from "react";

export const STORAGE_KEY = "arogya_rowsPerPage";
export const DEFAULT_ROWS = 10;
export const MIN_ROWS = 1;
export const MAX_ROWS = 100;

export function getStoredRowsPerPage(userId) {
  if (!userId) return DEFAULT_ROWS;
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (stored) {
      const num = parseInt(stored, 10);
      if (!isNaN(num) && num >= MIN_ROWS && num <= MAX_ROWS) return num;
    }
  } catch (_) {}
  return DEFAULT_ROWS;
}

export function useRowsPerPage(user) {
  const [rowsPerPage, setRowsPerPage] = useState(() =>
    getStoredRowsPerPage(user?.uid)
  );

  const handleRowsPerPageChange = (e) => {
    const raw = e.target.value;
    if (raw === "") return;
    const val = parseInt(raw, 10);
    if (!isNaN(val) && val >= MIN_ROWS && val <= MAX_ROWS) {
      setRowsPerPage(val);
      if (user?.uid) {
        localStorage.setItem(`${STORAGE_KEY}_${user.uid}`, String(val));
      }
    }
  };

  return [rowsPerPage, setRowsPerPage, handleRowsPerPageChange];
}
