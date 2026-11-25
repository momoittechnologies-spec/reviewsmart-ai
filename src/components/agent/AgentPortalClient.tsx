"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Phone,
  MessageCircle,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Store,
  ChevronRight,
  X,
  Loader2,
  LogOut,
  History,
  MapPin,
  Upload,
  ExternalLink,
  Compass,
  ShieldCheck,
  UserCheck,
  XCircle,
  QrCode,
} from "lucide-react";
import BrandLogo from "@/components/brand/BrandLogo";
import { HARDWARE_PACKAGES } from "@/lib/packages";

const PACKAGE_LIST = Object.values(HARDWARE_PACKAGES);

interface AgentUserInfo {
  id: string;
  name: string;
  role: string;
  agentCode: string;
}

interface LeadActivityItem {
  id: string;
  type: string;
  outcome: string | null;
  notes: string | null;
  performedBy: string | null;
  createdAt: string;
}

interface OnboardingSummary {
  businessId: string;
  businessName: string;
  slug: string;
  packageTier: string;
  logoUrl: string | null;
  googleReviewUrl: string | null;
  googleAddress: string | null;
  category: string | null;
  phone: string | null;
  isPaid: boolean;
  activatedAt: string | null;
  orderId: string | null;
  paymentStatus: string | null;
  utrNumber: string | null;
  amount: number | null;
  missingItems: string[];
}

interface AgentLead {
  id: string;
  businessName: string;
  city: string | null;
  locality: string | null;
  category: string | null;
  phone: string | null;
  status: string;
  priority: string;
  priorityReason: string | null;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  nextAction: string | null;
  nextActionDue: string | null;
  lastOutcome: string | null;
  lostReason: string | null;
  conflictFlag: boolean;
  notes: string | null;
  bucket: "OVERDUE" | "TODAY" | "NEEDS_ONBOARDING" | "UPCOMING" | "DONE";
  onboardingSummary: OnboardingSummary | null;
  activities: LeadActivityItem[];
  createdAt: string;
  updatedAt: string;
}

interface PoolLead {
  id: string;
  businessName: string;
  city: string | null;
  locality: string | null;
  category: string | null;
  phone: string | null;
  rating: number | null;
  reviewCount: number | null;
  verificationMethod: string;
  listingUrl: string | null;
}

interface Counts {
  overdue: number;
  todayDue: number;
  needsOnboarding: number;
  totalOpen: number;
  totalLeads: number;
}

interface TeamAgent {
  id: string;
  name: string | null;
  agentCode: string | null;
}

const ACTION_LABELS: Record<string, string> = {
  IN_PERSON_VISIT: "Store Visit",
  CALL: "Phone Call",
  WHATSAPP_FOLLOWUP: "WhatsApp Follow-up",
  DELIVER_MOCKUP: "Deliver Demo / Mockup",
};

const LOST_REASONS = [
  "Not interested right now",
  "Too expensive / Budget issue",
  "Already using another service",
  "Shop closed / Wrong number",
  "Do not contact",
];

function formatDueBadge(dueIso: string | null): string {
  if (!dueIso) return "Anytime";
  const d = new Date(dueIso);
  if (Number.isNaN(d.getTime())) return "Anytime";
  const now = new Date();
  const isSameDay = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
  if (isSameDay) return `Today ${timeStr}`;
  const dateStr = d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return `${dateStr} • ${timeStr}`;
}

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function nextWeekdayDateTime(targetDay: number, hour = 11): string {
  const now = new Date();
  const diff = (targetDay - now.getDay() + 7) % 7 || 7;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  d.setHours(hour, 0, 0, 0);
  return toDatetimeLocalValue(d);
}

async function compressLogoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 256;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Invalid image file"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function AgentPortalClient({
  initialUser,
}: {
  initialUser: AgentUserInfo;
}) {
  const [tab, setTab] = useState<"TODAY" | "MY_LEADS" | "POOL">("TODAY");
  const [loading, setLoading] = useState(true);
  const [todayQueue, setTodayQueue] = useState<AgentLead[]>([]);
  const [myLeads, setMyLeads] = useState<AgentLead[]>([]);
  const [teamAgents, setTeamAgents] = useState<TeamAgent[]>([]);
  const [counts, setCounts] = useState<Counts>({
    overdue: 0,
    todayDue: 0,
    needsOnboarding: 0,
    totalOpen: 0,
    totalLeads: 0,
  });

  // Search & My Leads filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [agentFilter, setAgentFilter] = useState("ALL");

  // Pool state
  const [pool, setPool] = useState<PoolLead[]>([]);
  const [poolRemaining, setPoolRemaining] = useState(5);
  const [poolLimit, setPoolLimit] = useState(5);
  const [loadingPool, setLoadingPool] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Toast / Error banner
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );

  // Add Lead Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addBizName, setAddBizName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addLocality, setAddLocality] = useState("");
  const [addCity, setAddCity] = useState("Kadapa");
  const [addCategory, setAddCategory] = useState("Local Business");
  const [addNextAction, setAddNextAction] = useState("IN_PERSON_VISIT");
  const [addDueDate, setAddDueDate] = useState(() =>
    nextWeekdayDateTime(new Date().getDay() === 5 ? 6 : 5, 11)
  );
  const [addNotes, setAddNotes] = useState("");
  const [savingLead, setSavingLead] = useState(false);
  const [dupState, setDupState] = useState<{
    crossAgentConflict: boolean;
    message: string;
    existingLead?: { id: string; businessName: string; locality?: string; status: string };
  } | null>(null);

  // Outcome Modal
  const [outcomeLead, setOutcomeLead] = useState<AgentLead | null>(null);
  const [actType, setActType] = useState("IN_PERSON_VISIT");
  const [actOutcome, setActOutcome] = useState("SPOKE_TO_OWNER");
  const [actNotes, setActNotes] = useState("");
  const [actNextAction, setActNextAction] = useState("CALL");
  const [actNextDue, setActNextDue] = useState("");
  const [closeAsLost, setCloseAsLost] = useState(false);
  const [lostReason, setLostReason] = useState(LOST_REASONS[0]);
  const [savingOutcome, setSavingOutcome] = useState(false);

  // WhatsApp review Modal
  const [waLead, setWaLead] = useState<AgentLead | null>(null);
  const [waMessage, setWaMessage] = useState("");
  const [sendingWa, setSendingWa] = useState(false);

  // Timeline Drawer
  const [timelineLead, setTimelineLead] = useState<AgentLead | null>(null);

  // Convert to Merchant Onboarding Modal
  const [convertLead, setConvertLead] = useState<AgentLead | null>(null);
  const [convName, setConvName] = useState("");
  const [convPhone, setConvPhone] = useState("");
  const [convCategory, setConvCategory] = useState("");
  const [convAddress, setConvAddress] = useState("");
  const [convPackage, setConvPackage] = useState("STARTER_PVC");
  const [convGoogleUrl, setConvGoogleUrl] = useState("");
  const [convLogoUrl, setConvLogoUrl] = useState("");
  const [convUtr, setConvUtr] = useState("");
  const [convAmount, setConvAmount] = useState("2999");
  const [convPayNotes, setConvPayNotes] = useState("");
  const [convManagerConfirm, setConvManagerConfirm] = useState(false);
  const [savingConvert, setSavingConvert] = useState(false);
  const [convertResult, setConvertResult] = useState<{
    qrUrl: string;
    missingItems: string[];
    isActivated: boolean;
  } | null>(null);

  const showNotice = (kind: "ok" | "err", text: string) => {
    setToast({ kind, text });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (initialUser.role === "SUPER_ADMIN" && agentFilter !== "ALL") {
        params.set("agentId", agentFilter);
      }
      const res = await fetch(`/api/agent/leads?${params.toString()}`);
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      setTodayQueue(data.todayQueue || []);
      setMyLeads(data.myLeads || []);
      setCounts(
        data.counts || {
          overdue: 0,
          todayDue: 0,
          needsOnboarding: 0,
          totalOpen: 0,
          totalLeads: 0,
        }
      );
      setTeamAgents(data.teamAgents || []);
    } catch {
      showNotice("err", "Could not sync leads. Check connection and pull to retry.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, agentFilter, initialUser.role]);

  const fetchPool = useCallback(async () => {
    setLoadingPool(true);
    try {
      const res = await fetch("/api/agent/pool");
      const data = await res.json();
      setPool(data.pool || []);
      setPoolRemaining(data.remainingToday ?? 0);
      setPoolLimit(data.dailyLimit ?? 5);
    } catch {
      showNotice("err", "Failed to load Growth Engine pool.");
    } finally {
      setLoadingPool(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (tab === "POOL") fetchPool();
  }, [tab, fetchPool]);

  const openConvertSheet = (lead: AgentLead) => {
    const ob = lead.onboardingSummary;
    setConvertLead(lead);
    setConvName(ob?.businessName || lead.businessName);
    setConvPhone(ob?.phone || lead.phone || "");
    setConvCategory(ob?.category || lead.category || "Local Business");
    setConvAddress(
      ob?.googleAddress || [lead.locality, lead.city].filter(Boolean).join(", ")
    );
    const pkgId = ob?.packageTier || "STARTER_PVC";
    setConvPackage(pkgId);
    const pkgObj = PACKAGE_LIST.find((p) => p.id === pkgId);
    setConvAmount(String(ob?.amount || pkgObj?.price || 2999));
    setConvGoogleUrl(ob?.googleReviewUrl || "");
    setConvLogoUrl(ob?.logoUrl || "");
    setConvUtr(ob?.utrNumber || "");
    setConvPayNotes("");
    setConvManagerConfirm(false);
    setConvertResult(
      ob
        ? {
            qrUrl: `/r/${ob.slug}`,
            missingItems: ob.missingItems,
            isActivated: Boolean(ob.activatedAt),
          }
        : null
    );
  };

  const openOutcomeSheet = (lead: AgentLead) => {
    setOutcomeLead(lead);
    setActType(lead.nextAction === "CALL" ? "CALL" : "IN_PERSON_VISIT");
    setActOutcome("SPOKE_TO_OWNER");
    setActNotes("");
    setActNextAction(lead.nextAction || "CALL");
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(11, 0, 0, 0);
    setActNextDue(
      lead.nextActionDue
        ? toDatetimeLocalValue(new Date(lead.nextActionDue))
        : toDatetimeLocalValue(tomorrow)
    );
    setCloseAsLost(false);
    setLostReason(LOST_REASONS[0]);
  };

  const openWhatsAppSheet = (lead: AgentLead) => {
    const firstArea = lead.locality || lead.city || "your area";
    setWaLead(lead);
    setWaMessage(
      `Namaste! This is ${initialUser.name} from ReviewSmart AI.\n\nIt was great connecting regarding the QR Google Review Standee for ${lead.businessName} in ${firstArea}.\n\nCustomers simply tap or scan the standee to post genuine Google reviews in seconds (English & Telugu supported).\n\nCounter standee packages start at ₹2,999 one-time. Demo: https://reviewsmart.online/demo`
    );
  };

  const handleSaveLead = async (
    mode: "FOLLOW_UP" | "ONBOARD_NOW",
    opts?: { allowSamePhoneBranch?: boolean; acknowledgeCrossAgentConflict?: boolean }
  ) => {
    if (!addBizName.trim() || !addPhone.trim() || !addLocality.trim()) {
      showNotice("err", "Please fill Business Name, Contact Number, and Area.");
      return;
    }
    setSavingLead(true);
    try {
      const res = await fetch("/api/agent/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: addBizName.trim(),
          phone: addPhone.trim(),
          locality: addLocality.trim(),
          city: addCity.trim(),
          category: addCategory.trim(),
          mode,
          nextAction: addNextAction,
          nextActionDue: addDueDate ? new Date(addDueDate).toISOString() : new Date().toISOString(),
          notes: addNotes.trim() || undefined,
          allowSamePhoneBranch: opts?.allowSamePhoneBranch || false,
          acknowledgeCrossAgentConflict: opts?.acknowledgeCrossAgentConflict || false,
        }),
      });
      const data = await res.json();
      if (res.status === 409 && data.duplicateDetected) {
        setDupState({
          crossAgentConflict: Boolean(data.crossAgentConflict),
          message: data.message,
          existingLead: data.existingLead,
        });
        setSavingLead(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Could not save lead");

      setDupState(null);
      setShowAddModal(false);
      setAddBizName("");
      setAddPhone("");
      setAddLocality("");
      setAddNotes("");

      showNotice(
        "ok",
        data.conflictFlaggedForManager
          ? "Saved as branch & flagged for manager review."
          : mode === "ONBOARD_NOW"
          ? "Lead saved — complete onboarding below."
          : "Lead saved and follow-up scheduled!"
      );

      await fetchLeads();

      if (mode === "ONBOARD_NOW" && data.lead) {
        openConvertSheet({
          ...data.lead,
          bucket: "NEEDS_ONBOARDING",
          onboardingSummary: null,
          activities: data.lead.activities || [],
        });
      }
    } catch (err) {
      showNotice("err", err instanceof Error ? err.message : "Failed to save lead");
    } finally {
      setSavingLead(false);
    }
  };

  const handleSaveOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcomeLead) return;
    setSavingOutcome(true);
    try {
      const res = await fetch("/api/admin/growth/crm/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: outcomeLead.id,
          type: actType,
          outcome: closeAsLost ? "NOT_INTERESTED" : actOutcome,
          notes: actNotes.trim() || (closeAsLost ? lostReason : undefined),
          nextAction: closeAsLost ? null : actNextAction,
          nextActionDue:
            closeAsLost || !actNextDue ? null : new Date(actNextDue).toISOString(),
          status: closeAsLost ? "LOST" : undefined,
          lostReason: closeAsLost ? lostReason : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log outcome");

      setOutcomeLead(null);
      showNotice(
        "ok",
        closeAsLost ? "Lead closed as Lost with reason saved." : "Outcome & follow-up saved!"
      );
      await fetchLeads();
    } catch (err) {
      showNotice("err", err instanceof Error ? err.message : "Error saving outcome");
    } finally {
      setSavingOutcome(false);
    }
  };

  const handleLaunchWhatsApp = async () => {
    if (!waLead || !waLead.phone) return;
    setSendingWa(true);
    try {
      await fetch("/api/admin/growth/crm/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: waLead.id,
          type: "WHATSAPP_DRAFT",
          outcome: "DRAFT_OPENED",
          notes: waMessage.slice(0, 160),
        }),
      });
      const clean10 = waLead.phone.replace(/\D/g, "").slice(-10);
      const waUrl = `https://wa.me/91${clean10}?text=${encodeURIComponent(waMessage)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
      setWaLead(null);
      await fetchLeads();
    } catch {
      showNotice("err", "Could not log WhatsApp draft.");
    } finally {
      setSendingWa(false);
    }
  };

  const handleSaveConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertLead || savingConvert) return;
    setSavingConvert(true);
    try {
      const res = await fetch("/api/agent/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: convertLead.id,
          businessName: convName.trim(),
          phone: convPhone.trim(),
          category: convCategory.trim(),
          googleAddress: convAddress.trim(),
          packageTier: convPackage,
          googleReviewUrl: convGoogleUrl.trim(),
          logoUrl: convLogoUrl.trim(),
          utrNumber: convUtr.trim() || undefined,
          paymentAmount: Number(convAmount) || 2999,
          paymentNotes: convPayNotes.trim() || undefined,
          managerConfirmPayment:
            initialUser.role === "SUPER_ADMIN" && convManagerConfirm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Conversion save failed");

      setConvertResult({
        qrUrl: data.qrUrl,
        missingItems: data.missingItems || [],
        isActivated: Boolean(data.isActivated),
      });
      showNotice("ok", data.message || "Merchant setup saved!");
      await fetchLeads();
    } catch (err) {
      showNotice("err", err instanceof Error ? err.message : "Failed to save onboarding");
    } finally {
      setSavingConvert(false);
    }
  };

  const handleClaimFromPool = async (leadId: string) => {
    setClaimingId(leadId);
    try {
      const res = await fetch("/api/agent/pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: [leadId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Claim failed");
      showNotice("ok", data.message || "Added to your Today queue!");
      await Promise.all([fetchPool(), fetchLeads()]);
    } catch (err) {
      showNotice("err", err instanceof Error ? err.message : "Could not claim lead");
    } finally {
      setClaimingId(null);
    }
  };

  const handleReassignLead = async (leadId: string, assignedAgentId: string) => {
    try {
      const res = await fetch("/api/admin/growth/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, assignedAgentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reassign failed");
      showNotice("ok", "Lead assignment updated.");
      await fetchLeads();
    } catch (err) {
      showNotice("err", err instanceof Error ? err.message : "Could not reassign lead");
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressLogoFile(file);
      setConvLogoUrl(compressed);
      showNotice("ok", "Logo attached & optimized.");
    } catch {
      showNotice("err", "Could not process logo image. Please paste URL or pick PNG/JPG.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const visibleTodaySections = useMemo(() => {
    return {
      overdue: todayQueue.filter((l) => l.bucket === "OVERDUE"),
      today: todayQueue.filter((l) => l.bucket === "TODAY"),
      onboarding: todayQueue.filter((l) => l.bucket === "NEEDS_ONBOARDING"),
    };
  }, [todayQueue]);

  const renderLeadCard = (lead: AgentLead) => {
    const ob = lead.onboardingSummary;
    const isOverdue = lead.bucket === "OVERDUE";
    const missing = ob?.missingItems || [];

    return (
      <div
        key={lead.id}
        data-testid={`lead-card-${lead.id}`}
        className={`rounded-2xl border p-4 bg-white shadow-sm space-y-3 ${
          isOverdue
            ? "border-rose-300 ring-1 ring-rose-100"
            : lead.bucket === "NEEDS_ONBOARDING"
            ? "border-indigo-300 ring-1 ring-indigo-50"
            : "border-[#e3ded6]"
        }`}
      >
        {/* Top Row: Name + Bucket / Due Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-black text-[#172033] break-words">
                {lead.businessName}
              </h3>
              {isOverdue && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                  Overdue
                </span>
              )}
              {lead.status === "LOST" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                  Lost
                </span>
              )}
              {ob?.activatedAt && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live QR
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 flex-wrap">
              {(lead.locality || lead.city) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{[lead.locality, lead.city].filter(Boolean).join(", ")}</span>
                </span>
              )}
              {lead.phone && (
                <span className="font-mono text-[11px] text-slate-500">
                  +91 {lead.phone.slice(-10)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTimelineLead(lead)}
            className="shrink-0 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
            title="View dated activity timeline"
            aria-label="View timeline"
          >
            <History className="w-4 h-4" />
          </button>
        </div>

        {/* Next Action & Due Time OR Missing Onboarding Item */}
        <div className="rounded-xl bg-[#f7f6f2] border border-[#e3ded6]/80 px-3 py-2 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[#172033]">
            <Clock className={`w-3.5 h-3.5 shrink-0 ${isOverdue ? "text-rose-600" : "text-[#4338ca]"}`} />
            <span>
              {missing.length > 0
                ? missing[0]
                : ACTION_LABELS[lead.nextAction || "IN_PERSON_VISIT"] || "Follow-up"}
            </span>
          </div>
          <span className={`font-mono text-[11px] ${isOverdue ? "text-rose-700 font-bold" : "text-slate-600"}`}>
            {missing.length > 0
              ? ob?.paymentStatus === "APPROVED"
                ? "Payment Verified"
                : ob?.paymentStatus === "PENDING"
                ? "Payment Pending"
                : "Draft Saved"
              : formatDueBadge(lead.nextActionDue)}
          </span>
        </div>

        {/* Missing setup pills if converted / partial onboarding exists */}
        {missing.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {missing.map((item) => (
              <span
                key={item}
                className="px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
              >
                {item}
              </span>
            ))}
          </div>
        )}

        {/* Manager reassignment control on My Leads */}
        {initialUser.role === "SUPER_ADMIN" && teamAgents.length > 0 && (
          <div className="flex items-center justify-between gap-2 text-[11px] pt-1 border-t border-slate-100">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-[#4338ca]" />
              Owner: {lead.assignedAgentName || "Unassigned"}
            </span>
            <select
              value={lead.assignedAgentId || ""}
              onChange={(e) => handleReassignLead(lead.id, e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700"
            >
              <option value="">Unassigned</option>
              {teamAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.agentCode})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Mobile Action Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {lead.phone ? (
            <a
              href={`tel:+91${lead.phone.replace(/\D/g, "").slice(-10)}`}
              className="min-h-[40px] px-2.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>Call</span>
            </a>
          ) : (
            <span className="min-h-[40px] px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs font-semibold flex items-center justify-center">
              No Phone
            </span>
          )}

          {lead.phone ? (
            <button
              type="button"
              onClick={() => openWhatsAppSheet(lead)}
              className="min-h-[40px] px-2.5 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0 text-[#128C7E]" />
              <span>WhatsApp</span>
            </button>
          ) : (
            <span className="min-h-[40px] px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs font-semibold flex items-center justify-center">
              No WA
            </span>
          )}

          <button
            type="button"
            onClick={() => openOutcomeSheet(lead)}
            className="min-h-[40px] px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#172033] text-xs font-bold flex items-center justify-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#4338ca]" />
            <span>Outcome</span>
          </button>

          <button
            type="button"
            onClick={() => openConvertSheet(lead)}
            className="min-h-[40px] px-2.5 py-2 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white text-xs font-bold flex items-center justify-center gap-1"
          >
            <Store className="w-3.5 h-3.5 shrink-0" />
            <span>{ob ? "Resume Setup" : "Convert"}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#172033] pb-28 font-sans">
      {/* Top Staff Header */}
      <header className="sticky top-0 z-30 bg-[#f7f6f2]/95 backdrop-blur-md border-b border-[#e3ded6] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="shrink-0">
              <BrandLogo href="/agent" size="sm" theme="light" />
            </div>
            <div className="min-w-0 border-l border-[#e3ded6] pl-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded-md bg-indigo-100 text-[#4338ca] font-mono text-[10px] font-black">
                  {initialUser.agentCode}
                </span>
                <span className="text-xs font-black text-[#172033] truncate">
                  {initialUser.name}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">Field Sales Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {initialUser.role === "SUPER_ADMIN" && (
              <Link
                href="/admin/growth"
                className="px-2.5 py-1.5 rounded-xl bg-white border border-[#e3ded6] text-[11px] font-bold text-[#4338ca] hover:bg-indigo-50"
              >
                Manager View
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white border border-[#e3ded6] text-slate-600 hover:text-rose-700"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-1.5 mt-3 p-1 rounded-2xl bg-[#ece9e0] border border-[#e3ded6]">
          <button
            type="button"
            onClick={() => setTab("TODAY")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              tab === "TODAY" ? "bg-white text-[#172033] shadow-sm" : "text-slate-600"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#4338ca] shrink-0" />
            <span>Today ({todayQueue.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("MY_LEADS")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              tab === "MY_LEADS" ? "bg-white text-[#172033] shadow-sm" : "text-slate-600"
            }`}
          >
            <Search className="w-3.5 h-3.5 text-[#4338ca] shrink-0" />
            <span>{initialUser.role === "SUPER_ADMIN" ? "Team Leads" : "My Leads"}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("POOL")}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
              tab === "POOL" ? "bg-white text-[#172033] shadow-sm" : "text-slate-600"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Pool ({poolRemaining}/{poolLimit})</span>
          </button>
        </div>
      </header>

      {/* Main Feed */}
      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {toast && (
          <div
            className={`p-3 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
              toast.kind === "ok"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            {toast.kind === "ok" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{toast.text}</span>
          </div>
        )}

        {/* TAB 1: TODAY */}
        {tab === "TODAY" && (
          <div className="space-y-4">
            {/* Compact KPI Strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white border border-rose-200 rounded-2xl p-3 text-center">
                <p className="text-lg font-black text-rose-700">{counts.overdue}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Overdue</p>
              </div>
              <div className="bg-white border border-[#e3ded6] rounded-2xl p-3 text-center">
                <p className="text-lg font-black text-[#4338ca]">{counts.todayDue}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Due Today</p>
              </div>
              <div className="bg-white border border-amber-200 rounded-2xl p-3 text-center">
                <p className="text-lg font-black text-amber-700">{counts.needsOnboarding}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Setup Needed</p>
              </div>
            </div>

            {loading ? (
              <div className="bg-white border border-[#e3ded6] rounded-3xl p-10 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 text-[#4338ca] animate-spin" />
                <p className="text-xs text-slate-500">Loading your Today queue...</p>
              </div>
            ) : todayQueue.length === 0 ? (
              <div className="bg-white border border-[#e3ded6] rounded-3xl p-8 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h2 className="text-sm font-black text-[#172033]">No pending tasks right now!</h2>
                <p className="text-xs text-slate-500">
                  Tap <strong>Add a lead</strong> below after a shop visit or pick up to {poolLimit} prospects from the Growth Pool.
                </p>
                <button
                  type="button"
                  onClick={() => setTab("POOL")}
                  className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-[#4338ca] text-xs font-bold"
                >
                  Open Growth Pool
                </button>
              </div>
            ) : (
              <>
                {visibleTodaySections.overdue.length > 0 && (
                  <section className="space-y-2.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-rose-700 px-1">
                      Overdue Follow-ups ({visibleTodaySections.overdue.length})
                    </h2>
                    {visibleTodaySections.overdue.map(renderLeadCard)}
                  </section>
                )}

                {visibleTodaySections.today.length > 0 && (
                  <section className="space-y-2.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-[#4338ca] px-1">
                      Today&apos;s Follow-ups ({visibleTodaySections.today.length})
                    </h2>
                    {visibleTodaySections.today.map(renderLeadCard)}
                  </section>
                )}

                {visibleTodaySections.onboarding.length > 0 && (
                  <section className="space-y-2.5">
                    <h2 className="text-xs font-black uppercase tracking-wider text-amber-800 px-1">
                      Merchants Needing Setup Action ({visibleTodaySections.onboarding.length})
                    </h2>
                    {visibleTodaySections.onboarding.map(renderLeadCard)}
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: MY LEADS */}
        {tab === "MY_LEADS" && (
          <div className="space-y-3">
            <div className="bg-white border border-[#e3ded6] rounded-2xl p-3 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search business name, phone, or area..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#f7f6f2] border border-[#e3ded6] text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { k: "ALL", l: "All" },
                  { k: "NEW", l: "New" },
                  { k: "CONTACTED", l: "Contacted" },
                  { k: "DEMO_REQUESTED", l: "Onboarding" },
                  { k: "CONVERTED", l: "Converted" },
                  { k: "LOST", l: "Lost" },
                ].map((opt) => (
                  <button
                    key={opt.k}
                    type="button"
                    onClick={() => setStatusFilter(opt.k)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap border ${
                      statusFilter === opt.k
                        ? "bg-[#172033] text-white border-[#172033]"
                        : "bg-slate-50 text-slate-600 border-[#e3ded6]"
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>

              {initialUser.role === "SUPER_ADMIN" && teamAgents.length > 0 && (
                <select
                  value={agentFilter}
                  onChange={(e) => setAgentFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs font-bold text-[#172033]"
                >
                  <option value="ALL">All Agents (Manager View)</option>
                  <option value="UNASSIGNED">Unassigned Pool</option>
                  {teamAgents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.agentCode})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {loading ? (
              <div className="bg-white border border-[#e3ded6] rounded-3xl p-10 text-center">
                <Loader2 className="w-6 h-6 text-[#4338ca] animate-spin mx-auto" />
              </div>
            ) : myLeads.length === 0 ? (
              <div className="bg-white border border-[#e3ded6] rounded-3xl p-8 text-center text-xs text-slate-500">
                No matching leads found.
              </div>
            ) : (
              <div className="space-y-3">{myLeads.map(renderLeadCard)}</div>
            )}
          </div>
        )}

        {/* TAB 3: HYBRID AI GROWTH ENGINE POOL */}
        {tab === "POOL" && (
          <div className="space-y-3">
            <div className="bg-white border border-[#e3ded6] rounded-2xl p-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-[#172033]">AI Growth Engine Pool</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified local shops (&lt;100 Google reviews). Claim up to {poolLimit} leads per day.
                </p>
              </div>
              <span className="shrink-0 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[#4338ca] font-mono text-xs font-black">
                {poolRemaining} left
              </span>
            </div>

            {loadingPool ? (
              <div className="bg-white border border-[#e3ded6] rounded-3xl p-10 text-center">
                <Loader2 className="w-6 h-6 text-[#4338ca] animate-spin mx-auto" />
              </div>
            ) : pool.length === 0 ? (
              <div className="bg-white border border-[#e3ded6] rounded-3xl p-8 text-center text-xs text-slate-500">
                No unassigned prospects available in the Growth Pool right now. Ask your manager to run Discovery Radar or add your own field visits below!
              </div>
            ) : (
              <div className="space-y-2.5">
                {pool.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-[#e3ded6] rounded-2xl p-4 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-sm font-black text-[#172033] truncate">
                        {p.businessName}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">
                        {[p.locality, p.city, p.category].filter(Boolean).join(" • ")}
                      </p>
                      <div className="flex items-center gap-2 text-[11px]">
                        {p.reviewCount !== null && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                            {p.reviewCount} reviews
                          </span>
                        )}
                        {p.phone && <span className="font-mono text-slate-500">{p.phone}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={
                        claimingId === p.id ||
                        (initialUser.role === "MARKETING_AGENT" && poolRemaining <= 0)
                      }
                      onClick={() => handleClaimFromPool(p.id)}
                      className="shrink-0 px-3.5 py-2.5 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white text-xs font-bold disabled:opacity-40"
                    >
                      {claimingId === p.id ? "Adding..." : "Claim Lead"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Thumb-Reach Bottom CTA Bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#e3ded6] px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => {
              setDupState(null);
              setShowAddModal(true);
            }}
            className="w-full py-3.5 rounded-2xl bg-[#172033] hover:bg-black text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add a lead</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: ADD A LEAD (SHORT CAPTURE + DUPLICATE DETECTION) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-[#e3ded6] p-5 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[#172033]">Quick Field Lead Capture</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {dupState && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2.5 text-xs">
                <p className="font-black text-amber-900">Possible Duplicate Detected</p>
                <p className="text-amber-800">{dupState.message}</p>
                {dupState.existingLead && (
                  <p className="font-mono text-[11px] text-amber-900">
                    Existing: {dupState.existingLead.businessName} ({dupState.existingLead.locality || "Area"}) — {dupState.existingLead.status}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {dupState.existingLead && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setDupState(null);
                        setTab("MY_LEADS");
                        setSearch(dupState.existingLead?.businessName || "");
                      }}
                      className="px-3 py-2 rounded-xl bg-white border border-amber-300 font-bold text-[#172033]"
                    >
                      Open Existing Lead
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      handleSaveLead("FOLLOW_UP", {
                        allowSamePhoneBranch: true,
                        acknowledgeCrossAgentConflict: dupState.crossAgentConflict,
                      })
                    }
                    className="px-3 py-2 rounded-xl bg-amber-900 text-white font-bold"
                  >
                    {dupState.crossAgentConflict
                      ? "Save Separate Branch (Flag Manager)"
                      : "Save as Branch / Separate Business"}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={addBizName}
                  onChange={(e) => setAddBizName(e.target.value)}
                  placeholder="e.g. Sri Balaji Medicals"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ded6] bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ded6] bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Area / Locality *
                  </label>
                  <input
                    type="text"
                    value={addLocality}
                    onChange={(e) => setAddLocality(e.target.value)}
                    placeholder="e.g. Seven Roads Junction"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ded6] bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Next Action
                  </label>
                  <select
                    value={addNextAction}
                    onChange={(e) => setAddNextAction(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs font-bold"
                  >
                    <option value="CALL">Phone Call</option>
                    <option value="IN_PERSON_VISIT">Store Visit</option>
                    <option value="WHATSAPP_FOLLOWUP">WhatsApp Follow-up</option>
                    <option value="DELIVER_MOCKUP">Deliver Demo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Follow-up Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={addDueDate}
                    onChange={(e) => setAddDueDate(e.target.value)}
                    className="w-full px-2.5 py-2.5 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={addCity}
                    onChange={(e) => setAddCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Visit Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  placeholder="Spoke with owner, asked to come back Friday..."
                  className="w-full px-3 py-2 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                disabled={savingLead}
                onClick={() => handleSaveLead("FOLLOW_UP")}
                className="w-full py-3 rounded-xl bg-white border-2 border-[#172033] text-[#172033] font-black text-xs hover:bg-slate-50 disabled:opacity-50"
              >
                Save and schedule follow-up
              </button>
              <button
                type="button"
                disabled={savingLead}
                onClick={() => handleSaveLead("ONBOARD_NOW")}
                className="w-full py-3 rounded-xl bg-[#4338ca] text-white font-black text-xs hover:bg-[#3730a3] disabled:opacity-50"
              >
                Save and start onboarding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG OUTCOME / RESCHEDULE / MARK LOST */}
      {outcomeLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleSaveOutcome}
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-[#e3ded6] p-5 max-h-[92vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-[#172033]">Log Activity &amp; Next Step</h2>
                <p className="text-xs text-slate-500">{outcomeLead.businessName}</p>
              </div>
              <button
                type="button"
                onClick={() => setOutcomeLead(null)}
                className="p-2 rounded-xl bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Interaction Type
                </label>
                <select
                  value={actType}
                  onChange={(e) => setActType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs font-bold"
                >
                  <option value="IN_PERSON_VISIT">Shop Visit</option>
                  <option value="CALL">Phone Call</option>
                  <option value="DEMO_SHOWN">Standee Demo</option>
                  <option value="WHATSAPP_SENT">WhatsApp Message</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Outcome
                </label>
                <select
                  value={actOutcome}
                  disabled={closeAsLost}
                  onChange={(e) => setActOutcome(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs font-bold disabled:opacity-50"
                >
                  <option value="SPOKE_TO_OWNER">Spoke to Owner</option>
                  <option value="CALLBACK_REQUESTED">Callback Requested</option>
                  <option value="DEMO_SHOWN">Liked Live Demo</option>
                  <option value="VISITED_STORE">Visited Store</option>
                  <option value="NO_ANSWER">No Answer / Busy</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Brief Note
              </label>
              <textarea
                rows={2}
                value={actNotes}
                onChange={(e) => setActNotes(e.target.value)}
                placeholder="What happened? e.g. Owner requested demo on Friday morning..."
                className="w-full px-3 py-2 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2.5 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={closeAsLost}
                onChange={(e) => setCloseAsLost(e.target.checked)}
              />
              <span>Close this lead as Lost (requires reason)</span>
            </label>

            {closeAsLost ? (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Lost Reason *
                </label>
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-rose-300 bg-rose-50/50 text-xs font-bold"
                >
                  {LOST_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-[#f7f6f2] border border-[#e3ded6]">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Next Action
                  </label>
                  <select
                    value={actNextAction}
                    onChange={(e) => setActNextAction(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ded6] bg-white text-xs font-bold"
                  >
                    <option value="CALL">Phone Call</option>
                    <option value="IN_PERSON_VISIT">Store Visit</option>
                    <option value="WHATSAPP_FOLLOWUP">WhatsApp Follow-up</option>
                    <option value="DELIVER_MOCKUP">Deliver Demo / Standee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Next Due Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={actNextDue}
                    onChange={(e) => setActNextDue(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#e3ded6] bg-white text-xs"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={savingOutcome}
              className="w-full py-3 rounded-xl bg-[#4338ca] text-white font-black text-xs hover:bg-[#3730a3] disabled:opacity-50"
            >
              {savingOutcome ? "Saving..." : closeAsLost ? "Close Lead as Lost" : "Save Outcome & Schedule"}
            </button>
          </form>
        </div>
      )}

      {/* MODAL 3: WHATSAPP REVIEW & SEND */}
      {waLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-[#e3ded6] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-[#172033]">Review WhatsApp Message</h2>
                <p className="text-xs text-slate-500">To +91 {waLead.phone?.slice(-10)}</p>
              </div>
              <button
                type="button"
                onClick={() => setWaLead(null)}
                className="p-2 rounded-xl bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={6}
              value={waMessage}
              onChange={(e) => setWaMessage(e.target.value)}
              className="w-full p-3.5 rounded-2xl border border-[#e3ded6] bg-[#f7f6f2] text-xs leading-relaxed"
            />
            <button
              type="button"
              disabled={sendingWa}
              onClick={handleLaunchWhatsApp}
              className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1fb858] text-[#172033] font-black text-xs flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{sendingWa ? "Opening..." : "Open WhatsApp to Review & Send"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: TIMELINE HISTORY DRAWER */}
      {timelineLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-[#e3ded6] p-5 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-[#172033]">Activity Timeline</h2>
                <p className="text-xs text-slate-500">{timelineLead.businessName}</p>
              </div>
              <button
                type="button"
                onClick={() => setTimelineLead(null)}
                className="p-2 rounded-xl bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {timelineLead.lostReason && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                <strong>Lost Reason:</strong> {timelineLead.lostReason}
              </div>
            )}

            {timelineLead.activities.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No logged activities yet.</p>
            ) : (
              <div className="space-y-2.5">
                {timelineLead.activities.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-2xl bg-[#f7f6f2] border border-[#e3ded6] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-[#172033]">
                        {a.type.replace(/_/g, " ")}
                        {a.outcome ? ` • ${a.outcome.replace(/_/g, " ")}` : ""}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(a.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {a.notes && <p className="text-slate-700">{a.notes}</p>}
                    {a.performedBy && (
                      <p className="text-[10px] text-slate-500">By {a.performedBy}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 5: CONVERT TO MERCHANT (PREFILLED, PARTIAL SAVE & RETRY-SAFE) */}
      {convertLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <form
            onSubmit={handleSaveConversion}
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-[#e3ded6] p-5 max-h-[92vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-[#172033]">
                  Convert to Merchant &amp; Setup QR
                </h2>
                <p className="text-xs text-slate-500">
                  Save partial progress anytime — resume later with zero duplicates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConvertLead(null)}
                className="p-2 rounded-xl bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {convertResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
                  convertResult.isActivated
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black">
                    {convertResult.isActivated ? "Merchant Activated & Live" : "Setup In Progress"}
                  </span>
                  <Link
                    href={convertResult.qrUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1 font-bold text-[#4338ca] underline"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Open {convertResult.qrUrl}
                  </Link>
                </div>
                {convertResult.missingItems.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {convertResult.missingItems.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded-md bg-white border border-amber-300 font-bold text-[10.5px]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Package Selected *
                </label>
                <select
                  value={convPackage}
                  onChange={(e) => {
                    const id = e.target.value;
                    setConvPackage(id);
                    const pkg = PACKAGE_LIST.find((p) => p.id === id);
                    if (pkg) setConvAmount(String(pkg.price));
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs font-bold"
                >
                  {PACKAGE_LIST.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — ₹{pkg.price.toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Public Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={convName}
                    onChange={(e) => setConvName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Merchant WhatsApp / Phone
                  </label>
                  <input
                    type="tel"
                    value={convPhone}
                    onChange={(e) => setConvPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={convCategory}
                    onChange={(e) => setConvCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Address / Area
                  </label>
                  <input
                    type="text"
                    value={convAddress}
                    onChange={(e) => setConvAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Google Review Link / Maps URL (Leave blank if arriving later)
                </label>
                <input
                  type="url"
                  value={convGoogleUrl}
                  onChange={(e) => setConvGoogleUrl(e.target.value)}
                  placeholder="https://g.page/r/... or Google Maps link"
                  className="w-full px-3 py-2 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Business Logo (Upload image or paste URL — optional to save now)
                </label>
                <div className="flex items-center gap-2">
                  <label className="shrink-0 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-[#e3ded6] text-xs font-bold cursor-pointer inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoFileChange}
                    />
                  </label>
                  <input
                    type="text"
                    value={convLogoUrl}
                    onChange={(e) => setConvLogoUrl(e.target.value)}
                    placeholder="Or paste logo image URL"
                    className="flex-1 px-3 py-2 rounded-xl border border-[#e3ded6] bg-slate-50 text-xs"
                  />
                </div>
              </div>

              {/* Payment Record Box */}
              <div className="p-3.5 rounded-2xl bg-[#f7f6f2] border border-[#e3ded6] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-[#172033]">Payment Record (UPI: 9036909110@apl)</span>
                  <span className="text-[10.5px] font-bold text-slate-500">Damerla Mohan</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      min={2999}
                      value={convAmount}
                      onChange={(e) => setConvAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#e3ded6] bg-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-slate-600 mb-1">
                      UTR / Offline Ref (Optional now)
                    </label>
                    <input
                      type="text"
                      value={convUtr}
                      onChange={(e) => setConvUtr(e.target.value)}
                      placeholder="12-digit UTR or CASH-REF"
                      className="w-full px-3 py-2 rounded-xl border border-[#e3ded6] bg-white text-xs font-mono"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  value={convPayNotes}
                  onChange={(e) => setConvPayNotes(e.target.value)}
                  placeholder="Optional payment note (e.g. Paid via PhonePe at counter)"
                  className="w-full px-3 py-2 rounded-xl border border-[#e3ded6] bg-white text-xs"
                />
                {initialUser.role === "SUPER_ADMIN" && (
                  <label className="flex items-center gap-2 text-xs font-bold text-emerald-800 pt-1">
                    <input
                      type="checkbox"
                      checked={convManagerConfirm}
                      onChange={(e) => setConvManagerConfirm(e.target.checked)}
                    />
                    <span>Manager: Mark this payment as confirmed immediately</span>
                  </label>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={savingConvert}
              className="w-full py-3.5 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white font-black text-xs disabled:opacity-50"
            >
              {savingConvert
                ? "Saving Progress..."
                : convUtr.trim()
                ? "Save Setup & Submit Payment Reference"
                : "Save Partial Setup (Resume Later)"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
