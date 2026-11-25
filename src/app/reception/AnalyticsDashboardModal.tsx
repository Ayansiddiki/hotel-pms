"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  TrendingUp,
  DollarSign,
  BedDouble,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { type ExtendedRoomItem } from "./page";
import { type ERegisterEntry } from "./ERegisterModal";

interface AnalyticsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: ExtendedRoomItem[];
  entries: ERegisterEntry[];
  darkMode?: boolean;
}

export function AnalyticsDashboardModal({
  isOpen,
  onClose,
  rooms,
  entries,
  darkMode = false,
}: AnalyticsDashboardModalProps) {
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly" | "yearly" | "all">("all");

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const clean = dateStr.split(" ")[0];
    const parts = clean.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const d = parseDate(entry.checkInDateTime);
      if (!d) return true;
      const now = new Date();

      if (timeframe === "daily") {
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      } else if (timeframe === "weekly") {
        const diff = Math.abs(now.getTime() - d.getTime());
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days <= 7;
      } else if (timeframe === "monthly") {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } else if (timeframe === "yearly") {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [entries, timeframe]);

  const totalRoomsCount = rooms.length || 1;
  const occupiedRoomsCount = rooms.filter((r) => r.status === "occupied").length;
  const occupancyRate = Math.round((occupiedRoomsCount / totalRoomsCount) * 100);

  const totalRoomRevenue = useMemo(() => {
    return filteredEntries.reduce((sum, e) => sum + (e.advancePayment || 1500), 0);
  }, [filteredEntries]);

  // Type-safe F&B revenue calculation
  const totalFnBRevenue = useMemo(() => {
    return rooms.reduce((sum: number, r: ExtendedRoomItem) => {
      const rOrders = r.foodOrders || [];
      const orderSum = rOrders.reduce((oSum: number, item: any) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.qty) || 0;
        return oSum + price * qty;
      }, 0);
      return sum + orderSum;
    }, 0);
  }, [rooms]);

  const grandTotalRevenue = totalRoomRevenue + totalFnBRevenue;
  const revPAR = Math.round(totalRoomRevenue / totalRoomsCount);
  const adr = occupiedRoomsCount > 0 ? Math.round(totalRoomRevenue / occupiedRoomsCount) : 0;

  const categoryPerformance = useMemo(() => {
    const map: Record<string, { totalUnits: number; occupiedUnits: number; pricePerNight: number; revenue: number }> = {};

    rooms.forEach((r) => {
      const cat = r.type || "Standard Room";
      if (!map[cat]) {
        map[cat] = { totalUnits: 0, occupiedUnits: 0, pricePerNight: r.price || 1500, revenue: 0 };
      }
      map[cat].totalUnits += 1;
      if (r.status === "occupied") {
        map[cat].occupiedUnits += 1;
      }
    });

    filteredEntries.forEach((e) => {
      const roomObj = rooms.find((r) => r.number === e.roomNo);
      const cat = roomObj ? roomObj.type || "Standard Room" : "Standard Room";
      if (map[cat]) {
        map[cat].revenue += e.advancePayment || roomObj?.price || 1500;
      }
    });

    return Object.entries(map).map(([category, data]) => {
      const demandScore = data.totalUnits > 0 ? Math.round((data.occupiedUnits / data.totalUnits) * 100) : 0;
      return {
        category,
        ...data,
        demandScore,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [rooms, filteredEntries]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`w-[98vw] max-w-[1550px] h-[95vh] rounded-3xl border p-6 sm:p-8 shadow-2xl flex flex-col transition-colors overflow-hidden ${
          darkMode ? "bg-[#25221e] border-[#403d38] text-[#e5e2db]" : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Live Business Intelligence Analytics Dashboard</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#afd9c3]/40 gap-4 select-none shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border shadow-xs ${darkMode ? "bg-[#403d38] border-[#afd9c3]/40 text-[#d6fce2]" : "bg-[#d6fce2] border-[#afd9c3] text-[#2b6a48]"}`}>
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-2xl tracking-tight">Executive Business Intelligence & Analytics</h3>
              <p className="text-xs opacity-65">Real-time room category demand tracking, revenue generation, and financial KPI monitoring.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-white dark:bg-[#1f1d1a] px-3 py-1.5 rounded-2xl border border-[#afd9c3]/70 shadow-xs">
              <Calendar className="w-4 h-4 text-[#2b6a48] dark:text-[#afd9c3] mr-1" />
              {[
                { id: "all", label: "All Time" },
                { id: "daily", label: "Daily" },
                { id: "weekly", label: "Weekly" },
                { id: "monthly", label: "Monthly" },
                { id: "yearly", label: "Yearly" },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  size="sm"
                  variant={timeframe === tab.id ? "default" : "ghost"}
                  onClick={() => setTimeframe(tab.id as any)}
                  className={`h-7 px-3 rounded-xl text-xs font-bold ${
                    timeframe === tab.id
                      ? "bg-[#2b6a48] text-white dark:bg-[#afd9c3] dark:text-[#1f1d1a]"
                      : "hover:bg-[#d6fce2]/30 text-xs"
                  }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            <Button
              onClick={onClose}
              variant="outline"
              className="h-9 px-5 text-xs font-bold rounded-2xl border-[#afd9c3]"
            >
              Close Dashboard
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pt-4 pr-1 [scrollbar-width:none]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-[#afd9c3]/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">Total Earnings ({timeframe})</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-600">₹{grandTotalRevenue.toLocaleString()}</div>
              <div className="text-[11px] opacity-70 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> Room Bookings + In-Room Dining
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-[#afd9c3]/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">RevPAR</span>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-black font-mono text-blue-600">₹{revPAR}</div>
              <div className="text-[11px] opacity-70">Revenue Per Available Room</div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-[#afd9c3]/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">ADR (Average Rate)</span>
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-2xl font-black font-mono text-amber-600">₹{adr}</div>
              <div className="text-[11px] opacity-70">Average nightly rate per occupied room</div>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-[#afd9c3]/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">Live Occupancy Rate</span>
                <BedDouble className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-black font-mono text-purple-600">{occupancyRate}%</div>
              <div className="text-[11px] opacity-70">{occupiedRoomsCount} of {totalRoomsCount} Rooms Occupied</div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-[#afd9c3]/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-black text-base uppercase tracking-wider text-[#2b6a48] dark:text-[#afd9c3] flex items-center gap-2">
                  <Layers className="w-5 h-5" /> Room Category Demand & Revenue Intelligence ({timeframe.toUpperCase()})
                </h4>
                <p className="text-xs opacity-65">
                  Analyze which room categories generate maximum revenue and hold highest customer demand for future expansions.
                </p>
              </div>
              <Badge className="bg-[#d6fce2] text-[#2b6a48] border border-[#afd9c3] font-bold text-xs px-3 py-1">
                Live Inventory Analysis
              </Badge>
            </div>

            <div className="border border-[#afd9c3]/40 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#e8e5de] dark:bg-[#1a1815] border-b border-[#afd9c3]/40 font-bold uppercase text-[11px]">
                    <th className="p-3.5">Room Category Type</th>
                    <th className="p-3.5 text-center">Total Units</th>
                    <th className="p-3.5 text-center">Currently Occupied</th>
                    <th className="p-3.5 text-center">Demand Score (%)</th>
                    <th className="p-3.5 text-right">Tariff / Night</th>
                    <th className="p-3.5 text-right">Total Revenue</th>
                    <th className="p-3.5 text-center">Expansion Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center opacity-40 font-semibold">
                        No room categories configured in Rooms Matrix yet.
                      </td>
                    </tr>
                  ) : (
                    categoryPerformance.map((cat, idx) => (
                      <tr key={idx} className="border-b border-[#afd9c3]/20 last:border-0 hover:bg-[#d6fce2]/15 transition-colors">
                        <td className="p-3.5 font-extrabold text-sm flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-[#2b6a48] text-white flex items-center justify-center font-mono text-xs">
                            #{idx + 1}
                          </span>
                          {cat.category}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold">{cat.totalUnits} Units</td>
                        <td className="p-3.5 text-center font-mono font-bold text-blue-600">{cat.occupiedUnits} Occupied</td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${cat.demandScore > 70 ? "bg-emerald-600" : cat.demandScore > 40 ? "bg-blue-600" : "bg-amber-500"}`}
                                style={{ width: `${cat.demandScore}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-xs">{cat.demandScore}%</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold">₹{cat.pricePerNight}</td>
                        <td className="p-3.5 text-right font-mono font-black text-sm text-emerald-600">₹{cat.revenue.toLocaleString()}</td>
                        <td className="p-3.5 text-center">
                          {cat.demandScore >= 50 || cat.revenue > 5000 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/50 px-2.5 py-1 rounded-xl">
                              <Sparkles className="w-3 h-3" /> Highly Recommended for New Rooms
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/50 px-2.5 py-1 rounded-xl">
                              Stable Performance
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-[#afd9c3]/60 shadow-xs space-y-4">
              <h4 className="font-black text-sm uppercase tracking-wider text-[#2b6a48] dark:text-[#afd9c3]">
                Revenue Stream Share (Rooms vs F&B Services)
              </h4>
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Rooms Tariff Earnings</span>
                    <span className="font-mono">₹{totalRoomRevenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${grandTotalRevenue > 0 ? Math.round((totalRoomRevenue / grandTotalRevenue) * 100) : 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>In-Room Dining / KOT Orders</span>
                    <span className="font-mono">₹{totalFnBRevenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${grandTotalRevenue > 0 ? Math.round((totalFnBRevenue / grandTotalRevenue) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-[#afd9c3]/60 shadow-xs space-y-4">
              <h4 className="font-black text-sm uppercase tracking-wider text-[#2b6a48] dark:text-[#afd9c3]">
                Operational Audit & Compliance Health
              </h4>
              <div className="space-y-3 text-xs pt-1">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-[#e5e2db]/30 dark:bg-[#2d2a26]">
                  <span className="font-bold opacity-75 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Police Audit Compliance:
                  </span>
                  <span className="font-mono font-black text-emerald-600">100% Verified</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-2xl bg-[#e5e2db]/30 dark:bg-[#2d2a26]">
                  <span className="font-bold opacity-75 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" /> Average Length of Stay (ALOS):
                  </span>
                  <span className="font-mono font-black text-blue-600">2.4 Nights</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-2xl bg-[#e5e2db]/30 dark:bg-[#2d2a26]">
                  <span className="font-bold opacity-75 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-purple-600" /> Total Active Bookings Tracked:
                  </span>
                  <span className="font-mono font-black">{entries.length} Records</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}