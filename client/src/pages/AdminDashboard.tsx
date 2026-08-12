import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Link2,
  Search,
  LogOut,
  ShieldCheck,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { ThreeBackground } from "../App";
import adminApi from "../utils/adminApi";
import { clearAdminToken } from "../utils/adminAuth";

const LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBgdTWjBxgLljLj0OL4xEvxNE5sUvv3veDbVYoyqiYOxLU54PKranBW0u0G1XEs-EbRzsEXq2Em-e-iYdUaPRPF8UMHKnZ3hLHIpk7uBP8Xy1W5A0K7GcNbJ4sABhViIb1vkZsh7YZRwXloCpkQUG7hYVv85N2VkX--BcqVP3UGil_qk91sJ8OwX6auzgHq8FTq0fZVShQLBc6U5IwqM3CTq_PFoBdTX1WFMSJX-pGXTl0XDtVioHyO";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  urlCount: number;
  totalClicks: number;
};

type AdminUrl = {
  id: string;
  shortCode: string;
  originalUrl: string;
  clickCount: number;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

type Stats = {
  totalUsers: number;
  totalLinks: number;
  totalClicks: number;
};

type TabKey = "users" | "links";

const EMPTY_STATS: Stats = { totalUsers: 0, totalLinks: 0, totalClicks: 0 };

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("users");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [urls, setUrls] = useState<AdminUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fetch everything in parallel. adminApi already attaches the admin token
  // and unwraps .data, so each `res` is the JSON body { status, data }.
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsRes, usersRes, urlsRes] = await Promise.all([
        adminApi.get("/admin/stats"),
        adminApi.get("/admin/users"),
        adminApi.get("/admin/urls"),
      ]);

      setStats(statsRes.data ?? EMPTY_STATS);
      setUsers(usersRes.data ?? []);
      setUrls(urlsRes.data ?? []);
    } catch (err: any) {
      setError(err?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleLogout = () => {
    clearAdminToken();
    navigate("/admin", { replace: true });
  };

  // Search scope follows the active tab.
  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return users;

    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(value) ||
        u.email.toLowerCase().includes(value) ||
        u.role.toLowerCase().includes(value),
    );
  }, [users, search]);

  const filteredUrls = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return urls;

    return urls.filter(
      (u) =>
        u.shortCode.toLowerCase().includes(value) ||
        u.originalUrl.toLowerCase().includes(value) ||
        u.user.email.toLowerCase().includes(value) ||
        u.user.name?.toLowerCase().includes(value),
    );
  }, [urls, search]);

  const searchPlaceholder =
    activeTab === "users"
      ? "Search users by name, email or role..."
      : "Search links by code, URL or owner...";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">
      <ThreeBackground />

      {/* Atmospheric Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary-container/5 blur-[120px]" />

        <div className="absolute -bottom-52 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px]" />
      </div>

      {/* Main Shell */}
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* SIDEBAR */}
        <aside className="glass-panel flex h-full w-64 shrink-0 flex-col border-r border-white/5">
          {/* Logo */}
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

          {/* Navigation (tabs) */}
          <nav className="mt-stack-lg flex-1 space-y-1">
            <p className="px-gutter pb-2 font-label-md text-label-md uppercase tracking-widest text-on-surface-variant/50">
              Overview
            </p>

            <SidebarItem
              icon={<Users size={21} />}
              label="Users"
              active={activeTab === "users"}
              onClick={() => {
                setActiveTab("users");
                setSearch("");
              }}
            />

            <SidebarItem
              icon={<Link2 size={21} />}
              label="Links"
              active={activeTab === "links"}
              onClick={() => {
                setActiveTab("links");
                setSearch("");
              }}
            />

            <div className="px-gutter pt-stack-lg">
              <p className="pb-2 font-label-md text-label-md uppercase tracking-widest text-on-surface-variant/50">
                Insights
              </p>

              <SidebarItem
                icon={<BarChart3 size={21} />}
                label="Statistics"
                active={false}
                onClick={() => setActiveTab("users")}
                inner
              />
            </div>
          </nav>

          {/* Logout */}
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
            <div>
              <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
                Admin Dashboard
              </h1>

              <p className="text-body-sm text-on-surface-variant">
                Platform overview · all users & links
              </p>
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
            {error && (
              <div className="glass-panel flex flex-col items-center justify-between gap-4 rounded-2xl border border-error/30 bg-error/10 px-6 py-5 sm:flex-row">
                <div className="flex items-center gap-3 text-error">
                  <span className="material-symbols-outlined">error</span>

                  <p className="text-body-sm">{error}</p>
                </div>

                <button
                  onClick={fetchAll}
                  className="rounded-lg border border-error/40 px-4 py-2 font-label-md text-label-md text-error transition-colors hover:bg-error/10"
                >
                  Retry
                </button>
              </div>
            )}

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <StatCard
                title="Total Users"
                value={stats.totalUsers.toLocaleString()}
                icon={<Users size={22} />}
                glow="bg-primary/10"
              />

              <StatCard
                title="Total Links"
                value={stats.totalLinks.toLocaleString()}
                icon={<Link2 size={22} />}
                glow="bg-secondary/10"
              />

              <StatCard
                title="Total Clicks"
                value={stats.totalClicks.toLocaleString()}
                icon={<BarChart3 size={22} />}
                glow="bg-tertiary/10"
              />
            </div>

            {/* TAB BAR */}
            <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-surface-container-low p-1">
              <TabButton
                active={activeTab === "users"}
                icon={<Users size={18} />}
                label="Users"
                count={stats.totalUsers}
                onClick={() => {
                  setActiveTab("users");
                  setSearch("");
                }}
              />

              <TabButton
                active={activeTab === "links"}
                icon={<Link2 size={18} />}
                label="Links"
                count={stats.totalLinks}
                onClick={() => {
                  setActiveTab("links");
                  setSearch("");
                }}
              />
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
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-white/10 bg-surface-container-low py-3 pl-12 pr-4 text-body-md outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* TABLE PANEL */}
            <div className="glass-panel overflow-hidden rounded-2xl border border-white/5">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-24">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />

                  <p className="text-body-sm text-on-surface-variant">
                    Loading admin data...
                  </p>
                </div>
              ) : activeTab === "users" ? (
                <UsersTable users={filteredUsers} />
              ) : (
                <LinksTable urls={filteredUrls} />
              )}
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

/* ── Users table ──────────────────────────────────────────────────────────── */

function UsersTable({ users }: { users: AdminUser[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-white/5 bg-white/5">
            <TableHeading>User</TableHeading>
            <TableHeading>Role</TableHeading>
            <TableHeading>Verified</TableHeading>
            <TableHeading className="text-right">Links</TableHeading>
            <TableHeading className="text-right">Clicks</TableHeading>
            <TableHeading>Created</TableHeading>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/5">
          {users.map((user) => (
            <tr
              key={user.id}
              className="transition-colors hover:bg-white/5"
            >
              <td className="px-6 py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-sm font-bold">
                    {user.name || "—"}
                  </span>

                  <span className="text-body-sm text-on-surface-variant">
                    {user.email}
                  </span>
                </div>
              </td>

              <td className="px-6 py-4">
                <RolePill role={user.role} />
              </td>

              <td className="px-6 py-4">
                <VerifiedBadge verified={user.isVerified} />
              </td>

              <td className="whitespace-nowrap px-6 py-4 text-right font-code text-body-sm">
                {user.urlCount}
              </td>

              <td className="whitespace-nowrap px-6 py-4 text-right font-code text-body-sm">
                {user.totalClicks.toLocaleString()}
              </td>

              <td className="whitespace-nowrap px-6 py-4 text-body-sm text-on-surface-variant">
                {formatDate(user.createdAt)}
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-16 text-center text-body-sm text-on-surface-variant"
              >
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ── Links table ──────────────────────────────────────────────────────────── */

function LinksTable({ urls }: { urls: AdminUrl[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-white/5 bg-white/5">
            <TableHeading>Short URL</TableHeading>
            <TableHeading>Destination</TableHeading>
            <TableHeading>Owner</TableHeading>
            <TableHeading className="text-right">Clicks</TableHeading>
            <TableHeading>Created</TableHeading>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/5">
          {urls.map((url) => (
            <tr
              key={url.id}
              className="group transition-colors hover:bg-white/5"
            >
              <td className="px-6 py-4">
                <button
                  onClick={() =>
                    window.open(
                      `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/url/${url.shortCode}`,
                      "_blank",
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

              <td className="px-6 py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-sm font-bold">
                    {url.user.name || "—"}
                  </span>

                  <span className="text-body-sm text-on-surface-variant">
                    {url.user.email}
                  </span>
                </div>
              </td>

              <td className="whitespace-nowrap px-6 py-4 text-right font-code text-body-sm">
                {url.clickCount.toLocaleString()}
              </td>

              <td className="whitespace-nowrap px-6 py-4 text-body-sm text-on-surface-variant">
                {formatDate(url.createdAt)}
              </td>
            </tr>
          ))}

          {urls.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-16 text-center text-body-sm text-on-surface-variant"
              >
                No links found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ── Local helpers (kept private to this file) ────────────────────────────── */

function SidebarItem({
  icon,
  label,
  active = false,
  inner = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  inner?: boolean;
  onClick: () => void;
}) {
  if (inner) {
    return (
      <button
        onClick={onClick}
        className="group -mx-3 flex w-full items-center gap-3 rounded-lg px-3 py-3 font-body-md text-on-surface-variant transition-all hover:bg-primary-container/10 hover:text-primary"
      >
        <span className="transition-transform group-hover:scale-110">
          {icon}
        </span>

        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        group flex w-full items-center gap-3
        border-r-2
        px-gutter py-3
        font-body-md
        transition-all duration-200
        ${
          active
            ? "border-primary-container bg-[#7C3AED]/20 text-primary"
            : "border-transparent text-on-surface-variant hover:bg-[#7C3AED]/10 hover:text-primary"
        }
      `}
    >
      <span
        className={
          active
            ? "text-primary"
            : "transition-transform group-hover:scale-110"
        }
      >
        {icon}
      </span>

      <span className={active ? "font-semibold" : ""}>{label}</span>
    </button>
  );
}

function StatCard({
  title,
  value,
  icon,
  glow,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  glow: string;
}) {
  return (
    <div className="glass-panel group relative overflow-hidden rounded-2xl p-6">
      <div
        className={`absolute -bottom-4 -right-4 h-24 w-24 rounded-full ${glow} blur-3xl transition-transform duration-500 group-hover:scale-150`}
      />

      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-surface-container-high text-primary">
        {icon}
      </div>

      <p className="mb-1 text-label-md text-on-surface-variant">
        {title}
      </p>

      <h3 className="text-headline-lg font-bold">
        {value}
      </h3>
    </div>
  );
}

function TabButton({
  active,
  icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5
        font-label-md text-label-md transition-all duration-200
        ${
          active
            ? "bg-[#7C3AED]/20 text-primary shadow-[inset_0_0_0_1px_rgba(124,58,237,0.3)]"
            : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
        }
      `}
    >
      {icon}

      <span>{label}</span>

      <span
        className={`rounded-full px-2 py-0.5 font-code text-xs ${
          active
            ? "bg-primary/20 text-primary"
            : "bg-white/5 text-on-surface-variant"
        }`}
      >
        {count.toLocaleString()}
      </span>
    </button>
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

function RolePill({ role }: { role: string }) {
  const isAdmin = role === "ADMIN";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full px-3 py-1
        font-label-md text-label-md
        ${
          isAdmin
            ? "bg-tertiary/15 text-tertiary"
            : "bg-primary/10 text-primary"
        }
      `}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isAdmin
            ? "bg-tertiary shadow-[0_0_8px_rgba(74,225,118,0.6)]"
            : "bg-primary"
        }`}
      />

      {role}
    </span>
  );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 ${
        verified ? "text-tertiary" : "text-on-surface-variant"
      }`}
    >
      <div
        className={
          verified
            ? "h-1.5 w-1.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(74,225,118,0.6)]"
            : "h-1.5 w-1.5 rounded-full bg-on-surface-variant/40"
        }
      />

      <span className="font-medium text-label-md">
        {verified ? "Yes" : "No"}
      </span>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
