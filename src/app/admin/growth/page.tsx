"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Sparkles,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Building2,
  TrendingDown,
  Award,
  Loader2,
  Share2,
  ExternalLink,
  Flame,
  ArrowRight,
  Inbox,
  Clock,
  RefreshCw,
  CheckCircle2,
  Tag,
  MapPin,
  Filter,
  Globe2,
  Zap,
  Target,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  BarChart3,
  ShieldCheck,
  Send,
  Eye,
} from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
import { PanIndiaLead } from "@/lib/growthEngine";

interface InboundLead {
  id: string;
  businessName: string;
  city: string | null;
  category: string | null;
  phone: string;
  source: string;
  notes: string | null;
  status: string;
  createdAt: string;
}

const INDIAN_LANGUAGES = [
  { id: "telugu", label: "Telugu", native: "తెలుగు", badge: "AP / TS" },
  { id: "hindi", label: "Hindi", native: "हिन्दी", badge: "Pan-India" },
  { id: "english", label: "English", native: "English", badge: "Corporate" },
  { id: "tamil", label: "Tamil", native: "தமிழ்", badge: "TN" },
  { id: "kannada", label: "Kannada", native: "ಕನ್ನಡ", badge: "KA" },
  { id: "malayalam", label: "Malayalam", native: "മലയാളം", badge: "KL" },
  { id: "marathi", label: "Marathi", native: "मराठी", badge: "MH" },
  { id: "gujarati", label: "Gujarati", native: "ગુજરાતી", badge: "GJ" },
  { id: "bengali", label: "Bengali", native: "বাংলা", badge: "WB" },
];

const POPULAR_CITIES = [
  { id: "Kadapa", label: "Kadapa", state: "Andhra Pradesh" },
  { id: "Tirupati", label: "Tirupati", state: "Andhra Pradesh" },
  { id: "Vijayawada", label: "Vijayawada", state: "Andhra Pradesh" },
  { id: "Visakhapatnam", label: "Visakhapatnam", state: "Andhra Pradesh" },
  { id: "Hyderabad", label: "Hyderabad", state: "Telangana" },
  { id: "Bengaluru", label: "Bengaluru", state: "Karnataka" },
  { id: "Chennai", label: "Chennai", state: "Tamil Nadu" },
  { id: "Kochi", label: "Kochi", state: "Kerala" },
  { id: "Mumbai", label: "Mumbai", state: "Maharashtra" },
  { id: "Pune", label: "Pune", state: "Maharashtra" },
  { id: "Ahmedabad", label: "Ahmedabad", state: "Gujarat" },
  { id: "Delhi NCR", label: "Delhi NCR", state: "Delhi" },
  { id: "Jaipur", label: "Jaipur", state: "Rajasthan" },
  { id: "Lucknow", label: "Lucknow", state: "Uttar Pradesh" },
  { id: "Kolkata", label: "Kolkata", state: "West Bengal" },
];

const POPULAR_CATEGORIES = [
  "Restaurants & Cafes",
  "Dental Clinics & Healthcare",
  "Hair Salons & Beauty Spas",
  "Jewellery & Gold Showrooms",
  "Clothing Boutiques & Menswear",
  "Automobile & Car Care Services",
  "Hotels & Travel Agencies",
];

export default function AdminGrowthPage() {
  const [activeTab, setActiveTab] = useState<"radar" | "audit" | "inbound">("radar");

  // Market Radar State
  const [selectedCity, setSelectedCity] = useState("Kadapa");
  const [customCity, setCustomCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Restaurants & Cafes");
  const [filterHotOnly, setFilterHotOnly] = useState(false);
  const [activeLangByLead, setActiveLangByLead] = useState<Record<string, string>>({});
  const [leads, setLeads] = useState<PanIndiaLead[]>([]);
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [radarError, setRadarError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedDossier, setExpandedDossier] = useState<Record<string, boolean>>({});

  // 360 Custom Audit State
  const [auditBusinessName, setAuditBusinessName] = useState("");
  const [auditCity, setAuditCity] = useState("Kadapa");
  const [auditCategory, setAuditCategory] = useState("Restaurants & Cafes");
  const [auditResult, setAuditResult] = useState<PanIndiaLead | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState("");
  const [auditActiveLang, setAuditActiveLang] = useState("telugu");
  const [copiedAudit, setCopiedAudit] = useState(false);

  // Inbound Leads CRM State
  const [inboundLeads, setInboundLeads] = useState<InboundLead[]>([]);
  const [loadingInbound, setLoadingInbound] = useState(false);
  const [inboundFilter, setInboundFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Initial Scan on load
  useEffect(() => {
    runRadarScan("Kadapa", "Restaurants & Cafes");
    fetchInboundLeads();
  }, []);

  // 1. Radar Scan
  const runRadarScan = async (cityToUse?: string, categoryToUse?: string) => {
    const city = (customCity.trim() || cityToUse || selectedCity).trim();
    const category = (categoryToUse || selectedCategory).trim();

    setLoadingRadar(true);
    setRadarError("");

    try {
      const res = await fetch("/api/admin/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "scan",
          city,
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to scan market");
      }

      setLeads(data.leads || []);
      // Default all leads to Telugu if in AP/TS, or Hindi/English for others
      const defaultLang = ["Kadapa", "Tirupati", "Vijayawada", "Visakhapatnam", "Hyderabad"].includes(city)
        ? "telugu"
        : "hindi";

      const initLangs: Record<string, string> = {};
      (data.leads || []).forEach((lead: PanIndiaLead) => {
        initLangs[lead.id] = defaultLang;
      });
      setActiveLangByLead(initLangs);
    } catch (err: any) {
      setRadarError(err?.message || "Radar scan failed");
    } finally {
      setLoadingRadar(false);
    }
  };

  // 2. Custom 360 Deep Audit
  const runDeepAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditBusinessName.trim()) return;

    setLoadingAudit(true);
    setAuditError("");

    try {
      const res = await fetch("/api/admin/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "deep_audit",
          customBusinessName: auditBusinessName.trim(),
          city: auditCity.trim(),
          category: auditCategory.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Deep audit failed");
      }

      if (data.leads && data.leads.length > 0) {
        setAuditResult(data.leads[0]);
      }
    } catch (err: any) {
      setAuditError(err?.message || "Commercial audit failed");
    } finally {
      setLoadingAudit(false);
    }
  };

  // 3. Inbound Pipeline Fetch
  const fetchInboundLeads = async () => {
    setLoadingInbound(true);
    try {
      const res = await fetch("/api/lead/capture");
      const data = await res.json();
      if (res.ok && data.leads) {
        setInboundLeads(data.leads);
      }
    } catch (err) {
      console.error("Failed to load inbound leads:", err);
    } finally {
      setLoadingInbound(false);
    }
  };

  const updateInboundStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/lead/capture", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setInboundLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status } : l))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyLeadPitch = async (leadId: string, text: string) => {
    await copyToClipboard(text);
    setCopiedId(leadId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyAuditPitch = async (text: string) => {
    await copyToClipboard(text);
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 2500);
  };

  const toggleDossier = (id: string) => {
    setExpandedDossier((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExportCsv = () => {
    if (leads.length === 0) return;

    const headers = [
      "Business Name",
      "Locality",
      "City",
      "State",
      "Category",
      "Phone",
      "Google Rating",
      "Reviews",
      "Top Competitor",
      "Competitor Reviews",
      "Review Deficit",
      "Target Audience",
      "Pain Point",
      "Marketing Opportunity",
      "Hardware Placement",
      "Live Demo URL",
      "Pitch - Telugu",
      "Pitch - Hindi",
      "Pitch - English",
    ];

    const rows = leads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.locality.replace(/"/g, '""')}"`,
      `"${l.city.replace(/"/g, '""')}"`,
      `"${l.state.replace(/"/g, '""')}"`,
      `"${l.category.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      l.currentRating,
      l.currentReviews,
      `"${l.competitorName.replace(/"/g, '""')}"`,
      l.competitorReviews,
      l.reviewDeficit,
      `"${(l.targetAudience || "").replace(/"/g, '""')}"`,
      `"${(l.painPoint || "").replace(/"/g, '""')}"`,
      `"${(l.marketingOpportunity || "").replace(/"/g, '""')}"`,
      `"${(l.hardwarePlacement || "").replace(/"/g, '""')}"`,
      `"${l.demoUrl}"`,
      `"${(l.pitches?.telugu || "").replace(/"/g, '""')}"`,
      `"${(l.pitches?.hindi || "").replace(/"/g, '""')}"`,
      `"${(l.pitches?.english || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ReviewSmart_GrowthLeads_${selectedCity}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedLeads = filterHotOnly ? leads.filter((l) => l.isHotLead) : leads;

  const filteredInbound = inboundLeads.filter((l) => {
    if (inboundFilter === "ALL") return true;
    return l.status === inboundFilter;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* ── TOP HERO HEADER ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Pan-India Autonomous Growth Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              AI Growth Engine 🚀
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
              Scan high-intent retail businesses across all Indian states, audit Google Maps vulnerabilities, and send hyper-personalized pitches in <span className="text-amber-300 font-semibold">9 Indian Languages</span> with 1-click live preview demos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                ₹0
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Telecom Cost</div>
                <div className="text-xs font-semibold text-white">Direct WhatsApp API</div>
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                9
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Languages</div>
                <div className="text-xs font-semibold text-white">Pan-India Reach</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS BAR ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mt-8 border-b border-slate-800/80 pb-1">
          <button
            onClick={() => setActiveTab("radar")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "radar"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Compass className="w-4 h-4" />
            Pan-India Market Radar
            <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] bg-indigo-900/60 text-indigo-200 border border-indigo-700/50">
              {leads.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "audit"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Target className="w-4 h-4" />
            360° Custom Deep Audit
          </button>

          <button
            onClick={() => setActiveTab("inbound")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "inbound"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Inbox className="w-4 h-4" />
            Inbound Leads CRM
            {inboundLeads.filter((l) => l.status === "NEW").length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] bg-rose-500 text-white font-bold animate-pulse">
                {inboundLeads.filter((l) => l.status === "NEW").length} NEW
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── TAB 1: PAN-INDIA MARKET RADAR ───────────────────────────── */}
      {activeTab === "radar" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 flex-1">
                {/* City Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    Target Indian City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setCustomCity("");
                    }}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {POPULAR_CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label} ({c.state})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom City input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                    Or Any Other Indian City
                  </label>
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="e.g. Surat, Coimbatore, Indore..."
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Category Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    Business Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {POPULAR_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2 lg:pt-0">
                <button
                  onClick={() => runRadarScan()}
                  disabled={loadingRadar}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {loadingRadar ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scanning Market...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Scan Market Radar
                    </>
                  )}
                </button>

                {leads.length > 0 && (
                  <button
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition-all"
                    title="Export Scanned Leads with Pitches to CSV"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    Export CSV
                  </button>
                )}
              </div>
            </div>

            {/* Filter Chips */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-medium">Quick Filters:</span>
                <button
                  onClick={() => setFilterHotOnly(!filterHotOnly)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
                    filterHotOnly
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/50 font-semibold"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  Hot Leads Only (Deficit &gt; 100)
                </button>
              </div>

              <div className="text-slate-400">
                Showing <strong className="text-white">{displayedLeads.length}</strong> high-opportunity businesses in{" "}
                <span className="text-indigo-300 font-medium">{customCity || selectedCity}</span>
              </div>
            </div>
          </div>

          {/* Radar Error Notice */}
          {radarError && (
            <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl flex items-center gap-3 text-rose-200 text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{radarError}</span>
            </div>
          )}

          {/* Leads Grid */}
          <div className="grid grid-cols-1 gap-6">
            {displayedLeads.map((lead) => {
              const currentLang = activeLangByLead[lead.id] || "telugu";
              const currentPitch = lead.pitches?.[currentLang] || lead.pitches?.english || "";
              const isExpanded = expandedDossier[lead.id] || false;
              const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
              const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(currentPitch)}`;

              return (
                <div
                  key={lead.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all"
                >
                  {/* Lead Top Bar */}
                  <div className="p-5 md:p-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {lead.category}
                        </span>
                        {lead.isHotLead && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-rose-400" />
                            HOT LEAD • HUGE REVIEW GAP
                          </span>
                        )}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {lead.locality}, {lead.city} ({lead.state})
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        {lead.name}
                      </h2>
                    </div>

                    {/* Review Deficit Visualizer Badge */}
                    <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Current Rating</div>
                        <div className="text-sm font-extrabold text-amber-400 flex items-center justify-center gap-1">
                          ⭐ {lead.currentRating} ({lead.currentReviews})
                        </div>
                      </div>

                      <div className="text-slate-600 font-black">VS</div>

                      <div className="text-center">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Top Competitor</div>
                        <div className="text-sm font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                          ⭐ {lead.competitorRating} ({lead.competitorReviews})
                        </div>
                      </div>

                      <div className="pl-2 border-l border-slate-700 text-center">
                        <div className="text-[10px] uppercase font-bold text-rose-400">Deficit Gap</div>
                        <div className="text-sm font-black text-rose-400">
                          -{lead.reviewDeficit} reviews
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deep Business Research Dossier */}
                  <div className="px-5 md:px-6 py-4 bg-slate-950/40 border-b border-slate-800/60">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        Commercial Intelligence Dossier
                      </div>
                      <button
                        onClick={() => toggleDossier(lead.id)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            Less details <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            View full strategy <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                        <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-indigo-400" />
                          Target Customer Persona
                        </div>
                        <div className="text-slate-200 line-clamp-2">{lead.targetAudience}</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                        <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          Core Vulnerability
                        </div>
                        <div className="text-slate-200 line-clamp-2">{lead.painPoint}</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                        <div className="text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          Strategic Opportunity
                        </div>
                        <div className="text-slate-200 line-clamp-2">{lead.marketingOpportunity}</div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs flex items-center gap-2 text-indigo-200">
                        <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span>
                          <strong>Recommended Hardware Setup:</strong> {lead.hardwarePlacement}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 9-Language Pitch Engine */}
                  <div className="p-5 md:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <Globe2 className="w-4 h-4 text-emerald-400" />
                        Select Regional Pitch Language:
                      </div>

                      {/* 9 Languages Switcher */}
                      <div className="flex flex-wrap items-center gap-1">
                        {INDIAN_LANGUAGES.map((lang) => {
                          const isSelected = currentLang === lang.id;
                          return (
                            <button
                              key={lang.id}
                              onClick={() =>
                                setActiveLangByLead((prev) => ({
                                  ...prev,
                                  [lead.id]: lang.id,
                                }))
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                isSelected
                                  ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30"
                                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                              }`}
                            >
                              {lang.label} ({lang.native})
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pitch Display Box */}
                    <div className="relative rounded-2xl bg-slate-950/80 border border-slate-800 p-4 text-slate-200 text-xs md:text-sm font-sans leading-relaxed whitespace-pre-wrap">
                      {currentPitch}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <a
                          href={lead.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          Test Live Demo ({lead.demoSlug})
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>

                        <button
                          onClick={() => handleCopyLeadPitch(lead.id, currentPitch)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                        >
                          {copiedId === lead.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              Copy Pitch
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:+91${cleanPhone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          +91 {cleanPhone}
                        </a>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Send WhatsApp Pitch (1-Click)
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: 360° CUSTOM DEEP AUDIT ───────────────────────────── */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="max-w-2xl mb-6 space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                Targeted Business 360° Commercial Audit
              </h2>
              <p className="text-slate-400 text-sm">
                Enter any specific shop, restaurant, salon or hospital name anywhere in India. The AI Growth Engine will evaluate their Google profile deficit, customer profile, and create ready-to-close pitches.
              </p>
            </div>

            <form onSubmit={runDeepAudit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Business / Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={auditBusinessName}
                    onChange={(e) => setAuditBusinessName(e.target.value)}
                    placeholder="e.g. Saravana Bhavan, Dr. Reddy Dental"
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    City Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={auditCity}
                    onChange={(e) => setAuditCity(e.target.value)}
                    placeholder="e.g. Tirupati, Kadapa, Pune, Chennai"
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Business Category
                  </label>
                  <select
                    value={auditCategory}
                    onChange={(e) => setAuditCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {POPULAR_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loadingAudit || !auditBusinessName.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {loadingAudit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Business & Competitors...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Run 360° Commercial Audit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {auditError && (
            <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-2xl flex items-center gap-3 text-rose-200 text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{auditError}</span>
            </div>
          )}

          {auditResult && (
            <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl overflow-hidden shadow-2xl space-y-6 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    360° Verified Market Audit
                  </div>
                  <h3 className="text-2xl font-black text-white">{auditResult.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {auditResult.category} • {auditResult.locality}, {auditResult.city} ({auditResult.state})
                  </p>
                </div>

                <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 flex items-center gap-5">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Current Position</div>
                    <div className="text-base font-extrabold text-amber-400">
                      ⭐ {auditResult.currentRating} ({auditResult.currentReviews} reviews)
                    </div>
                  </div>
                  <div className="text-slate-600 font-bold">VS</div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Rival: {auditResult.competitorName}</div>
                    <div className="text-base font-extrabold text-emerald-400">
                      ⭐ {auditResult.competitorRating} ({auditResult.competitorReviews} reviews)
                    </div>
                  </div>
                  <div className="pl-3 border-l border-slate-700">
                    <div className="text-[10px] uppercase font-bold text-rose-400">Deficit</div>
                    <div className="text-base font-black text-rose-400">-{auditResult.reviewDeficit}</div>
                  </div>
                </div>
              </div>

              {/* Research Dossier Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> Target Footfall Audience
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{auditResult.targetAudience}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Local SEO Vulnerability
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{auditResult.painPoint}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Revenue Upside
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{auditResult.marketingOpportunity}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Recommended Hardware
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{auditResult.hardwarePlacement}</p>
                </div>
              </div>

              {/* Pitch in 9 Languages */}
              <div className="space-y-3 pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-emerald-400" />
                    Generated Outreach Script:
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    {INDIAN_LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setAuditActiveLang(lang.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          auditActiveLang === lang.id
                            ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {lang.label} ({lang.native})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                  {auditResult.pitches?.[auditActiveLang] || auditResult.pitches?.english}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <a
                    href={auditResult.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                  >
                    <Eye className="w-4 h-4 text-indigo-400" />
                    Test Live Demo ({auditResult.demoSlug})
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCopyAuditPitch(auditResult.pitches?.[auditActiveLang] || "")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                    >
                      {copiedAudit ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Pitch Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-400" />
                          Copy Script
                        </>
                      )}
                    </button>

                    <a
                      href={`https://wa.me/91${auditResult.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        auditResult.pitches?.[auditActiveLang] || auditResult.pitches?.english || ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Send via WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: INBOUND LEADS PIPELINE CRM ───────────────────────── */}
      {activeTab === "inbound" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Inbox className="w-5 h-5 text-indigo-400" />
                Live Inbound Customer Pipeline
              </h2>
              <p className="text-xs text-slate-400">
                Incoming inquiries submitted through your homepage hero card customizer, pricing calculator, and demo pages.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchInboundLeads}
                disabled={loadingInbound}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingInbound ? "animate-spin" : ""}`} />
                Refresh
              </button>

              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
                {["ALL", "NEW", "CONTACTED", "DEMO_SENT", "CONVERTED", "LOST"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setInboundFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      inboundFilter === st
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredInbound.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800 text-slate-400 text-sm">
              <Inbox className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              No inbound leads found for filter "{inboundFilter}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInbound.map((lead) => {
                const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
                const waPitch = `Hello ${lead.businessName}! 👋 Thank you for inquiring about ReviewSmart AI 3D NFC standees. We have prepared your demo and are ready to dispatch. Would you like to confirm your delivery address?`;
                const waLink = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waPitch)}`;

                return (
                  <div
                    key={lead.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              lead.status === "NEW"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                : lead.status === "CONVERTED"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {lead.status}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white">{lead.businessName}</h4>
                        <p className="text-xs text-slate-400">
                          {lead.category || "Retail Store"} • {lead.city || "India"}
                        </p>
                      </div>

                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => updateInboundStatus(lead.id, e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="DEMO_SENT">DEMO_SENT</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="LOST">LOST</option>
                      </select>
                    </div>

                    {lead.notes && (
                      <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                        {lead.notes}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
                      <a
                        href={`tel:+91${cleanPhone}`}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
                      >
                        <Phone className="w-3.5 h-3.5 text-indigo-400" />
                        +91 {cleanPhone}
                      </a>

                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Connect on WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
