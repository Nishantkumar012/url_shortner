import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { ThreeBackground } from "../App";
import axiosinstance from "../utils/axiosInstance";
import { isAdminLoggedIn, setAdminToken } from "../utils/adminAuth";

const LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBgdTWjBxgLljLj0OL4xEvxNE5sUvv3veDbVYoyqiYOxLU54PKranBW0u0G1XEs-EbRzsEXq2Em-e-iYdUaPRPF8UMHKnZ3hLHIpk7uBP8Xy1W5A0K7GcNbJ4sABhViIb1vkZsh7YZRwXloCpkQUG7hYVv85N2VkX--BcqVP3UGil_qk91sJ8OwX6auzgHq8FTq0fZVShQLBc6U5IwqM3CTq_PFoBdTX1WFMSJX-pGXTl0XDtVioHyO";

type SubmitStatus = "idle" | "loading" | "success";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Already admin-logged in? Skip the form and go straight to the dashboard.
  if (isAdminLoggedIn() && status !== "success") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status !== "idle") return;

    setStatus("loading");
    setError("");

    try {
      // Response interceptor unwraps .data, so `response` here is the body
      // { status, data: { token } } — read one level, not two.
      const response: any = await axiosinstance.post("/admin/login", {
        username,
        password,
      });

      const token = response.data?.token;

      if (token) {
        setAdminToken(token);
      }

      setStatus("success");

      // Redirect to the admin dashboard after a brief success state.
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1200);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid admin credentials";
      setError(errorMessage);
      setStatus("idle");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background font-body-md text-on-surface">
      <ThreeBackground />

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0" />

      {/* Admin Login Container */}
      <main className="relative z-10 w-full max-w-[440px] px-margin-mobile">
        <div className="glass-card flex flex-col items-center rounded-xl p-stack-lg transition-transform duration-200 md:p-stack-xl">
          {/* Logo */}
          <div className="mb-stack-lg">
            <img
              src={LOGO}
              alt="SnapLink Logo"
              className="h-20 w-20 object-contain"
            />
          </div>

          {/* Header */}
          <div className="mb-stack-lg text-center">
            <h1 className="mb-stack-sm font-headline-md text-headline-md text-on-surface">
              Admin Access
            </h1>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Enter the admin credentials to manage the platform
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full space-y-stack-md">
            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Username */}
            <div className="space-y-stack-sm transition-transform duration-200 focus-within:scale-[1.01]">
              <label
                htmlFor="admin-username"
                className="ml-1 font-label-md text-label-md text-on-surface-variant"
              >
                Username
              </label>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  person
                </span>

                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  placeholder="admin"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-[#09090B] py-3 pl-10 pr-4 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-stack-sm transition-transform duration-200 focus-within:scale-[1.01]">
              <label
                htmlFor="admin-password"
                className="ml-1 font-label-md text-label-md text-on-surface-variant"
              >
                Password
              </label>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  lock
                </span>

                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-[#09090B] py-3 pl-10 pr-10 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={status !== "idle"}
              className={
                status === "success"
                  ? "mt-stack-md flex w-full items-center justify-center gap-2 rounded-lg border border-tertiary/50 bg-tertiary/20 py-4 font-label-md text-label-md text-tertiary transition-all duration-200"
                  : "primary-gradient-btn mt-stack-sm flex w-full items-center justify-center gap-2 rounded-lg py-4 font-label-md text-label-md text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed"
              }
            >
              {status === "idle" && (
                <>
                  <span>Enter Admin</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </>
              )}

              {status === "loading" && (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>
                  <span>Authenticating...</span>
                </>
              )}

              {status === "success" && (
                <>
                  <span className="material-symbols-outlined text-tertiary">
                    check_circle
                  </span>
                  <span>Access granted!</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-stack-lg flex justify-center gap-stack-md text-on-surface-variant opacity-40">
          <span className="font-code text-code">© 2024 SnapLink</span>

          <span className="font-code text-code">•</span>

          <span className="font-code text-code">Admin Portal</span>
        </div>
      </main>
    </div>
  );
}
