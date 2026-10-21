"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";

interface Lead {
  name: string;
  locality: string;
  phone: string;
  currentRating: number;
  currentReviews: number;
  competitorName: string;
  competitorReviews: number;
  isHotLead: boolean;
  leadReason: string;
  whatsappPitchTelugu: string;
  whatsappPitchEnglish: string;
}

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
  { id: "Kadapa", label: "Kadapa (కడప)" },
  { id: "Tirupati", label: "Tirupati (తిరుపతి)" },
  { id: "Vijayawada", label: "Vijayawada (విజయవాడ)" },
  { id: "Guntur", label: "Guntur (గుంటూరు)" },
  { id: "Hyderabad", label: "Hyderabad (హైదరాబాద్)" },
  { id: "Kurnool", label: "Kurnool (కర్నూలు)" },
  { id: "Nellore", label: "Nellore (నెల్లూరు)" },
  { id: "Visakhapatnam", label: "Vizag (వైజాగ్)" },
  { id: "Bengaluru", label: "Bengaluru (బెంగళూరు)" },
];

const POPULAR_CATEGORIES = [
  { id: "Dental Clinics & Doctors", label: "🦷 Dental & Clinics" },
  { id: "Restaurants & Biryani Points", label: "🍽️ Restaurants & Cafes" },
  { id: "Hair Salons & Beauty Spas", label: "💇 Salons & Spas" },
  { id: "Clothing & Menswear Stores", label: "👗 Menswear & Fashion" },
  { id: "Bakeries & Sweet Stalls", label: "🍰 Bakeries & Sweets" },
  { id: "Jewellery & Gold Showrooms", label: "💍 Jewellery" },
  { id: "Automobile & Car Care Services", label: "🚗 Car Care & Auto" },
  { id: "Coaching & Tuition Institutes", label: "🎓 Coaching & Tuition" },
];

export default function AdminLeadsPage() {
  const [activeTab, setActiveTab] = useState<"inbound" | "outbound">("inbound");

  // Inbound Leads State
  const [inboundLeads, setInboundLeads] = useState<InboundLead[]>([]);
  const [inboundLoading, setInboundLoading] = useState(false);
  const [inboundStatusFilter, setInboundStatusFilter] = useState<string>("ALL");
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  // Outbound Radar State
  const [selectedCity, setSelectedCity] = useState("Kadapa");
  const [selectedCategory, setSelectedCategory] = useState("Dental Clinics & Doctors");
  const [customSearch, setCustomSearch] = useState("");
  const [pitchLang, setPitchLang] = useState<"telugu" | "english">("telugu");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [filterHotOnly, setFilterHotOnly] = useState(false);

  // Fetch Inbound Leads on Mount
  const fetchInboundLeads = async () => {
    setInboundLoading(true);
    try {
      const res = await fetch("/api/lead/capture");
      const data = await res.json();
      if (res.ok && data.leads) {
        setInboundLeads(data.leads);
      }
    } catch (err) {
      console.error("Failed to load inbound leads", err);
    } finally {
      setInboundLoading(false);
    }
  };

  useEffect(() => {
    fetchInboundLeads();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingLeadId(id);
    try {
      const res = await fetch("/api/lead/capture", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setInboundLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        );
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdatingLeadId(null);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/leads/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: selectedCity,
          category: selectedCategory,
          customQuery: customSearch.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to fetch leads");
      } else {
        setLeads(data.leads || []);
      }
    } catch {
      setErrorMsg("Network error while discovering leads");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPitch = async (text: string, idx: number) => {
    await copyToClipboard(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleExportCsv = () => {
    if (leads.length === 0) return;

    const headers = [
      "Business Name",
      "Locality",
      "Phone",
      "Google Rating",
      "Review Count",
      "Top Competitor",
      "Competitor Reviews",
      "Is Hot Lead",
      "Telugu WhatsApp Pitch",
      "English WhatsApp Pitch",
    ];

    const rows = leads.map((l) => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.locality.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      l.currentRating,
      l.currentReviews,
      `"${l.competitorName.replace(/"/g, '""')}"`,
      l.competitorReviews,
      l.isHotLead ? "YES" : "NO",
      `"${l.whatsappPitchTelugu.replace(/"/g, '""')}"`,
      `"${l.whatsappPitchEnglish.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ReviewSmart_Leads_${selectedCity}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedLeads = filterHotOnly ? leads.filter((l) => l.isHotLead) : leads;
  const hotLeadsCount = leads.filter((l) => l.isHotLead).length;

  const filteredInboundLeads =
    inboundStatusFilter === "ALL"
      ? inboundLeads
      : inboundLeads.filter((l) => l.status === inboundStatusFilter);

  const newInboundCount = inboundLeads.filter((l) => l.status === "NEW").length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            Lead Command Center 🎯
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage live online website inquiries &amp; discover high-value prospects across Indian cities.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("inbound")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "inbound"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Live Inbound Leads</span>
            {newInboundCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                {newInboundCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("outbound")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "outbound"
                ? "bg-purple-600 text-white shadow-md shadow-purple-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Outbound Radar Hunter</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: LIVE INBOUND LEADS (From Website Customizer & Gap Tool)    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "inbound" && (
        <div className="space-y-5">
          {/* Metrics bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Inbound Leads
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {inboundLeads.length}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Captured from marketing website</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                New Actionable Inquiries
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {newInboundCount}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Awaiting initial WhatsApp contact</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                  Filter by Status
                </span>
                <div className="flex gap-1 mt-2">
                  {["ALL", "NEW", "CONTACTED", "CONVERTED"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setInboundStatusFilter(st)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                        inboundStatusFilter === st
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={fetchInboundLeads}
                disabled={inboundLoading}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Refresh Leads"
              >
                <RefreshCw className={`w-4 h-4 ${inboundLoading ? "animate-spin text-indigo-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* Lead List Cards */}
          {inboundLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
              <p className="text-xs">Loading inbound leads from database...</p>
            </div>
          ) : filteredInboundLeads.length === 0 ? (
            <div className="p-10 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-2">
              <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No inbound leads found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Leads captured from the 3D Standee Customizer, Google Maps Gap Calculator, or viral QR cards will appear here immediately with 1-click WhatsApp buttons.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInboundLeads.map((lead) => {
                const cleanPhone = lead.phone.replace(/\D/g, "");
                const waChatUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                  `Hi ${lead.businessName}! This is MOMO IT Technologies from ReviewSmart AI. We received your request for the Smart Google Review Standee. How can we help you activate it today?`
                )}`;

                return (
                  <div
                    key={lead.id}
                    className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition shadow-lg"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-white">
                              {lead.businessName}
                            </h4>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                lead.status === "NEW"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : lead.status === "CONTACTED"
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : lead.status === "CONVERTED"
                                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {lead.status}
                            </span>
                          </div>
                          {(lead.city || lead.category) && (
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                              {lead.city && (
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3 text-slate-500" /> {lead.city}
                                </span>
                              )}
                              {lead.city && lead.category && <span>&bull;</span>}
                              {lead.category && <span>{lead.category}</span>}
                            </p>
                          )}
                        </div>

                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Phone & Source */}
                      <div className="flex flex-wrap items-center gap-2 my-2.5">
                        <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20 font-mono">
                          📱 +91 {cleanPhone}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                          Source: {lead.source}
                        </span>
                      </div>

                      {/* Notes & Lead Intent */}
                      {lead.notes && (
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Inquiry Details &amp; Customizer Notes:
                          </span>
                          <p className="text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                            {lead.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions & Status Dropdown */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[10px] text-slate-500 font-bold">Status:</label>
                        <select
                          value={lead.status}
                          disabled={updatingLeadId === lead.id}
                          onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="CONVERTED">CONVERTED (₹2,999)</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={waChatUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950 transition active:scale-95"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`tel:+91${cleanPhone}`}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                          title="Call Lead"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: OUTBOUND LEAD RADAR (Google Places API Discoverer)          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === "outbound" && (
        <div className="space-y-6">
          {/* Search Configuration Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            {/* City Pills */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                1. Select Target City:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => setSelectedCity(city.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedCity === city.id
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-950"
                        : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                    }`}
                  >
                    {city.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                2. Select Industry Category:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedCategory === cat.id
                        ? "bg-purple-600 text-white shadow-md shadow-purple-950"
                        : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Search & Search Trigger */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 pt-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customSearch}
                  onChange={(e) => setCustomSearch(e.target.value)}
                  placeholder={`Optional specific search in ${selectedCity} (e.g. Near Rims Road, Bellary Road...)`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950 transition active:scale-95 shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Hunting Leads...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Find Hot Leads</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Results Header */}
          {leads.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">
                    Found {leads.length} Target Businesses in {selectedCity}
                  </span>
                  {hotLeadsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {hotLeadsCount} Hot Prospects
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterHotOnly(!filterHotOnly)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
                      filterHotOnly
                        ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950"
                        : "bg-slate-800 text-slate-400 hover:text-white border-slate-700"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>Hot Leads Only</span>
                  </button>

                  <div className="flex items-center rounded-xl bg-slate-800 p-0.5 border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setPitchLang("telugu")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        pitchLang === "telugu"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Telugu Pitch
                    </button>
                    <button
                      type="button"
                      onClick={() => setPitchLang("english")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        pitchLang === "english"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      English Pitch
                    </button>
                  </div>
                </div>
              </div>

              {/* Lead Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedLeads.map((lead, idx) => {
                  const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
                  const activePitch =
                    pitchLang === "telugu"
                      ? lead.whatsappPitchTelugu
                      : lead.whatsappPitchEnglish;
                  const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                    activePitch
                  )}`;

                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-3xl bg-slate-900 border flex flex-col justify-between transition shadow-xl ${
                        lead.isHotLead
                          ? "border-rose-500/40 hover:border-rose-500"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-white leading-tight">
                                {lead.name}
                              </h4>
                              {lead.isHotLead && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[9px] font-black uppercase tracking-wider shrink-0 border border-rose-500/30 flex items-center gap-0.5">
                                  <Flame className="w-2.5 h-2.5" /> High Urgency
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{lead.locality}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-amber-400 block">
                              ★ {lead.currentRating.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              ({lead.currentReviews} reviews)
                            </span>
                          </div>
                        </div>

                        {/* Competitor Gap Pill */}
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Local Competitor Benchmarking:
                          </span>
                          <div className="text-xs text-slate-300 flex items-center justify-between">
                            <span className="truncate max-w-[180px] font-medium">
                              {lead.competitorName}
                            </span>
                            <span className="text-rose-400 font-bold">
                              {lead.competitorReviews} reviews ({lead.competitorReviews - lead.currentReviews} ahead)
                            </span>
                          </div>
                        </div>

                        {/* Why they need ReviewSmart AI */}
                        <p className="text-[11px] text-slate-300 bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 leading-relaxed">
                          💡 <strong>Why They Convert:</strong> {lead.leadReason}
                        </p>

                        {/* Pitch Preview Box */}
                        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] space-y-2">
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-400">
                              <MessageCircle className="w-3 h-3 text-emerald-400" />
                              Pre-Built {pitchLang === "telugu" ? "Telugu" : "English"} Pitch
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyPitch(activePitch, idx)}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Pitch</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-slate-300 line-clamp-3 italic">
                            &quot;{activePitch}&quot;
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-4 mt-3 border-t border-slate-800">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition active:scale-95"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Send 1-Click WhatsApp Pitch</span>
                        </a>

                        <a
                          href={`tel:+91${cleanPhone}`}
                          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1 border border-slate-700 transition"
                          title="Call Owner Phone"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Initial Empty State Guide */}
          {leads.length === 0 && !loading && (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Ready to Discover High-Value Prospects in {selectedCity}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Select your city and industry category above, then click <strong>&quot;Find Hot Leads&quot;</strong>. The AI will extract businesses with low Google reviews and build personalized WhatsApp audit pitches!
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSearch()}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs inline-flex items-center gap-2 shadow-lg shadow-indigo-950 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Hunt Leads in {selectedCity} Now</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
