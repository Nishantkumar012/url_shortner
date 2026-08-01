
import {
  Link as LinkIcon,
  LayoutDashboard,
  Share2,
  ChevronRight,
  CalendarDays,
  ChevronDown,
  MousePointerClick,
  Zap,
  Globe2,
  TrendingUp,
  QrCode,
  AtSign,
  PlayCircle,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { ThreeBackground } from "../App";

const PROFILE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBcYmJZF_M66dOjAkShFEruJ1vFQKOjZtYM2H0otAH3GkAWjezBokOSZLKVvAWXR4PkZJR-YkVviCJCZAQRUhgDzQRo4omO8MrXIzC_2Cff-lfXlVcLI7_2EyseIrf5Qm_1nme6b2aq9isimeRxPlaKWlfBeN806cWyi17MwvO3cDgFvmd7T87ZGa4WJr_jECYCGshwkZ9dNC1Ri29uh-ByRG2sQX8I7cO5C5YK9EhXF41N2iTLy01Y";

const MAP_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuABcL-3RAgB82H8dK8GSYTKIdQTn63EorkXKWPs-EnEJAnlQMuEUOvdC7fXarxoqP6ck_Q2azKRZt3HAc3_KL6Pg1LT0QZQF9NRdkOACXLiS5E_iTzFSBWufsW6y9oCwPsE4gAG9Yo6qYdNzTA9qFGFUC8CmCAiMLmKHQmr04OvSA_4qcTWwoBj3KGbu4J17pa3osZzeqn9oRVvpuWNf2OF4jIpLwna42HhKcFSUj0t-z-sgeDZEdAa";

const chartData = [40, 55, 45, 70, 85, 60, 75, 95, 80, 100];

const referrers = [
  {
    name: "facebook.com",
    clicks: "42,104",
    icon: QrCode,
    boxClass: "bg-blue-600/20 text-blue-400",
  },
  {
    name: "twitter.com",
    clicks: "31,892",
    icon: AtSign,
    boxClass: "bg-sky-400/20 text-sky-400",
  },
  {
    name: "youtube.com",
    clicks: "18,221",
    icon: PlayCircle,
    boxClass: "bg-red-600/20 text-red-400",
  },
  {
    name: "google.com",
    clicks: "12,005",
    icon: Search,
    boxClass: "bg-green-600/20 text-green-400",
  },
  {
    name: "Direct / Other",
    clicks: "8,432",
    icon: MoreHorizontal,
    boxClass: "bg-white/10 text-on-surface",
  },
];

const browsers = [
  {
    name: "Chrome",
    value: 62,
    className: "bg-primary",
  },
  {
    name: "Safari",
    value: 24,
    className: "bg-secondary",
  },
  {
    name: "Firefox",
    value: 10,
    className: "bg-tertiary",
  },
  {
    name: "Edge",
    value: 4,
    className: "bg-surface-container-highest",
  },
];

export default function Analytics() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#09090B] text-on-surface">
        <ThreeBackground/>
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-20">
        <div className="animate-pulse-slow absolute -right-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[120px]" />

        <div
          className="animate-pulse-slow absolute -bottom-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-secondary/10 blur-[120px]"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 z-50 h-20 w-full border-b border-white/10 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-container-max items-center justify-between px-gutter">

          <div className="flex items-center gap-8">
            <a
              href="#"
              className="flex items-center gap-2 font-headline-md text-headline-md font-bold tracking-tight text-on-surface"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C3AED]">
                <LinkIcon
                  size={20}
                  className="text-white"
                />
              </span>

              SnapLink
            </a>

            <div className="hidden md:flex">
              <a
                href="/dashboard"
                className="flex items-center gap-2 font-body-md text-on-surface-variant transition-all duration-200 hover:scale-105 hover:text-primary"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden items-center gap-2 rounded-lg border border-white/10 px-4 py-2 font-body-md text-on-surface-variant transition-all hover:bg-white/5 active:scale-95 md:flex">
              <Share2 size={20} />
              Share Link
            </button>

            <div className="h-10 w-10 rounded-full border border-primary/20 p-[2px]">
              <img
                src={PROFILE}
                alt="Profile"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="relative z-10 mx-auto w-full max-w-container-max flex-grow px-gutter pb-stack-xl pt-28">

        {/* HEADER */}
        <header className="mb-stack-lg flex flex-col justify-between gap-4 md:flex-row md:items-end">

          <div>
            <div className="mb-2 flex items-center gap-2 text-on-surface-variant">
              <span className="font-label-md text-label-md uppercase tracking-widest">
                Analytics
              </span>

              <ChevronRight size={14} />

              <span className="font-code text-code text-primary">
                snap.link/dev-nexus-2024
              </span>
            </div>

            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Link Performance Overview
            </h1>
          </div>

          <button className="glass-card flex items-center gap-3 rounded-lg px-4 py-2">
            <CalendarDays
              size={20}
              className="text-primary"
            />

            <span className="font-body-sm text-body-sm">
              Last 30 Days
            </span>

            <ChevronDown size={16} />
          </button>
        </header>

        {/* SUMMARY CARDS */}
        <div className="mb-stack-lg grid grid-cols-1 gap-stack-md sm:grid-cols-2 lg:grid-cols-4">

          <SummaryCard
            title="Total Clicks"
            value="124.8k"
            icon={
              <MousePointerClick size={20} />
            }
            iconClass="bg-primary/10 text-primary"
          >
            <span className="flex items-center gap-1 font-label-md text-tertiary">
              <TrendingUp size={14} />
              +12%
            </span>
          </SummaryCard>

          <SummaryCard
            title="Active Links"
            value="842"
            icon={<LinkIcon size={20} />}
            iconClass="bg-secondary/10 text-secondary"
          >
            <span className="font-label-md text-on-surface-variant">
              / 1k limit
            </span>
          </SummaryCard>

          <SummaryCard
            title="Today's Clicks"
            value="3,102"
            icon={<Zap size={20} />}
            iconClass="bg-tertiary/10 text-tertiary"
          >
            <span className="flex items-center gap-1 font-label-md text-primary">
              <TrendingUp size={14} />
              +5.4%
            </span>
          </SummaryCard>

          <SummaryCard
            title="Top Country"
            value="USA"
            icon={<Globe2 size={20} />}
            iconClass="bg-on-surface-variant/10 text-on-surface-variant"
          >
            <span className="font-label-md text-on-surface-variant">
              42% Traffic
            </span>
          </SummaryCard>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-12 gap-stack-md">

          {/* CLICKS CHART */}
          <section className="glass-card relative col-span-12 h-[400px] overflow-hidden rounded-xl p-8 lg:col-span-8">

            <div className="relative z-10 mb-8 flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md">
                Clicks Over Time
              </h3>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-primary" />

                <span className="font-label-md text-on-surface-variant">
                  Daily Engagement
                </span>
              </div>
            </div>

            {/* Chart */}
            <div className="absolute bottom-0 left-0 flex h-[250px] w-full items-end gap-2 px-8 pb-8">
              {chartData.map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t-sm bg-primary/20 transition-all duration-300 hover:bg-[#7C3AED]"
                  style={{
                    height: `${height}%`,
                  }}
                />
              ))}
            </div>

            <div className="chart-gradient-purple pointer-events-none absolute inset-0 opacity-40" />
          </section>

          {/* REFERRERS */}
          <section className="glass-card col-span-12 flex h-[400px] flex-col rounded-xl p-8 lg:col-span-4">

            <h3 className="mb-6 font-headline-md text-headline-md">
              Top Referrers
            </h3>

            <div className="custom-scrollbar flex-grow space-y-4 overflow-y-auto">
              {referrers.map((referrer) => {
                const Icon = referrer.icon;

                return (
                  <div
                    key={referrer.name}
                    className="flex items-center justify-between rounded-lg bg-[#7C3AED]/10
  border border-[#7C3AED]/10 p-3 transition-colors hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded ${referrer.boxClass}`}
                      >
                        <Icon size={18} />
                      </span>

                      <span className="font-body-md">
                        {referrer.name}
                      </span>
                    </div>

                    <span className="font-code text-code text-on-surface">
                      {referrer.clicks}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* GEOGRAPHIC DISTRIBUTION */}
          <section className="glass-card relative col-span-12 h-[450px] overflow-hidden rounded-xl p-8 lg:col-span-6">

            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md">
                Geographic Distribution
              </h3>

              <span className="font-body-sm text-on-surface-variant">
                Active Sessions
              </span>
            </div>

            <div className="h-[300px] w-full overflow-hidden rounded-lg border border-white/5 opacity-80 grayscale brightness-75">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url("${MAP_IMAGE}")`,
                }}
              />
            </div>

            <div className="absolute bottom-12 left-12 flex gap-6">
              <Region
                name="North America"
                value="54,120"
                color="text-primary"
              />

              <Region
                name="Europe"
                value="38,442"
                color="text-secondary"
              />

              <Region
                name="Asia"
                value="22,109"
                color="text-tertiary"
              />
            </div>
          </section>

          {/* DEVICES + BROWSERS */}
          <div className="col-span-12 grid grid-cols-1 gap-stack-md md:grid-cols-2 lg:col-span-6">

            {/* DEVICES */}
            <section className="glass-card flex flex-col rounded-xl p-8">

              <h3 className="mb-8 font-headline-md text-headline-md">
                Devices
              </h3>

              <div className="relative flex flex-grow items-center justify-center">

                <svg
                  className="h-32 w-32 -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#27272A"
                    strokeWidth="12"
                  />

                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#7C3AED"
                    strokeDasharray="251.2"
                    strokeDashoffset="75"
                    strokeWidth="12"
                  />

                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#60A5FA"
                    strokeDasharray="251.2"
                    strokeDashoffset="200"
                    strokeWidth="12"
                  />
                </svg>

                <div className="absolute flex flex-col items-center">
                  <span className="font-headline-md text-headline-md">
                    70%
                  </span>

                  <span className="font-label-md text-on-surface-variant">
                    Mobile
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <DeviceRow
                  label="Mobile"
                  value="70%"
                  dot="bg-[#7C3AED]"
                />

                <DeviceRow
                  label="Desktop"
                  value="25%"
                  dot="bg-secondary"
                />

                <DeviceRow
                  label="Tablet"
                  value="5%"
                  dot="bg-surface-container-highest"
                />
              </div>
            </section>

            {/* BROWSERS */}
            <section className="glass-card flex flex-col rounded-xl p-8">

              <h3 className="mb-8 font-headline-md text-headline-md">
                Browsers
              </h3>

              <div className="space-y-6">
                {browsers.map((browser) => (
                  <div
                    key={browser.name}
                    className="space-y-2"
                  >
                    <div className="flex justify-between font-label-md text-on-surface-variant">
                      <span>{browser.name}</span>
                      <span>{browser.value}%</span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full ${browser.className}`}
                        style={{
                          width: `${browser.value}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 mt-auto w-full border-t border-white/5 bg-surface-container-lowest py-stack-xl">
        <div className="mx-auto grid max-w-container-max grid-cols-2 gap-stack-lg px-gutter md:grid-cols-5">

          <div className="col-span-2">
            <div className="mb-4 text-xl font-bold text-on-surface">
              SnapLink
            </div>

            <p className="mb-6 max-w-xs font-body-sm text-on-surface-variant">
              Professional grade link management and real-time
              analytics for the modern web.
            </p>

            <p className="font-body-sm text-on-surface-variant/50">
              © 2024 SnapLink. Built for performance.
            </p>
          </div>

          <FooterColumn
            title="Product"
            links={["Features", "API", "Pricing"]}
          />

          <FooterColumn
            title="Legal"
            links={["Privacy", "Terms"]}
          />

          <FooterColumn
            title="Support"
            links={["Docs", "Community"]}
          />
        </div>
      </footer>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function SummaryCard({
  title,
  value,
  icon,
  iconClass,
  children,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="glass-card flex flex-col rounded-xl p-6">
      <div className="mb-4 flex items-start justify-between">
        <span className="font-label-md text-on-surface-variant">
          {title}
        </span>

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-headline-lg text-headline-lg">
          {value}
        </span>

        {children}
      </div>
    </div>
  );
}

function Region({
  name,
  value,
  color,
}: {
  name: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="font-label-md text-on-surface-variant">
        {name}
      </span>

      <span className={`font-code text-code ${color}`}>
        {value}
      </span>
    </div>
  );
}

function DeviceRow({
  label,
  value,
  dot,
}: {
  label: string;
  value: string;
  dot: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${dot}`} />
        <span className="font-body-sm">{label}</span>
      </div>

      <span className="font-code text-code">
        {value}
      </span>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: string[];
}) {
  return (
    <div>
      <h4 className="mb-4 font-label-md text-on-surface">
        {title}
      </h4>

      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link}>
            <a
              href="#"
              className="font-body-sm text-on-surface-variant transition-colors hover:text-primary"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}