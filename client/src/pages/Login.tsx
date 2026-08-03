import {type  FormEvent, useState } from "react";
import { ThreeBackground } from "../App";
import axiosinstance from "../utils/axiosInstance";
import { Navigate, useNavigate } from "react-router";

const LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBgdTWjBxgLljLj0OL4xEvxNE5sUvv3veDbVYoyqiYOxLU54PKranBW0u0G1XEs-EbRzsEXq2Em-e-iYdUaPRPF8UMHKnZ3hLHIpk7uBP8Xy1W5A0K7GcNbJ4sABhViIb1vkZsh7YZRwXloCpkQUG7hYVv85N2VkX--BcqVP3UGil_qk91sJ8OwX6auzgHq8FTq0fZVShQLBc6U5IwqM3CTq_PFoBdTX1WFMSJX-pGXTl0XDtVioHyO";

type SubmitStatus = "idle" | "loading" | "success";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Already logged in? Send straight to the dashboard.
  // (Skip while the "Welcome back!" success state is showing after a fresh login.)
  if (token && status !== "success") {
    return <Navigate to="/dash" replace />;
  }

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status !== "idle") return;

    console.log("Attempting login with:", { email, password: "***" });

    setStatus("loading");
    setError("");

    try {
      const response: any = await axiosinstance.post("/auth/login", {
        email,
        password,
      });

      console.log("Login response:", response.data);

      // Store token in localStorage
      if (response.data?.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
      }

      setStatus("success");

      // Redirect to dashboard after successful login
      setTimeout(() => {
        navigate("/dash");
      }, 1500);
    } catch (err: any) {
      console.error("Login failed - Full error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error message:", err.message);

      const errorMessage = err.response?.data?.message || err.message || "Login failed. Please try again.";
      console.error("Setting error message:", errorMessage);

      setError(errorMessage);
      setStatus("idle");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background font-body-md text-on-surface">
        <ThreeBackground/>
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0" />

      {/* Login Container */}
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
              Welcome back
            </h1>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="w-full space-y-stack-md"
          >
            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-stack-sm transition-transform duration-200 focus-within:scale-[1.01]">
              <label
                htmlFor="email"
                className="ml-1 font-label-md text-label-md text-on-surface-variant"
              >
                Email address
              </label>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  mail
                </span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-[#09090B] py-3 pl-10 pr-4 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-stack-sm transition-transform duration-200 focus-within:scale-[1.01]">
              <div className="flex items-center justify-between px-1">
                <label
                  htmlFor="password"
                  className="font-label-md text-label-md text-on-surface-variant"
                >
                  Password
                </label>

                <a
                  href="#"
                  className="font-label-md text-label-md text-primary-container transition-colors hover:text-primary"
                >
                  Forgot password?
                </a>
              </div>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  lock
                </span>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-[#09090B] py-3 pl-10 pr-10 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-primary"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center space-x-2 px-1">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-outline-variant bg-[#09090B] text-primary-container focus:ring-primary-container focus:ring-offset-0"
              />

              <label
                htmlFor="remember"
                className="cursor-pointer font-body-sm text-body-sm text-on-surface-variant"
              >
                Remember me for 30 days
              </label>
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
                  <span>Sign In</span>
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
                  <span>Welcome back!</span>
                </>
              )}
            </button>
          </form>

          {/* Signup */}
          <div className="mt-stack-lg text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Don't have an account?

              <a
                href="/signup"
                className="ml-1 font-medium text-primary-container transition-colors hover:text-primary"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-stack-lg flex justify-center gap-stack-md text-on-surface-variant opacity-40">
          <span className="font-code text-code">
            © 2024 SnapLink
          </span>

          <span className="font-code text-code">•</span>

          <span className="font-code text-code">
            v2.4.0-stable
          </span>
        </div>
      </main>
    </div>
  );
}