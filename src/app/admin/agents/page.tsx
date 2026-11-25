"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Power,
  RefreshCw,
  ArrowLeft,
  Compass,
  Phone,
} from "lucide-react";

interface AgentRecord {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  agentCode: string | null;
  userIdTag: string | null;
  commissionRate: number | null;
  isActive: boolean;
  createdAt: string;
  activeLeads: number;
  overdueLeads: number;
  confirmedSalesCount: number;
  confirmedSalesValue: number;
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Create form
  const [name, setName] = useState("");
  const [agentCode, setAgentCode] = useState("MKT-02");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // PIN Reset modal state
  const [resetTarget, setResetTarget] = useState<AgentRecord | null>(null);
  const [newPin, setNewPin] = useState("");
  const [savingPin, setSavingPin] = useState(false);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/agents");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load agents");
      setAgents(data.agents || []);

      // Suggest next MKT-XX code
      const count = (data.agents || []).length + 1;
      setAgentCode(`MKT-${String(count).padStart(2, "0")}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load field agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, agentCode, phone, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create agent");
      setNotice(`Added field agent ${data.agent.name} (${data.agent.agentCode}).`);
      setName("");
      setPhone("");
      setPin("");
      await loadAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add agent");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (agent: AgentRecord) => {
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: agent.id, isActive: !agent.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setNotice(`${agent.name} is now ${!agent.isActive ? "Active" : "Suspended"}.`);
      await loadAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update agent");
    }
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setSavingPin(true);
    setError("");
    try {
      const res = await fetch("/api/admin/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resetTarget.id, newPin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset PIN");
      setNotice(`4-digit PIN updated for ${resetTarget.name} (${resetTarget.agentCode}).`);
      setResetTarget(null);
      setNewPin("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset PIN");
    } finally {
      setSavingPin(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#172033] pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Header */}
        <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4338ca]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#172033]">
                Field Marketing Agents
              </h1>
              <p className="text-xs text-stone-500">
                Manage field reps signing in with Agent Code + 4-digit PIN at /login → /agent.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/growth"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Manager Growth Dashboard</span>
            </Link>
            <Link
              href="/agent"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 text-stone-800 border border-stone-200 text-xs font-bold hover:bg-stone-200 transition"
            >
              <span>Preview Agent Portal</span>
            </Link>
            <button
              onClick={loadAgents}
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900"
              title="Refresh agents"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {notice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create New Agent Card */}
          <form
            onSubmit={handleCreateAgent}
            className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4 h-fit"
          >
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#4338ca]" />
              <h2 className="text-sm font-black text-[#172033]">Add Field Agent</h2>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Agent Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Subrahmanyam"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-medium text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Agent Code *
                </label>
                <input
                  type="text"
                  required
                  value={agentCode}
                  onChange={(e) => setAgentCode(e.target.value.toUpperCase())}
                  placeholder="MKT-02"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-mono font-bold text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  4-Digit PIN *
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="1234"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-mono text-center tracking-widest text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-medium text-[#172033] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4338ca]/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-[#4338ca] hover:bg-[#3730a3] text-white text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>Create Field Agent</span>
            </button>
          </form>

          {/* Agents Roster */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 text-[#4338ca] animate-spin" />
                <p className="text-xs text-stone-500">Loading field team...</p>
              </div>
            ) : agents.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center text-xs text-stone-500">
                No field marketing agents configured yet.
              </div>
            ) : (
              agents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-[#4338ca] font-mono text-xs font-black">
                        {agent.agentCode || agent.userIdTag}
                      </span>
                      <h3 className="text-sm font-black text-[#172033]">
                        {agent.name || "Unnamed Agent"}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          agent.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {agent.isActive ? "Active" : "Suspended"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-stone-500 flex-wrap">
                      {agent.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {agent.phone}
                        </span>
                      )}
                      <span>Active Leads: <strong className="text-[#172033]">{agent.activeLeads}</strong></span>
                      <span>Overdue: <strong className={agent.overdueLeads > 0 ? "text-rose-600" : "text-[#172033]"}>{agent.overdueLeads}</strong></span>
                      <span>
                        Confirmed Sales:{" "}
                        <strong className="text-emerald-700">
                          {agent.confirmedSalesCount} (₹{agent.confirmedSalesValue.toLocaleString("en-IN")})
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setResetTarget(agent);
                        setNewPin("");
                      }}
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold inline-flex items-center gap-1.5 transition"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Reset PIN</span>
                    </button>
                    <button
                      onClick={() => handleToggleActive(agent)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition ${
                        agent.isActive
                          ? "bg-white border-rose-200 text-rose-700 hover:bg-rose-50"
                          : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{agent.isActive ? "Suspend" : "Activate"}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom back link */}
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#172033]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Platform Overview
          </Link>
        </div>
      </div>

      {/* Reset PIN Modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleResetPin}
            className="w-full max-w-sm bg-white border border-stone-200 rounded-3xl p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#4338ca]" />
              <h3 className="text-sm font-black text-[#172033]">
                Reset PIN — {resetTarget.name} ({resetTarget.agentCode})
              </h3>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">
                New 4-Digit PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50 text-center font-mono text-base tracking-[0.4em]"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingPin || newPin.length !== 4}
                className="px-4 py-2 rounded-xl bg-[#4338ca] text-white text-xs font-bold disabled:opacity-50"
              >
                {savingPin ? "Saving..." : "Save PIN"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
