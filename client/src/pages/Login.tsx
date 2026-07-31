import {type  FormEvent,type  MouseEvent, useState } from "react";
import { ThreeBackground } from "../App";

const LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBgdTWjBxgLljLj0OL4xEvxNE5sUvv3veDbVYoyqiYOxLU54PKranBW0u0G1XEs-EbRzsEXq2Em-e-iYdUaPRPF8UMHKnZ3hLHIpk7uBP8Xy1W5A0K7GcNbJ4sABhViIb1vkZsh7YZRwXloCpkQUG7hYVv85N2VkX--BcqVP3UGil_qk91sJ8OwX6auzgHq8FTq0fZVShQLBc6U5IwqM3CTq_PFoBdTX1WFMSJX-pGXTl0XDtVioHyO";

  
export default function Login() {
  const [cardTransform, setCardTransform] = useState("");

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const x = (window.innerWidth / 2 - e.pageX) / 50;
    const y = (window.innerHeight / 2 - e.pageY) / 50;

    setCardTransform(`translate(${x}px, ${y}px)`);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background font-body-md text-on-surface"
    >
        <ThreeBackground/>
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0" />

      {/* Login Container */}
      <main className="relative z-10 w-full max-w-[440px] px-margin-mobile">
        <div
          style={{ transform: cardTransform }}
          className="glass-card flex flex-col items-center rounded-xl p-stack-lg transition-transform duration-200 md:p-stack-xl"
        >
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
            onSubmit={handleSubmit}
            className="w-full space-y-stack-md"
          >
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
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-outline-variant bg-[#09090B] py-3 pl-10 pr-4 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                />
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
              className="primary-gradient-btn mt-stack-sm flex w-full items-center justify-center gap-2 rounded-lg py-4 font-label-md text-label-md text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In

              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
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