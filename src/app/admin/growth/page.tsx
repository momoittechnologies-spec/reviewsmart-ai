"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Sparkles,
  Phone,
  MessageCircle,
  Download,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Flame,
  Inbox,
  RefreshCw,
  MapPin,
  Globe2,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { RealBusinessLead } from "@/lib/gmbDataFetcher";

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

const POPULAR_CITIES = [
  { id: "Kadapa", label: "Kadapa", state: "Andhra Pradesh" },
  { id: "Tirupati", label: "Tirupati", state: "Andhra Pradesh" },
  { id: "Vijayawada", label: "Vijayawada", state: "Andhra Pradesh" },
  { id: "Visakhapatnam", label: "Visakhapatnam", state: "Andhra Pradesh" },
  { id: "Guntur", label: "Guntur", state: "Andhra Pradesh" },
  { id: "Hyderabad", label: "Hyderabad", state: "Telangana" },
  { id: "Bengaluru", label: "Bengaluru", state: "Karnataka" },
  { id: "Chennai", label: "Chennai", state: "Tamil Nadu" },
  { id: "Kochi", label: "Kochi", state: "Kerala" },
  { id: "Mumbai", label: "Mumbai", state: "Maharashtra" },
  { id: "Pune", label: "Pune", state: "Maharashtra" },
  { id: "Delhi NCR", label: "Delhi NCR", state: "Delhi" },
  { id: "Jaipur", label: "Jaipur", state: "Rajasthan" },
  { id: "Lucknow", label: "Lucknow", state: "Uttar Pradesh" },
  { id: "Kolkata", label: "Kolkata", state: "West Bengal" },
];

const POPULAR_CATEGORIES = [
  "Restaurants & Cafes",
  "Dental Clinics & Healthcare",
  "Hair Salons & Beauty",
  "Automobile Services & Garages",
  "Jewellery & Gold Shops",
  "Pharmacies & Medical Stores",
  "Hotels & Lodges",
  "Gyms & Fitness Centers",
  "Supermarkets & Grocery Stores",
  "Clothing & Textiles",
];

export default function AdminGrowthPage() {
  const [activeTab, setActiveTab] = useState<"radar" | "inbound">("radar");

  // Market Radar State
  const [selectedCity, setSelectedCity] = useState("Kadapa");
  const [customCity, setCustomCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Restaurants & Cafes");
  const [filterHotOnly, setFilterHotOnly] = useState(false);
  const [leads, setLeads] = useState<RealBusinessLead[]>([]);
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [radarError, setRadarError] = useState("");
  const [dataSourceNote, setDataSourceNote] = useState("");
  const [expandedDossier, setExpandedDossier] = useState<Record<string, boolean>>({});

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
    setDataSourceNote("");

    try {
      const res = await fetch("/api/admin/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, category }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to scan market");
      }

      setLeads(data.leads || []);
      setDataSourceNote(data.note || "");
    } catch (err: any) {
      setRadarError(err?.message || "Radar scan failed");
    } finally {
      setLoadingRadar(false);
    }
  };

  // 2. Inbound Pipeline Fetch
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
      "Address",
      "City",
      "Phone",
      "Website",
      "Google Rating",
      "Review Count",
      "Opportunity Score",
      "Data Source",
      "Google Maps URL",
    ];

    const rows = leads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${(l.address || "").replace(/"/g, '""')}"`,
      `"${l.city.replace(/"/g, '""')}"`,
      `"${l.phone ?? ""}"`,
      `"${l.website ?? ""}"`,
      l.rating ?? "N/A",
      l.reviewCount ?? "N/A",
      l.reviewGapScore,
      l.dataSource,
      `"${l.googleMapsUrl ?? ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ReviewSmart_GrowthLeads_${selectedCity}_${Date.now()}.csv`
    );
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              100% Free Open Data Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              AI Growth Engine 🚀
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
              Discover real local business leads from{" "}
              <span className="text-emerald-300 font-semibold">OpenStreetMap &amp; Nominatim</span> with zero API costs and no credit card required — your highest-converting prospects.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                🆓
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Zero Cost</div>
                <div className="text-xs font-semibold text-white">100% Free Open Engine</div>
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                📍
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Coverage</div>
                <div className="text-xs font-semibold text-white">All Indian Cities</div>
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
            Market Radar
            <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] bg-indigo-900/60 text-indigo-200 border border-indigo-700/50">
              {leads.length}
            </span>
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

      {/* ── TAB 1: MARKET RADAR ─────────────────────────────────────── */}
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
                      Fetching Real Data...
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
                    title="Export Leads to CSV"
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
                  Hot Leads Only (Score &gt; 60)
                </button>
              </div>

              <div className="text-slate-400">
                Showing <strong className="text-white">{displayedLeads.length}</strong> businesses in{" "}
                <span className="text-indigo-300 font-medium">{customCity || selectedCity}</span>
              </div>
            </div>
          </div>

          {/* Data Source Info Banner */}
          {dataSourceNote && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-950/40 border border-blue-800/30 text-xs text-blue-300">
              <span className="text-blue-400">ℹ️</span>
              <span>{dataSourceNote}</span>
            </div>
          )}

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
              const isExpanded = expandedDossier[lead.id] || false;
              const cleanPhone = (lead.phone || "").replace(/[^0-9]/g, "");
              const waUrl = cleanPhone
                ? `https://wa.me/91${cleanPhone}`
                : null;

              return (
                <div
                  key={lead.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all"
                >
                  {/* Lead Top Bar */}
                  <div className="p-5 md:p-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Data Source Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          lead.dataSource === "google_places"
                            ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        }`}>
                          {lead.dataSource === "google_places" ? "📍 Google Places" : "🗺️ OpenStreetMap"}
                        </span>

                        {lead.isHotLead && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-rose-400" />
                            HOT LEAD
                          </span>
                        )}

                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {lead.locality !== lead.city ? `${lead.locality}, ` : ""}{lead.city}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-white tracking-tight">{lead.name}</h2>
                      {lead.address && (
                        <p className="text-xs text-slate-500">{lead.address}</p>
                      )}
                    </div>

                    {/* Opportunity Score Badge */}
                    <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Rating</div>
                        <div className="text-sm font-extrabold text-amber-400 flex items-center justify-center gap-1">
                          {lead.rating !== null ? `⭐ ${lead.rating}` : "⭐ N/A"}
                        </div>
                      </div>

                      <div className="text-slate-600 font-black text-xs">•</div>

                      <div className="text-center">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Reviews</div>
                        <div className="text-sm font-extrabold text-slate-200">
                          {lead.reviewCount !== null ? lead.reviewCount : "N/A"}
                        </div>
                      </div>

                      <div className="pl-2 border-l border-slate-700 text-center">
                        <div className="text-[10px] uppercase font-bold text-indigo-400">Opp. Score</div>
                        <div className={`text-sm font-black ${
                          lead.reviewGapScore >= 70
                            ? "text-rose-400"
                            : lead.reviewGapScore >= 40
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}>
                          {lead.reviewGapScore}/100
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <div className="px-5 md:px-6 py-3 bg-slate-950/40 border-b border-slate-800/60">
                    <button
                      onClick={() => toggleDossier(lead.id)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>Hide details <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>View contact & maps details <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {lead.phone && (
                          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                            <div className="text-slate-400 font-semibold mb-1">📞 Phone</div>
                            <div className="text-slate-200">{lead.phone}</div>
                          </div>
                        )}
                        {lead.website && (
                          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                            <div className="text-slate-400 font-semibold mb-1">🌐 Website</div>
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline truncate block"
                            >
                              {lead.website}
                            </a>
                          </div>
                        )}
                        {lead.lat && lead.lng && (
                          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                            <div className="text-slate-400 font-semibold mb-1">📌 Coordinates</div>
                            <div className="text-slate-200">{lead.lat.toFixed(5)}, {lead.lng.toFixed(5)}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="p-5 md:p-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {lead.googleMapsUrl && (
                        <a
                          href={lead.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                        >
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          Search on Google Maps
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {cleanPhone && (
                        <a
                          href={`tel:+91${cleanPhone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          +91 {cleanPhone}
                        </a>
                      )}

                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                        </a>
                      )}

                      {!cleanPhone && (
                        <a
                          href={lead.googleMapsUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-all"
                        >
                          Find Contact on Maps
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {!loadingRadar && displayedLeads.length === 0 && !radarError && (
              <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800 text-slate-400 text-sm">
                <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>No leads yet. Select a city &amp; category then click <strong>Scan Market Radar</strong>.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: INBOUND LEADS PIPELINE CRM ───────────────────────── */}
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
              No inbound leads found for filter &quot;{inboundFilter}&quot;.
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
