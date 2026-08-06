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
  Globe,
  Clock3,
} from "lucide-react";
import { ThreeBackground } from "../App";
import axiosinstance from "../utils/axiosInstance";
import { useSearchParams } from "react-router";

const PROFILE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBcYmJZF_M66dOjAkShFEruJ1vFQKOjZtYM2H0otAH3GkAWjezBokOSZLKVvAWXR4PkZJR-YkVviCJCZAQRUhgDzQRo4omO8MrXIzC_2Cff-lfXlVcLI7_2EyseIrf5Qm_1nme6b2aq9isimeRxPlaKWlfBeN806cWyi17MwvO3cDgFvmd7T87ZGa4WJr_jECYCGshwkZ9dNC1Ri29uh-ByRG2sQX8I7cO5C5YK9EhXF41N2iTLy01Y";

const COLORS = {
  primary: "#7C3AED",
  secondary: "#60A5FA",
  tertiary: "#4AE271",
  muted: "#52525B",
  surface: "#27272A",
};

const PALETTE = [COLORS.primary, COLORS.secondary, COLORS.tertiary];

const DEVICE_COLORS: Record<string, string> = {
  desktop: COLORS.primary,
  mobile: COLORS.secondary,
  tablet: COLORS.tertiary,
};

type AnalyticsLink = {
  id: string;
  destination: string;
  shortCode: string;
  clickCount: number;
  createdAt: string;
  expiresAt: string | null;
};

type AnalyticsPayload = {
  total: number;
  totalUrls?: number;
  timeline: Record<string, number>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  oses: Record<string, number>;
  referrers: Record<string, number>;
  recent: { time: string; browser: string; device: string; referrer: string }[];
};

export default function Analytics() {
  const [links, setLinks] = useState<AnalyticsLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [searchParams] = useSearchParams();

  // Deep-linking support: /analy?shortCode=xyz preselects that link.
  const requestedShortCode = searchParams.get("shortCode");

  const [selected, setSelected] = useState<string>(requestedShortCode ?? "all");

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

      // console.log("urls are",urls);

      const mapped: AnalyticsLink[] = urls.map((url: any) => ({
        id: url._id || url.id,
        destination: url.originalUrl || url.destination,
        shortCode: url.shortCode,
        clickCount: Number(url.clickCount) || 0,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt || null,
      }));
      //  console.log("lets check mapped ", mapped);
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

  // Fetch real per-click analytics for the selected link (or the overview
  // across all links when "all" is selected).
  useEffect(() => {
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const endpoint =
          selected === "all" ? "/analytics/overview" : `/analytics/${selected}`;
        const res: any = await axiosinstance.get(endpoint);
        setAnalytics(res?.data ?? null);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        setAnalytics(null);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [selected]);

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

  const selectedLabel = selected === "all" ? "All Links" : selected;
  const showEmpty = !loading && visibleLinks.length === 0;
  const shareOf = (value: number, total: number) =>
    total ? Math.round((value / total) * 100) : 0;

  // Breakdown slices for the per-click panels (fed by /analytics endpoints).
  const deviceEntries = useMemo(
    () => (analytics ? sortEntries(analytics.devices) : []),
    [analytics],
  );

  const deviceSegments = useMemo(
    () =>
      deviceEntries.map(([label, value], i) => ({
        value,
        color: DEVICE_COLORS[label] ?? PALETTE[i % PALETTE.length],
      })),
    [deviceEntries],
  );

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

            {/* CLICKS OVER TIME */}
            <section className="glass-card mb-stack-lg rounded-xl p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md">
                  Clicks Over Time
                </h3>

                <span className="font-body-sm text-on-surface-variant">
                  {selectedLabel}
                </span>
              </div>

              {analyticsLoading ? (
                <ChartSkeleton />
              ) : analytics && analytics.total > 0 ? (
                <ClicksOverTime timeline={analytics.timeline} />
              ) : (
                <EmptyState message="No clicks recorded yet. Share your link to start collecting data." />
              )}
            </section>

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

              {/* LINK STATUS */}
              <section className="glass-card col-span-12 flex flex-col rounded-xl p-8 lg:col-span-6">
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
            </div>

            {/* DEVICE / SOURCE / RECENT BREAKDOWN */}
            <div className="mt-stack-lg grid grid-cols-12 gap-stack-md">
              {/* DEVICES */}
              <section className="glass-card col-span-12 flex flex-col rounded-xl p-8 md:col-span-6 lg:col-span-3">
                <h3 className="mb-6 font-headline-md text-headline-md">
                  Devices
                </h3>

                {analyticsLoading ? (
                  <ChartSkeleton />
                ) : analytics && analytics.total > 0 ? (
                  <>
                    <div className="relative flex flex-grow items-center justify-center">
                      <Donut
                        segments={deviceSegments.map((s) => ({
                          value: s.value,
                          color: s.color,
                        }))}
                      />

                      <div className="absolute flex flex-col items-center">
                        <span className="font-headline-md text-headline-md">
                          {analytics.total.toLocaleString()}
                        </span>

                        <span className="font-label-md text-on-surface-variant">
                          clicks
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 space-y-2">
                      {deviceEntries.map(([label, value], i) => (
                        <DeviceRow
                          key={label}
                          label={capitalize(label)}
                          value={value.toLocaleString()}
                          dot={DEVICE_COLORS[label] ?? PALETTE[i % PALETTE.length]}
                          sub={`${shareOf(value, analytics.total)}%`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState message="No clicks yet" />
                )}
              </section>

              {/* BROWSERS + OS */}
              <section className="glass-card col-span-12 flex flex-col rounded-xl p-8 md:col-span-6 lg:col-span-3">
                <h3 className="mb-6 font-headline-md text-headline-md">
                  Browsers
                </h3>

                {analyticsLoading ? (
                  <ChartSkeleton />
                ) : analytics && analytics.total > 0 ? (
                  <div className="custom-scrollbar flex-grow space-y-6 overflow-y-auto">
                    <div>
                      <p className="mb-2 font-label-md text-on-surface-variant">
                        Browsers
                      </p>
                      <BreakdownList
                        entries={topEntries(analytics.browsers, 6)}
                        total={analytics.total}
                      />
                    </div>

                    <div>
                      <p className="mb-2 font-label-md text-on-surface-variant">
                        Operating Systems
                      </p>
                      <BreakdownList
                        entries={topEntries(analytics.oses, 6)}
                        total={analytics.total}
                      />
                    </div>
                  </div>
                ) : (
                  <EmptyState message="No clicks yet" />
                )}
              </section>

              {/* TOP REFERRERS */}
              <section className="glass-card col-span-12 flex flex-col rounded-xl p-8 md:col-span-6 lg:col-span-3">
                <h3 className="mb-6 font-headline-md text-headline-md">
                  Top Referrers
                </h3>

                {analyticsLoading ? (
                  <ChartSkeleton />
                ) : analytics && Object.keys(analytics.referrers).length > 0 ? (
                  <ReferrerList referrers={analytics.referrers} />
                ) : (
                  <EmptyState message="No referrer data yet" />
                )}
              </section>

              {/* RECENT CLICKS */}
              <section className="glass-card col-span-12 flex flex-col rounded-xl p-8 md:col-span-6 lg:col-span-3">
                <h3 className="mb-6 font-headline-md text-headline-md">
                  Recent Clicks
                </h3>

                {analyticsLoading ? (
                  <ChartSkeleton />
                ) : analytics && analytics.recent.length > 0 ? (
                  <RecentClicks recent={analytics.recent} />
                ) : (
                  <EmptyState message="No clicks yet" />
                )}
              </section>
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
  sub,
}: {
  label: string;
  value: string;
  dot: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: dot }} />
        <span className="font-body-sm">{label}</span>
      </div>

      <span className="font-code text-code">
        {value}
        {sub ? (
          <span className="ml-2 text-on-surface-variant">{sub}</span>
        ) : null}
      </span>
    </div>
  );
}

/* ---------------- ANALYTICS HELPERS ---------------- */

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

// Sort a `{ label: count }` object by count, descending.
function sortEntries(obj: Record<string, number>): [string, number][] {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

function topEntries(obj: Record<string, number>, n: number): [string, number][] {
  return sortEntries(obj).slice(0, n);
}

function formatDay(day: string) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function relativeTime(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ChartSkeleton() {
  return (
    <div className="flex h-full min-h-[160px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

/* Clicks-per-day bar chart. Matches the existing "Clicks by Link" bar
   style — fully visible even with a single day of data. */
function ClicksOverTime({ timeline }: { timeline: Record<string, number> }) {
  const entries = Object.entries(timeline).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  if (entries.length === 0) return null;

  // Cap at 30 bars so labels stay readable.
  const display = entries.length > 30 ? entries.slice(-30) : entries;

  return (
    <div>
      <div className="flex items-end gap-1" style={{ height: 200 }}>
        {display.map(([day, count]) => {
          const height = Math.max(8, Math.round((count / max) * 190));

          return (
            <div
              key={day}
              title={`${day} — ${count.toLocaleString()} click${count === 1 ? "" : "s"}`}
              className="group flex flex-1 flex-col items-center justify-end gap-1"
            >
              <span className="font-code text-[10px] text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100">
                {count.toLocaleString()}
              </span>

              <div
                className="w-full rounded-t-sm bg-primary/25 transition-all duration-300 hover:bg-[#7C3AED] group-hover:bg-primary/60"
                style={{ height: `${height}px` }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex justify-between font-label-md text-on-surface-variant">
        <span>{formatDay(display[0][0])}</span>

        <span>
          {total.toLocaleString()} clicks · {display.length} day
          {display.length === 1 ? "" : "s"}
        </span>

        <span>{formatDay(display[display.length - 1][0])}</span>
      </div>
    </div>
  );
}

/* Simple `label: value (sub%)` rows for browser/OS breakdowns. */
function BreakdownList({
  entries,
  total,
}: {
  entries: [string, number][];
  total: number;
}) {
  return (
    <div className="space-y-2">
      {entries.map(([label, value], i) => (
        <DeviceRow
          key={label}
          label={capitalize(label)}
          value={value.toLocaleString()}
          dot={PALETTE[i % PALETTE.length]}
          sub={total ? `${Math.round((value / total) * 100)}%` : undefined}
        />
      ))}
    </div>
  );
}

function ReferrerList({ referrers }: { referrers: Record<string, number> }) {
  const entries = sortEntries(referrers).slice(0, 8);
  const total = Object.values(referrers).reduce((sum, v) => sum + v, 0);

  return (
    <div className="custom-scrollbar flex-grow space-y-4 overflow-y-auto">
      {entries.map(([host, count]) => {
        const share = total ? Math.round((count / total) * 100) : 0;

        return (
          <div
            key={host}
            className="flex items-center justify-between rounded-lg border border-[#7C3AED]/10 bg-[#7C3AED]/10 p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white/10 font-code text-code text-on-surface-variant">
                <Globe size={14} />
              </span>

              <span className="block truncate font-code text-code text-primary">
                {host}
              </span>
            </div>

            <div className="shrink-0 text-right">
              <span className="block font-code text-code text-on-surface">
                {count.toLocaleString()}
              </span>

              <span className="block text-[10px] text-on-surface-variant">
                {share}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecentClicks({
  recent,
}: {
  recent: AnalyticsPayload["recent"];
}) {
  return (
    <div className="custom-scrollbar flex-grow space-y-4 overflow-y-auto">
      {recent.map((click, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/5 p-3"
        >
          <div className="min-w-0">
            <span className="block truncate font-body-sm text-on-surface">
              {capitalize(click.device)} · {click.browser}
            </span>

            <span className="block truncate text-xs text-on-surface-variant">
              {click.referrer}
            </span>
          </div>

          <span className="flex shrink-0 items-center gap-1 font-code text-code text-on-surface-variant">
            <Clock3 size={12} />
            {relativeTime(click.time)}
          </span>
        </div>
      ))}
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
