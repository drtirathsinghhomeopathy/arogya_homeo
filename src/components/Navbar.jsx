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
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand */}
        <div
          onClick={() => navigate("/dashboard")}
          className="cursor-pointer"
        >
          <h1 className="text-lg font-bold text-green-700 leading-tight">
            Dr. Tirath Singh
          </h1>
          <p className="text-xs text-gray-500">
            Homoeopathic Clinic
          </p>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-600 hidden sm:block">
              {user.email}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2
                       rounded-lg bg-red-50 text-red-600
                       hover:bg-red-100 transition"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </header>
  );
}