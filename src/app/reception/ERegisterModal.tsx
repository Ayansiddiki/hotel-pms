"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Search,
  Printer,
  Calendar,
  User,
  ArrowRight,
  Clock,
  ShieldCheck,
  Eye,
  Camera,
  Download,
  RotateCcw,
  XCircle,
  Edit3,
  Save,
} from "lucide-react";
import { type VisitorLogItem } from "./VisitorsSecurityModal";

export interface ERegisterEntry {
  id: string;
  roomNo: string;
  fullName: string;
  mobile: string;
  address?: string;
  city: string;
  stateName?: string;
  email?: string;
  idType: string;
  idNumber: string;
  idDocFileName?: string;
  companyName?: string;
  guestGstin?: string;
  checkInDateTime: string;
  checkOutDateTime?: string;
  adults: number;
  kids: number;
  advancePayment: number;
  arrivalMode: string;
  purposeOfVisit: string;
  bookedVia: string;
  visitorsCount?: number;
  visitorNames?: string;
}

interface ERegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: ERegisterEntry[];
  darkMode?: boolean;
}

export function ERegisterModal({
  isOpen,
  onClose,
  entries,
  darkMode = false,
}: ERegisterModalProps) {
  const [registerList, setRegisterList] = useState<ERegisterEntry[]>(entries);

  useEffect(() => {
    setRegisterList(entries);
  }, [entries]);

  const [searchTerm, setSearchTerm] = useState("");
  const [timePreset, setTimePreset] = useState<"all" | "today" | "week" | "month" | "year">("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Inline Editing States
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editGstin, setEditGstin] = useState("");

  // Visitor Police Audit Popup States
  const [inspectingRoom, setInspectingRoom] = useState<string | null>(null);
  const [inspectingGuestName, setInspectingGuestName] = useState("");

  const allStoredVisitors: VisitorLogItem[] = useMemo(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hotel_pms_visitors_log");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  }, [inspectingRoom]);

  const roomVisitors = useMemo(() => {
    if (!inspectingRoom) return [];
    return allStoredVisitors.filter((v) => v.roomNo === inspectingRoom && v.status === "approved");
  }, [inspectingRoom, allStoredVisitors]);

  const parseEntryDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const cleanDatePart = dateStr.split(" ")[0];
    const parts = cleanDatePart.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day, 0, 0, 0);
      }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const filteredEntries = useMemo(() => {
    return registerList.filter((entry) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        entry.fullName.toLowerCase().includes(term) ||
        entry.roomNo.toLowerCase().includes(term) ||
        entry.mobile.toLowerCase().includes(term) ||
        entry.id.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      const entryDate = parseEntryDate(entry.checkInDateTime);
      if (!entryDate) return true;

      if (fromDate) {
        const [fYear, fMonth, fDay] = fromDate.split("-").map(Number);
        const startRange = new Date(fYear, fMonth - 1, fDay, 0, 0, 0);
        if (entryDate < startRange) return false;
      }
      if (toDate) {
        const [tYear, tMonth, tDay] = toDate.split("-").map(Number);
        const endRange = new Date(tYear, tMonth - 1, tDay, 23, 59, 59);
        if (entryDate > endRange) return false;
      }

      if (selectedMonth !== "all") {
        if (entryDate.getMonth() !== parseInt(selectedMonth, 10)) {
          return false;
        }
      }

      if (selectedYear !== "all") {
        if (entryDate.getFullYear() !== parseInt(selectedYear, 10)) {
          return false;
        }
      }

      const now = new Date();
      if (timePreset === "today") {
        return (
          entryDate.getDate() === now.getDate() &&
          entryDate.getMonth() === now.getMonth() &&
          entryDate.getFullYear() === now.getFullYear()
        );
      } else if (timePreset === "week") {
        const diffTime = Math.abs(now.getTime() - entryDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      } else if (timePreset === "month") {
        return (
          entryDate.getMonth() === now.getMonth() &&
          entryDate.getFullYear() === now.getFullYear()
        );
      } else if (timePreset === "year") {
        return entryDate.getFullYear() === now.getFullYear();
      }

      return true;
    });
  }, [registerList, searchTerm, timePreset, selectedMonth, selectedYear, fromDate, toDate]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setTimePreset("all");
    setSelectedMonth("all");
    setSelectedYear("all");
    setFromDate("");
    setToDate("");
  };

  const handleStartEdit = (entry: ERegisterEntry) => {
    setEditingEntryId(entry.id);
    setEditName(entry.fullName);
    setEditMobile(entry.mobile);
    setEditCompany(entry.companyName || "");
    setEditGstin(entry.guestGstin || "");
  };

  const handleSaveEdit = (entryId: string) => {
    const updatedList = registerList.map((item) => {
      if (item.id === entryId) {
        return {
          ...item,
          fullName: editName.trim(),
          mobile: editMobile.trim(),
          companyName: editCompany.trim(),
          guestGstin: editGstin.trim(),
        };
      }
      return item;
    });

    setRegisterList(updatedList);
    setEditingEntryId(null);

    if (typeof window !== "undefined") {
      localStorage.setItem("hotel_pms_eregister", JSON.stringify(updatedList));
    }
    alert("✓ Guest details updated successfully in E-Register!");
  };

  const handleVoidStay = (entry: ERegisterEntry) => {
    if (
      confirm(
        `⚠️ Confirm Instant Zero-Stay Void for ${entry.fullName} (Room ${entry.roomNo})?\n\n- Room will be set back to AVAILABLE.\n- Booking status will be marked as CANCELLED (ZERO-STAY).\n- Advance payment (₹${entry.advancePayment}) will be marked refunded.`
      )
    ) {
      const updatedList = registerList.map((item) => {
        if (item.id === entry.id) {
          return {
            ...item,
            checkOutDateTime: "Cancelled (Zero-Stay Void)",
            advancePayment: 0,
            purposeOfVisit: `${item.purposeOfVisit || ""} [Cancelled: Zero-Stay Immediate Departure]`,
          };
        }
        return item;
      });
      setRegisterList(updatedList);

      if (typeof window !== "undefined") {
        localStorage.setItem("hotel_pms_eregister", JSON.stringify(updatedList));

        const savedRooms = localStorage.getItem("hotel_pms_rooms");
        if (savedRooms) {
          try {
            const rList = JSON.parse(savedRooms);
            const updatedRooms = rList.map((r: any) =>
              r.number === entry.roomNo
                ? {
                    ...r,
                    status: "available",
                    guest: undefined,
                    foodOrders: [],
                    currentPasscode: undefined,
                  }
                : r
            );
            localStorage.setItem("hotel_pms_rooms", JSON.stringify(updatedRooms));
          } catch (err) {
            console.error(err);
          }
        }

        const savedCal = localStorage.getItem("hotel_pms_bookings");
        if (savedCal) {
          try {
            const bList = JSON.parse(savedCal);
            const updatedCal = bList.filter(
              (b: any) => !(b.roomNumber === entry.roomNo && b.status === "occupied")
            );
            localStorage.setItem("hotel_pms_bookings", JSON.stringify(updatedCal));
          } catch (err) {
            console.error(err);
          }
        }
      }

      alert(`✓ Room ${entry.roomNo} booking voided successfully. Room is now AVAILABLE.`);
    }
  };

  const handleExportExcel = () => {
    if (filteredEntries.length === 0) {
      alert("Export karne ke liye koi data available nahi hai!");
      return;
    }

    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <table border="1">
          <tr style="background-color: #2b6a48; color: #ffffff; font-weight: bold;">
            <th>Reg ID</th>
            <th>Guest Full Name</th>
            <th>Room No</th>
            <th>Mobile</th>
            <th>City</th>
            <th>ID Type</th>
            <th>Corporate / GST</th>
            <th>Check-In Date/Time</th>
            <th>Check-Out Date/Time</th>
            <th>Occupancy</th>
            <th>Advance Paid (INR)</th>
            <th>Visitors Count</th>
            <th>Approved Visitors Names</th>
            <th>Visitor Photos Status</th>
          </tr>
    `;

    filteredEntries.forEach((e) => {
      const isVoided = e.checkOutDateTime?.toLowerCase().includes("void") || e.checkOutDateTime?.toLowerCase().includes("cancel");
      const isCheckedOut =
        e.checkOutDateTime &&
        e.checkOutDateTime !== "Pending" &&
        e.checkOutDateTime !== "Not specified";

      const outStatus = isVoided ? "Cancelled (Zero-Stay Void)" : isCheckedOut ? e.checkOutDateTime : "Currently Staying";
      const hasVisitorsPhotos = (e.visitorsCount || 0) > 0 ? "Saved in PMS Security Vault" : "No Visitors";

      tableHtml += `
        <tr>
          <td>${e.id}</td>
          <td>${e.fullName}</td>
          <td>${e.roomNo}</td>
          <td>${e.mobile}</td>
          <td>${e.city || "N/A"}</td>
          <td>${e.idType || "N/A"}</td>
          <td>${e.companyName || "Personal"}</td>
          <td>${e.checkInDateTime}</td>
          <td>${outStatus}</td>
          <td>${e.adults} Adults / ${e.kids} Kids</td>
          <td>${e.advancePayment || 0}</td>
          <td>${e.visitorsCount || 0}</td>
          <td>${e.visitorNames || "None"}</td>
          <td>${hasVisitorsPhotos}</td>
        </tr>
      `;
    });

    tableHtml += `</table></body></html>`;

    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GrandPalace_ERegister_Report_${new Date().toISOString().split("T")[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          showCloseButton={false}
          className={`w-[98vw] max-w-[1550px] h-[92vh] rounded-3xl border p-6 sm:p-8 shadow-2xl transition-colors overflow-hidden flex flex-col print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full ${
            darkMode ? "bg-[#25221e] border-[#403d38] text-[#e5e2db]" : "bg-white border-[#afd9c3] text-[#403d38]"
          }`}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Digital Guest E-Register</DialogTitle>
          </DialogHeader>

          {/* SCREEN TOP BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#afd9c3]/40 gap-4 print:hidden select-none shrink-0">
            <div>
              <h3 className="text-2xl font-black flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#2b6a48] dark:text-[#afd9c3]" />
                Digital Guest E-Register & Local Backup
              </h3>
              <p className="text-xs opacity-70 mt-0.5">
                Filter by timeline, search guests, edit record details instantly, or export professional reports.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge className="bg-[#d6fce2] text-[#403d38] border border-[#afd9c3] font-bold px-3 py-1">
                Showing: {filteredEntries.length} of {registerList.length} Records
              </Badge>

              <Button
                onClick={handleExportExcel}
                className="rounded-2xl px-4 py-2 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" /> Export to Excel
              </Button>

              <Button
                onClick={() => window.print()}
                className={`rounded-2xl px-4 py-2 font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
                  darkMode
                    ? "bg-[#d6fce2] text-[#1f1d1a] hover:bg-[#afd9c3]"
                    : "bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db]"
                }`}
              >
                <Printer className="w-4 h-4" /> Print Report
              </Button>

              <Button
                onClick={onClose}
                variant="outline"
                className="rounded-2xl px-4 py-2 font-bold text-xs border-[#afd9c3]"
              >
                Close
              </Button>
            </div>
          </div>

          {/* ADVANCED FILTERING PANEL */}
          <div className="bg-[#e5e2db]/35 dark:bg-[#1f1d1a] p-4 rounded-2xl border border-[#afd9c3]/50 my-3 space-y-3 print:hidden text-xs shrink-0">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <Input
                  placeholder="Search by Guest Name, Room No, or Phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-xl border-[#afd9c3]/70 focus-visible:ring-[#afd9c3]"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold opacity-60 mr-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Quick Filter:
                </span>
                {[
                  { id: "all", label: "All" },
                  { id: "today", label: "Today" },
                  { id: "week", label: "This Week" },
                  { id: "month", label: "This Month" },
                  { id: "year", label: "This Year" },
                ].map((preset) => (
                  <Button
                    key={preset.id}
                    size="sm"
                    variant={timePreset === preset.id ? "default" : "outline"}
                    onClick={() => {
                      setTimePreset(preset.id as any);
                      setFromDate("");
                      setToDate("");
                    }}
                    className={`h-8 px-3 rounded-xl text-xs font-semibold ${
                      timePreset === preset.id
                        ? "bg-[#403d38] text-[#e5e2db] dark:bg-[#d6fce2] dark:text-[#1f1d1a]"
                        : "border-[#afd9c3]/70 hover:bg-[#d6fce2]/30"
                    }`}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#afd9c3]/30">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-white dark:bg-[#2d2a26] px-3 py-1 rounded-xl border border-[#afd9c3]/60 shadow-sm">
                  <span className="text-[11px] font-bold text-[#2b6a48] dark:text-[#afd9c3]">
                    Timeline:
                  </span>
                  <span className="text-[10px] opacity-70">From</span>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setTimePreset("all");
                    }}
                    className="h-7 text-xs rounded-lg border-[#afd9c3]/70 w-32 p-1"
                  />
                  <ArrowRight className="w-3.5 h-3.5 opacity-40 mx-0.5" />
                  <span className="text-[10px] opacity-70">To</span>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setTimePreset("all");
                    }}
                    className="h-7 text-xs rounded-lg border-[#afd9c3]/70 w-32 p-1"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] opacity-70">Month:</span>
                  <div className="w-28">
                    <Select value={selectedMonth} onValueChange={(val) => val && setSelectedMonth(val)}>
                      <SelectTrigger className="h-8 text-xs rounded-xl border-[#afd9c3]/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="0">January</SelectItem>
                        <SelectItem value="1">February</SelectItem>
                        <SelectItem value="2">March</SelectItem>
                        <SelectItem value="3">April</SelectItem>
                        <SelectItem value="4">May</SelectItem>
                        <SelectItem value="5">June</SelectItem>
                        <SelectItem value="6">July</SelectItem>
                        <SelectItem value="7">August</SelectItem>
                        <SelectItem value="8">September</SelectItem>
                        <SelectItem value="9">October</SelectItem>
                        <SelectItem value="10">November</SelectItem>
                        <SelectItem value="11">December</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] opacity-70">Year:</span>
                  <div className="w-24">
                    <Select value={selectedYear} onValueChange={(val) => val && setSelectedYear(val)}>
                      <SelectTrigger className="h-8 text-xs rounded-xl border-[#afd9c3]/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {(searchTerm || timePreset !== "all" || fromDate || toDate || selectedMonth !== "all" || selectedYear !== "all") && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleResetFilters}
                  className="h-8 px-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1 rounded-xl"
                >
                  <RotateCcw className="w-3 h-3" /> Reset All
                </Button>
              )}
            </div>
          </div>

          {/* E-REGISTER DATA TABLE WITH SOLID OPAQUE STICKY HEADERS */}
          <div className="flex-1 border border-[#afd9c3]/50 rounded-2xl overflow-x-auto overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-sm print:border-black print:overflow-visible">
            <table className="w-full text-left text-xs border-separate border-spacing-0 min-w-[1550px] print:min-w-full print:text-[10px]">
              <thead>
                <tr className="font-bold uppercase text-[11px] select-none">
                  <th className="sticky top-0 z-30 p-3.5 bg-[#edeae3] dark:bg-[#1a1815] border-b-2 border-[#afd9c3]">
                    Reg ID
                  </th>
                  <th className="sticky top-0 z-30 p-3.5 bg-[#edeae3] dark:bg-[#1a1815] border-b-2 border-[#afd9c3]">
                    Guest Full Name
                  </th>
                  <th className="sticky top-0 z-30 p-3.5 bg-[#edeae3] dark:bg-[#1a1815] border-b-2 border-[#afd9c3] text-center">
                    Room
                  </th>
                  <th className="sticky top-0 z-30 p-3.5 bg-[#edeae3] dark:bg-[#1a1815] border-b-2 border-[#afd9c3]">
                    Contact Details
                  </th>
                  <th className="sticky top-0 z-30 p-3.5 bg-[#edeae3] dark:bg-[#1a1815] border-b-2 border-[#afd9c3]">
                    Address & Location
                  </th>
                  <th className="sticky top-0 z-30 p-3.5 bg-[#edeae3] dark:bg-[#1a1815] border-b-2 border-[#afd9c3]">
                    Govt ID Proof
                  </th>
                  <th className="sticky top-0 z-30 p-3.5 bg-[#edeae3] dark:bg-[#1a1815] border-b-2 border-[#afd9c3]">
                    Corporate / GST
                  </th>
                  <th className="sticky top-0 z-30 p-3.5 bg-[#edeae3] dark:bg-[#1a1815] border-b-2 border-[#afd9c3]">
                    Check-In Details
                  </th>
                  <th className="sticky top-0 z-30 p-3.5 bg-[#edeae3] dark:bg-[#1a1815] border-b-2 border-[#afd9c3]">
                    Check-Out Details
                  </th>
                  <th className="sticky top-0 z-30 p-3.5 bg-[#edeae3] dark:bg-[#1a1815] border-b-2 border-[#afd9c3] text-center">
                    Occupancy
                  </th>
                  <th className="sticky top-0 z-30 p-3.5 bg-[#edeae3] dark:bg-[#1a1815] border-b-2 border-[#afd9c3] text-right">
                    Advance
                  </th>
                  {/* SOLID OPAQUE VISITOR LOG HEADER */}
                  <th className="sticky top-0 z-30 p-3.5 bg-[#c5f2d4] text-[#1b4d32] dark:bg-[#1e382b] dark:text-[#d6fce2] border-b-2 border-[#afd9c3] text-center font-black">
                    Visitors Log / Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-12 text-center text-slate-400 font-semibold bg-white dark:bg-[#1f1d1a]">
                      No guest check-in records found for this selected timeline.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => {
                    const isEditing = editingEntryId === entry.id;
                    const isVoided =
                      entry.checkOutDateTime?.toLowerCase().includes("void") ||
                      entry.checkOutDateTime?.toLowerCase().includes("cancel");

                    const isCheckedOut =
                      entry.checkOutDateTime &&
                      entry.checkOutDateTime !== "Not specified" &&
                      entry.checkOutDateTime !== "Pending" &&
                      entry.checkOutDateTime.trim() !== "" &&
                      !isVoided;

                    const visCount = entry.visitorsCount || 0;

                    return (
                      <tr
                        key={entry.id}
                        className={`border-b border-[#afd9c3]/30 transition-colors ${
                          isVoided
                            ? "bg-red-50/40 dark:bg-red-950/20"
                            : darkMode
                            ? "bg-[#1f1d1a] hover:bg-[#25221e]"
                            : "bg-white hover:bg-[#d6fce2]/15"
                        }`}
                      >
                        <td className="p-3.5 font-mono font-bold text-[#2b6a48] dark:text-[#afd9c3] border-b border-[#afd9c3]/20">
                          {entry.id}
                        </td>

                        {/* GUEST NAME (EDITABLE) */}
                        <td className="p-3.5 border-b border-[#afd9c3]/20">
                          {!isEditing ? (
                            <div className="font-extrabold text-sm text-[#403d38] dark:text-[#e5e2db] flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 opacity-60 print:hidden" />
                              <span>{entry.fullName}</span>
                            </div>
                          ) : (
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-8 text-xs font-bold rounded-xl border-[#2b6a48]"
                            />
                          )}
                        </td>

                        <td className="p-3.5 text-center font-bold border-b border-[#afd9c3]/20">
                          <span className="bg-[#d6fce2] text-[#403d38] border border-[#afd9c3] px-2.5 py-0.5 rounded-lg font-mono">
                            {entry.roomNo}
                          </span>
                        </td>

                        {/* CONTACT DETAILS (EDITABLE MOBILE) */}
                        <td className="p-3.5 border-b border-[#afd9c3]/20">
                          {!isEditing ? (
                            <>
                              <div className="font-mono text-xs font-semibold">{entry.mobile}</div>
                              {entry.email && (
                                <div className="text-[10px] opacity-60 truncate max-w-[140px]">{entry.email}</div>
                              )}
                            </>
                          ) : (
                            <Input
                              value={editMobile}
                              onChange={(e) => setEditMobile(e.target.value)}
                              className="h-8 text-xs font-mono rounded-xl border-[#2b6a48]"
                            />
                          )}
                        </td>

                        <td className="p-3.5 max-w-[180px] border-b border-[#afd9c3]/20">
                          <div className="font-semibold">{entry.city}{entry.stateName ? `, ${entry.stateName}` : ""}</div>
                          <div className="text-[10px] opacity-60 truncate">{entry.address || "N/A"}</div>
                        </td>

                        <td className="p-3.5 border-b border-[#afd9c3]/20">
                          <div className="font-semibold">{entry.idType}</div>
                          <div className="font-mono text-[11px] opacity-80">[Redacted ID]</div>
                          {entry.idDocFileName && (
                            <span className="text-[9px] text-emerald-600 font-semibold block print:hidden">
                              ✓ {entry.idDocFileName}
                            </span>
                          )}
                        </td>

                        {/* CORPORATE / GST (EDITABLE) */}
                        <td className="p-3.5 border-b border-[#afd9c3]/20">
                          {!isEditing ? (
                            <>
                              <div className="font-medium">{entry.companyName || "Personal"}</div>
                              {entry.guestGstin && (
                                <div className="font-mono text-[10px] opacity-70">GST: {entry.guestGstin}</div>
                              )}
                            </>
                          ) : (
                            <div className="space-y-1">
                              <Input
                                placeholder="Company"
                                value={editCompany}
                                onChange={(e) => setEditCompany(e.target.value)}
                                className="h-7 text-[11px] rounded-lg border-[#2b6a48]"
                              />
                              <Input
                                placeholder="GSTIN"
                                value={editGstin}
                                onChange={(e) => setEditGstin(e.target.value)}
                                className="h-7 text-[11px] font-mono uppercase rounded-lg border-[#2b6a48]"
                              />
                            </div>
                          )}
                        </td>

                        {/* CHECK-IN COLUMN */}
                        <td className="p-3.5 border-b border-[#afd9c3]/20">
                          <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                            <Clock className="w-3.5 h-3.5 opacity-60 print:hidden" />
                            <span>{entry.checkInDateTime}</span>
                          </div>
                        </td>

                        {/* CHECK-OUT & ZERO-STAY VOID COLUMN */}
                        <td className="p-3.5 border-b border-[#afd9c3]/20">
                          {isVoided ? (
                            <Badge className="bg-red-100 text-red-700 border border-red-300 dark:bg-red-950/40 dark:text-red-400 font-bold text-[10px] uppercase">
                              ✕ Cancelled (Zero-Stay)
                            </Badge>
                          ) : isCheckedOut ? (
                            <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#e11d48]">
                              <ArrowRight className="w-3.5 h-3.5 opacity-60 print:hidden" />
                              <span>{entry.checkOutDateTime}</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <Badge className="bg-[#df918d]/15 text-[#e11d48] border border-[#df918d]/40 font-bold text-[10px] uppercase">
                                Currently Staying
                              </Badge>
                              <button
                                type="button"
                                onClick={() => handleVoidStay(entry)}
                                className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 print:hidden"
                                title="Guest left within minutes - cancel stay & free room"
                              >
                                <XCircle className="w-3 h-3 text-red-500" /> Void Stay (Zero-Stay)
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="p-3.5 text-center font-mono border-b border-[#afd9c3]/20">
                          {entry.adults}A {entry.kids > 0 ? `+ ${entry.kids}K` : ""}
                        </td>

                        <td className="p-3.5 text-right font-mono font-bold text-sm text-emerald-600 border-b border-[#afd9c3]/20">
                          ₹{entry.advancePayment}
                        </td>

                        {/* VISITORS LOG & INLINE EDIT BUTTONS */}
                        <td className="p-3.5 text-center bg-[#d6fce2]/20 dark:bg-[#1f2f25]/40 border-b border-[#afd9c3]/20">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setInspectingRoom(entry.roomNo);
                                setInspectingGuestName(entry.fullName);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#25221e] border border-[#afd9c3] hover:border-[#2b6a48] shadow-xs flex items-center gap-1 transition-all print:hidden"
                              title="View verified visitor photos"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[#2b6a48] dark:text-[#afd9c3]" />
                              <span className="font-bold text-xs">{visCount}</span>
                            </button>

                            {!isEditing ? (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(entry)}
                                className="px-2.5 py-1.5 rounded-xl bg-[#2b6a48] text-white hover:bg-[#23583c] shadow-xs flex items-center gap-1 text-xs font-bold transition-all print:hidden"
                                title="Edit guest details"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(entry.id)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs flex items-center gap-1 text-xs font-bold transition-all print:hidden animate-pulse"
                                title="Save changes"
                              >
                                <Save className="w-3.5 h-3.5" /> Save
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {/* INSPECT APPROVED VISITORS MODAL */}
      <Dialog open={!!inspectingRoom} onOpenChange={(open) => !open && setInspectingRoom(null)}>
        <DialogContent
          showCloseButton={false}
          className={`w-[90vw] max-w-2xl max-h-[85vh] rounded-3xl border p-6 shadow-2xl overflow-y-auto ${
            darkMode ? "bg-[#25221e] border-[#403d38] text-[#e5e2db]" : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#afd9c3]/50">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2b6a48] dark:text-[#afd9c3]" />
                <h3 className="font-black text-base">Verified Visitors Police Audit Log</h3>
              </div>
              <p className="text-xs opacity-65">
                Room <strong>{inspectingRoom}</strong> | Primary Guest: <strong>{inspectingGuestName}</strong>
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setInspectingRoom(null)}
              variant="outline"
              className="h-8 rounded-xl text-xs font-bold border-[#afd9c3]"
            >
              Close
            </Button>
          </div>

          <div className="space-y-3 pt-3">
            {roomVisitors.length === 0 ? (
              <div className="text-center py-10 opacity-50 text-xs font-semibold space-y-2">
                <Camera className="w-8 h-8 mx-auto opacity-40" />
                <p>Is guest se milne koi bhi visitor nahi aaya hai. (No verified visitors logged for this stay)</p>
              </div>
            ) : (
              roomVisitors.map((vis) => (
                <div
                  key={vis.id}
                  className={`p-3.5 rounded-2xl border flex items-center gap-4 shadow-xs ${
                    darkMode ? "bg-[#1f1d1a] border-[#403d38]" : "bg-white border-[#afd9c3]/60"
                  }`}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-black/20 shrink-0 bg-black">
                    <img src={vis.photoUrl} alt={vis.visitorName} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 text-xs flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm">{vis.visitorName}</span>
                      <Badge className="bg-[#d6fce2] text-[#2b6a48] text-[9px] font-bold">✓ Guest Approved</Badge>
                    </div>
                    <div className="font-mono opacity-80">Mobile: {vis.visitorPhone}</div>
                    <div className="text-[11px] opacity-75">
                      Entry Time: <strong>{vis.entryTime}</strong>
                    </div>
                    <div className="text-[10px] opacity-60">Govt ID Proof: {vis.idProofNumber || "N/A"}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}