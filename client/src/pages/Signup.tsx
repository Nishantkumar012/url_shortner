import { type FormEvent, useState } from "react";
import { ThreeBackground } from "../App";
import axiosinstance from "../utils/axiosInstance";
import { Navigate, useNavigate } from "react-router";

const LOGO =
   
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBgdTWjBxgLljLj0OL4xEvxNE5sUvv3veDbVYoyqiYOxLU54PKranBW0u0G1XEs-EbRzsEXq2Em-e-iYdUaPRPF8UMHKnZ3hLHIpk7uBP8Xy1W5A0K7GcNbJ4sABhViIb1vkZsh7YZRwXloCpkQUG7hYVv85N2VkX--BcqVP3UGil_qk91sJ8OwX6auzgHq8FTq0fZVShQLBc6U5IwqM3CTq_PFoBdTX1WFMSJX-pGXTl0XDtVioHyO";

type SubmitStatus = "idle" | "loading" | "success";

export default function Signup() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Already logged in? Send straight to the dashboard.
  // (Skip while the success state is showing after a fresh signup.)
  if (token && status !== "success") {
    return <Navigate to="/dash" replace />;
  }

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status !== "idle") return;

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      console.log("Attempting signup with:", { name, email, password: "***" });

      const response: any = await axiosinstance.post("/auth/register", {
        name,
        email,
        password,
      });

      console.log("Signup response:", response.data);
      // Store token in localStorage
      if (response.data?.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
      }

      setStatus("success");

      // Redirect to dashboard or home page after successful signup
      setTimeout(() => {
        navigate("/dash")
        // window.location.href = "/dashboard";
      }, 1500);
    } catch (err: any) {
      console.error("Signup failed - Full error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error message:", err.message);

      const errorMessage = err.response?.data?.message || err.message || "Signup failed. Please try again.";
      console.error("Setting error message:", errorMessage);

      setError(errorMessage);
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background font-body-md text-on-surface selection:bg-primary-container selection:text-on-primary-container">
       <ThreeBackground/>
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0" />

      {/* Main */}
      <main className="relative z-10 flex min-h-screen items-center justify-center p-margin-mobile md:p-gutter">
        <div className="glass-panel flex w-full max-w-[480px] flex-col items-center rounded-xl p-stack-lg md:p-stack-xl">
          {/* Logo */}
          <div className="mb-stack-lg flex flex-col items-center">
            <img
              src={LOGO}
              alt="SnapLink Logo"
              className="mb-stack-md h-16 w-16 object-contain transition-transform duration-300 hover:scale-105 md:h-20 md:w-20"
            />

            <h1 className="font-headline-md text-headline-md tracking-tight text-white">
              Create your account
            </h1>

            <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
              Join the future of high-speed connectivity
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSignup}
            className="w-full space-y-stack-md"
          >
            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            {/* Full Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="ml-1 font-label-md text-label-md text-on-surface-variant"
              >
                Full Name
              </label>

              <div className="group relative transition-transform duration-200 focus-within:scale-[1.01]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary">
                  person
                </span>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-outline/20 bg-background py-3 pl-10 pr-4 text-on-surface outline-none transition-all placeholder:text-outline/50 focus:border-primary-container"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="signup-email"
                className="ml-1 font-label-md text-label-md text-on-surface-variant"
              >
                Email Address
              </label>

              <div className="group relative transition-transform duration-200 focus-within:scale-[1.01]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary">
                  mail
                </span>

                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-outline/20 bg-background py-3 pl-10 pr-4 text-on-surface outline-none transition-all placeholder:text-outline/50 focus:border-primary-container"
                />
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 gap-stack-md md:grid-cols-2">
              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="signup-password"
                  className="ml-1 font-label-md text-label-md text-on-surface-variant"
                >
                  Password
                </label>

                <div className="group relative transition-transform duration-200 focus-within:scale-[1.01]">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary">
                    lock
                  </span>

                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-outline/20 bg-background py-3 pl-10 pr-10 text-on-surface outline-none transition-all placeholder:text-outline/50 focus:border-primary-container"
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirm_password"
                  className="ml-1 font-label-md text-label-md text-on-surface-variant"
                >
                  Confirm Password
                </label>

                <div className="group relative transition-transform duration-200 focus-within:scale-[1.01]">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary">
                    lock_reset
                  </span>

                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-outline/20 bg-background py-3 pl-10 pr-10 text-on-surface outline-none transition-all placeholder:text-outline/50 focus:border-primary-container"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-primary"
                  >
                    <span className="material-symbols-outlined">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 py-2">
              <div className="flex h-5 items-center">
                <input
                  id="terms"
                  required
                  type="checkbox"
                  className="h-4 w-4 rounded border-outline/30 bg-background text-primary-container transition-all focus:ring-primary-container focus:ring-offset-background"
                />
              </div>

              <label
                htmlFor="terms"
                className="font-body-sm text-body-sm text-on-surface-variant"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="text-primary transition-all hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-primary transition-all hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status !== "idle"}
              className={
                status === "success"
                  ? "mt-stack-md flex w-full items-center justify-center gap-2 rounded-lg border border-tertiary/50 bg-tertiary/20 py-4 font-label-md text-label-md text-tertiary transition-all duration-200"
                  : "button-primary-gradient group mt-stack-md flex w-full items-center justify-center gap-2 rounded-lg py-4 font-label-md text-label-md text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed"
              }
            >
              {status === "idle" && (
                <>
                  <span>Create Account</span>

                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </>
              )}

              {status === "loading" && (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>

                  <span>Initializing Node...</span>
                </>
              )}

              {status === "success" && (
                <>
                  <span className="material-symbols-outlined text-tertiary">
                    check_circle
                  </span>

                  <span>Welcome to SnapLink</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-stack-lg w-full border-t border-white/5 pt-stack-md text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Already have an account?

              <a
                href="/login"
                className="ml-1 font-medium text-primary transition-colors hover:text-white"
              >
                Log in
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}