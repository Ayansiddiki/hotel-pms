"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  AlertTriangle,
} from "lucide-react";
import { type ERegisterEntry } from "./ERegisterModal";

interface FinanceDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: ERegisterEntry[];
  darkMode?: boolean;
}

export function FinanceDashboardModal({
  isOpen,
  onClose,
  entries,
  darkMode = false,
}: FinanceDashboardModalProps) {
  // Authentication Passcode State
  const [passcode, setPasscode] = useState("");
  const [viewMode, setViewMode] = useState<"none" | "legal" | "master">("none");
  const [authError, setAuthError] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Unregistered / Black Money Direct Cash Vault State
  const [directCashEntries, setDirectCashEntries] = useState<
    { id: string; desc: string; amount: number; time: string }[]
  >([
    { id: "DC-01", desc: "Unregistered Walk-in Cash", amount: 3500, time: "Today, 01:00 PM" },
    { id: "DC-02", desc: "Relative Stay Direct Settlement", amount: 2000, time: "Yesterday, 09:30 PM" },
  ]);
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");

  // Load custom passwords from global settings storage if available
  const handleAuthenticate = () => {
    let savedAuditor = "AUDIT2026";
    let savedMaster = "MASTER999";
    if (typeof window !== "undefined") {
      const globalCfg = localStorage.getItem("hotel_pms_global_settings");
      if (globalCfg) {
        try {
          const parsed = JSON.parse(globalCfg);
          if (parsed.auditorPass) savedAuditor = parsed.auditorPass;
          if (parsed.masterPass) savedMaster = parsed.masterPass;
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (passcode === savedAuditor) {
      setViewMode("legal");
      setAuthError(false);
    } else if (passcode === savedMaster) {
      setViewMode("master");
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleAddDirectCash = () => {
    if (!newDesc || !newAmount) return;
    const newItem = {
      id: `DC-${Date.now().toString().slice(-4)}`,
      desc: newDesc,
      amount: Number(newAmount) || 0,
      time: new Date().toLocaleString(),
    };
    setDirectCashEntries([newItem, ...directCashEntries]);
    setNewDesc("");
    setNewAmount("");
  };

  // Calculations
  const officialRevenue = useMemo(() => {
    return entries.reduce((sum, e) => sum + (e.advancePayment || 1500), 0);
  }, [entries]);

  const totalDirectCash = useMemo(() => {
    return directCashEntries.reduce((sum, item) => sum + item.amount, 0);
  }, [directCashEntries]);

  const grandUnifiedTotal = officialRevenue + totalDirectCash;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`w-[98vw] max-w-[1450px] h-[94vh] rounded-3xl border p-6 sm:p-8 shadow-2xl flex flex-col transition-colors overflow-hidden ${
          darkMode ? "bg-[#25221e] border-[#403d38] text-[#e5e2db]" : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <style jsx global>{`
          input[type="password"]::-ms-reveal,
          input[type="password"]::-ms-clear {
            display: none;
          }
        `}</style>

        <DialogHeader className="sr-only">
          <DialogTitle>Secure Finance & Dual-Ledger Vault</DialogTitle>
        </DialogHeader>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#afd9c3]/40 gap-3 select-none shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border shadow-xs ${darkMode ? "bg-[#403d38] border-[#afd9c3]/40 text-[#d6fce2]" : "bg-[#d6fce2] border-[#afd9c3] text-[#2b6a48]"}`}>
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-2xl tracking-tight">Finance, Revenue & Dual-Ledger Vault</h3>
              <p className="text-xs opacity-65">Secure financial accounts management with protected access levels.</p>
            </div>
          </div>
          <Button onClick={onClose} variant="outline" className="h-9 px-5 text-xs font-bold rounded-2xl border-[#afd9c3]">
            Close Vault
          </Button>
        </div>

        {/* AUTHENTICATION GATE */}
        {viewMode === "none" ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className={`max-w-md w-full p-8 rounded-3xl border shadow-xl space-y-6 text-center ${darkMode ? "bg-[#1f1d1a] border-[#403d38]" : "bg-white border-[#afd9c3]"}`}>
              <div className="w-14 h-14 rounded-2xl bg-[#2b6a48] text-white flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-xl">Restricted Financial Gateway</h4>
                <p className="text-xs opacity-65">Enter Passcode to view Official Legal records or Master Net Profit ledger.</p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    autoComplete="off"
                    placeholder="Enter Passcode..."
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAuthenticate()}
                    className="h-11 px-4 pr-10 text-sm font-mono font-bold rounded-2xl border-[#afd9c3] text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 focus:outline-none"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {authError && (
                  <div className="text-xs font-bold text-red-600 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Invalid Passcode Entered!
                  </div>
                )}

                <Button
                  onClick={handleAuthenticate}
                  className="w-full h-11 bg-[#2b6a48] hover:bg-[#2b6a48]/90 text-white font-black text-xs rounded-2xl shadow-md"
                >
                  Unlock Vault
                </Button>
              </div>
              <div className="text-[11px] opacity-50 border-t border-[#afd9c3]/30 pt-3">
                💡 Passcodes can be updated anytime inside the <strong>Hotel Settings</strong> module.
              </div>
            </div>
          </div>
        ) : (
          /* UNLOCKED DASHBOARD CONTENT */
          <div className="flex-1 overflow-y-auto space-y-6 pt-4 pr-1 [scrollbar-width:none]">
            
            {/* VIEW MODE STATUS BANNER */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${viewMode === "legal" ? "bg-blue-500/15 border-blue-400 text-blue-700 dark:text-blue-300" : "bg-purple-500/15 border-purple-400 text-purple-700 dark:text-purple-300"}`}>
              <div className="flex items-center gap-2">
                {viewMode === "legal" ? <ShieldCheck className="w-5 h-5 text-blue-600" /> : <KeyRound className="w-5 h-5 text-purple-600" />}
                <span>
                  {viewMode === "legal" ? "🛡️ Inspector Mode Active: Showing 100% Tax-Compliant Official Records Only." : "👑 Master Net Profit Mode Active: Showing Official + Private Black Money Direct Cash Ledger."}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setViewMode("none");
                  setPasscode("");
                }}
                className="h-7 px-3 text-[11px] font-bold rounded-xl border-current"
              >
                Lock Vault
              </Button>
            </div>

            {/* KPI METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-[#afd9c3]/60 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">Official Registered Collection</span>
                <div className="text-2xl font-black font-mono text-emerald-600">₹{officialRevenue.toLocaleString()}</div>
                <div className="text-[11px] opacity-70">Tax audit ready (E-Register Linked)</div>
              </div>

              {viewMode === "master" && (
                <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-purple-400/60 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Private Black Money Inflow</span>
                    <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-950/50 text-[10px]">Owner View</Badge>
                  </div>
                  <div className="text-2xl font-black font-mono text-purple-600">₹{totalDirectCash.toLocaleString()}</div>
                  <div className="text-[11px] opacity-70">Direct cash without tax logging</div>
                </div>
              )}

              <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-[#afd9c3]/60 shadow-xs space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                  {viewMode === "master" ? "Grand Net Profit Total Cash Flow" : "Declared Revenue Summary"}
                </span>
                <div className="text-2xl font-black font-mono text-blue-600">
                  ₹{(viewMode === "master" ? grandUnifiedTotal : officialRevenue).toLocaleString()}
                </div>
                <div className="text-[11px] opacity-70">Total earnings snapshot</div>
              </div>
            </div>

            {/* MASTER ONLY: UNREGISTERED / DIRECT CASH MANAGER */}
            {viewMode === "master" && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-purple-400/50 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-black text-base uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      <Lock className="w-5 h-5" /> Unregistered Direct Cash Ledger (Black Money / Relative Stays)
                    </h4>
                    <p className="text-xs opacity-65">Log cash transactions that remain confidential and bypass official tax registers.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Transaction Note..."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="h-8 w-48 text-xs rounded-xl border-purple-300"
                    />
                    <Input
                      type="number"
                      placeholder="Amount (₹)"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="h-8 w-28 text-xs font-mono font-bold rounded-xl border-purple-300"
                    />
                    <Button onClick={handleAddDirectCash} size="sm" className="h-8 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl">
                      Log Cash
                    </Button>
                  </div>
                </div>

                <div className="border border-purple-300/40 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-purple-50 dark:bg-purple-950/30 border-b border-purple-200 dark:border-purple-900 font-bold uppercase text-[10px]">
                        <th className="p-3">Ref ID</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3 text-right">Cash Received</th>
                      </tr>
                    </thead>
                    <tbody>
                      {directCashEntries.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-6 text-center opacity-40 font-semibold">No direct cash records found.</td>
                        </tr>
                      ) : (
                        directCashEntries.map((dc) => (
                          <tr key={dc.id} className="border-b border-purple-100 dark:border-purple-900/40 last:border-0">
                            <td className="p-3 font-mono font-bold">{dc.id}</td>
                            <td className="p-3 font-semibold">{dc.desc}</td>
                            <td className="p-3 opacity-70 font-mono">{dc.time}</td>
                            <td className="p-3 text-right font-mono font-black text-purple-600 text-sm">₹{dc.amount.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* OFFICIAL REGISTERED RECORDS TABLE */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-[#afd9c3]/60 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-base uppercase tracking-wider text-[#2b6a48] dark:text-[#afd9c3]">
                    Official Registered Inflows (Audit Trail)
                  </h4>
                  <p className="text-xs opacity-65">Verified check-in advance payments recorded in E-Register.</p>
                </div>
                <Badge className="bg-[#d6fce2] text-[#2b6a48] font-bold text-xs">Tax Compliant</Badge>
              </div>

              <div className="border border-[#afd9c3]/40 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#e8e5de] dark:bg-[#1a1815] border-b border-[#afd9c3]/40 font-bold uppercase text-[10px]">
                      <th className="p-3">Reg ID</th>
                      <th className="p-3">Room No</th>
                      <th className="p-3">Guest Full Name</th>
                      <th className="p-3">Check-In Timestamp</th>
                      <th className="p-3 text-right">Advance Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center opacity-40 font-semibold">No official check-ins logged yet.</td>
                      </tr>
                    ) : (
                      entries.map((e, idx) => (
                        <tr key={idx} className="border-b border-[#afd9c3]/20 last:border-0">
                          <td className="p-3 font-mono font-bold">{e.id}</td>
                          <td className="p-3 font-mono font-extrabold text-[#2b6a48]">Room {e.roomNo}</td>
                          <td className="p-3 font-bold">{e.fullName}</td>
                          <td className="p-3 font-mono opacity-70">{e.checkInDateTime}</td>
                          <td className="p-3 text-right font-mono font-black text-emerald-600 text-sm">₹{e.advancePayment || 1500}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}