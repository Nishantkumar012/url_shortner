import { useEffect, useMemo, useState } from "react";
import axiosinstance from "../utils/axiosInstance";
// import { useNavigate } from "react-router";
import {
  Link as LinkIcon,
  Star,
  Zap,
  Archive,
  ChartNoAxesCombined,
  Network,
  Settings,
  Plus,
  Search,
  ListFilter,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Copy,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { ThreeBackground } from "../App";
import {  useNavigate } from "react-router";

const LOGO =
 "https://lh3.googleusercontent.com/aida-public/AB6AXuBgdTWjBxgLljLj0OL4xEvxNE5sUvv3veDbVYoyqiYOxLU54PKranBW0u0G1XEs-EbRzsEXq2Em-e-iYdUaPRPF8UMHKnZ3hLHIpk7uBP8Xy1W5A0K7GcNbJ4sABhViIb1vkZsh7YZRwXloCpkQUG7hYVv85N2VkX--BcqVP3UGil_qk91sJ8OwX6auzgHq8FTq0fZVShQLBc6U5IwqM3CTq_PFoBdTX1WFMSJX-pGXTl0XDtVioHyO";

const PROFILE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBA5ymn2v7UkijC1L7prIdim_ZcicgPa1SrcTpSqwFRivl-Gd9DxEaWJMVhwGTrSW-qGruSWEm-TvMGlKEu0YVHXs2NfxYHWVkbHo-4Z9dkn7FK2hxyinMqZisLmprl4EnhRkc_A3rADVDHle69sQac81ukFF2Wg7YvhzSLxn6c_gOkC0UrhvfRAbcU0N2K5CvQ7oJMiJ6J3KjaEcIiVcSnrytlYZ84agHsHkmhu-bFuPGmzFyI-l2N";

type LinkStatus = "Active" | "Paused";

type LinkItem = {
  id: number;
  destination: string;
  shortUrl: string;
  created: string;
  clicks: string;
  status: LinkStatus;
  isDeleted:boolean
  
};

const initialLinks: LinkItem[] = [
  {
    id: 1,
    destination:
      "https://github.com/developer-tools/obsidian-flux-theme-builder/v2/releases...",
    shortUrl: "snap.link/flux-v2",
    created: "Oct 24, 2023",
    clicks: "4,281",
    status: "Active",
  isDeleted:false

  },
  {
    id: 2,
    destination:
      "https://figma.com/file/marketing-assets-2024-bundle-q4/layers...",
    shortUrl: "snap.link/mktg-q4",
    created: "Nov 02, 2023",
    clicks: "842",
    status: "Paused",
  isDeleted:false

  },
  {
    id: 3,
    destination:
      "https://stripe.com/checkout/sessions/pro-subscription-annual-alex...",
    shortUrl: "snap.link/pro-sub",
    created: "Oct 12, 2023",
    clicks: "12,903",
    status: "Active",
  isDeleted:false

  },
];

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    originalUrl: "",
    alias: "",
    expiresAt: "",
  });
  const [updateForm,setUpdateForm] = useState({
    originalUrl: "",
  })
  // The link currently being edited, or null when the update modal is closed.
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate()

  // Fetch current user's URLs from backend
  const fetchUserUrls = async () => {
    try {
      setLoading(true);
      const response = await axiosinstance.get("/url/");

      // console.log("response urls", response);
      // Map backend response to LinkItem format
      const userLinks: LinkItem[] = response.data.map((url: any) => ({
        id: url._id || url.id,
        destination: url.originalUrl || url.destination,
        shortUrl: url.shortCode,
        created: new Date(url.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        clicks: url.clickCount?.toString() || "0",
        status: url.status || "Active",
        isDeleted:url.isDeleted
      }));

           console.log("the url is",response);
      setLinks(userLinks);
    } catch (error) {
      console.error("Failed to fetch URLs:", error);
      // Fallback to initialLinks on error
      setLinks(initialLinks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserUrls();
  }, []);



  const filteredLinks = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return links;

    return links.filter(
      (link) =>
        link.destination.toLowerCase().includes(value) ||
        link.shortUrl.toLowerCase().includes(value) ||
        link.status.toLowerCase().includes(value),
    );
  }, [links, search]);

  

  // Calculate stats from user's URLs
  const stats = useMemo(() => {
    const totalClicks = links.reduce((sum, link) => {
      const clicks = parseInt(link.clicks.replace(/,/g, ""), 10) || 0;
      return sum + clicks;
    }, 0);

    const activeLinks = links.filter((link) => link.status === "Active").length;

    return {
      totalClicks,
      activeLinks,
      totalLinks: links.length,
    };
  }, [links]);

  const handleCopy = async (link: LinkItem) => {
const shortUrl = `${import.meta.env.VITE_API_URL}/url/${link.shortUrl}`;
      // console.log(shortUrl);
    try {
      await navigator.clipboard.writeText(shortUrl);
    } catch {
      // Clipboard can be unavailable on non-secure localhost contexts.
    }

    setCopiedId(link.id);

    window.setTimeout(() => {
      setCopiedId((current) =>
        current === link.id ? null : current,
      );
    }, 2000);
  };

  const handleDelete = async(id: number,shortcode:string) => {
        
    try {
             await axiosinstance.delete(`url/${shortcode}`)

             console.log(shortcode)
    setLinks((current) =>
      current.filter((link) => link.id !== id),
    );
      
    } catch (error) {
         console.log("error", error);
    }
   
  };

  // Open the update modal. The field starts empty so you can paste/type a fresh
// destination; `editingLink` records WHICH link is being edited (its shortCode
// is the PATCH target) and is used to refresh that row on success.
  const openUpdateModal = (link: LinkItem) => {
    setEditingLink(link);
    setUpdateForm({ originalUrl: "" });
    setError("");
    setShowUpdateModal(true);
  };

  // Update the destination of an existing short URL
  const handleUpdateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;
    setError("");
    setCreating(true);

    try {
      await axiosinstance.patch(`/url/${editingLink.shortUrl}`, {
        originalUrl: updateForm.originalUrl,
      });

      // Reflect the new destination in the list
      setLinks((current) =>
        current.map((link) =>
          link.id === editingLink.id
            ? { ...link, destination: updateForm.originalUrl }
            : link,
        ),
      );

      setShowUpdateModal(false);
      setEditingLink(null);
      setUpdateForm({ originalUrl: "" });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update URL");
    } finally {
      setCreating(false);
    }
  };

  // Create new short URL
  const handleCreateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      const payload: any = {
        originalUrl: createForm.originalUrl,
      };

      if (createForm.alias.trim()) {
        payload.alias = createForm.alias.trim();
      }

      if (createForm.expiresAt.trim()) {
        payload.expiresAt = createForm.expiresAt.trim();
      }

      const response = await axiosinstance.post("/url/", payload);

      // Add new URL to the list
      const newUrl = response.data;
      const newLink: LinkItem = {
        id: newUrl._id || newUrl.id,
        destination: newUrl.originalUrl,
        shortUrl: newUrl.shortCode,
        created: new Date(newUrl.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        clicks: "0",
        status: "Active",
        isDeleted:false

      };

      setLinks((current) => [newLink, ...current]);
      setShowCreateModal(false);
      setCreateForm({ originalUrl: "", alias: "", expiresAt: "" });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create URL");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">

        <ThreeBackground/>
      {/* Atmospheric Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary-container/5 blur-[120px]" />

        <div className="absolute -bottom-52 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px]" />
      </div>

      {/* Create URL Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-panel relative w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                Create Short URL
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setError("");
                  setCreateForm({ originalUrl: "", alias: "", expiresAt: "" });
                }}
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUrl} className="space-y-4">
              {/* Original URL */}
              <div>
                <label className="mb-2 block text-label-md font-medium text-on-surface-variant">
                  Destination URL *
                </label>
                <input
                  type="url"
                  value={createForm.originalUrl}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, originalUrl: e.target.value })
                  }
                  placeholder="https://example.com/your-long-url"
                  required
                  className="w-full rounded-xl border border-white/10 bg-surface-container-low px-4 py-3 text-body-md outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Custom Alias */}
              <div>
                <label className="mb-2 block text-label-md font-medium text-on-surface-variant">
                  Custom Alias (optional)
                </label>
                <input
                  type="text"
                  value={createForm.alias}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, alias: e.target.value })
                  }
                  placeholder="my-custom-link"
                  minLength={3}
                  maxLength={32}
                  pattern="[a-zA-Z0-9_-]+"
                  className="w-full rounded-xl border border-white/10 bg-surface-container-low px-4 py-3 text-body-md outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1 text-xs text-on-surface-variant/60">
                  Letters, numbers, - and _ only (3-32 chars)
                </p>
              </div>

              {/* Expiration */}
              <div>
                <label className="mb-2 block text-label-md font-medium text-on-surface-variant">
                  Expiration (optional)
                </label>
                <input
                  type="text"
                  value={createForm.expiresAt}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, expiresAt: e.target.value })
                  }
                  placeholder="30m, 2h, 15d"
                  pattern="\d+(m|h|d)"
                  className="w-full rounded-xl border border-white/10 bg-surface-container-low px-4 py-3 text-body-md outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1 text-xs text-on-surface-variant/60">
                  Format: number + unit (m=minutes, h=hours, d=days)
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <p className="rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={creating || !createForm.originalUrl}
                className="w-full rounded-lg bg-[#7C3AED] px-6 py-3 font-label-md font-bold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:bg-[#8B5CF6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Short URL"}
              </button>
            </form>
          </div>
        </div>
      )}

        
         {/* Create URL Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-panel relative w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                Upate Short URL
              </h2>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setError("");
                  setEditingLink(null);
                  setUpdateForm({ originalUrl: "" })
                }}
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateUrl} className="space-y-4">
              {/* Original URL */}
              <div>
                <label className="mb-2 block text-label-md font-medium text-on-surface-variant">
                  New Destination URL *
                </label>
                <input
                  type="url"
                  value={updateForm.originalUrl}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, originalUrl: e.target.value })
                  }
                  placeholder="https://example.com/your-long-url"
                  required
                  className="w-full rounded-xl border border-white/10 bg-surface-container-low px-4 py-3 text-body-md outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Custom Alias */}

{/*               
              <div>
                <label className="mb-2 block text-label-md font-medium text-on-surface-variant">
                  Custom Alias (optional)
                </label>
                <input
                  type="text"
                  value={createForm.alias}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, alias: e.target.value })
                  }
                  placeholder="my-custom-link"
                  minLength={3}
                  maxLength={32}
                  pattern="[a-zA-Z0-9_-]+"
                  className="w-full rounded-xl border border-white/10 bg-surface-container-low px-4 py-3 text-body-md outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1 text-xs text-on-surface-variant/60">
                  Letters, numbers, - and _ only (3-32 chars)
                </p>
              </div> */}

              {/* Expiration */}
{/*               
              <div>
                <label className="mb-2 block text-label-md font-medium text-on-surface-variant">
                  Expiration (optional)
                </label>
                <input
                  type="text"
                  value={createForm.expiresAt}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, expiresAt: e.target.value })
                  }
                  placeholder="30m, 2h, 15d"
                  pattern="\d+(m|h|d)"
                  className="w-full rounded-xl border border-white/10 bg-surface-container-low px-4 py-3 text-body-md outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1 text-xs text-on-surface-variant/60">
                  Format: number + unit (m=minutes, h=hours, d=days)
                </p>
              </div> */}

              {/* Error Message */}
              {error && (
                <p className="rounded-lg bg-error/10 px-4 py-2 text-sm text-error">
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={creating || !updateForm.originalUrl}
                className="w-full rounded-lg bg-[#7C3AED] px-6 py-3 font-label-md font-bold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:bg-[#8B5CF6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Updating..." : "Update Short URL"}
              </button>
            </form>
          </div>
        </div>
      )}






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

            <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
              SnapLink
            </span>
          </div>

          {/* Navigation */}
          <nav className="mt-stack-lg flex-1 space-y-1">
            <SidebarItem
              icon={<LinkIcon size={21} />}
              label="My Links"
              active
            />

            <SidebarItem
              icon={<Star size={21} />}
              label="Favorites"
            />

            <SidebarItem
              icon={<Zap size={21} />}
              label="Recent Activity"
            />

            <SidebarItem
              icon={<Archive size={21} />}
              label="Archives"
            />

            <div className="px-gutter pt-stack-lg">
              <p className="pb-2 font-label-md text-label-md uppercase tracking-widest text-on-surface-variant/50">
                Insights
              </p>

              <SidebarItem
                icon={<ChartNoAxesCombined size={21} />}
                label="Analytics"
                inner
                onClick={() => navigate("/analy")}
              />

              <SidebarItem
                icon={<Network size={21} />}
                label="Integrations"
                inner
              />
            </div>
          </nav>

          {/* User */}
          <div className="mt-auto border-t border-white/5 p-gutter">
            <div className="group flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-primary/30 p-0.5">
                <img
                  src={PROFILE}
                  alt="Alex Rivera"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-bold">
                  Alex Rivera
                </p>

                <p className="truncate text-xs text-on-surface-variant">
                  Pro Plan
                </p>
              </div>

              <Settings
                size={20}
                className="text-on-surface-variant transition-colors group-hover:text-on-surface"
              />
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="custom-scrollbar flex flex-1 flex-col overflow-y-auto">

          {/* Header */}
          <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between border-b border-white/5 bg-background/50 px-stack-xl backdrop-blur-md">
            <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
              My Links
            </h1>

           <button
  className="
    group flex items-center gap-2
    rounded-lg px-6 py-2.5
    bg-[#7C3AED]
    text-white font-label-md
    shadow-[0_0_20px_rgba(124,58,237,0.3)]
    transition-all
    hover:bg-[#8B5CF6]
    hover:scale-[1.02]
    active:scale-[0.98]
  "
  onClick={() => setShowCreateModal(true)}
> <Plus
                size={20}
                className="transition-transform group-hover:rotate-90"
              />

              Create New
            </button>
          </header>

          <div className="mx-auto w-full max-w-7xl space-y-stack-lg p-stack-xl">

            {/* SEARCH / FILTERS */}
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="group relative w-full md:w-96">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search links or tags..."
                  className="w-full rounded-xl border border-white/10 bg-surface-container-low py-3 pl-12 pr-4 text-body-md outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex w-full items-center gap-2 md:w-auto">
                <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-container-high px-4 py-3 text-body-sm transition-colors hover:bg-surface-bright">
                  <ListFilter size={18} />
                  Status
                </button>

                <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-container-high px-4 py-3 text-body-sm transition-colors hover:bg-surface-bright">
                  <CalendarDays size={18} />
                  Date Range
                </button>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <StatCard
                title="Total Clicks"
                value={stats.totalClicks.toLocaleString()}
                glow="bg-primary/10"
              />

              <StatCard
                title="Active Links"
                value={stats.activeLinks.toString()}
                glow="bg-secondary/10"
              />

              <StatCard
                title="Total Links"
                value={stats.totalLinks.toString()}
                glow="bg-tertiary/10"
              />
            </div>

            {/* LINKS TABLE */}
            <div className="glass-panel overflow-hidden rounded-2xl border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <TableHeading>
                        Destination & Short URL
                      </TableHeading>

                      <TableHeading>Created</TableHeading>
                      <TableHeading>Clicks</TableHeading>
                      <TableHeading>Status</TableHeading>

                      <th className="px-6 py-4 text-right font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {filteredLinks.map((link) => (
                      <tr
                        key={link.id}
                        className="group transition-colors hover:bg-white/5"
                      >
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <span className="block max-w-xs truncate text-body-sm text-on-surface-variant">
                              {link.destination}
                            </span>

                            <span
                              className="cursor-pointer font-code font-bold text-primary hover:underline"
                              onClick={() => {
                                // Extract shortCode from shortUrl (e.g., "snap.link/abc123" → "abc123")
                                 window.open(
                                  `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/url/${link.shortUrl}`,
                                  "_blank")
                              }
                               
                            }
                            >
                              {link.shortUrl}
                            </span>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-body-sm text-on-surface-variant">
                          {link.created}
                        </td>

                        <td className="px-6 py-5 font-code text-body-sm">
                          {link.clicks}
                        </td>

                        <td className="px-6 py-5">
                          <Status status={link.status} />
                        </td>

                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">

                            {/* Copy */}
                            <button
                              onClick={() => handleCopy(link)}
                              className={`rounded-lg p-2 transition-all hover:bg-white/10 ${
                                copiedId === link.id
                                  ? "text-tertiary"
                                  : "text-on-surface-variant hover:text-on-surface"
                              }`}
                              title="Copy"
                            >
                              {copiedId === link.id ? (
                                <Check size={20} />
                              ) : (
                                <Copy size={20} />
                              )}
                            </button>

                            {/* Analytics */}
                            <button
                              className="rounded-lg p-2 text-on-surface-variant transition-all hover:bg-white/10 hover:text-on-surface"
                              title="Analytics"

                              onClick={()=>{navigate(`/analy?shortCode=${link.shortUrl}`)}}
                            >
                              <ChartNoAxesCombined size={20} />
                            </button>

                            {/* Edit */}
                            <button
                              className="rounded-lg p-2 text-on-surface-variant transition-all hover:bg-white/10 hover:text-on-surface"
                              title="Edit"

                                onClick={()=> openUpdateModal(link)}
                            >
                              <Pencil size={20} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(link.id,link.shortUrl)}
                              className="rounded-lg p-2 text-on-surface-variant transition-all hover:bg-error/10 hover:text-error"
                              title="Delete"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredLinks.length === 0 && (
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

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-white/5 bg-white/[0.02] px-6 py-4">
                <p className="text-body-sm text-on-surface-variant">
                  Showing 1-10 of 842 links
                </p>

                <div className="flex items-center gap-1">
                  <button
                    disabled
                    className="rounded-lg p-2 text-on-surface-variant hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-body-sm font-bold text-on-primary">
                    1
                  </button>

                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-body-sm text-on-surface-variant hover:bg-white/10">
                    2
                  </button>

                  <button className="flex h-8 w-8 items-center justify-center rounded-lg text-body-sm text-on-surface-variant hover:bg-white/10">
                    3
                  </button>

                  <button className="rounded-lg p-2 text-on-surface-variant hover:bg-white/10">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <footer className="flex flex-col items-center justify-between gap-4 pt-stack-xl font-label-md text-label-md text-on-surface-variant/60 md:flex-row">
              <p>© 2024 SnapLink. All rights reserved.</p>

              <div className="flex gap-stack-lg">
                {["Privacy", "Terms", "Support", "API"].map(
                  (item) => (
                    <a
                      key={item}
                      href="#"
                      className="transition-colors hover:text-primary"
                    >
                      {item}
                    </a>
                  ),
                )}
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

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
  onClick?: () => void;
}) {
  if (inner) {
    return (
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); onClick?.(); }}
        className="
          group -mx-3 flex items-center gap-3 rounded-lg px-3 py-3
          font-body-md text-on-surface-variant
          transition-all
          hover:bg-primary-container/10 hover:text-primary
        "
      >
        <span className="transition-transform group-hover:scale-110">
          {icon}
        </span>

        <span>{label}</span>
      </a>
    );
  }

  return (
    <a
      href="#"
      className={`
        group flex items-center gap-3
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

      <span className={active ? "font-semibold" : ""}>
        {label}
      </span>
    </a>
  );
}
function StatCard({
  title,
  value,
  glow,
  children,
}: {
  title: string;
  value: string;
  glow: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="glass-panel group relative overflow-hidden rounded-2xl p-6">
      <div
        className={`absolute -bottom-4 -right-4 h-24 w-24 rounded-full ${glow} blur-3xl transition-transform duration-500 group-hover:scale-150`}
      />

      <p className="mb-1 text-label-md text-on-surface-variant">
        {title}
      </p>

      <div className="relative flex items-end gap-2">
        <h3 className="text-headline-lg font-bold">
          {value}
        </h3>

        {children}
      </div>
    </div>
  );
}

function Status({ status }: { status: LinkStatus }) {
  const active = status === "Active";

  return (
    <div
      className={`flex items-center gap-1.5 ${
        active ? "text-tertiary" : "text-on-surface-variant"
      }`}
    >
      <div
        className={
          active
            ? "h-1.5 w-1.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(74,225,118,0.6)]"
            : "h-1.5 w-1.5 rounded-full bg-on-surface-variant/40"
        }
      />

      <span className="font-medium text-label-md">
        {status}
      </span>
    </div>
  );
}

function TableHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-6 py-4 font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
      {children}
    </th>
  );
}