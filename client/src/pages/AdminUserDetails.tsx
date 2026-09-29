import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  LogOut,
  ShieldCheck,
  ExternalLink,
  Search,
} from "lucide-react";
import { ThreeBackground } from "../App";
import adminApi from "../utils/adminApi";
import { clearAdminToken } from "../utils/adminAuth";

const LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBgdTWjBxgLljLj0OL4xEvxNE5sUvv3veDbVYoyqiYOxLU54PKranBW0u0G1XEs-EbRzsEXq2Em-e-iYdUaPRPF8UMHKnZ3hLHIpk7uBP8Xy1W5A0K7GcNbJ4sABhViIb1vkZsh7YZRwXloCpkQUG7hYVv85N2VkX--BcqVP3UGil_qk91sJ8OwX6auzgHq8FTq0fZVShQLBc6U5IwqM3CTq_PFoBdTX1WFMSJX-pGXTl0XDtVioHyO";

type UserDetail = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
};

type UserUrl = {
  id: string;
  shortCode: string;
  originalUrl: string;
  clickCount: number;
  createdAt: string;
  isDeleted: boolean;
};

export default function AdminUserDetails() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [urls, setUrls] = useState<UserUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!userId) {
      setError("User ID is required");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [userRes, urlsRes] = await Promise.all([
          adminApi.get(`/admin/users/${userId}`),
          adminApi.get(`/admin/users/${userId}/urls`),
        ]);

        setUser(userRes.data ?? null);
        setUrls(urlsRes.data ?? []);
      } catch (err: any) {
        setError(err?.message || "Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleLogout = () => {
    clearAdminToken();
    navigate("/admin", { replace: true });
  };

  const filteredUrls = urls.filter((url) => {
    const value = search.trim().toLowerCase();
    if (!value) return true;
    return (
      url.shortCode.toLowerCase().includes(value) ||
      url.originalUrl.toLowerCase().includes(value)
    );
  });

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">
        <ThreeBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-body-sm text-on-surface-variant">
              Loading user details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">
        <ThreeBackground />
        <div className="flex flex-col items-center justify-center min-h-screen gap-6">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-error">
              error
            </span>
            <h2 className="mt-4 font-headline-md text-headline-md text-on-surface">
              {error}
            </h2>
          </div>

          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary-container/20 px-6 py-3 font-label-md text-primary transition-all hover:bg-primary-container/30"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">
      <ThreeBackground />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary-container/5 blur-[120px]" />
        <div className="absolute -bottom-52 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* SIDEBAR */}
        <aside className="glass-panel flex h-full w-64 shrink-0 flex-col border-r border-white/5">
          <div className="flex items-center gap-3 p-gutter">
            <img
              src={LOGO}
              alt="SnapLink"
              className="h-8 w-8 object-contain"
            />

            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
                SnapLink
              </span>

              <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-on-surface-variant/70">
                <ShieldCheck size={12} className="text-tertiary" />
                Admin
              </span>
            </div>
          </div>

          <div className="mt-auto border-t border-white/5 p-gutter">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-xl p-3 font-body-md text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
            >
              <LogOut
                size={20}
                className="transition-transform group-hover:-translate-x-0.5"
              />

              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="custom-scrollbar flex flex-1 flex-col overflow-y-auto">
          {/* Header */}
          <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between border-b border-white/5 bg-background/50 px-stack-xl backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="group flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container-high px-4 py-2.5 font-label-md text-label-md text-on-surface-variant transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
              >
                <ArrowLeft
                  size={18}
                  className="transition-transform group-hover:-translate-x-0.5"
                />

                Back
              </button>

              <div>
                <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
                  {user?.name || "User Details"}
                </h1>

                <p className="text-body-sm text-on-surface-variant">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 rounded-lg border border-white/10 bg-surface-container-high px-4 py-2.5 font-label-md text-label-md text-on-surface-variant transition-all hover:border-error/40 hover:bg-error/10 hover:text-error active:scale-[0.98]"
            >
              <LogOut
                size={18}
                className="transition-transform group-hover:-translate-x-0.5"
              />

              Logout
            </button>
          </header>

          <div className="mx-auto w-full max-w-7xl space-y-stack-lg p-stack-xl">
            {/* USER INFO CARD */}
            {user && (
              <div className="glass-panel overflow-hidden rounded-2xl border border-white/5">
                <div className="p-6">
                  <h2 className="mb-6 font-headline-md text-headline-md text-on-surface">
                    User Information
                  </h2>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <InfoCard
                      label="Name"
                      value={user.name || "—"}
                    />

                    <InfoCard
                      label="Email"
                      value={user.email}
                    />

                    <InfoCard
                      label="Role"
                      value={user.role}
                    />

                    <InfoCard
                      label="Verified"
                      value={user.isVerified ? "Yes" : "No"}
                    />

                    <InfoCard
                      label="Created"
                      value={formatDate(user.createdAt)}
                    />

                    <InfoCard
                      label="Total URLs"
                      value={urls.length.toString()}
                    />

                    <InfoCard
                      label="Total Clicks"
                      value={urls
                        .reduce((sum, url) => sum + url.clickCount, 0)
                        .toLocaleString()}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* URLS TABLE */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  User URLs ({filteredUrls.length})
                </h2>
              </div>

              {/* SEARCH */}
              <div className="group relative w-full md:w-96">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search URLs..."
                  className="w-full rounded-xl border border-white/10 bg-surface-container-low py-3 pl-12 pr-4 text-body-md outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="glass-panel overflow-hidden rounded-2xl border border-white/5">
                {filteredUrls.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-24">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">
                      link_off
                    </span>

                    <p className="text-body-sm text-on-surface-variant">
                      No URLs found for this user.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                          <TableHeading>Short URL</TableHeading>
                          <TableHeading>Destination</TableHeading>
                          <TableHeading className="text-right">
                            Clicks
                          </TableHeading>
                          <TableHeading>Created</TableHeading>
                          <TableHeading>Status</TableHeading>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/5">
                        {filteredUrls.map((url) => (
                          <tr
                            key={url.id}
                            className="group transition-colors hover:bg-white/5"
                          >
                            <td className="px-6 py-4">
                              <button
                                onClick={() =>
                                  window.open(
                                    `${
                                      import.meta.env.VITE_API_URL ||
                                      "http://localhost:3000"
                                    }/url/${url.shortCode}`,
                                    "_blank"
                                  )
                                }
                                className="flex items-center gap-1.5 font-code font-bold text-primary transition-colors hover:underline"
                                title="Open short URL"
                              >
                                {url.shortCode}

                                <ExternalLink
                                  size={14}
                                  className="opacity-0 transition-opacity group-hover:opacity-100"
                                />
                              </button>
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className="block max-w-xs truncate text-body-sm text-on-surface-variant"
                                title={url.originalUrl}
                              >
                                {url.originalUrl}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-6 py-4 text-right font-code text-body-sm">
                              {url.clickCount.toLocaleString()}
                            </td>

                            <td className="whitespace-nowrap px-6 py-4 text-body-sm text-on-surface-variant">
                              {formatDate(url.createdAt)}
                            </td>

                            <td className="px-6 py-4">
                              <StatusBadge isDeleted={url.isDeleted} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <footer className="flex flex-col items-center justify-between gap-4 pt-stack-xl font-label-md text-label-md text-on-surface-variant/60 md:flex-row">
              <p>© 2024 SnapLink · Admin Portal</p>

              <p>Authorized access only</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-surface-container-low p-4">
      <p className="text-label-md text-on-surface-variant mb-1">
        {label}
      </p>

      <p className="text-body-md font-bold text-on-surface">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ isDeleted }: { isDeleted: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-label-md text-label-md ${
        isDeleted
          ? "bg-error/10 text-error"
          : "bg-tertiary/15 text-tertiary"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isDeleted
            ? "bg-error"
            : "bg-tertiary shadow-[0_0_8px_rgba(74,225,118,0.6)]"
        }`}
      />

      {isDeleted ? "Deleted" : "Active"}
    </span>
  );
}

function TableHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-6 py-4 font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant ${className}`}
    >
      {children}
    </th>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
