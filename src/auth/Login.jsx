import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthApi from "../api/AuthApi";
import { ROLES } from "../constants/roles";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await AuthApi.loginUser(email, password);
      user.role === ROLES.ADMIN ? navigate("/admin") : navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await AuthApi.loginWithGoogle();
      user.role === ROLES.ADMIN ? navigate("/admin") : navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-green-800 mb-2">
  DR. TIRATH SINGH’S
  <span className="block text-lg sm:text-xl font-semibold tracking-wider text-green-600">
    HOMOEOPATHIC CLINIC
  </span>
</h2>
        <p className="text-center text-gray-500 mb-6">
          Login to your account
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-700 py-2.5 text-white font-semibold hover:bg-green-800 transition disabled:opacity-60"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            Login
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 text-white font-semibold hover:bg-red-600 transition disabled:opacity-60"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;