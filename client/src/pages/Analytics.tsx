import { useEffect, useMemo, useState } from "react";
import {
  Link as LinkIcon,
  LayoutDashboard,
  Share2,
  ChevronRight,
  CalendarDays,
  ChevronDown,
  MousePointerClick,
  TrendingUp,
  Trophy,
  Activity,
} from "lucide-react";
import { ThreeBackground } from "../App";
import axiosinstance from "../utils/axiosInstance";
import { useSearchParams } from "react-router";

const PROFILE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBcYmJZF_M66dOjAkShFEruJ1vFQKOjZtYM2H0otAH3GkAWjezBokOSZLKVvAWXR4PkZJR-YkVviCJCZAQRUhgDzQRo4omO8MrXIzC_2Cff-lfXlVcLI7_2EyseIrf5Qm_1nme6b2aq9isimeRxPlaKWlfBeN806cWyi17MwvO3cDgFvmd7T87ZGa4WJr_jECYCGshwkZ9dNC1Ri29uh-ByRG2sQX8I7cO5C5YK9EhXF41N2iTLy01Y";

const DAY = 86_400_000;

const COLORS = {
  primary: "#7C3AED",
  secondary: "#60A5FA",
  tertiary: "#4AE271",
  muted: "#52525B",
  surface: "#27272A",
};

const PALETTE = [COLORS.primary, COLORS.secondary, COLORS.tertiary];

type AnalyticsLink = {
  id: string;
  destination: string;
  shortCode: string;
  clickCount: number;
  createdAt: string;
  expiresAt: string | null;
};

export default function Analytics() {
  const [links, setLinks] = useState<AnalyticsLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>("all");
  const [searchParams] = useSearchParams();

  // Deep-linking support: /analy?shortCode=xyz preselects that link.
  const requestedShortCode = searchParams.get("shortCode");

  useEffect(() => {
    if (requestedShortCode) {
      setSelected(requestedShortCode);
    }
  }, [requestedShortCode]);

  // Fetch the current user's real links (same source as the Dashboard).
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response: any = await axiosinstance.get("/url/");
      const urls = Array.isArray(response?.data) ? response.data : [];

      const mapped: AnalyticsLink[] = urls.map((url: any) => ({
        id: url._id || url.id,
        destination: url.originalUrl || url.destination,
        shortCode: url.shortCode,
        clickCount: Number(url.clickCount) || 0,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt || null,
      }));

      setLinks(mapped);
    } catch (error) {
      console.error("Failed to fetch analytics links:", error);
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const allSortedLinks = useMemo(
    () => [...links].sort((a, b) => b.clickCount - a.clickCount),
    [links],
  );

  // When a single link is selected from the dropdown, every panel below
  // narrows to just that link's data.
  const visibleLinks = useMemo(() => {
    if (selected === "all") return links;
    const match = links.filter((l) => l.shortCode === selected);
    // Fall back to all links if the deep-linked shortCode no longer exists.
    return match.length > 0 ? match : links;
  }, [links, selected]);

  const sortedLinks = useMemo(
    () => [...visibleLinks].sort((a, b) => b.clickCount - a.clickCount),
    [visibleLinks],
  );

  const totalClicks = useMemo(
    () => visibleLinks.reduce((sum, l) => sum + l.clickCount, 0),
    [visibleLinks],
  );

  const activeCount = useMemo(
    () =>
      visibleLinks.filter(
        (l) => !l.expiresAt || new Date(l.expiresAt).getTime() > Date.now(),
      ).length,
    [visibleLinks],
  );

  const expiredCount = visibleLinks.length - activeCount;
  const topLink = sortedLinks[0];
  const avgClicks = visibleLinks.length
    ? Math.round(totalClicks / visibleLinks.length)
    : 0;
  const maxClicks = Math.max(...visibleLinks.map((l) => l.clickCount), 1);

  const chartLinks = sortedLinks.slice(0, 12);

  // Click share across the top links (+ "Others" bucket).
  const clickShare = useMemo(() => {
    const top = sortedLinks.slice(0, 3);
    const topSum = top.reduce((sum, l) => sum + l.clickCount, 0);
    const others = totalClicks - topSum;

    const segments = top.map((l, i) => ({
      label: l.shortCode,
      value: l.clickCount,
      color: PALETTE[i % PALETTE.length],
    }));

    if (others > 0) {
      segments.push({ label: "Others", value: others, color: COLORS.muted });
    }

    return segments;
  }, [sortedLinks, totalClicks]);

  const statusSegments = [
    { label: "Active", value: activeCount, color: COLORS.tertiary },
    { label: "Expired", value: expiredCount, color: COLORS.muted },
  ];

  // Bucket links by how long ago they were created.
  const ageBuckets = useMemo(() => {
    const now = Date.now();
    const buckets = [
      { label: "Last 7 days", count: 0 },
      { label: "Last 30 days", count: 0 },
      { label: "Last 90 days", count: 0 },
      { label: "Older", count: 0 },
    ];

    visibleLinks.forEach((l) => {
      const age = now - new Date(l.createdAt).getTime();
      if (age <= 7 * DAY) buckets[0].count++;
      else if (age <= 30 * DAY) buckets[1].count++;
      else if (age <= 90 * DAY) buckets[2].count++;
      else buckets[3].count++;
    });

    return buckets;
  }, [visibleLinks]);

  const selectedLabel = selected === "all" ? "All Links" : selected;
  const showEmpty = !loading && visibleLinks.length === 0;
  const shareOf = (value: number, total: number) =>
    total ? Math.round((value / total) * 100) : 0;

  // console.log("visible clicks", visibleLinks);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#09090B] text-on-surface">
      <ThreeBackground />
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-20">
        <div className="animate-pulse-slow absolute -right-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[120px]" />

        <div
          className="animate-pulse-slow absolute -bottom-[10%] left-[10%] h-[50%] w-[50%] rounded-full bg-secondary/10 blur-[120px]"
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
                <LinkIcon size={20} className="text-white" />
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
                {selectedLabel}
              </span>
            </div>

            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Link Performance Overview
            </h1>
          </div>

          {/* Link selector — view all links or drill into one */}
          <div className="relative w-full md:w-64">
            <CalendarDays
              size={20}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary"
            />

            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="glass-card w-full cursor-pointer appearance-none rounded-lg py-2 pl-10 pr-9 font-body-sm text-body-sm text-on-surface outline-none"
            >
              <option value="all">All Links ({links.length})</option>

              {allSortedLinks.map((link) => (
                <option key={link.id} value={link.shortCode}>
                  {link.shortCode}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-on-surface-variant">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 font-body-sm">Loading your links...</p>
          </div>
        ) : (
          <>
            {/* SUMMARY CARDS */}
            <div className="mb-stack-lg grid grid-cols-1 gap-stack-md sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                title="Total Clicks"
                value={totalClicks.toLocaleString()}
                icon={<MousePointerClick size={20} />}
                iconClass="bg-primary/10 text-primary"
              >
                <span className="font-label-md text-on-surface-variant">
                  {/* {visibleLinks.length} links */}
                </span>
              </SummaryCard>

              <SummaryCard
                title="Active Links"
                value={activeCount.toLocaleString()}
                icon={<LinkIcon size={20} />}
                iconClass="bg-secondary/10 text-secondary"
              >
                <span className="font-label-md text-on-surface-variant">
                  / {visibleLinks.length} total
                </span>
              </SummaryCard>

              <SummaryCard
                title="Most Clicked"
                value={topLink ? topLink.shortCode : "—"}
                icon={<Trophy size={20} />}
                iconClass="bg-tertiary/10 text-tertiary"
              >
                <span className="font-label-md text-on-surface-variant">
                  {topLink
                    ? `${topLink.clickCount.toLocaleString()} clicks`
                    : "No data"}
                </span>
              </SummaryCard>

              <SummaryCard
                title="Avg Clicks / Link"
                value={avgClicks.toLocaleString()}
                icon={<TrendingUp size={20} />}
                iconClass="bg-on-surface-variant/10 text-on-surface-variant"
              >
                <span className="font-label-md text-on-surface-variant">
                  per link
                </span>
              </SummaryCard>
            </div>

            {/* BENTO GRID */}
            <div className="grid grid-cols-12 gap-stack-md">
              {/* CLICKS BY LINK CHART */}
              <section className="glass-card relative col-span-12 h-[400px] overflow-hidden rounded-xl p-8 lg:col-span-8">
                <div className="relative z-10 mb-8 flex items-center justify-between">
                  <h3 className="font-headline-md text-headline-md">
                    Clicks by Link
                  </h3>

                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-primary" />
                    <span className="font-label-md text-on-surface-variant">
                      {totalClicks.toLocaleString()} total clicks
                    </span>
                  </div>
                </div>

                {showEmpty ? (
                  <EmptyState />
                ) : (
                  <div className="absolute bottom-0 left-0 flex h-[250px] w-full items-end gap-2 px-8 pb-8">
                    {chartLinks.map((link) => {
                      const height = Math.max(
                        6,
                        Math.round((link.clickCount / maxClicks) * 190),
                      );

                      return (
                        <div
                          key={link.id}
                          title={`${link.shortCode} — ${link.clickCount.toLocaleString()} clicks`}
                          className="group relative flex h-full flex-1 cursor-pointer flex-col items-center justify-end gap-1"
                        >
                          <span className="font-code text-[10px] text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100">
                            {link.clickCount.toLocaleString()}
                          </span>

                          <div
                            className="w-full rounded-t-sm bg-primary/25 transition-all duration-300 hover:bg-[#7C3AED] group-hover:bg-primary/60"
                            style={{ height: `${height}px` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {!showEmpty && chartLinks.length < visibleLinks.length && (
                  <p className="absolute bottom-2 left-8 font-label-md text-on-surface-variant/60">
                    Showing top {chartLinks.length} of {visibleLinks.length}{" "}
                    links
                  </p>
                )}

                <div className="chart-gradient-purple pointer-events-none absolute inset-0 opacity-40" />
              </section>

              {/* TOP LINKS */}
              <section className="glass-card col-span-12 flex h-[400px] flex-col rounded-xl p-8 lg:col-span-4">
                <h3 className="mb-6 font-headline-md text-headline-md">
                  Top Links
                </h3>

                {showEmpty ? (
                  <EmptyState />
                ) : (
                  <div className="custom-scrollbar flex-grow space-y-4 overflow-y-auto">
                    {sortedLinks.slice(0, 8).map((link, index) => {
                      const share = shareOf(link.clickCount, totalClicks);

                      return (
                        <div
                          key={link.id}
                          className="flex items-center justify-between rounded-lg border border-[#7C3AED]/10 bg-[#7C3AED]/10 p-3 transition-colors hover:bg-white/10"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white/10 font-code text-code text-on-surface-variant">
                              {index + 1}
                            </span>

                            <div className="min-w-0">
                              <span className="block truncate font-code text-code text-primary">
                                {link.shortCode}
                              </span>

                              <span className="block max-w-[180px] truncate text-xs text-on-surface-variant">
                                {link.destination}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className="block font-code text-code text-on-surface">
                              {link.clickCount.toLocaleString()}
                            </span>

                            <span className="block text-[10px] text-on-surface-variant">
                              {share}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* CLICK SHARE */}
              <section className="glass-card relative col-span-12 h-[450px] overflow-hidden rounded-xl p-8 lg:col-span-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-headline-md text-headline-md">
                    Click Share
                  </h3>

                  <span className="font-body-sm text-on-surface-variant">
                    {visibleLinks.length} links
                  </span>
                </div>

                {showEmpty ? (
                  <EmptyState />
                ) : (
                  <>
                    <div className="relative flex h-[300px] w-full items-center justify-center">
                      <Donut
                        segments={clickShare.map((s) => ({
                          value: s.value,
                          color: s.color,
                        }))}
                      />

                      <div className="absolute flex flex-col items-center">
                        <span className="font-headline-md text-headline-md">
                          {totalClicks.toLocaleString()}
                        </span>

                        <span className="font-label-md text-on-surface-variant">
                          clicks
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-10 left-12 flex flex-wrap gap-6">
                      {clickShare.map((segment) => (
                        <Region
                          key={segment.label}
                          name={segment.label}
                          value={`${shareOf(segment.value, totalClicks)}%`}
                          color={segment.color}
                        />
                      ))}
                    </div>
                  </>
                )}
              </section>

              {/* STATUS + AGE */}
              <div className="col-span-12 grid grid-cols-1 gap-stack-md md:grid-cols-2 lg:col-span-6">
                {/* LINK STATUS */}
                <section className="glass-card flex flex-col rounded-xl p-8">
                  <h3 className="mb-8 font-headline-md text-headline-md">
                    Link Status
                  </h3>

                  {showEmpty ? (
                    <EmptyState />
                  ) : (
                    <>
                      <div className="relative flex flex-grow items-center justify-center">
                        <Donut
                          segments={statusSegments.map((s) => ({
                            value: s.value,
                            color: s.color,
                          }))}
                        />

                        <div className="absolute flex flex-col items-center">
                          <span className="font-headline-md text-headline-md">
                            {activeCount}
                          </span>

                          <span className="font-label-md text-on-surface-variant">
                            Active
                          </span>
                        </div>
                      </div>

                      <div className="mt-8 space-y-2">
                        <DeviceRow
                          label="Active"
                          value={activeCount.toString()}
                          dot={COLORS.tertiary}
                        />

                        <DeviceRow
                          label="Expired"
                          value={expiredCount.toString()}
                          dot={COLORS.muted}
                        />
                      </div>
                    </>
                  )}
                </section>

                {/* LINKS BY AGE */}
                <section className="glass-card flex flex-col rounded-xl p-8">
                  <h3 className="mb-8 font-headline-md text-headline-md">
                    Links by Age
                  </h3>

                  {showEmpty ? (
                    <EmptyState />
                  ) : (
                    <div className="flex-grow space-y-6">
                      {ageBuckets.map((bucket) => {
                        const pct = shareOf(
                          bucket.count,
                          visibleLinks.length,
                        );

                        return (
                          <div key={bucket.label} className="space-y-2">
                            <div className="flex justify-between font-label-md text-on-surface-variant">
                              <span>{bucket.label}</span>
                              <span>
                                {bucket.count} · {pct}%
                              </span>
                            </div>

                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                              <div
                                className={`h-full rounded-full ${
                                  pct >= 50
                                    ? "bg-primary"
                                    : pct >= 25
                                      ? "bg-secondary"
                                      : "bg-surface-container-highest"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 mt-auto w-full border-t border-white/5 bg-surface-container-lowest py-stack-xl">
        <div className="mx-auto grid max-w-container-max grid-cols-2 gap-stack-lg px-gutter md:grid-cols-5">
          <div className="col-span-2">
            <div className="mb-4 text-xl font-bold text-on-surface">
              SnapLink
            </div>

            <p className="mb-6 max-w-xs font-body-sm text-on-surface-variant">
              Professional grade link management and real-time analytics for the
              modern web.
            </p>

            <p className="font-body-sm text-on-surface-variant/50">
              © 2024 SnapLink. Built for performance.
            </p>
          </div>

          <FooterColumn title="Product" links={["Features", "API", "Pricing"]} />
          <FooterColumn title="Legal" links={["Privacy", "Terms"]} />
          <FooterColumn title="Support" links={["Docs", "Community"]} />
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
        <span className="font-label-md text-on-surface-variant">{title}</span>

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </span>
      </div>

      <div className="flex min-w-0 items-baseline gap-2">
        <span className="truncate font-headline-lg text-headline-lg">
          {value}
        </span>

        {children}
      </div>
    </div>
  );
}

function Donut({
  segments,
}: {
  segments: { value: number; color: string }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const CIRC = 2 * Math.PI * 40;
  let acc = 0;

  return (
    <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="transparent"
        stroke={COLORS.surface}
        strokeWidth="12"
      />

      {segments
        .filter((s) => s.value > 0)
        .map((segment, index) => {
          const dash = (segment.value / total) * CIRC;
          const element = (
            <circle
              key={index}
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={segment.color}
              strokeWidth="12"
              strokeDasharray={`${dash} ${CIRC - dash}`}
              strokeDashoffset={-acc}
            />
          );
          acc += dash;
          return element;
        })}
    </svg>
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
      <span className="font-label-md text-on-surface-variant">{name}</span>

      <span className="font-code text-code" style={{ color }}>
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
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: dot }} />
        <span className="font-body-sm">{label}</span>
      </div>

      <span className="font-code text-code">{value}</span>
    </div>
  );
}

function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex h-full min-h-[140px] items-center justify-center">
      <p className="max-w-xs text-center font-body-sm text-on-surface-variant">
        {message ?? "No links yet. Create a short URL on the dashboard to see analytics here."}
      </p>
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
      <h4 className="mb-4 font-label-md text-on-surface">{title}</h4>

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
