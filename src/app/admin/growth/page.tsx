"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
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
  Inbox,
  RefreshCw,
  MapPin,
  CheckCircle2,
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
  Filter,
  BarChart3,
  Layers,
  ShieldCheck,
  Eye,
  Check,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  UserX,
  Store,
  HelpCircle,
} from "lucide-react";
import type { RealBusinessLead } from "@/lib/gmbDataFetcher";

interface LeadActivity {
  id: string;
  type: string;
  outcome: string | null;
  notes: string | null;
  performedBy: string | null;
  createdAt: string;
}

interface CrmLead {
  id: string;
  businessName: string;
  city: string | null;
  locality: string | null;
  category: string | null;
  phone: string | null;
  source: string;
  notes: string | null;
  status: string;
  provider: string | null;
  providerListingId: string | null;
  listingUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  observedDate: string | null;
  verificationMethod: string;
  priority: string;
  priorityReason: string | null;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  nextAction: string | null;
  nextActionDue: string | null;
  lastOutcome: string | null;
  doNotContact: boolean;
  confirmedPaidAt: string | null;
  createdAt: string;
  updatedAt: string;
  activities?: LeadActivity[];
}

interface CrmMetrics {
  totalLeads: number;
  filteredTotal: number;
  todaysFollowUpsCount: number;
  websiteEnquiriesCount: number;
  radarDiscoveredCount: number;
  fieldContactsCount: number;
  agentReportedConversions: number;
  confirmedPaidSales: number;
  stageCounts: Record<string, number>;
}

interface AgentUser {
  id: string;
  name: string;
  role: string;
  agentCode: string | null;
}

const POPULAR_CITIES = [
  { id: "Kadapa", label: "Kadapa", state: "Andhra Pradesh" },
  { id: "Proddatur", label: "Proddatur", state: "Andhra Pradesh" },
  { id: "Nandyal", label: "Nandyal", state: "Andhra Pradesh" },
  { id: "Tirupati", label: "Tirupati", state: "Andhra Pradesh" },
  { id: "Vijayawada", label: "Vijayawada", state: "Andhra Pradesh" },
  { id: "Visakhapatnam", label: "Visakhapatnam", state: "Andhra Pradesh" },
  { id: "Hyderabad", label: "Hyderabad", state: "Telangana" },
  { id: "Bengaluru", label: "Bengaluru", state: "Karnataka" },
];

const TARGET_CATEGORIES = [
  { id: "dental clinics", label: "Dental Clinics & Doctors" },
  { id: "beauty salon", label: "Beauty Salons & Spas" },
  { id: "hair studio", label: "Hair Wigs & Salons" },
  { id: "restaurants", label: "Restaurants & Cafes" },
  { id: "tours travels", label: "Tours, Travels & Pilgrimage" },
  { id: "clothing store", label: "Fashion & Clothing Stores" },
  { id: "jewellery", label: "Gold & Jewellery Shops" },
  { id: "photo studio", label: "Photography & Gift Studios" },
  { id: "flex printing", label: "Printing & Sign Boards" },
  { id: "ac repair", label: "AC & Appliance Repair" },
];

export default function AdminGrowthPage() {
  // Top-Level View State
  const [activeView, setActiveView] = useState<"TODAYS_FOLLOWUPS" | "DISCOVER" | "PIPELINE" | "REPORTS">(
    "TODAYS_FOLLOWUPS"
  );

  // CRM Data State
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [metrics, setMetrics] = useState<CrmMetrics | null>(null);
  const [agents, setAgents] = useState<AgentUser[]>([]);
  const [isLoadingCrm, setIsLoadingCrm] = useState(true);
  const [crmError, setCrmError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAgent, setFilterAgent] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Active Lead Outreach / Action Modals
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Outreach Pitch Generator State
  const [pitchTemplate, setPitchTemplate] = useState<"FIRST_CONTACT" | "CALL_FOLLOWUP" | "VISIT_FOLLOWUP">(
    "FIRST_CONTACT"
  );
  const [pitchText, setPitchText] = useState("");
  const [customPitchNote, setCustomPitchNote] = useState("");
  const [pitchCopied, setPitchCopied] = useState(false);
  const [isLoggingAction, setIsLoggingAction] = useState(false);

  // In-Person Visit State
  const [visitOwnerName, setVisitOwnerName] = useState("");
  const [visitNotes, setVisitNotes] = useState("");
  const [visitOutcome, setVisitOutcome] = useState("SPOKE_TO_OWNER");
  const [visitNextDate, setVisitNextDate] = useState("");

  // Discover / Radar State
  const [radarCity, setRadarCity] = useState("Kadapa");
  const [radarCategory, setRadarCategory] = useState("dental clinics");
  const [radarResults, setRadarResults] = useState<RealBusinessLead[]>([]);
  const [radarState, setRadarState] = useState<"IDLE" | "LOADING" | "SUCCESS" | "NO_MATCHES" | "ERROR">("IDLE");
  const [radarErrorMsg, setRadarErrorMsg] = useState("");
  const [addingLeadId, setAddingLeadId] = useState<string | null>(null);

  // Import State
  const [importCsvText, setImportCsvText] = useState("");
  const [importMaxReviews, setImportMaxReviews] = useState(50);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any | null>(null);
  const [importResultMsg, setImportResultMsg] = useState<string | null>(null);

  // Current Logged In Agent Name
  const [currentAgentName, setCurrentAgentName] = useState("ReviewSmart Sales");

  // Fetch Current User
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.name) {
          setCurrentAgentName(data.user.name);
        } else if (data.user?.agentCode) {
          setCurrentAgentName(`Agent ${data.user.agentCode}`);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch CRM Leads & Server-Side Metrics
  const fetchCrmData = useCallback(async () => {
    setIsLoadingCrm(true);
    setCrmError(null);
    try {
      const params = new URLSearchParams({
        view: activeView,
        page: String(currentPage),
        pageSize: "25",
      });
      if (searchTerm) params.set("search", searchTerm);
      if (filterCity) params.set("city", filterCity);
      if (filterStage) params.set("stage", filterStage);
      if (filterPriority) params.set("priority", filterPriority);
      if (filterAgent) params.set("agentId", filterAgent);
      if (filterSource) params.set("source", filterSource);

      const res = await fetch(`/api/admin/growth/crm?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`CRM API responded with status ${res.status}`);
      }
      const data = await res.json();
      setLeads(data.leads || []);
      setMetrics(data.metrics || null);
      setAgents(data.agents || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error("Failed to load CRM data:", err);
      setCrmError(err.message || "Failed to load CRM leads. Please try again.");
    } finally {
      setIsLoadingCrm(false);
    }
  }, [activeView, currentPage, searchTerm, filterCity, filterStage, filterPriority, filterAgent, filterSource]);

  useEffect(() => {
    if (activeView !== "DISCOVER") {
      fetchCrmData();
    }
  }, [fetchCrmData, activeView]);

  // Construct Fact-Based English Outreach Pitch
  useEffect(() => {
    if (!selectedLead) return;

    const ownerName = "Business Owner / Manager";
    const agentName = currentAgentName;
    const bizName = selectedLead.businessName;
    const locality = selectedLead.locality || selectedLead.city || "your area";

    let message = "";
    if (pitchTemplate === "FIRST_CONTACT") {
      message = `Hi ${ownerName}, this is ${agentName} from ReviewSmart AI.\n\nWe noticed ${bizName} in ${locality} and have prepared an official physical QR review standee preview for your counter.\n\nWould you like me to share a quick 10-second photo preview?`;
    } else if (pitchTemplate === "CALL_FOLLOWUP") {
      message = `Hi ${ownerName}, thank you for speaking with me earlier today regarding ${bizName}.\n\nAs discussed, here is the official ReviewSmart AI link for your business:\nhttps://reviewsmart.online/r/${bizName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}\n\nLet me know if you would like me to deliver your branded acrylic counter standee!`;
    } else if (pitchTemplate === "VISIT_FOLLOWUP") {
      message = `Hi ${ownerName}, it was great visiting ${bizName} today in ${locality}.\n\nAs demonstrated, your customers can tap or scan to share 5-star Google reviews in 10 seconds with zero typing.\n\nPlease find your digital card preview here. Excited to help grow your local Google visibility!`;
    }

    if (customPitchNote.trim()) {
      message += `\n\nNote: ${customPitchNote.trim()}`;
    }

    setPitchText(message);
  }, [selectedLead, pitchTemplate, currentAgentName, customPitchNote]);

  // Handle WhatsApp Click (Records "Draft opened" without changing sales stage)
  const handleOpenWhatsApp = async () => {
    if (!selectedLead || !selectedLead.phone) return;

    setIsLoggingAction(true);
    try {
      // 1. Log immutable audit action: WHATSAPP_DRAFT (DRAFT_OPENED)
      await fetch("/api/admin/growth/crm/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: selectedLead.id,
          type: "WHATSAPP_DRAFT",
          outcome: "DRAFT_OPENED",
          notes: pitchText.slice(0, 150),
        }),
      });

      // 2. Open WhatsApp Web / Mobile
      const clean10 = selectedLead.phone.replace(/\D/g, "").slice(-10);
      const waUrl = `https://wa.me/91${clean10}?text=${encodeURIComponent(pitchText)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");

      fetchCrmData();
    } catch (err) {
      console.error("WhatsApp activity log error:", err);
    } finally {
      setIsLoggingAction(false);
    }
  };

  // Handle Explicit Confirmation: "Marked sent by agent"
  const handleConfirmWhatsAppSent = async () => {
    if (!selectedLead) return;
    setIsLoggingAction(true);
    try {
      await fetch("/api/admin/growth/crm/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: selectedLead.id,
          type: "WHATSAPP_SENT",
          outcome: "SENT_CONFIRMED",
          notes: "Agent confirmed outreach message was successfully sent.",
        }),
      });
      setShowPitchModal(false);
      fetchCrmData();
    } catch (err) {
      console.error("Confirm sent error:", err);
    } finally {
      setIsLoggingAction(false);
    }
  };

  // Handle Call Logging
  const handleLogCall = async (outcome: "SPOKE_TO_OWNER" | "NO_ANSWER" | "CALLBACK_REQUESTED") => {
    if (!selectedLead) return;
    setIsLoggingAction(true);
    try {
      await fetch("/api/admin/growth/crm/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: selectedLead.id,
          type: "CALL",
          outcome,
          notes: `Call outcome: ${outcome.replace(/_/g, " ")}`,
        }),
      });
      fetchCrmData();
    } catch (err) {
      console.error("Call log error:", err);
    } finally {
      setIsLoggingAction(false);
    }
  };

  // Handle In-Person Store Visit Logging
  const handleLogVisit = async () => {
    if (!selectedLead) return;
    setIsLoggingAction(true);
    try {
      await fetch("/api/admin/growth/crm/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: selectedLead.id,
          type: "IN_PERSON_VISIT",
          outcome: visitOutcome,
          notes: `Owner: ${visitOwnerName || "Not stated"}. Notes: ${visitNotes}`,
          nextAction: "FOLLOW_UP_VISIT",
          nextActionDue: visitNextDate ? new Date(visitNextDate).toISOString() : null,
        }),
      });
      setShowVisitModal(false);
      setVisitOwnerName("");
      setVisitNotes("");
      setVisitNextDate("");
      fetchCrmData();
    } catch (err) {
      console.error("Visit log error:", err);
    } finally {
      setIsLoggingAction(false);
    }
  };

  // Update Lead Stage / Status
  const handleUpdateStage = async (leadId: string, newStage: string) => {
    try {
      await fetch("/api/admin/growth/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          status: newStage,
        }),
      });
      fetchCrmData();
    } catch (err) {
      console.error("Stage update error:", err);
    }
  };

  // Toggle Do Not Contact
  const handleToggleDoNotContact = async (leadId: string, currentVal: boolean) => {
    try {
      await fetch("/api/admin/growth/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          doNotContact: !currentVal,
        }),
      });
      fetchCrmData();
    } catch (err) {
      console.error("DNC update error:", err);
    }
  };

  // Run Radar Search (On Demand Only)
  const handleRunRadar = async () => {
    setRadarState("LOADING");
    setRadarErrorMsg("");
    setRadarResults([]);

    try {
      const res = await fetch(`/api/admin/growth?city=${encodeURIComponent(radarCity)}&category=${encodeURIComponent(radarCategory)}`);
      if (!res.ok) {
        throw new Error(`Radar provider returned status ${res.status}`);
      }
      const data = await res.json();
      if (!data.leads || data.leads.length === 0) {
        setRadarState("NO_MATCHES");
      } else {
        setRadarResults(data.leads);
        setRadarState("SUCCESS");
      }
    } catch (err: any) {
      console.error("Radar search error:", err);
      setRadarErrorMsg(err.message || "Provider service unavailable. Please retry in a few moments.");
      setRadarState("ERROR");
    }
  };

  // Add Radar Discovery to CRM
  const handleAddRadarToCrm = async (lead: RealBusinessLead) => {
    setAddingLeadId(lead.id);
    try {
      const res = await fetch("/api/admin/growth/crm/radar-to-crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          city: lead.city,
          locality: lead.locality,
          category: radarCategory,
          phone: lead.phone,
          rating: lead.rating,
          reviewCount: lead.reviewCount,
          googlePlaceId: lead.googlePlaceId,
          googleMapsUrl: lead.googleMapsUrl,
          dataSource: lead.dataSource,
          id: lead.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Remove or mark added
        setRadarResults((prev) => prev.filter((r) => r.id !== lead.id));
      }
    } catch (err) {
      console.error("Add radar lead error:", err);
    } finally {
      setAddingLeadId(null);
    }
  };

  // CSV Import (Supports dryRun preview first)
  const handlePreviewImport = async (dryRun: boolean) => {
    if (!importCsvText.trim()) return;
    setIsImporting(true);
    setImportResultMsg(null);
    try {
      const res = await fetch("/api/admin/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvText: importCsvText,
          maxReviews: importMaxReviews,
          dryRun,
        }),
      });
      const data = await res.json();
      if (dryRun) {
        setImportPreview(data);
      } else {
        setImportResultMsg(`Successfully imported ${data.importedCount} new leads! (${data.matchedCount} already matched, ${data.skippedCount} skipped)`);
        setImportPreview(null);
        setImportCsvText("");
        fetchCrmData();
      }
    } catch (err: any) {
      console.error("Import error:", err);
      setImportResultMsg(err.message || "Failed to process CSV import.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#172033] pb-20 font-sans selection:bg-indigo-600 selection:text-white">
      {/* ─── STICKY HEADER ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#F7F6F2]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-[#172033] tracking-tight">
                  Field-Sales CRM
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full">
                  Verified Data
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Ground-truth leads, fact-based outreach & reliable follow-ups
              </p>
            </div>
          </div>

          {/* Navigation Views Tab Bar */}
          <div className="flex items-center bg-stone-200/70 p-1 rounded-2xl border border-stone-300/60 shadow-inner">
            <button
              onClick={() => setActiveView("TODAYS_FOLLOWUPS")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeView === "TODAYS_FOLLOWUPS"
                  ? "bg-white text-indigo-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Today's Follow-ups</span>
              {metrics && metrics.todaysFollowUpsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-600 text-white font-mono">
                  {metrics.todaysFollowUpsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView("DISCOVER")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeView === "DISCOVER"
                  ? "bg-white text-indigo-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>Discover (Radar)</span>
            </button>

            <button
              onClick={() => setActiveView("PIPELINE")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeView === "PIPELINE"
                  ? "bg-white text-indigo-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Pipeline</span>
              {metrics && (
                <span className="ml-1 text-[11px] font-mono text-stone-500">
                  ({metrics.totalLeads})
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView("REPORTS")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeView === "REPORTS"
                  ? "bg-white text-indigo-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reports</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:text-stone-900 text-xs font-bold shadow-sm transition hover:bg-stone-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={() => fetchCrmData()}
              className="p-2 rounded-xl bg-white border border-stone-300 text-stone-600 hover:text-stone-900 transition hover:bg-stone-50"
              title="Refresh CRM"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingCrm ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT CONTAINER ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        {/* VIEW 1: TODAY'S FOLLOW-UPS (DEFAULT VIEW) */}
        {activeView === "TODAYS_FOLLOWUPS" && (
          <div className="space-y-4">
            <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base sm:text-lg font-black text-[#172033]">
                    Today's Action Queue
                  </h2>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Scheduled phone calls, in-person visits, and demo requests requiring action today.
                </p>
              </div>

              {/* Search in Queue */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search business or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs text-stone-800 placeholder-stone-400 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {/* Leads List / Cards */}
            {isLoadingCrm ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                <p className="text-xs font-semibold text-stone-500">Loading today's follow-up queue...</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-1" />
                <h3 className="text-base font-bold text-stone-800">All caught up for today!</h3>
                <p className="text-xs text-stone-500 max-w-sm">
                  No overdue or pending follow-ups right now. Check the Pipeline or run a Radar search to discover new merchants.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {leads.map((lead) => {
                  const hasPhone = Boolean(lead.phone && lead.phone.length >= 10);
                  return (
                    <div
                      key={lead.id}
                      className="bg-white border border-stone-200/90 hover:border-indigo-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      {/* Left: Identity & Badges */}
                      <div className="space-y-1.5 flex-1 min-w-[280px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-[#172033] hover:text-indigo-600 transition cursor-pointer" onClick={() => { setSelectedLead(lead); setShowDetailDrawer(true); }}>
                            {lead.businessName}
                          </h3>

                          {/* Priority Pill */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                              lead.priority === "DEMO_REQUESTED"
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : lead.priority === "BELOW_THRESHOLD"
                                ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                                : "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                            title={lead.priorityReason || ""}
                          >
                            <span>{lead.priority.replace(/_/g, " ")}</span>
                          </span>

                          {/* Verification Method Pill */}
                          <span
                            className={`text-[9.5px] font-medium px-2 py-0.2 rounded-md border ${
                              lead.verificationMethod === "API_VERIFIED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : lead.verificationMethod === "MAPS_LINK_ONLY"
                                ? "bg-sky-50 text-sky-800 border-sky-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {lead.verificationMethod === "API_VERIFIED"
                              ? "API Verified"
                              : lead.verificationMethod === "MAPS_LINK_ONLY"
                              ? "Maps Link"
                              : "Needs Verification"}
                          </span>
                        </div>

                        {/* Locality & Ratings */}
                        <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{lead.locality || lead.city || "Kadapa"}</span>
                          </span>

                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            <span>
                              {lead.rating !== null ? `${lead.rating.toFixed(1)}★` : "Unrated"}
                              {lead.reviewCount !== null ? ` (${lead.reviewCount} revs)` : " (0 revs)"}
                            </span>
                          </span>

                          {lead.assignedAgentName && (
                            <span className="flex items-center gap-1 font-mono text-[11px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                              <UserCheck className="w-3 h-3" />
                              <span>{lead.assignedAgentName}</span>
                            </span>
                          )}

                          {lead.lastOutcome && (
                            <span className="text-[11px] text-stone-600 bg-stone-100 px-1.5 py-0.2 rounded font-mono">
                              Last: {lead.lastOutcome.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Field Actions */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
                        {/* Call Button */}
                        {hasPhone ? (
                          <a
                            href={`tel:+91${lead.phone}`}
                            onClick={() => {
                              setSelectedLead(lead);
                              handleLogCall("SPOKE_TO_OWNER");
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition shadow-sm"
                            title={`Call +91 ${lead.phone}`}
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>+91 {lead.phone}</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-400 text-xs border border-stone-200">
                            <Phone className="w-3.5 h-3.5 text-stone-300" />
                            <span>No Phone</span>
                          </span>
                        )}

                        {/* WhatsApp Outreach */}
                        <button
                          disabled={!hasPhone}
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowPitchModal(true);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                            hasPhone
                              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                              : "bg-stone-200 text-stone-400 cursor-not-allowed"
                          }`}
                          title={hasPhone ? "Prepare WhatsApp Pitch" : "Phone number required for WhatsApp"}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>

                        {/* In-Person Store Visit */}
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowVisitModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-indigo-400 text-stone-700 hover:text-indigo-900 text-xs font-bold transition shadow-sm"
                          title="Record in-person field visit"
                        >
                          <Store className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Log Visit</span>
                        </button>

                        {/* Stage Selector */}
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateStage(lead.id, e.target.value)}
                          className="text-xs font-bold bg-stone-50 border border-stone-300 text-stone-800 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="NEW">New</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="DEMO_REQUESTED">Demo Requested</option>
                          <option value="CONVERTED">Converted</option>
                          <option value="LOST">Lost</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: DISCOVER (RADAR ON-DEMAND SEARCH) */}
        {activeView === "DISCOVER" && (
          <div className="space-y-4">
            <div className="bg-white border border-stone-200/90 rounded-3xl p-5 shadow-sm space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-600" />
                  <h2 className="text-base sm:text-lg font-black text-[#172033]">
                    Ground Radar Discovery
                  </h2>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Scan local OpenStreetMap & Google Places registers on demand. Results remain strictly unverified until confirmed by an agent.
                </p>
              </div>

              {/* City & Category Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">Target City</label>
                  <select
                    value={radarCity}
                    onChange={(e) => setRadarCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {POPULAR_CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label} ({c.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">Merchant Category</label>
                  <select
                    value={radarCategory}
                    onChange={(e) => setRadarCategory(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {TARGET_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleRunRadar}
                    disabled={radarState === "LOADING"}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition disabled:opacity-50"
                  >
                    {radarState === "LOADING" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Scanning Radar...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Search Radar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Radar Visual States */}
            {radarState === "IDLE" && (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center flex flex-col items-center justify-center gap-2">
                <Compass className="w-10 h-10 text-stone-300 mb-1" />
                <h3 className="text-base font-bold text-stone-800">Ready to Scan</h3>
                <p className="text-xs text-stone-500 max-w-sm">
                  Select your target city and category above, then tap "Search Radar" to query local business listings on demand.
                </p>
              </div>
            )}

            {radarState === "LOADING" && (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-xs font-semibold text-stone-600">
                  Querying OpenStreetMap spatial nodes in {radarCity} for {radarCategory}...
                </p>
              </div>
            )}

            {radarState === "NO_MATCHES" && (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center flex flex-col items-center justify-center gap-2">
                <AlertTriangle className="w-10 h-10 text-amber-500 mb-1" />
                <h3 className="text-base font-bold text-stone-800">No Listings Found</h3>
                <p className="text-xs text-stone-500 max-w-sm">
                  No matching business nodes found in {radarCity} for this category. Try another nearby city or category.
                </p>
              </div>
            )}

            {radarState === "ERROR" && (
              <div className="bg-white rounded-3xl border border-red-200 p-8 text-center flex flex-col items-center justify-center gap-2">
                <AlertTriangle className="w-10 h-10 text-red-500 mb-1" />
                <h3 className="text-base font-bold text-red-800">Provider Unavailable</h3>
                <p className="text-xs text-red-600 max-w-md">{radarErrorMsg}</p>
                <button
                  onClick={handleRunRadar}
                  className="mt-2 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition"
                >
                  Retry Search
                </button>
              </div>
            )}

            {radarState === "SUCCESS" && radarResults.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                  <span>Found {radarResults.length} potential merchant listings in {radarCity}</span>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    All Marked "Needs Verification"
                  </span>
                </div>

                {radarResults.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-[#172033]">{lead.name}</h4>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 border border-amber-300 px-2 py-0.2 rounded-full">
                          Needs Verification
                        </span>
                        {lead.phone ? (
                          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            {lead.phone}
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400">No phone in OSM</span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500">{lead.address}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {lead.googleMapsUrl && (
                        <a
                          href={lead.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition"
                          title="Open Maps Search"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleAddRadarToCrm(lead)}
                        disabled={addingLeadId === lead.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
                      >
                        {addingLeadId === lead.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <PlusCircle className="w-3.5 h-3.5" />
                        )}
                        <span>Add to CRM</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: PIPELINE (ALL LEADS & STAGES) */}
        {activeView === "PIPELINE" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white border border-stone-200/90 rounded-3xl p-4 shadow-sm flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap flex-1">
                <input
                  type="text"
                  placeholder="Filter name, phone, locality..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:bg-white text-stone-800 placeholder-stone-400 min-w-[200px]"
                />

                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 bg-stone-50"
                >
                  <option value="">All Stages</option>
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="DEMO_REQUESTED">Demo Requested</option>
                  <option value="CONVERTED">Converted</option>
                  <option value="LOST">Lost</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 bg-stone-50"
                >
                  <option value="">All Priorities</option>
                  <option value="DEMO_REQUESTED">Demo Requested</option>
                  <option value="FOLLOW_UP_TODAY">Follow-up Today</option>
                  <option value="BELOW_THRESHOLD">Below 30 Target</option>
                  <option value="NEEDS_VERIFICATION">Needs Verification</option>
                  <option value="NORMAL">Normal</option>
                </select>

                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 bg-stone-50"
                >
                  <option value="">All Sources</option>
                  <option value="WEBSITE_ENQUIRY">Website Enquiry</option>
                  <option value="RADAR_DISCOVERY">Radar Discovery</option>
                  <option value="CSV_IMPORT">CSV Import</option>
                  <option value="FIELD_VISIT">Field Visit</option>
                </select>
              </div>

              <span className="text-xs text-stone-500 font-mono">
                Showing {leads.length} of {metrics?.filteredTotal || leads.length} leads
              </span>
            </div>

            {/* Pipeline Table */}
            <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Merchant & Branch</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Rating / Reviews</th>
                      <th className="py-3 px-4">Priority & Reason</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-stone-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">{lead.businessName}</div>
                          <div className="text-[11px] text-stone-400">{lead.locality || lead.city || "Kadapa"}</div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {lead.phone ? `+91 ${lead.phone}` : <span className="text-stone-300">—</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-stone-800">
                            {lead.rating !== null ? `${lead.rating.toFixed(1)}★` : "—"}
                          </span>{" "}
                          <span className="text-stone-400">
                            ({lead.reviewCount !== null ? lead.reviewCount : "Unverified"})
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              lead.priority === "DEMO_REQUESTED"
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                          >
                            {lead.priority.replace(/_/g, " ")}
                          </span>
                          {lead.priorityReason && (
                            <div className="text-[10px] text-stone-400 mt-0.5 max-w-[160px] truncate" title={lead.priorityReason}>
                              {lead.priorityReason}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone-500 text-[11px]">
                          {lead.source.replace(/_/g, " ")}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={lead.status}
                            onChange={(e) => handleUpdateStage(lead.id, e.target.value)}
                            className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold text-stone-800"
                          >
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="DEMO_REQUESTED">Demo Requested</option>
                            <option value="CONVERTED">Converted</option>
                            <option value="LOST">Lost</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => { setSelectedLead(lead); setShowDetailDrawer(true); }}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                            title="View Activity Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: SERVER-SIDE RECONCILED REPORTS */}
        {activeView === "REPORTS" && metrics && (
          <div className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm">
              <h2 className="text-base sm:text-lg font-black text-[#172033]">
                Sales & Verification Performance
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Aggregated server-side metrics across your full database. Tap any card to filter the contributing records.
              </p>
            </div>

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div
                onClick={() => { setFilterSource(""); setFilterStage(""); setActiveView("PIPELINE"); }}
                className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm hover:border-indigo-400 cursor-pointer transition"
              >
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Total Leads</span>
                <span className="text-2xl font-black text-[#172033] mt-1 block">{metrics.totalLeads}</span>
                <span className="text-[10px] text-stone-400 mt-1 block">Full CRM database</span>
              </div>

              <div
                onClick={() => setActiveView("TODAYS_FOLLOWUPS")}
                className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-sm hover:border-indigo-400 cursor-pointer transition"
              >
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">Follow-ups Due</span>
                <span className="text-2xl font-black text-indigo-900 mt-1 block">{metrics.todaysFollowUpsCount}</span>
                <span className="text-[10px] text-indigo-500 mt-1 block">Due today or pending</span>
              </div>

              <div
                onClick={() => { setFilterSource("WEBSITE_ENQUIRY"); setActiveView("PIPELINE"); }}
                className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm hover:border-indigo-400 cursor-pointer transition"
              >
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Website Enquiries</span>
                <span className="text-2xl font-black text-[#172033] mt-1 block">{metrics.websiteEnquiriesCount}</span>
                <span className="text-[10px] text-stone-400 mt-1 block">Inbound visitors</span>
              </div>

              <div
                onClick={() => { setFilterSource("RADAR_DISCOVERY"); setActiveView("PIPELINE"); }}
                className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm hover:border-indigo-400 cursor-pointer transition"
              >
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Radar Discovered</span>
                <span className="text-2xl font-black text-[#172033] mt-1 block">{metrics.radarDiscoveredCount}</span>
                <span className="text-[10px] text-stone-400 mt-1 block">OSM & Maps hunters</span>
              </div>

              <div
                onClick={() => { setFilterStage("CONVERTED"); setActiveView("PIPELINE"); }}
                className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm hover:border-emerald-400 cursor-pointer transition"
              >
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Agent Conversions</span>
                <span className="text-2xl font-black text-emerald-900 mt-1 block">{metrics.agentReportedConversions}</span>
                <span className="text-[10px] text-emerald-600 mt-1 block">Reported in field</span>
              </div>

              <div
                className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 shadow-sm"
              >
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Confirmed Paid</span>
                <span className="text-2xl font-black text-emerald-950 mt-1 block">{metrics.confirmedPaidSales}</span>
                <span className="text-[10px] text-emerald-700 mt-1 block">Admin-verified sales</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── MODAL 1: FACT-BASED OUTREACH PITCH GENERATOR ───────────────────── */}
      {showPitchModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-stone-300 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-black text-base text-[#172033]">
                  WhatsApp Outreach Generator
                </h3>
                <p className="text-xs text-stone-500">
                  Target: {selectedLead.businessName} ({selectedLead.phone})
                </p>
              </div>
              <button onClick={() => setShowPitchModal(false)} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector (English Only) */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">Outreach Context</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPitchTemplate("FIRST_CONTACT")}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                    pitchTemplate === "FIRST_CONTACT"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-stone-50 text-stone-700 border-stone-200"
                  }`}
                >
                  First Contact
                </button>
                <button
                  type="button"
                  onClick={() => setPitchTemplate("CALL_FOLLOWUP")}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                    pitchTemplate === "CALL_FOLLOWUP"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-stone-50 text-stone-700 border-stone-200"
                  }`}
                >
                  Post-Call Link
                </button>
                <button
                  type="button"
                  onClick={() => setPitchTemplate("VISIT_FOLLOWUP")}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                    pitchTemplate === "VISIT_FOLLOWUP"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-stone-50 text-stone-700 border-stone-200"
                  }`}
                >
                  Post-Visit Demo
                </button>
              </div>
            </div>

            {/* Editable Pitch Area */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Editable Message (English)
              </label>
              <textarea
                rows={6}
                value={pitchText}
                onChange={(e) => setPitchText(e.target.value)}
                className="w-full p-3 rounded-2xl border border-stone-300 text-xs text-stone-800 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-stone-50 focus:bg-white"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(pitchText);
                  setPitchCopied(true);
                  setTimeout(() => setPitchCopied(false), 2000);
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
              >
                {pitchCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{pitchCopied ? "Copied" : "Copy"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirmWhatsAppSent}
                  className="px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition"
                  title="Record that this message was already sent manually"
                >
                  Mark Sent
                </button>

                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  disabled={isLoggingAction}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Open WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: IN-PERSON STORE VISIT LOGGER ─────────────────────────── */}
      {showVisitModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-stone-300 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-black text-base text-[#172033]">Log In-Person Store Visit</h3>
                <p className="text-xs text-stone-500">{selectedLead.businessName}</p>
              </div>
              <button onClick={() => setShowVisitModal(false)} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Owner / Manager Name</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Reddy"
                value={visitOwnerName}
                onChange={(e) => setVisitOwnerName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:bg-white text-stone-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Visit Outcome</label>
              <select
                value={visitOutcome}
                onChange={(e) => setVisitOutcome(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-stone-50 text-stone-800"
              >
                <option value="SPOKE_TO_OWNER">Spoke to Owner directly</option>
                <option value="DEMO_DELIVERED">Demonstrated review card on phone</option>
                <option value="OWNER_NOT_AVAILABLE">Owner not available (met staff)</option>
                <option value="PROMISED_CALL_BACK">Owner requested return visit</option>
                <option value="NOT_INTERESTED">Not interested</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Visit Discussion Notes</label>
              <textarea
                rows={3}
                placeholder="Notes on counter space, pricing response, objection handling..."
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:bg-white text-stone-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Schedule Next Action Date</label>
              <input
                type="date"
                value={visitNextDate}
                onChange={(e) => setVisitNextDate(e.target.value)}
                className="w-full p-2 rounded-xl border border-stone-300 text-xs bg-stone-50 text-stone-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowVisitModal(false)}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogVisit}
                disabled={isLoggingAction}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition disabled:opacity-50"
              >
                Save Visit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: CSV IMPORT PREVIEW ────────────────────────────────────── */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-stone-300 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-black text-base text-[#172033]">Import Leads CSV</h3>
                <p className="text-xs text-stone-500">Separates distinct branches, strips fake phones, and normalizes Indian numbers</p>
              </div>
              <button onClick={() => { setShowImportModal(false); setImportPreview(null); }} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Paste CSV Data or Tab-Delimited Leads</label>
                <textarea
                  rows={6}
                  placeholder="name,phone,reviews,rating,address,city,category&#10;City Grafix,7287867584,12,4.8,Ganagapeta,Kadapa,Printing"
                  value={importCsvText}
                  onChange={(e) => setImportCsvText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-mono bg-stone-50 focus:bg-white text-stone-800"
                />
              </div>

              {/* Preview Summary */}
              {importPreview && importPreview.summary && (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 space-y-2 text-xs">
                  <h4 className="font-bold text-stone-800">Preview Counts</h4>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-stone-400 block">Total Rows:</span>
                      <span className="font-bold text-stone-800">{importPreview.summary.total}</span>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-emerald-700 block">New Leads:</span>
                      <span className="font-bold text-emerald-900">{importPreview.summary.newCount}</span>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="text-amber-700 block">Already in CRM:</span>
                      <span className="font-bold text-amber-900">{importPreview.summary.matchedCount}</span>
                    </div>
                  </div>
                </div>
              )}

              {importResultMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                  {importResultMsg}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => handlePreviewImport(true)}
                disabled={isImporting || !importCsvText.trim()}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition disabled:opacity-50"
              >
                Preview Counts
              </button>

              <button
                type="button"
                onClick={() => handlePreviewImport(false)}
                disabled={isImporting || !importCsvText.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition disabled:opacity-50"
              >
                Confirm Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DRAWER 4: LEAD AUDIT & ACTIVITY HISTORY ───────────────────────── */}
      {showDetailDrawer && selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full h-full p-6 shadow-2xl overflow-y-auto space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <h3 className="font-black text-lg text-[#172033]">{selectedLead.businessName}</h3>
                  <p className="text-xs text-stone-500">{selectedLead.locality || selectedLead.city || "Kadapa"}</p>
                </div>
                <button onClick={() => setShowDetailDrawer(false)} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-[10px] text-stone-400 font-bold block">STATUS</span>
                  <span className="font-bold text-stone-800">{selectedLead.status}</span>
                </div>
                <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="text-[10px] text-stone-400 font-bold block">PRIORITY</span>
                  <span className="font-bold text-stone-800">{selectedLead.priority.replace(/_/g, " ")}</span>
                </div>
              </div>

              {/* Verified Contact Details */}
              <div className="space-y-1 text-xs">
                <span className="text-stone-400 font-bold text-[10px] uppercase">Verified Phone</span>
                <p className="font-mono font-bold text-stone-800">
                  {selectedLead.phone ? `+91 ${selectedLead.phone}` : "No verified number (Do in-person visit)"}
                </p>
              </div>

              {/* Do Not Contact Toggle */}
              <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-stone-800 block">Do Not Contact</span>
                  <span className="text-[10px] text-stone-500">Mute from active outreach and follow-up lists</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleDoNotContact(selectedLead.id, selectedLead.doNotContact)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedLead.doNotContact
                      ? "bg-red-600 text-white"
                      : "bg-stone-200 text-stone-700 hover:bg-stone-300"
                  }`}
                >
                  {selectedLead.doNotContact ? "Muted" : "Mute"}
                </button>
              </div>

              {/* Append-Only Activity Log */}
              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Activity History</span>
                </h4>
                {selectedLead.activities && selectedLead.activities.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedLead.activities.map((act) => (
                      <div key={act.id} className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                            {act.type}
                          </span>
                          <span className="text-stone-400">{new Date(act.createdAt).toLocaleString()}</span>
                        </div>
                        {act.outcome && <p className="font-bold text-stone-800 text-[11px]">{act.outcome.replace(/_/g, " ")}</p>}
                        {act.notes && <p className="text-stone-600 text-[11px]">{act.notes}</p>}
                        {act.performedBy && <p className="text-[9.5px] text-stone-400">By: {act.performedBy}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">No activity recorded yet.</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowDetailDrawer(false)}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
