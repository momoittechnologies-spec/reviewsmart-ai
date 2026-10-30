"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Sparkles,
  Phone,
  PhoneCall,
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
  Upload,
  CheckCircle2,
  Target,
  PlusCircle,
  FileText,
  Star,
  Copy,
  Edit3,
  Save,
  X,
  ArrowRight,
  Clock,
  UserCheck,
  Send,
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

const PIPELINE_STAGES = [
  { id: "NEW", label: "1. New Target", color: "bg-slate-800 text-slate-300 border-slate-700" },
  { id: "WHATSAPP_SENT", label: "2. WhatsApp Sent 💬", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  { id: "CALLED", label: "3. Called 📞", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  { id: "DEMO_SENT", label: "4. Demo Sent 🎁", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" },
  { id: "CONVERTED", label: "5. Converted 🎉", color: "bg-emerald-600 text-white border-emerald-500" },
  { id: "LOST", label: "Lost ✕", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
];

// Helper to extract rating & review count from lead.notes if stored in hunter format
function parseHunterNotes(notes: string | null) {
  if (!notes) return { rating: null, reviewCount: null, deficit: null, mapsUrl: null, cleanAddress: null };

  const ratingMatch = notes.match(/Rating:\s*([0-9.]+)/i);
  const reviewMatch = notes.match(/Google Reviews:\s*([0-9]+)/i);
  const deficitMatch = notes.match(/Needs\s*([0-9]+)\s*to reach 100/i);
  const mapsMatch = notes.match(/Maps:\s*(https?:\/\/[^\s]+)/i);
  const addressMatch = notes.match(/Address:\s*([^.]+)\./i);

  return {
    rating: ratingMatch ? parseFloat(ratingMatch[1]) : null,
    reviewCount: reviewMatch ? parseInt(reviewMatch[1], 10) : null,
    deficit: deficitMatch ? parseInt(deficitMatch[1], 10) : null,
    mapsUrl: mapsMatch ? mapsMatch[1] : null,
    cleanAddress: addressMatch ? addressMatch[1].trim() : null,
  };
}

export default function AdminGrowthPage() {
  const [activeTab, setActiveTab] = useState<"radar" | "inbound">("inbound");

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
  const [addingToCrmId, setAddingToCrmId] = useState<string | null>(null);

  // Inbound Leads CRM State
  const [inboundLeads, setInboundLeads] = useState<InboundLead[]>([]);
  const [loadingInbound, setLoadingInbound] = useState(false);
  const [inboundFilter, setInboundFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | "HUNTER" | "WEBSITE">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Inline Phone Edit State
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [editingPhoneValue, setEditingPhoneValue] = useState("");
  const [savingPhoneLoading, setSavingPhoneLoading] = useState(false);

  // Quick Notes State
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteInputValue, setNoteInputValue] = useState("");
  const [savingNoteLoading, setSavingNoteLoading] = useState(false);

  // WhatsApp Pitch Modal State
  const [whatsappModalLead, setWhatsappModalLead] = useState<InboundLead | null>(null);
  const [activeWaTemplate, setActiveWaTemplate] = useState<"deficit" | "telugu" | "mockup" | "followup">("deficit");

  // Call Assistant Modal State
  const [callingModalLead, setCallingModalLead] = useState<InboundLead | null>(null);

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState("");
  const [importCity, setImportCity] = useState("Kadapa");
  const [importCategory, setImportCategory] = useState("Local Business");
  const [importMaxReviews, setImportMaxReviews] = useState("40");
  const [importingLoading, setImportingLoading] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  // Initial Scan on load
  useEffect(() => {
    fetchInboundLeads();
    runRadarScan("Kadapa", "Restaurants & Cafes");
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

  const updateInboundStatus = async (id: string, status: string, appendNote?: string) => {
    setUpdatingId(id);
    try {
      const currentLead = inboundLeads.find((l) => l.id === id);
      let updatedNotes = currentLead?.notes || "";
      if (appendNote) {
        const timestamp = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        updatedNotes = `${updatedNotes}\n[${timestamp}]: ${appendNote}`.trim();
      }

      const res = await fetch("/api/lead/capture", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, notes: updatedNotes }),
      });
      if (res.ok) {
        setInboundLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status, notes: updatedNotes } : l))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Save / Update Phone Number
  const handleSavePhone = async (leadId: string) => {
    const cleanDigits = editingPhoneValue.replace(/[^0-9]/g, "").slice(-10);
    if (cleanDigits.length < 10) {
      alert("Please enter a valid 10-digit Indian mobile or landline number.");
      return;
    }

    setSavingPhoneLoading(true);
    try {
      const res = await fetch("/api/lead/capture", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, phone: cleanDigits }),
      });

      if (res.ok) {
        setInboundLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, phone: cleanDigits } : l))
        );
        setEditingPhoneId(null);
        setEditingPhoneValue("");
      } else {
        alert("Failed to save phone number.");
      }
    } catch (err) {
      console.error("Save phone error:", err);
    } finally {
      setSavingPhoneLoading(false);
    }
  };

  // Add Quick Note
  const handleSaveQuickNote = async (leadId: string) => {
    if (!noteInputValue.trim()) return;
    setSavingNoteLoading(true);
    try {
      const currentLead = inboundLeads.find((l) => l.id === leadId);
      const timestamp = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      const newNotes = `${currentLead?.notes || ""}\n• [${timestamp}]: ${noteInputValue.trim()}`.trim();

      const res = await fetch("/api/lead/capture", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, notes: newNotes }),
      });

      if (res.ok) {
        setInboundLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, notes: newNotes } : l))
        );
        setActiveNoteId(null);
        setNoteInputValue("");
      }
    } catch (err) {
      console.error("Save note error:", err);
    } finally {
      setSavingNoteLoading(false);
    }
  };

  const toggleDossier = (id: string) => {
    setExpandedDossier((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 1-Click Add Radar Lead to CRM
  const addRadarLeadToCrm = async (lead: RealBusinessLead) => {
    setAddingToCrmId(lead.id);
    try {
      const cleanPhone = (lead.phone || "").replace(/[^0-9]/g, "");
      const res = await fetch("/api/lead/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: lead.name,
          city: lead.city,
          category: selectedCategory,
          phone: cleanPhone.length >= 10 ? cleanPhone : `000${Math.floor(1000000 + Math.random() * 9000000)}`,
          source: "MARKET_RADAR_TARGET",
          notes: `Added from Market Radar. Address: ${lead.address}. Google Maps: ${lead.googleMapsUrl}`,
        }),
      });

      if (res.ok) {
        await fetchInboundLeads();
        alert(`✅ Added "${lead.name}" to your Target CRM leads!`);
      }
    } catch (err) {
      console.error("Failed to add lead to CRM:", err);
    } finally {
      setAddingToCrmId(null);
    }
  };

  // Generate WhatsApp Message depending on selected template
  const getWhatsAppMessage = (lead: InboundLead, template: "deficit" | "telugu" | "mockup" | "followup") => {
    const { rating, reviewCount, deficit } = parseHunterNotes(lead.notes);
    const starRating = rating !== null ? `${rating}★` : "5.0★";
    const revs = reviewCount !== null ? reviewCount : "few";
    const gap = deficit || 90;
    const city = lead.city || "Kadapa";

    if (template === "telugu") {
      return `నమస్కారం ${lead.businessName} మేనేజ్‌మెంట్ గారికి! 🙏\n\nగూగుల్ మ్యాప్స్‌లో మీ బిజినెస్‌కి ${starRating} రేటింగ్ ఉన్నా, కేవలం ${revs} రివ్యూలు మాత్రమే ఉన్నాయి. ${city}లో మీ పోటీదారులకు 100+ రివ్యూలు ఉండటం వల్ల రోజూ ఎంతోమంది కస్టమర్లు అటువైపు వెళ్ళిపోతున్నారు.\n\nమా 3D స్మార్ట్ NFC స్టాండీ మీ కౌంటర్‌లో పెడితే, కస్టమర్లు తమ మొబైల్ టచ్ చేయగానే కేవలం 5 సెకన్లలో 5-స్టార్ గూగుల్ రివ్యూ ఇస్తారు (Gemini AI సాయంతో).\n\nమీ బిజినెస్ కోసం ఉచిత డెమో & శాంపిల్ స్టాండీ ఫోటో పంపమంటారా?`;
    }

    if (template === "mockup") {
      return `Hello ${lead.businessName} team! 👋\n\nWe noticed on Google Maps that you have a wonderful ${starRating} rating, but only ${revs} reviews in ${city}.\n\nWe designed a FREE custom 3D Crystal Acrylic NFC Standee preview with your shop's branding & instant Google review QR.\n\nWhen customers tap their phone on your billing counter, it opens your Google review box directly in 5 seconds without searching or typing.\n\nWould you like us to send the photo preview mockup for ${lead.businessName}?`;
    }

    if (template === "followup") {
      return `Hello ${lead.businessName} team! 👋\n\nFollowing up on our phone call regarding your counter review standee. As discussed, placing our 3D Smart NFC Standee at your cash counter helps you collect 50-100 reviews in 30 days.\n\nWould you like us to deliver the sample standee to your counter today?`;
    }

    // Default: Deficit Audit (English)
    return `Hello ${lead.businessName} team! 👋\n\nI was looking at businesses in ${city} today and noticed your listing on Google Maps has a great ${starRating} rating, but only ${revs} reviews.\n\nMost customers search and pick competitors who have 100+ reviews. You need about ${gap} more reviews to dominate local search in ${city}!\n\nReviewSmart AI provides luxury 3D Smart NFC Standees for your billing desk. Customers simply tap their phone, and Gemini AI drafts an authentic 5-star review in 5 seconds.\n\nWould you like to see a free working preview for ${lead.businessName}?`;
  };

  // Launch WhatsApp and advance status
  const handleLaunchWhatsApp = async (lead: InboundLead) => {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.startsWith("000")) {
      alert("Please add a valid phone number first.");
      return;
    }

    const message = getWhatsAppMessage(lead, activeWaTemplate);
    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(waUrl, "_blank");

    // Automatically transition to WHATSAPP_SENT
    await updateInboundStatus(lead.id, "WHATSAPP_SENT", `WhatsApp sent (${activeWaTemplate.toUpperCase()} template)`);
    setWhatsappModalLead(null);
  };

  // Mark as Called
  const handleMarkCalled = async (lead: InboundLead) => {
    await updateInboundStatus(lead.id, "CALLED", "Followed up via Phone Call");
    setCallingModalLead(null);
  };

  // Import Leads (CSV / JSON)
  const handleImportLeads = async () => {
    if (!importCsvText.trim()) return;
    setImportingLoading(true);
    setImportResult(null);

    try {
      let payload: any = {
        city: importCity,
        category: importCategory,
        maxReviews: parseInt(importMaxReviews, 10) || 50,
        source: "OPEN_SOURCE_IMPORT",
      };

      if (importCsvText.trim().startsWith("[") || importCsvText.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(importCsvText.trim());
          payload.leads = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          payload.csvText = importCsvText;
        }
      } else {
        payload.csvText = importCsvText;
      }

      const res = await fetch("/api/admin/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to import leads");
      }

      setImportResult(`✅ ${data.message}`);
      await fetchInboundLeads();
      setTimeout(() => {
        setShowImportModal(false);
        setImportCsvText("");
        setImportResult(null);
        setActiveTab("inbound");
      }, 2000);
    } catch (err: any) {
      setImportResult(`❌ ${err?.message || "Import error"}`);
    } finally {
      setImportingLoading(false);
    }
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
    if (inboundFilter !== "ALL" && l.status !== inboundFilter) return false;

    if (sourceFilter === "HUNTER") {
      return l.source === "GOOGLE_MAPS_HUNTER" || l.source === "OPEN_SOURCE_IMPORT";
    }
    if (sourceFilter === "WEBSITE") {
      return l.source !== "GOOGLE_MAPS_HUNTER" && l.source !== "OPEN_SOURCE_IMPORT";
    }

    return true;
  });

  const hunterLeadCount = inboundLeads.filter(
    (l) => l.source === "GOOGLE_MAPS_HUNTER" || l.source === "OPEN_SOURCE_IMPORT"
  ).length;

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
              100% Free Open-Source Growth Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              AI Growth &amp; Low-Review Hunter 🚀
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
              Target independent local businesses with <strong className="text-emerald-300">few Google reviews (&lt; 40)</strong> that desperately need ReviewSmart AI standees. Zero paid APIs • Zero billing fees.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-indigo-600/90 hover:bg-indigo-500 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-indigo-400/40 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Upload className="w-4 h-4 text-indigo-200" />
              Import Scraped Leads
            </button>

            <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                🎯
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Hunted Targets</div>
                <div className="text-xs font-semibold text-white">{hunterLeadCount} Low-Review Leads</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS BAR ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mt-8 border-b border-slate-800/80 pb-1">
          <button
            onClick={() => setActiveTab("inbound")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "inbound"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Target className="w-4 h-4 text-emerald-400" />
            Target Lead CRM &amp; Sales Hub
            {hunterLeadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                {hunterLeadCount} Qualified
              </span>
            )}
            {inboundLeads.filter((l) => l.status === "NEW").length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-[11px] bg-rose-500 text-white font-bold animate-pulse">
                {inboundLeads.filter((l) => l.status === "NEW").length} NEW
              </span>
            )}
          </button>

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
        </div>
      </div>

      {/* ── TAB 1: TARGET LEAD CRM & SALES ACTION HUB ────────────────── */}
      {activeTab === "inbound" && (
        <div className="space-y-6">
          {/* Top Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Target Lead Pipeline &amp; High-Converting Sales Funnel
                </h2>
                <p className="text-xs text-slate-400">
                  Step 1: Send WhatsApp Message First &bull; Step 2: Proceed to Call &bull; Step 3: Convert to Client Store!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold border border-indigo-500/40 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Import Scraped Leads
                </button>

                <button
                  onClick={fetchInboundLeads}
                  disabled={loadingInbound}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingInbound ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800">
              {/* Source Filter */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setSourceFilter("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    sourceFilter === "ALL"
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All Sources ({inboundLeads.length})
                </button>
                <button
                  onClick={() => setSourceFilter("HUNTER")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    sourceFilter === "HUNTER"
                      ? "bg-emerald-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🎯 Low-Review Hunter ({hunterLeadCount})
                </button>
                <button
                  onClick={() => setSourceFilter("WEBSITE")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    sourceFilter === "WEBSITE"
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🌐 Website Inquiries ({inboundLeads.length - hunterLeadCount})
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                {["ALL", "NEW", "WHATSAPP_SENT", "CALLED", "DEMO_SENT", "CONVERTED", "LOST"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setInboundFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      inboundFilter === st
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st === "WHATSAPP_SENT" ? "WHATSAPP SENT" : st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Workflow Strategy Banner */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <strong className="text-white">Recommended Closing Sequence:</strong>
                <span className="text-slate-300 ml-1">
                  1. Click <strong>WhatsApp First</strong> to send the Review Deficit Hook &bull; 2. Wait 30 mins, then click <strong>Call Business</strong> to close &bull; 3. Click <strong>Onboard Store</strong> to generate standee!
                </span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-slate-800 font-mono text-[11px] text-emerald-400 select-all shrink-0">
              npm run hunt-leads -- --city Kadapa --category &quot;restaurants&quot; --maxReviews 40
            </div>
          </div>

          {/* Leads Grid */}
          {filteredInbound.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-3xl border border-slate-800 text-slate-400 text-sm">
              <Inbox className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              No leads found matching current filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredInbound.map((lead) => {
                const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
                const hasValidPhone = cleanPhone.length >= 10 && !cleanPhone.startsWith("000");
                const isHunter = lead.source === "GOOGLE_MAPS_HUNTER" || lead.source === "OPEN_SOURCE_IMPORT";
                const { rating, reviewCount, deficit, mapsUrl, cleanAddress } = parseHunterNotes(lead.notes);
                const isEditingThisPhone = editingPhoneId === lead.id;
                const isWritingNote = activeNoteId === lead.id;

                return (
                  <div
                    key={lead.id}
                    className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Badges & Date */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              isHunter
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            }`}
                          >
                            {isHunter ? "🎯 LOW-REVIEW TARGET" : "🌐 WEB INQUIRY"}
                          </span>

                          <span className="text-[10px] text-slate-500">
                            {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>

                        {/* Status Dropdown */}
                        <select
                          value={lead.status}
                          disabled={updatingId === lead.id}
                          onChange={(e) => updateInboundStatus(lead.id, e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                        >
                          <option value="NEW">1. NEW</option>
                          <option value="WHATSAPP_SENT">2. WHATSAPP SENT 💬</option>
                          <option value="CALLED">3. CALLED 📞</option>
                          <option value="DEMO_SENT">4. DEMO SENT 🎁</option>
                          <option value="CONVERTED">5. CONVERTED 🎉</option>
                          <option value="LOST">LOST ✕</option>
                        </select>
                      </div>

                      {/* Business Title & Location */}
                      <div className="space-y-0.5">
                        <h4 className="text-lg font-extrabold text-white tracking-tight flex items-center justify-between">
                          <span>{lead.businessName}</span>
                          {mapsUrl && (
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-semibold"
                              title="Open listing on Google Maps"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              Maps <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {lead.category || "Local Business"} &bull; <span className="text-slate-300 font-medium">{lead.city || "India"}</span>
                          {cleanAddress ? ` &bull; ${cleanAddress}` : ""}
                        </p>
                      </div>

                      {/* Google Reviews Metric Pill */}
                      {isHunter && reviewCount !== null && (
                        <div className="mt-3 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            {rating !== null && (
                              <span className="font-extrabold text-amber-400 flex items-center gap-1">
                                ⭐ {rating}
                              </span>
                            )}
                            <span className="font-bold text-slate-200">
                              💬 {reviewCount} Google Reviews
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-black">
                            🚨 Needs {deficit || (100 - reviewCount)} to hit 100
                          </span>
                        </div>
                      )}

                      {/* Interactive Pipeline Stepper Bar */}
                      <div className="mt-3 grid grid-cols-5 gap-1 text-[10px] text-center font-bold">
                        {[
                          { id: "NEW", label: "New" },
                          { id: "WHATSAPP_SENT", label: "WhatsApp" },
                          { id: "CALLED", label: "Called" },
                          { id: "DEMO_SENT", label: "Demo" },
                          { id: "CONVERTED", label: "Closed" },
                        ].map((step, idx) => {
                          const activeIdx = ["NEW", "WHATSAPP_SENT", "CALLED", "DEMO_SENT", "CONVERTED"].indexOf(lead.status);
                          const isDone = activeIdx >= idx;
                          return (
                            <button
                              key={step.id}
                              onClick={() => updateInboundStatus(lead.id, step.id)}
                              className={`py-1 rounded-lg transition-all border ${
                                isDone
                                  ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                                  : "bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300"
                              }`}
                            >
                              {step.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Phone Number Display / Inline Editor */}
                      <div className="mt-3 pt-3 border-t border-slate-800/80">
                        {isEditingThisPhone ? (
                          <div className="p-3 bg-slate-950 rounded-2xl border border-indigo-500/40 space-y-2">
                            <label className="text-[11px] font-bold text-indigo-300 block">
                              Enter 10-Digit Mobile / Phone Number:
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingPhoneValue}
                                onChange={(e) => setEditingPhoneValue(e.target.value)}
                                placeholder="e.g. 9876543210"
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSavePhone(lead.id)}
                                disabled={savingPhoneLoading}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/30"
                              >
                                {savingPhoneLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                Save
                              </button>
                              <button
                                onClick={() => setEditingPhoneId(null)}
                                className="px-2 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-indigo-400" />
                              {hasValidPhone ? (
                                <span className="font-bold text-white font-mono">+91 {cleanPhone}</span>
                              ) : (
                                <span className="text-amber-400 font-medium">⚠️ Phone missing</span>
                              )}
                              <button
                                onClick={() => {
                                  setEditingPhoneId(lead.id);
                                  setEditingPhoneValue(hasValidPhone ? cleanPhone : "");
                                }}
                                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium underline inline-flex items-center gap-0.5 ml-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                {hasValidPhone ? "Edit" : "Add Phone"}
                              </button>
                            </div>

                            {!hasValidPhone && mapsUrl && (
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <Search className="w-3 h-3" />
                                Find number on Google Maps
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Lead Notes / Activity History */}
                      {lead.notes && (
                        <div className="mt-3 text-xs text-slate-300 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 leading-relaxed max-h-24 overflow-y-auto whitespace-pre-line font-mono text-[11px]">
                          {lead.notes}
                        </div>
                      )}

                      {/* Add Quick Note Input */}
                      {isWritingNote ? (
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type="text"
                            value={noteInputValue}
                            onChange={(e) => setNoteInputValue(e.target.value)}
                            placeholder="e.g. Spoke to owner, callback at 4 PM..."
                            className="flex-1 bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveQuickNote(lead.id)}
                            disabled={savingNoteLoading}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setActiveNoteId(null)}
                            className="text-slate-400 hover:text-white text-xs px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1 flex justify-end">
                          <button
                            onClick={() => {
                              setActiveNoteId(lead.id);
                              setNoteInputValue("");
                            }}
                            className="text-[10px] text-slate-400 hover:text-indigo-400 flex items-center gap-1 font-medium"
                          >
                            <PlusCircle className="w-3 h-3" />
                            Add Follow-up Note
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Bar: STEP 1 (WhatsApp) -> STEP 2 (Call) -> STEP 3 (Onboard) */}
                    <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1. WHATSAPP FIRST BUTTON */}
                        <button
                          onClick={() => {
                            if (!hasValidPhone) {
                              setEditingPhoneId(lead.id);
                              setEditingPhoneValue("");
                              return;
                            }
                            setWhatsappModalLead(lead);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                            lead.status === "WHATSAPP_SENT" || lead.status === "CALLED"
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                          }`}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>1. WhatsApp Pitch</span>
                          {lead.status === "WHATSAPP_SENT" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        </button>

                        {/* 2. THEN CALL BUTTON */}
                        <button
                          onClick={() => {
                            if (!hasValidPhone) {
                              setEditingPhoneId(lead.id);
                              setEditingPhoneValue("");
                              return;
                            }
                            setCallingModalLead(lead);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                            lead.status === "CALLED"
                              ? "bg-blue-950/60 text-blue-300 border border-blue-500/30 hover:bg-blue-900/60"
                              : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                          }`}
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>2. Call Business</span>
                          {lead.status === "CALLED" && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                        </button>
                      </div>

                      {/* 3. CONVERT TO CLIENT STORE */}
                      <Link
                        href={`/admin/merchants?autoName=${encodeURIComponent(lead.businessName)}&autoPhone=${cleanPhone}&autoCity=${encodeURIComponent(lead.city || "")}&autoCategory=${encodeURIComponent(lead.category || "")}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition-all hover:border-amber-400/40"
                        title="Onboard this lead as an official client store"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Onboard Store &rarr;</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MARKET RADAR (OSM SCANNER) ───────────────────────── */}
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
                    title="Export Leads to CSV"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    Export CSV
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Leads Grid */}
          <div className="grid grid-cols-1 gap-6">
            {displayedLeads.map((lead) => {
              const isExpanded = expandedDossier[lead.id] || false;
              const cleanPhone = (lead.phone || "").replace(/[^0-9]/g, "");
              const isAdded = inboundLeads.some(
                (il) => il.businessName.toLowerCase() === lead.name.toLowerCase()
              );

              return (
                <div
                  key={lead.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-slate-700 transition-all"
                >
                  <div className="p-5 md:p-6 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          🗺️ OpenStreetMap
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {lead.locality !== lead.city ? `${lead.locality}, ` : ""}{lead.city}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-white tracking-tight">{lead.name}</h2>
                      {lead.address && <p className="text-xs text-slate-500">{lead.address}</p>}
                    </div>

                    <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Rating</div>
                        <div className="text-sm font-extrabold text-amber-400">⭐ N/A</div>
                      </div>
                      <div className="text-slate-600 font-black text-xs">•</div>
                      <div className="text-center">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Reviews</div>
                        <div className="text-sm font-extrabold text-slate-200">N/A</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 md:p-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {lead.googleMapsUrl && (
                        <a
                          href={lead.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                        >
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          Verify on Google Maps
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}

                      <button
                        onClick={() => addRadarLeadToCrm(lead)}
                        disabled={isAdded || addingToCrmId === lead.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          isAdded
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 cursor-default"
                            : "bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Tracked in CRM
                          </>
                        ) : addingToCrmId === lead.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            Add to CRM Targets
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODAL 1: WHATSAPP FIRST OUTREACH HUB ────────────────────── */}
      {whatsappModalLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  WhatsApp Pitch &bull; <span className="text-emerald-300">{whatsappModalLead.businessName}</span>
                </h3>
              </div>
              <button
                onClick={() => setWhatsappModalLead(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Template Selector Tabs */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Select High-Converting WhatsApp Hook:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                {[
                  { id: "deficit", label: "Deficit Hook (EN)" },
                  { id: "telugu", label: "తెలుగు పిచ్" },
                  { id: "mockup", label: "Mockup Offer" },
                  { id: "followup", label: "Call Follow-up" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveWaTemplate(t.id as any)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                      activeWaTemplate === t.id
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Preview */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Message Preview (Ready to Send to +91 {whatsappModalLead.phone.replace(/[^0-9]/g, "")}):
              </label>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto font-sans">
                {getWhatsAppMessage(whatsappModalLead, activeWaTemplate)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getWhatsAppMessage(whatsappModalLead, activeWaTemplate));
                  alert("Copied message to clipboard!");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Text
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWhatsappModalLead(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleLaunchWhatsApp(whatsappModalLead)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  Launch WhatsApp &amp; Advance Stage &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: THEN CALL ASSISTANT & BATTLECARD ───────────────── */}
      {callingModalLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Phone Call Battlecard &bull; <span className="text-blue-300">{callingModalLead.businessName}</span>
                </h3>
              </div>
              <button
                onClick={() => setCallingModalLead(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Click to Call Banner */}
            <div className="p-4 rounded-2xl bg-blue-950/50 border border-blue-500/30 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-blue-400">Target Phone Number</div>
                <div className="text-lg font-black text-white font-mono">+91 {callingModalLead.phone.replace(/[^0-9]/g, "")}</div>
              </div>
              <a
                href={`tel:+91${callingModalLead.phone.replace(/[^0-9]/g, "")}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition-all"
              >
                <Phone className="w-4 h-4" />
                Dial Now
              </a>
            </div>

            {/* Call Battlecard Script */}
            <div className="space-y-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-300">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                🗣️ On-Screen Call Script (High-Closing Pitch):
              </div>
              <div className="space-y-2 leading-relaxed">
                <p>
                  <strong>1. The Hook:</strong> &quot;Hello, am I speaking with the manager/owner of {callingModalLead.businessName}? I just sent you a message on WhatsApp regarding your Google Maps rating.&quot;
                </p>
                <p>
                  <strong>2. The Deficit:</strong> &quot;I noticed you have a great rating, but only a few reviews in {callingModalLead.city || "town"}. When customers search on Google Maps, nearby competitors with 100+ reviews rank at the top.&quot;
                </p>
                <p>
                  <strong>3. The Solution:</strong> &quot;We provide a 3D Smart NFC Standee for your billing desk. Diners/customers simply tap their phone at checkout, and Gemini AI drafts a 5-star review in 5 seconds.&quot;
                </p>
                <p>
                  <strong>4. The Close:</strong> &quot;We have sample units ready in {callingModalLead.city || "your area"} today. Can I deliver one to your counter for a quick 2-minute trial?&quot;
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCallingModalLead(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkCalled(callingModalLead)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Done! Mark as CALLED 📞
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: IMPORT SCRAPED LEADS ───────────────────────────── */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Import Scraped Google Maps Leads</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Paste CSV or JSON exported from top open-source tools like{" "}
              <strong className="text-emerald-300">omkarcloud/google-maps-scraper</strong> or{" "}
              <strong className="text-emerald-300">gosom/google-maps-scraper</strong>. The system will automatically skip national chains, filter for businesses with few reviews, and compute review deficits!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">City</label>
                <input
                  type="text"
                  value={importCity}
                  onChange={(e) => setImportCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <input
                  type="text"
                  value={importCategory}
                  onChange={(e) => setImportCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Max Reviews Filter</label>
                <input
                  type="number"
                  value={importMaxReviews}
                  onChange={(e) => setImportMaxReviews(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2"
                  placeholder="e.g. 40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Paste CSV or JSON text here:
              </label>
              <textarea
                rows={8}
                value={importCsvText}
                onChange={(e) => setImportCsvText(e.target.value)}
                placeholder="name,phone,rating,reviews,address,url&#10;Sri Balaji Clinic,9876543210,4.6,18,Kadapa,https://maps.google.com/..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {importResult && (
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
                {importResult}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleImportLeads}
                disabled={importingLoading || !importCsvText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {importingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Process &amp; Save Leads
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
