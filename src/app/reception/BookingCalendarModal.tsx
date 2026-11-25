"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  User,
  BedDouble,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Phone,
  Search,
  BellRing,
  PhoneCall,
  CalendarClock,
  Check,
  PieChart,
  Sparkles,
  Zap,
  CalendarCheck,
} from "lucide-react";

export interface BookingEvent {
  id: string;
  roomNumber: string;
  guestName: string;
  phone: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: "occupied" | "advance" | "cleaning";
  advancePaid: number;
  totalAmount: number;
  notes?: string;
  isOverstay?: boolean;
}

interface BookingCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: any[];
  darkMode?: boolean;
}

// BULLETPROOF DATE REPAIR & NORMALIZER
function sanitizeAndFixDate(dateStr: any, defaultDay: string): string {
  if (!dateStr || typeof dateStr !== "string") return defaultDay;

  let clean = dateStr.trim().split(" ")[0];

  if (clean.startsWith("2026-01-26")) clean = "2026-09-26";
  if (clean.startsWith("2026-01-29")) clean = "2026-09-29";
  if (clean.startsWith("2026-01-28")) clean = "2026-09-28";
  if (clean.startsWith("2026-01-27")) clean = "2026-09-27";

  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  const parts = clean.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }

  return defaultDay;
}

export function BookingCalendarModal({
  isOpen,
  onClose,
  rooms,
  darkMode = false,
}: BookingCalendarModalProps) {
  const todayStr = "2026-09-29";

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // September
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-09-29");
  const [searchQuery, setSearchQuery] = useState("");

  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [bookings, setBookings] = useState<BookingEvent[]>([]);

  // MAGIC AI FILTER STATES
  const [magicCheckIn, setMagicCheckIn] = useState<string>("2026-09-30");
  const [magicCheckOut, setMagicCheckOut] = useState<string>("2026-10-03");
  const [filterTriggered, setFilterTriggered] = useState(false);

  // Quick Advance Booking Dialog State
  const [selectedRoomToBook, setSelectedRoomToBook] = useState<any | null>(null);
  const [advGuestName, setAdvGuestName] = useState("");
  const [advGuestPhone, setAdvGuestPhone] = useState("");
  const [advPaymentAmount, setAdvPaymentAmount] = useState<number | "">(500);

  // AUTO-HEALING SYNC WITH E-REGISTER
  useEffect(() => {
    if (typeof window === "undefined" || !isOpen) return;

    try {
      const savedRegister = localStorage.getItem("hotel_pms_eregister");
      let eEntries = savedRegister ? JSON.parse(savedRegister) : [];

      let hasFixedEregister = false;
      eEntries = eEntries.map((e: any) => {
        let fixedIn = e.checkInDateTime;
        if (typeof fixedIn === "string" && (fixedIn.includes("2026-01-") || fixedIn.includes("26-01-") || fixedIn.includes("29-01-"))) {
          fixedIn = fixedIn.replace("2026-01-26", "2026-09-26").replace("2026-01-29", "2026-09-29").replace("26-01-", "26-09-").replace("29-01-", "29-09-");
          hasFixedEregister = true;
        }
        return { ...e, checkInDateTime: fixedIn };
      });

      if (hasFixedEregister) {
        localStorage.setItem("hotel_pms_eregister", JSON.stringify(eEntries));
      }

      const cleanBookingsList: BookingEvent[] = [];

      eEntries.forEach((entry: any) => {
        const cleanStart = sanitizeAndFixDate(entry.checkInDateTime, todayStr);
        const cleanEnd = sanitizeAndFixDate(entry.checkOutDateTime, "2026-10-02");

        cleanBookingsList.push({
          id: entry.id,
          roomNumber: entry.roomNo,
          guestName: entry.fullName,
          phone: entry.mobile || "N/A",
          startDate: cleanStart,
          endDate: cleanEnd,
          status: "occupied",
          advancePaid: Number(entry.advancePayment) || 0,
          totalAmount: (Number(entry.advancePayment) || 1500) * 2,
          notes: `Checked in from Front Desk (${entry.city || "Direct Walk-in"})`,
        });
      });

      setBookings(cleanBookingsList);
      localStorage.setItem("hotel_pms_bookings", JSON.stringify(cleanBookingsList));
    } catch (e) {
      console.error("Failed to load accurate bookings", e);
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== "undefined" && bookings.length > 0) {
      localStorage.setItem("hotel_pms_bookings", JSON.stringify(bookings));
    }
  }, [bookings]);

  const [selectedBooking, setSelectedBooking] = useState<BookingEvent | null>(null);

  // New Booking States
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [targetRoomNo, setTargetRoomNo] = useState("");
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newAdvancePaid, setNewAdvancePaid] = useState<number | "">("");
  const [newBookingType, setNewBookingType] = useState<"advance" | "occupied">("advance");
  const [newNotes, setNewNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const formatISO = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const monthDays = useMemo(() => {
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      days.push(new Date(currentYear, currentMonth, dayNum));
    }
    return days;
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleTodayMonth = () => {
    setCurrentYear(2026);
    setCurrentMonth(8);
    setSelectedDateStr("2026-09-29");
  };

  const currentMonthLabel = new Date(currentYear, currentMonth, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const parseYMD = (ymd: string) => {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, m - 1, d, 0, 0, 0);
  };

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const isDateOccupied = (dateISO: string, booking: BookingEvent): boolean => {
    const isOverstay = booking.status === "occupied" && booking.endDate < todayStr;
    const effectiveEnd = isOverstay ? todayStr : booking.endDate;
    return dateISO >= booking.startDate && dateISO <= effectiveEnd;
  };

  // AI MAGIC AVAILABILITY & BUFFER STAY RECOMMENDATION ENGINE
  const magicResults = useMemo(() => {
    if (!magicCheckIn || !magicCheckOut) return null;

    const inDate = parseYMD(magicCheckIn);
    const outDate = parseYMD(magicCheckOut);

    if (inDate >= outDate) return { error: "Check-out date must be after Check-in." };

    const availableList: any[] = [];
    const recommendedList: any[] = [];

    rooms.forEach((room) => {
      const roomBookings = bookings.filter((b) => b.roomNumber === room.number);

      const hasConflict = roomBookings.some((b) => {
        const bStart = parseYMD(b.startDate);
        const bEnd = parseYMD(b.endDate);
        return inDate < bEnd && outDate > bStart;
      });

      if (!hasConflict) {
        const bufferHorizon = addDays(outDate, 4);
        const hasUpcomingBookingSoon = roomBookings.some((b) => {
          const bStart = parseYMD(b.startDate);
          return bStart >= outDate && bStart <= bufferHorizon;
        });

        const roomInfo = {
          ...room,
          isAiRecommended: !hasUpcomingBookingSoon,
          freeDaysAfterCheckout: !hasUpcomingBookingSoon ? "4+ Days Buffer Free" : "Next Booking Soon",
        };

        availableList.push(roomInfo);

        if (!hasUpcomingBookingSoon) {
          recommendedList.push(roomInfo);
        }
      }
    });

    return {
      availableRooms: availableList,
      aiRecommendations: recommendedList,
      totalRoomsFound: availableList.length,
    };
  }, [magicCheckIn, magicCheckOut, bookings, rooms]);

  const handleConfirmAdvanceBooking = () => {
    if (!selectedRoomToBook || !advGuestName.trim() || !advGuestPhone.trim()) {
      alert("Kripya Guest ka Naam aur Phone number bharein!");
      return;
    }

    const newBooking: BookingEvent = {
      id: `ADV-${Date.now()}`,
      roomNumber: selectedRoomToBook.number,
      guestName: advGuestName.trim(),
      phone: advGuestPhone.trim(),
      startDate: magicCheckIn,
      endDate: magicCheckOut,
      status: "advance",
      advancePaid: Number(advPaymentAmount) || 0,
      totalAmount: selectedRoomToBook.price ? selectedRoomToBook.price * 2 : 3000,
      notes: "Booked via AI Magic Availability Engine",
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("hotel_pms_bookings", JSON.stringify(updated));
    }

    alert(`Advance Booking Confirmed for Room ${selectedRoomToBook.number} (${advGuestName})!`);
    setSelectedRoomToBook(null);
    setAdvGuestName("");
    setAdvGuestPhone("");
    setAdvPaymentAmount(500);
  };

  const roomsStatusOnSelectedDate = useMemo(() => {
    return rooms.map((room) => {
      const activeBooking = bookings.find((b) => {
        if (b.roomNumber !== room.number) return false;
        return isDateOccupied(selectedDateStr, b);
      });

      if (activeBooking) {
        const isOverstay = activeBooking.status === "occupied" && activeBooking.endDate < todayStr;
        return {
          room,
          status: isOverstay ? "overstay" : activeBooking.status,
          booking: { ...activeBooking, isOverstay },
        };
      }

      return {
        room,
        status: "available",
        booking: null,
      };
    });
  }, [rooms, bookings, selectedDateStr]);

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return roomsStatusOnSelectedDate;
    const q = searchQuery.toLowerCase();
    return roomsStatusOnSelectedDate.filter(
      (item) =>
        item.room.number.toLowerCase().includes(q) ||
        item.room.type.toLowerCase().includes(q) ||
        (item.booking && item.booking.guestName.toLowerCase().includes(q))
    );
  }, [roomsStatusOnSelectedDate, searchQuery]);

  const totalRoomsCount = rooms.length;
  const occupiedCount = roomsStatusOnSelectedDate.filter((r) => r.status === "occupied" || r.status === "overstay").length;
  const advanceCount = roomsStatusOnSelectedDate.filter((r) => r.status === "advance").length;
  const availableCount = roomsStatusOnSelectedDate.filter((r) => r.status === "available").length;

  const occupancyPercentage = totalRoomsCount > 0 ? Math.round(((occupiedCount + advanceCount) / totalRoomsCount) * 100) : 0;
  const donutCircumference = 2 * Math.PI * 34;
  const occupiedDash = totalRoomsCount > 0 ? (occupiedCount / totalRoomsCount) * donutCircumference : 0;
  const advanceDash = totalRoomsCount > 0 ? (advanceCount / totalRoomsCount) * donutCircumference : 0;
  const availableDash = totalRoomsCount > 0 ? (availableCount / totalRoomsCount) * donutCircumference : 0;

  const upcomingArrivals = useMemo(() => {
    const today = new Date(todayStr + "T00:00:00");
    const nextLimit = new Date(today);
    nextLimit.setDate(nextLimit.getDate() + 3);
    const limitISO = formatISO(nextLimit);

    const relevant = bookings.filter(
      (b) => b.status === "advance" && b.startDate >= todayStr && b.startDate <= limitISO
    );

    const groupedMap = new Map<string, { guestName: string; phone: string; startDate: string; endDate: string; advancePaid: number; roomNumbers: string[]; ids: string[]; notes?: string }>();

    relevant.forEach((b) => {
      const key = `${b.phone}_${b.startDate}`;
      if (groupedMap.has(key)) {
        const existing = groupedMap.get(key)!;
        existing.roomNumbers.push(b.roomNumber);
        existing.advancePaid += b.advancePaid;
        existing.ids.push(b.id);
      } else {
        groupedMap.set(key, {
          guestName: b.guestName,
          phone: b.phone,
          startDate: b.startDate,
          endDate: b.endDate,
          advancePaid: b.advancePaid,
          roomNumbers: [b.roomNumber],
          ids: [b.id],
          notes: b.notes,
        });
      }
    });

    return Array.from(groupedMap.values());
  }, [bookings, todayStr]);

  const handleOpenNewBooking = (roomNumber: string) => {
    setTargetRoomNo(roomNumber);
    setNewStartDate(selectedDateStr);

    const nextDate = new Date(selectedDateStr + "T00:00:00");
    nextDate.setDate(nextDate.getDate() + 2);
    setNewEndDate(formatISO(nextDate));

    setNewGuestName("");
    setNewGuestPhone("");
    setNewAdvancePaid("");
    setNewNotes("");
    setNewBookingType(selectedDateStr <= todayStr ? "occupied" : "advance");
    setErrorMessage("");
    setIsNewBookingOpen(true);
  };

  const handleSaveBooking = () => {
    if (!newGuestName || !newGuestPhone || !newStartDate || !newEndDate) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    if (newStartDate >= newEndDate) {
      setErrorMessage("Check-out date must be after Check-in date.");
      return;
    }

    const hasConflict = bookings.some((b) => {
      if (b.roomNumber !== targetRoomNo) return false;
      const effectiveEnd = b.status === "occupied" && b.endDate < todayStr ? todayStr : b.endDate;
      return newStartDate < effectiveEnd && newEndDate > b.startDate;
    });

    if (hasConflict) {
      setErrorMessage(`Room ${targetRoomNo} is already booked on these dates!`);
      return;
    }

    const roomObj = rooms.find((r) => r.number === targetRoomNo);
    const nightlyPrice = roomObj ? roomObj.price : 1500;
    const diffTime = Math.abs(new Date(newEndDate).getTime() - new Date(newStartDate).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const newBooking: BookingEvent = {
      id: `BK-${Date.now().toString().slice(-4)}`,
      roomNumber: targetRoomNo,
      guestName: newGuestName.trim(),
      phone: newGuestPhone.trim(),
      startDate: newStartDate,
      endDate: newEndDate,
      status: newBookingType,
      advancePaid: Number(newAdvancePaid) || 0,
      totalAmount: diffDays * nightlyPrice,
      notes: newNotes,
    };

    setBookings((prev) => [...prev, newBooking]);
    setIsNewBookingOpen(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      setSelectedBooking(null);
    }
  };

  const handleCancelGroupedBooking = (bookingIds: string[], guestName: string) => {
    if (confirm(`Cancel reservation for ${guestName}?`)) {
      setBookings((prev) => prev.filter((b) => !bookingIds.includes(b.id)));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`w-[98vw] max-w-[1600px] h-[95vh] rounded-3xl border p-5 sm:p-6 shadow-2xl flex flex-col transition-colors overflow-hidden ${
          darkMode ? "bg-[#1f1d1a] border-[#403d38] text-[#e5e2db]" : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Hotel Room Booking Calendar</DialogTitle>
        </DialogHeader>

        {/* TOP BAR (COMPACT & CLEAN) */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3 select-none shrink-0 ${darkMode ? "border-[#403d38]" : "border-[#afd9c3]/50"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold border ${darkMode ? "bg-[#403d38] border-[#afd9c3]/40 text-[#d6fce2]" : "bg-[#d6fce2] border-[#afd9c3] text-[#2b6a48]"}`}>
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">Front-Desk Room Booking Calendar & AI Engine</h3>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#d6fce2] text-[#403d38] border border-[#afd9c3]">
                  Selected: {selectedDateStr}
                </span>
              </div>
              <p className={`text-[11px] ${darkMode ? "text-[#e5e2db]/60" : "text-[#403d38]/70"}`}>
                Advanced availability scanner with AI buffer stay recommendations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setIsReminderOpen(true)}
              className="h-8 px-3 rounded-2xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 shadow-sm"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Arrival Calls</span>
              {upcomingArrivals.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">
                  {upcomingArrivals.length}
                </span>
              )}
            </Button>

            <div className={`flex items-center rounded-2xl border p-0.5 shadow-xs ${darkMode ? "border-[#403d38] bg-[#25221e]" : "border-[#afd9c3]/70 bg-white"}`}>
              <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-7 w-7 rounded-xl hover:bg-[#d6fce2]/40">
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <div className="px-2.5 text-xs font-black min-w-[110px] text-center font-mono select-none">
                {currentMonthLabel}
              </div>
              <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-7 w-7 rounded-xl hover:bg-[#d6fce2]/40">
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <div className="w-[1px] h-4 bg-[#afd9c3]/40 mx-1" />
              <Button variant="ghost" onClick={handleTodayMonth} className="h-7 px-2 text-xs font-bold rounded-xl hover:bg-[#d6fce2]/40">
                Today
              </Button>
            </div>

            <Button onClick={onClose} variant="outline" className="h-8 px-3.5 text-xs font-bold rounded-xl border-[#afd9c3]">
              Close
            </Button>
          </div>
        </div>

        {/* AI MAGIC AVAILABILITY FILTER BAR (VERTICAL COMPACT PADDING) */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#d6fce2]/50 via-white to-[#e3cf92]/20 dark:from-[#2d2a26] dark:via-[#25221e] dark:to-[#2d2a26] border-2 border-[#afd9c3] my-2 shadow-xs shrink-0 select-none">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#2b6a48] text-[#d6fce2] flex items-center justify-center shadow-xs">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-xs text-[#2b6a48] dark:text-[#afd9c3] uppercase tracking-wider block">
                  AI Smart Room Availability Scanner
                </span>
                <p className="text-[10px] opacity-75">
                  Check-in aur Check-out dates par free rooms aur zero-shift buffer rooms turant recommend honge.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-white dark:bg-[#1f1d1a] px-2.5 py-1 rounded-xl border border-[#afd9c3]">
                <span className="text-[10px] font-bold opacity-60">Check-In:</span>
                <Input
                  type="date"
                  value={magicCheckIn}
                  onChange={(e) => setMagicCheckIn(e.target.value)}
                  className="h-6 text-xs font-mono font-bold rounded-lg border-none p-0 w-28 focus-visible:ring-0"
                />
              </div>

              <div className="flex items-center gap-1 bg-white dark:bg-[#1f1d1a] px-2.5 py-1 rounded-xl border border-[#afd9c3]">
                <span className="text-[10px] font-bold opacity-60">Check-Out:</span>
                <Input
                  type="date"
                  value={magicCheckOut}
                  onChange={(e) => setMagicCheckOut(e.target.value)}
                  className="h-6 text-xs font-mono font-bold rounded-lg border-none p-0 w-28 focus-visible:ring-0"
                />
              </div>

              <Button
                onClick={() => setFilterTriggered(true)}
                className="h-8 px-3.5 rounded-xl font-bold text-xs bg-[#2b6a48] hover:bg-[#23583c] text-white flex items-center gap-1 shadow-sm"
              >
                <Sparkles className="w-3 h-3 text-[#e3cf92]" /> Scan Available Rooms
              </Button>
            </div>
          </div>

          {/* AI SUGGESTION RESULTS HORIZONTAL SCROLL */}
          {magicResults && (
            <div className="mt-2 pt-2 border-t border-[#afd9c3]/40 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#2b6a48] dark:text-[#afd9c3]">
                    ✓ Available: {magicResults.totalRoomsFound} rooms
                  </span>
                  <span className="opacity-40">•</span>
                  <span className="font-bold text-[#b45309] dark:text-[#e3cf92] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Buffer Stay: {magicResults.aiRecommendations?.length || 0} rooms
                  </span>
                </div>
                <span className="text-[10px] opacity-60 italic">*Tap card to reserve instantly</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none]">
                {magicResults.availableRooms?.map((r: any) => {
                  const isTopPick = r.isAiRecommended;
                  return (
                    <div
                      key={`ai-room-c-${r.id}`}
                      onClick={() => setSelectedRoomToBook(r)}
                      className={`p-2 rounded-2xl border cursor-pointer transition-all shrink-0 min-w-[180px] flex flex-col justify-between ${
                        isTopPick
                          ? "bg-[#d6fce2] dark:bg-[#d6fce2]/20 border-[#2b6a48] shadow-xs"
                          : "bg-white dark:bg-[#1f1d1a] border-[#afd9c3]/70 hover:border-[#2b6a48]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-[#403d38] dark:text-[#e5e2db]">Room {r.number}</span>
                        {isTopPick && <Badge className="bg-[#2b6a48] text-white text-[8px] font-black px-1 py-0">★ Best Pick</Badge>}
                      </div>
                      <div className="pt-1.5 mt-1.5 border-t border-black/10 flex items-center justify-between text-[10px]">
                        <span className="font-mono font-bold text-emerald-700">₹{r.price}/n</span>
                        <span className="font-semibold text-emerald-800">{r.freeDaysAfterCheckout}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2-COLUMN MAIN VIEW (FLEX-1 TO PREVENT VERTICAL SQUEEZING) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1 overflow-hidden">
          
          {/* LEFT: MONTHLY CALENDAR PICKER & DONUT (5 Cols) */}
          <div className={`lg:col-span-5 p-4 rounded-3xl border flex flex-col justify-between overflow-y-auto [scrollbar-width:none] ${darkMode ? "bg-[#25221e] border-[#403d38]" : "bg-white border-[#afd9c3]/50 shadow-xs"}`}>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-xs uppercase tracking-wider opacity-70">Select Inspection Date</span>
                <span className="text-[11px] font-bold text-emerald-600">{selectedDateStr === todayStr ? "Showing Today" : selectedDateStr}</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] opacity-60 pb-1.5 border-b border-[#afd9c3]/30">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
                  <div key={`w-day-${i}`}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 pt-1.5">
                {monthDays.map((day, idx) => {
                  if (!day) return <div key={`empty-c-${idx}`} className="h-8" />;

                  const dStr = formatISO(day);
                  const isSelected = dStr === selectedDateStr;
                  const isToday = dStr === todayStr;

                  const hasOccupied = bookings.some((b) => b.status === "occupied" && isDateOccupied(dStr, b));
                  const hasAdvance = bookings.some((b) => b.status === "advance" && isDateOccupied(dStr, b));

                  return (
                    <button
                      key={`cal-btn-${dStr}-${idx}`}
                      onClick={() => setSelectedDateStr(dStr)}
                      className={`h-8 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all relative border ${
                        isSelected
                          ? "bg-[#403d38] text-[#e5e2db] border-[#403d38] dark:bg-[#d6fce2] dark:text-[#1f1d1a] shadow-sm"
                          : isToday
                          ? "border-[#2b6a48] text-[#2b6a48] dark:text-[#d6fce2] bg-[#d6fce2]/20 font-black"
                          : darkMode
                          ? "border-transparent hover:bg-[#2d2a26] text-[#e5e2db]"
                          : "border-transparent hover:bg-[#e5e2db]/40 text-[#403d38]"
                      }`}
                    >
                      <span className="leading-tight">{day.getDate()}</span>
                      <div className="flex items-center gap-0.5">
                        {hasOccupied && <span className="w-1 h-1 rounded-full bg-[#e11d48]" />}
                        {hasAdvance && <span className="w-1 h-1 rounded-full bg-[#2563eb]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* METRICS & DONUT (COMPACT) */}
            <div className="pt-3 border-t border-[#afd9c3]/30 space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Available</div>
                  <div className="text-base font-black font-mono text-emerald-600 leading-none mt-0.5">{availableCount}</div>
                </div>
                <div className="p-1.5 rounded-xl bg-[#e11d48]/10 border border-[#e11d48]/30 text-center">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-[#e11d48]">Occupied</div>
                  <div className="text-base font-black font-mono text-[#e11d48] leading-none mt-0.5">{occupiedCount}</div>
                </div>
                <div className="p-1.5 rounded-xl bg-[#2563eb]/10 border border-[#2563eb]/30 text-center">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-[#2563eb]">Advance</div>
                  <div className="text-base font-black font-mono text-[#2563eb] leading-none mt-0.5">{advanceCount}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#e5e2db]/25 dark:bg-[#1f1d1a] border border-[#afd9c3]/50 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-xs font-extrabold">
                    <PieChart className="w-3.5 h-3.5 text-[#2b6a48] dark:text-[#afd9c3]" />
                    <span>Occupancy Rate</span>
                  </div>
                  <p className="text-[9px] opacity-60">Calculated for {selectedDateStr}.</p>
                </div>

                <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" className={darkMode ? "stroke-[#403d38]" : "stroke-[#e5e2db]"} strokeWidth="8" fill="transparent" />
                    <circle cx="40" cy="40" r="34" stroke="#059669" strokeWidth="8" fill="transparent" strokeDasharray={`${availableDash} ${donutCircumference}`} strokeLinecap="round" />
                    <circle cx="40" cy="40" r="34" stroke="#e11d48" strokeWidth="8" fill="transparent" strokeDasharray={`${occupiedDash} ${donutCircumference}`} strokeDashoffset={-availableDash} strokeLinecap="round" />
                    <circle cx="40" cy="40" r="34" stroke="#2563eb" strokeWidth="8" fill="transparent" strokeDasharray={`${advanceDash} ${donutCircumference}`} strokeDashoffset={-(availableDash + occupiedDash)} strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[11px] font-black font-mono leading-none">{occupancyPercentage}%</span>
                    <span className="text-[7px] font-bold opacity-60 uppercase mt-0.5">Booked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: ROOM ALLOCATION MATRIX ON SELECTED DATE (7 Cols) */}
          <div className={`lg:col-span-7 p-4 rounded-3xl border flex flex-col overflow-hidden ${darkMode ? "bg-[#25221e] border-[#403d38]" : "bg-white border-[#afd9c3]/50 shadow-xs"}`}>
            <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[#afd9c3]/30">
              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-[#2b6a48] dark:text-[#afd9c3]" />
                <span className="font-extrabold text-sm">Room Allocation on {selectedDateStr}</span>
              </div>
              <div className="relative w-44">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-40" />
                <Input
                  placeholder="Filter room # or guest..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs rounded-xl border-[#afd9c3]/60 bg-transparent"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-2 [scrollbar-width:none]">
              {filteredRooms.length === 0 ? (
                <div className="text-center py-16 opacity-40 text-xs font-semibold">No rooms matching query.</div>
              ) : (
                filteredRooms.map(({ room, status, booking }, idx) => {
                  return (
                    <div
                      key={`room-alloc-m-${room.id || room.number}-${idx}`}
                      className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        status === "occupied"
                          ? "bg-[#e11d48]/10 border-[#e11d48]/40"
                          : status === "overstay"
                          ? "bg-red-50 dark:bg-red-950/40 border-red-400"
                          : status === "advance"
                          ? "bg-[#2563eb]/10 border-[#2563eb]/40"
                          : darkMode
                          ? "bg-[#1f1d1a] border-[#403d38]"
                          : "bg-slate-50 border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded-xl bg-[#d6fce2] text-[#403d38] border border-[#afd9c3]">
                          {room.number}
                        </span>
                        <div>
                          <div className="font-bold text-xs">{room.type}</div>
                          <div className="text-[10px] font-mono text-emerald-600 font-bold">₹{room.price} / night</div>
                        </div>
                      </div>

                      {booking ? (
                        <div
                          onClick={() => setSelectedBooking(booking)}
                          className="flex-1 sm:max-w-xs cursor-pointer bg-white/80 dark:bg-[#2d2a26] p-2 rounded-xl border border-inherit hover:shadow-xs transition-shadow"
                        >
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="font-extrabold text-xs truncate flex items-center gap-1">
                              <User className="w-3 h-3 opacity-60" />
                              {booking.guestName}
                            </span>
                            <Badge
                              className={`text-[9px] py-0 px-1.5 font-bold ${
                                status === "overstay"
                                  ? "bg-red-600 text-white animate-pulse"
                                  : status === "occupied"
                                  ? "bg-[#e11d48] text-white"
                                  : "bg-[#2563eb] text-white"
                              }`}
                            >
                              {status === "overstay" ? "Overstay" : status === "occupied" ? "Checked In" : "Advance"}
                            </Badge>
                          </div>
                          <div className="text-[10px] opacity-75 font-mono flex items-center gap-2">
                            <span>{booking.startDate} → {booking.endDate}</span>
                            <span>•</span>
                            <span className="font-bold text-emerald-600">₹{booking.advancePaid} Paid</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 text-[11px] opacity-60 font-semibold italic text-emerald-700 dark:text-emerald-400">
                          ✓ Available for reservation
                        </div>
                      )}

                      <div className="flex items-center gap-2 shrink-0">
                        {booking ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedBooking(booking)}
                            className="h-7 px-2 text-xs font-bold rounded-xl border-[#afd9c3] hover:bg-[#d6fce2]/40"
                          >
                            Details
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleOpenNewBooking(room.number)}
                            className="h-7 px-2.5 text-xs font-bold rounded-xl bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db] flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Book Room
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* 1. UPCOMING ARRIVALS REMINDER POPUP */}
        {isReminderOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className={`p-6 rounded-3xl border shadow-2xl max-w-2xl w-full space-y-4 max-h-[85vh] flex flex-col ${darkMode ? "bg-[#2d2a26] border-[#403d38] text-[#e5e2db]" : "bg-white border-[#afd9c3] text-[#403d38]"}`}>
              <div className="flex items-center justify-between pb-3 border-b border-[#afd9c3]/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Advance Arrival Call Reminders</h3>
                    <p className="text-[11px] opacity-70">Confirm upcoming guest arrivals and manage reservations.</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setIsReminderOpen(false)} className="h-7 w-7 rounded-lg">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 [scrollbar-width:none]">
                {upcomingArrivals.length === 0 ? (
                  <div className="text-center py-12 opacity-50 text-xs font-semibold">No advance reservations scheduled.</div>
                ) : (
                  upcomingArrivals.map((arr, idx) => (
                    <div key={`rem-arr-${idx}`} className="p-4 rounded-2xl border border-[#afd9c3]/60 bg-[#e5e2db]/25 dark:bg-[#1f1d1a] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm">{arr.guestName}</span>
                            <Badge className="bg-[#2563eb] text-white text-[10px] font-bold">
                              {arr.roomNumbers.length} Rooms
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs font-mono font-bold text-emerald-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{arr.phone}</span>
                            <span className="opacity-40">•</span>
                            <span>₹{arr.advancePaid} Advance Paid</span>
                          </div>
                        </div>
                        <a
                          href={`tel:${arr.phone}`}
                          className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs shrink-0"
                        >
                          <PhoneCall className="w-3.5 h-3.5" /> Call Customer
                        </a>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#2d2a26] border border-[#afd9c3]/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold opacity-60">Reserved Rooms:</span>
                          <div className="flex items-center gap-1">
                            {arr.roomNumbers.map((rNo: string, rIdx: number) => (
                              <span key={`rem-r-${rNo}-${rIdx}`} className="font-mono font-bold px-2 py-0.5 rounded-md bg-[#d6fce2] text-[#403d38] border border-[#afd9c3] text-[11px]">
                                Room {rNo}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] opacity-80">
                          <CalendarClock className="w-3.5 h-3.5 opacity-60" />
                          <span>Check-In: {arr.startDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelGroupedBooking(arr.ids, arr.guestName)}
                          className="h-7 px-2.5 text-xs text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Cancel Booking
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. BOOKING DETAIL MODAL */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className={`p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-4 ${darkMode ? "bg-[#2d2a26] border-[#403d38] text-[#e5e2db]" : "bg-white border-[#afd9c3] text-[#403d38]"}`}>
              <div className="flex items-center justify-between pb-3 border-b border-[#afd9c3]/40">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-[#d6fce2] text-[#403d38] border border-[#afd9c3]">
                    Room {selectedBooking.roomNumber}
                  </span>
                  <Badge className={`font-bold text-xs ${selectedBooking.status === "occupied" ? "bg-[#e11d48] text-white" : "bg-[#2563eb] text-white"}`}>
                    {selectedBooking.status === "occupied" ? "Current Stay" : "Advance Confirmed"}
                  </Badge>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setSelectedBooking(null)} className="h-7 w-7 rounded-lg">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase opacity-60">Guest Name</label>
                  <div className="text-base font-extrabold">{selectedBooking.guestName}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase opacity-60">Contact Phone</label>
                    <div className="font-mono font-bold">{selectedBooking.phone}</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase opacity-60">Advance Payment</label>
                    <div className="font-mono font-bold text-emerald-600 text-sm">₹{selectedBooking.advancePaid}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-[#1f1d1a] border border-[#afd9c3]/50">
                  <div>
                    <label className="text-[10px] font-bold opacity-60">Check-In Date</label>
                    <div className="font-mono font-bold">{selectedBooking.startDate}</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold opacity-60">Scheduled Check-Out</label>
                    <div className="font-mono font-bold">{selectedBooking.endDate}</div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <Button
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    className="rounded-xl h-10 px-4 text-xs font-bold bg-red-100 hover:bg-red-200 text-red-600 border border-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Cancel Booking
                  </Button>
                  <Button
                    onClick={() => setSelectedBooking(null)}
                    className="rounded-xl h-10 px-5 text-xs font-bold bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db]"
                  >
                    Close Window
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. NEW ADVANCE BOOKING MODAL */}
        {isNewBookingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className={`p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-3.5 ${darkMode ? "bg-[#2d2a26] border-[#403d38] text-[#e5e2db]" : "bg-white border-[#afd9c3] text-[#403d38]"}`}>
              <div className="flex items-center justify-between pb-3 border-b border-[#afd9c3]/40">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-[#2b6a48] dark:text-[#afd9c3]" />
                  <h3 className="font-extrabold text-base">Book Room {targetRoomNo}</h3>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setIsNewBookingOpen(false)} className="h-7 w-7 rounded-lg">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/50 border border-red-300 text-red-600 text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Guest Full Name *</label>
                  <Input
                    placeholder="e.g. Anand Kumar"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    className="h-9 text-xs rounded-xl border-[#afd9c3]"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Mobile Contact *</label>
                  <Input
                    placeholder="+91 9876543210"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    className="h-9 text-xs rounded-xl font-mono border-[#afd9c3]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold block mb-1">Check-In Date *</label>
                    <Input
                      type="date"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="h-9 text-xs rounded-xl font-mono border-[#afd9c3]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Check-Out Date *</label>
                    <Input
                      type="date"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="h-9 text-xs rounded-xl font-mono border-[#afd9c3]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold block mb-1">Advance Received (₹)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newAdvancePaid}
                      onChange={(e) => setNewAdvancePaid(e.target.value ? Number(e.target.value) : "")}
                      className="h-9 text-xs rounded-xl font-mono border-[#afd9c3]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Reservation Type</label>
                    <select
                      value={newBookingType}
                      onChange={(e) => setNewBookingType(e.target.value as any)}
                      className="h-9 w-full rounded-xl border border-[#afd9c3] px-2 text-xs font-semibold bg-transparent"
                    >
                      <option value="advance">Advance Booking (Future)</option>
                      <option value="occupied">Live Check-In (Today)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleSaveBooking}
                    className="w-full h-11 rounded-2xl font-bold text-xs bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db] flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#d6fce2]" /> Confirm & Reserve Room
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. INSTANT ADVANCE RESERVATION POPUP FROM AI MAGIC SCANNER */}
        <Dialog open={!!selectedRoomToBook} onOpenChange={(open) => !open && setSelectedRoomToBook(null)}>
          <DialogContent
            showCloseButton={false}
            className="w-[90vw] max-w-md rounded-3xl border border-[#afd9c3] p-6 bg-white dark:bg-[#1f1d1a] shadow-2xl text-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#afd9c3]/40">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#2b6a48] dark:text-[#afd9c3]" />
                <h4 className="font-extrabold text-base">Instant Advance Reservation</h4>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedRoomToBook(null)} className="h-7 text-xs">
                Cancel
              </Button>
            </div>

            <div className="p-3 rounded-2xl bg-[#d6fce2]/25 border border-[#afd9c3] space-y-1">
              <div className="flex justify-between font-bold">
                <span>Selected: Room {selectedRoomToBook?.number}</span>
                <span className="font-mono text-emerald-700">₹{selectedRoomToBook?.price}/night</span>
              </div>
              <div className="text-[11px] opacity-75 font-mono">
                Dates: {magicCheckIn} → {magicCheckOut}
              </div>
              {selectedRoomToBook?.isAiRecommended && (
                <div className="text-[10px] font-black text-[#2b6a48] pt-0.5">
                  ★ AI Buffer Safe: Future dates me bhi room change ki zaroorat nahi padegi!
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold">Guest Full Name *</label>
                <Input
                  placeholder="e.g. Vikram Malhotra"
                  value={advGuestName}
                  onChange={(e) => setAdvGuestName(e.target.value)}
                  className="h-8.5 text-xs rounded-xl border-[#afd9c3]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Contact Mobile *</label>
                <Input
                  placeholder="e.g. 9876543210"
                  value={advGuestPhone}
                  onChange={(e) => setAdvGuestPhone(e.target.value)}
                  className="h-8.5 text-xs rounded-xl border-[#afd9c3]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Advance Token Received (₹)</label>
                <Input
                  type="number"
                  placeholder="500"
                  value={advPaymentAmount}
                  onChange={(e) => setAdvPaymentAmount(e.target.value ? Number(e.target.value) : "")}
                  className="h-8.5 text-xs font-mono font-bold rounded-xl border-[#afd9c3]"
                />
              </div>

              <Button
                onClick={handleConfirmAdvanceBooking}
                className="w-full h-10 rounded-2xl font-bold text-xs bg-[#2b6a48] hover:bg-[#23583c] text-white shadow-sm flex items-center justify-center gap-1.5 mt-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm & Lock Room in Calendar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </DialogContent>
    </Dialog>
  );
}