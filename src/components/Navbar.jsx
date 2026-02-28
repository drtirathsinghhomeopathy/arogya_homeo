import { useNavigate, useLocation } from "react-router-dom";
import AuthApi from "../api/AuthApi";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await AuthApi.logout();
    navigate("/login");
  };

  // hide navbar on login page
  if (location.pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm safe-area-inset-top">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-2 min-h-[56px]">
        {/* Brand */}
        <div
          onClick={() => navigate("/dashboard")}
          className="cursor-pointer hover:opacity-90 transition-opacity min-w-0 flex-1"
        >
          <h1 className="text-base sm:text-lg font-bold text-primary leading-tight truncate">
            Dr. Tirath Singh
          </h1>
          <p className="text-xs text-gray-500 truncate">
            Homoeopathic Clinic
          </p>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {user && (
            <span className="text-xs sm:text-sm text-gray-600 hidden md:block truncate max-w-[120px] lg:max-w-none">
              {user.email}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-3 sm:py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition min-h-[44px] touch-manipulation text-sm font-medium"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </header>
  );
}