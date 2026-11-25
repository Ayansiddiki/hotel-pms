"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

// Reception Sub-Modals
import { CheckInModal } from "./CheckInModal";
import { ERegisterModal, type ERegisterEntry } from "./ERegisterModal";
import { RoomMatrixModal, type RoomItem } from "./RoomMatrixModal";
import { NotepadModal } from "./NotepadModal";
import { BookingCalendarModal } from "./BookingCalendarModal";
import { RoomOpsModal, type FoodBillItem } from "./RoomOpsModal";
import { NotificationsModal, type LiveRequestItem } from "./NotificationsModal";
import { FoodServicesModal } from "./FoodServicesModal";
import { QRCodeModal } from "./QRCodeModal";
import { ServicesSetupModal } from "./ServicesSetupModal";
import { VisitorsSecurityModal, type VisitorLogItem } from "./VisitorsSecurityModal";
import { AnalyticsDashboardModal } from "./AnalyticsDashboardModal";
import { FinanceDashboardModal } from "./FinanceDashboardModal";
import { CompanyMasterModal } from "./CompanyMasterModal";
import { CustomerMasterModal } from "./CustomerMasterModal";
import { ReportMasterModal } from "./ReportMasterModal";
import { BillMasterModal } from "./BillMasterModal";
import { LostAndFoundModal } from "./LostAndFoundModal";
import { HotelSettingsModal } from "./HotelSettingsModal";

// Icons
import {
  BedDouble,
  LogIn,
  LogOut,
  Building2,
  Calendar,
  Bell,
  ConciergeBell,
  ShieldCheck,
  UtensilsCrossed,
  Shirt,
  QrCode,
  BookOpen,
  FileEdit,
  LayoutGrid,
  Sun,
  Moon,
  PieChart,
  Plus,
  BarChart3,
  Wallet,
  Settings,
  Users,
  FileText,
  Receipt,
  PackageSearch,
} from "lucide-react";

// TYPE-SAFE EXTENDED ROOM INTERFACE
export interface ExtendedRoomItem extends RoomItem {
  foodOrders?: FoodBillItem[];
  currentPasscode?: string;
}

// 4 MAIN DOCK MODULES (Most frequently used)
const MAIN_DOCK_MODULES = [
  { id: "live_notifications", label: "Live Queue Alerts", icon: Bell },
  { id: "visitors_security", label: "Visitors Security", icon: ShieldCheck },
  { id: "e_register", label: "E-Register", icon: BookOpen },
  { id: "notepad", label: "Note Pad", icon: FileEdit },
];

// ALL MODULES (Available inside the Drawer)
const ALL_MODULES = [
  { id: "rooms", label: "Rooms Matrix", icon: BedDouble },
  { id: "booking_calendar", label: "Booking Calendar", icon: Calendar },
  { id: "food_services", label: "Food Menu Setup", icon: UtensilsCrossed },
  { id: "services", label: "Services Setup", icon: ConciergeBell },
  { id: "qr_code", label: "Room QR Standees", icon: QrCode },
  { id: "company_master", label: "Company Master", icon: Building2 },
  { id: "customer_master", label: "Customer Master", icon: Users },
  { id: "report_master", label: "Report Master", icon: FileText },
  { id: "bill_master", label: "Bill Master", icon: Receipt },
  { id: "lost_and_found", label: "Lost & Found", icon: PackageSearch },
  { id: "visitors_security", label: "Visitors Security", icon: ShieldCheck },
  { id: "e_register", label: "E-Register", icon: BookOpen },
  { id: "notepad", label: "Note Pad", icon: FileEdit },
  { id: "live_notifications", label: "Live Queue", icon: Bell },
  { id: "analytics", label: "Executive Analytics", icon: BarChart3 },
  { id: "finance", label: "Finance & Vault", icon: Wallet },
  { id: "settings", label: "Hotel Settings", icon: Settings },
];

const CURRENT_HOTEL = {
  tenantId: "DEL-GRAND-101",
  name: "Grand Palace Hotel",
  plan: "Pro Enterprise",
};

export default function ReceptionDashboard() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [rooms, setRooms] = useState<ExtendedRoomItem[]>([]);
  const [eRegisterEntries, setERegisterEntries] = useState<ERegisterEntry[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // Live Guest Status Map State (Room In, Room Out, DND sync)
  const [guestStatusMap, setGuestStatusMap] = useState<{ [roomNo: string]: string }>({});

  // Modals Visibility States
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isERegisterOpen, setIsERegisterOpen] = useState(false);
  const [isRoomMatrixOpen, setIsRoomMatrixOpen] = useState(false);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMoreAppsOpen, setIsMoreAppsOpen] = useState(false);
  const [isFoodServicesOpen, setIsFoodServicesOpen] = useState(false);
  const [isServicesSetupOpen, setIsServicesSetupOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isVisitorsOpen, setIsVisitorsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [isCompanyMasterOpen, setIsCompanyMasterOpen] = useState(false);
  const [isCustomerMasterOpen, setIsCustomerMasterOpen] = useState(false);
  const [isReportMasterOpen, setIsReportMasterOpen] = useState(false);
  const [isBillMasterOpen, setIsBillMasterOpen] = useState(false);
  const [isLostAndFoundOpen, setIsLostAndFoundOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [opsRoom, setOpsRoom] = useState<ExtendedRoomItem | null>(null);
  const [isOpsOpen, setIsOpsOpen] = useState(false);

  // Live Orders & Service Requests Queue
  const [liveRequests, setLiveRequests] = useState<LiveRequestItem[]>([]);

  // Sound Chime Alert using Web Audio API
  const playAlertChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.error("Audio chime error", e);
    }
  };

  useEffect(() => {
    setHasMounted(true);

    try {
      const savedRooms = localStorage.getItem("hotel_pms_rooms");
      if (savedRooms) setRooms(JSON.parse(savedRooms));

      const savedEntries = localStorage.getItem("hotel_pms_eregister");
      if (savedEntries) setERegisterEntries(JSON.parse(savedEntries));

      const savedQueue = localStorage.getItem("hotel_pms_live_requests");
      if (savedQueue) setLiveRequests(JSON.parse(savedQueue));

      const savedStatuses = localStorage.getItem("hotel_pms_guest_statuses");
      if (savedStatuses) setGuestStatusMap(JSON.parse(savedStatuses));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Polling listener for live guest orders, status sync, and audio chime
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== "undefined") {
        const chimeTrigger = localStorage.getItem("hotel_pms_play_chime");
        if (chimeTrigger) {
          playAlertChime();
          localStorage.removeItem("hotel_pms_play_chime");
        }

        const savedQueue = localStorage.getItem("hotel_pms_live_requests");
        if (savedQueue) {
          setLiveRequests(JSON.parse(savedQueue));
        }

        const savedEntries = localStorage.getItem("hotel_pms_eregister");
        if (savedEntries) {
          setERegisterEntries(JSON.parse(savedEntries));
        }

        const savedStatuses = localStorage.getItem("hotel_pms_guest_statuses");
        if (savedStatuses) {
          try {
            setGuestStatusMap(JSON.parse(savedStatuses));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem("hotel_pms_rooms", JSON.stringify(rooms));
    }
  }, [rooms, hasMounted]);

  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem("hotel_pms_eregister", JSON.stringify(eRegisterEntries));
    }
  }, [eRegisterEntries, hasMounted]);

  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem("hotel_pms_live_requests", JSON.stringify(liveRequests));
    }
  }, [liveRequests, hasMounted]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/hotel-login");
  };

  const handleOpenCheckIn = (roomId?: string) => {
    if (rooms.length === 0) {
      alert("Pehle 'Rooms Matrix' me jaakar kamre add karein!");
      setIsRoomMatrixOpen(true);
      return;
    }
    const targetRoomId = roomId || rooms.find((r) => r.status === "available")?.id || rooms[0].id;
    setSelectedRoom(targetRoomId);
    setIsCheckInOpen(true);
  };

  const handleRoomCardClick = (room: ExtendedRoomItem) => {
    if (room.status === "available") {
      handleOpenCheckIn(room.id);
    } else {
      setOpsRoom(room);
      setIsOpsOpen(true);
    }
  };

  const handleConfirmCheckIn = (bookingData: any) => {
    const allocatedRoomNumbers: string[] =
      bookingData.roomNumbers && bookingData.roomNumbers.length > 0
        ? bookingData.roomNumbers
        : selectedRoom
        ? [rooms.find((r) => r.id === selectedRoom)?.number || "101"]
        : ["101"];

    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();

    setRooms((prev) =>
      prev.map((room) =>
        allocatedRoomNumbers.includes(room.number)
          ? {
              ...room,
              status: "occupied",
              guest: bookingData.fullName,
              currentPasscode: generatedPin,
            }
          : room
      )
    );

    const newEntries: ERegisterEntry[] = [];
    const newCalendarBookings: any[] = [];

    const rawCheckIn = bookingData.checkInDateTime ? bookingData.checkInDateTime.split(" ")[0] : "2026-09-29";
    const rawCheckOut =
      bookingData.checkOutDateTime && bookingData.checkOutDateTime !== "Not specified"
        ? bookingData.checkOutDateTime.split(" ")[0]
        : "2026-09-30";

    allocatedRoomNumbers.forEach((rNo, idx) => {
      const entryId = `REG-${String(eRegisterEntries.length + 1 + idx).padStart(3, "0")}`;
      const roomAdvance = idx === 0 ? Number(bookingData.advancePayment) || 0 : 0;

      newEntries.push({
        id: entryId,
        roomNo: rNo,
        fullName: bookingData.fullName,
        mobile: bookingData.mobile,
        address: bookingData.address,
        city: bookingData.city || "N/A",
        stateName: bookingData.stateName,
        email: bookingData.email,
        idType: bookingData.idType,
        idNumber: bookingData.idNumber || "N/A",
        idDocFileName: bookingData.idDocFileName,
        companyName: bookingData.companyName,
        guestGstin: bookingData.guestGstin,
        checkInDateTime: bookingData.checkInDateTime || new Date().toLocaleString(),
        checkOutDateTime: "Pending",
        adults: bookingData.adults,
        kids: bookingData.kids,
        advancePayment: roomAdvance,
        arrivalMode: bookingData.arrivalMode,
        purposeOfVisit: bookingData.purposeOfVisit,
        bookedVia: bookingData.referredCompanyBy || "Direct Walk-in",
        visitorsCount: 0,
        visitorNames: "None",
        ...bookingData,
      });

      newCalendarBookings.push({
        id: `BK-${Date.now()}-${rNo}`,
        roomNumber: rNo,
        guestName: bookingData.fullName,
        phone: bookingData.mobile,
        startDate: rawCheckIn,
        endDate: rawCheckOut,
        status: "occupied",
        advancePaid: roomAdvance,
        totalAmount: bookingData.finalAmount || 1500,
        notes: allocatedRoomNumbers.length > 1 ? `Group Booking (${allocatedRoomNumbers.join(", ")})` : "Direct Check-In",
      });
    });

    setERegisterEntries((prev) => [...newEntries, ...prev]);

    try {
      const savedCal = localStorage.getItem("hotel_pms_bookings");
      const currentCal = savedCal ? JSON.parse(savedCal) : [];
      const updatedCal = [...newCalendarBookings, ...currentCal];
      localStorage.setItem("hotel_pms_bookings", JSON.stringify(updatedCal));
    } catch (e) {
      console.error(e);
    }

    setIsCheckInOpen(false);

    let cleanPhone = bookingData.mobile.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }

    const host = typeof window !== "undefined" ? window.location.host : "localhost:3000";
    const guestPortalUrl = `http://${host}/guest?room=${allocatedRoomNumbers[0]}`;

    const welcomeMsg = `🏨 *Welcome to ${CURRENT_HOTEL.name}!*

Dear *${bookingData.fullName}*,
Your check-in is confirmed:

🚪 *Room No:* ${allocatedRoomNumbers.join(", ")}
🔑 *Passcode PIN:* ${generatedPin}
📶 *Wi-Fi Network:* GrandPalace_Guest_WiFi
🔐 *Wi-Fi Password:* welcome@2026

📱 *In-Room Digital Service & Food Menu:*
${guestPortalUrl}`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(welcomeMsg)}`;
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(welcomeMsg)}`;

    if (confirm(`Check-in Confirm! Guest ko welcome message bhejte hain:\n\nPIN: ${generatedPin}\nRoom: ${allocatedRoomNumbers.join(", ")}\n\nClick OK for WhatsApp.`)) {
      window.open(whatsappUrl, "_blank");
    } else {
      window.open(smsUrl, "_blank");
    }
  };

  const handleMarkCleaned = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status: "available" } : r))
    );
  };

  const handleCheckOut = (roomId: string, totalBill: number) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return;

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    const realCheckOutDateTime = `${day}-${month}-${year} ${timeStr}`;

    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, status: "cleaning", guest: undefined, foodOrders: [], currentPasscode: undefined }
          : r
      )
    );

    setERegisterEntries((prev) =>
      prev.map((entry) =>
        entry.roomNo === targetRoom.number &&
        (!entry.checkOutDateTime || entry.checkOutDateTime === "Pending" || entry.checkOutDateTime === "Not specified" || entry.checkOutDateTime.includes("2026"))
          ? { ...entry, checkOutDateTime: realCheckOutDateTime }
          : entry
      )
    );

    try {
      const savedCal = localStorage.getItem("hotel_pms_bookings");
      if (savedCal) {
        const calList = JSON.parse(savedCal);
        const filteredCal = calList.filter((b: any) => !(b.roomNumber === targetRoom.number && b.status === "occupied"));
        localStorage.setItem("hotel_pms_bookings", JSON.stringify(filteredCal));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVoidBooking = (roomId: string) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return;

    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, status: "available", guest: undefined, foodOrders: [], currentPasscode: undefined }
          : r
      )
    );

    setERegisterEntries((prev) =>
      prev.map((entry) =>
        entry.roomNo === targetRoom.number &&
        (!entry.checkOutDateTime || entry.checkOutDateTime === "Pending" || entry.checkOutDateTime === "Not specified")
          ? { ...entry, checkOutDateTime: "Cancelled (Zero-Stay Void)", advancePayment: 0 }
          : entry
      )
    );

    try {
      const savedCal = localStorage.getItem("hotel_pms_bookings");
      if (savedCal) {
        const calList = JSON.parse(savedCal);
        const filteredCal = calList.filter((b: any) => !(b.roomNumber === targetRoom.number && b.status === "occupied"));
        localStorage.setItem("hotel_pms_bookings", JSON.stringify(filteredCal));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoomChange = (currentRoomId: string, newRoomId: string, reason: string) => {
    const sourceRoom = rooms.find((r) => r.id === currentRoomId);
    const newRoomObj = rooms.find((r) => r.id === newRoomId);
    if (!sourceRoom || !newRoomObj) return;

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === currentRoomId) {
          return { ...r, status: "cleaning", guest: undefined, foodOrders: [], currentPasscode: undefined };
        }
        if (r.id === newRoomId) {
          return {
            ...r,
            status: "occupied",
            guest: sourceRoom.guest,
            foodOrders: sourceRoom.foodOrders ?? [],
            currentPasscode: sourceRoom.currentPasscode,
          };
        }
        return r;
      })
    );

    if (sourceRoom.guest) {
      setERegisterEntries((prev) =>
        prev.map((entry) =>
          entry.fullName === sourceRoom.guest && entry.roomNo === sourceRoom.number
            ? { ...entry, roomNo: newRoomObj.number, purposeOfVisit: `${entry.purposeOfVisit} (Shifted: ${reason})` }
            : entry
        )
      );
    }
  };

  const handleUpdateFoodOrders = (roomId: string, items: FoodBillItem[]) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, foodOrders: items } : r))
    );
  };

  const handleUpdateRequestStatus = (id: string, status: LiveRequestItem["status"], reason?: string) => {
    setLiveRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          if (status === "accepted" && req.type === "food_order" && req.items) {
            setRooms((rPrev) =>
              rPrev.map((room) => {
                if (room.number === req.roomNo) {
                  return {
                    ...room,
                    foodOrders: [...(room.foodOrders || []), ...(req.items || [])],
                  };
                }
                return room;
              })
            );
          }
          return { ...req, status, rejectionReason: reason };
        }
        return req;
      })
    );
  };

  const handleClearCompletedRequests = () => {
    setLiveRequests((prev) => prev.filter((r) => r.status === "pending"));
  };

  const handleVisitorApproved = (roomNo: string, visitor: VisitorLogItem) => {
    setERegisterEntries((prev) =>
      prev.map((entry) => {
        if (entry.roomNo === roomNo) {
          const currentCount = Number(entry.visitorsCount) || 0;
          const prevNames = entry.visitorNames && entry.visitorNames !== "None" ? entry.visitorNames : "";
          const newNames = prevNames ? `${prevNames}, ${visitor.visitorName}` : visitor.visitorName;
          return {
            ...entry,
            visitorsCount: currentCount + 1,
            visitorNames: newNames,
          };
        }
        return entry;
      })
    );
  };

  // Central Router for Dock and Drawer clicks
  const handleFeatureClick = (featureId: string) => {
    if (featureId === "rooms") {
      setIsRoomMatrixOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "e_register") {
      setIsERegisterOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "visitors_security") {
      setIsVisitorsOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "notepad") {
      setIsNotepadOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "booking_calendar") {
      setIsCalendarOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "food_services") {
      setIsFoodServicesOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "services") {
      setIsServicesSetupOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "qr_code") {
      setIsQrModalOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "company_master") {
      setIsCompanyMasterOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "customer_master") {
      setIsCustomerMasterOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "report_master") {
      setIsReportMasterOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "bill_master") {
      setIsBillMasterOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "lost_and_found") {
      setIsLostAndFoundOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "live_notifications") {
      setIsNotificationsOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "analytics") {
      setIsAnalyticsOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "finance") {
      setIsFinanceOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }
    if (featureId === "settings") {
      setIsSettingsOpen(true);
      setIsMoreAppsOpen(false);
      return;
    }

    setIsMoreAppsOpen(false);
    alert(`Module ${featureId} is active.`);
  };

  const totalRooms = rooms.length;
  const availableCount = rooms.filter((r) => r.status === "available").length;
  const occupiedCount = rooms.filter((r) => r.status === "occupied").length;
  const cleaningCount = rooms.filter((r) => r.status === "cleaning").length;

  const circumference = 2 * Math.PI * 42;
  const availableDash = totalRooms > 0 ? (availableCount / totalRooms) * circumference : 0;
  const occupiedDash = totalRooms > 0 ? (occupiedCount / totalRooms) * circumference : 0;
  const cleaningDash = totalRooms > 0 ? (cleaningCount / totalRooms) * circumference : 0;

  const occupiedOffset = -availableDash;
  const cleaningOffset = -(availableDash + occupiedDash);

  const activeRoomObj = rooms.find((r) => r.id === selectedRoom);
  const pendingRequestsCount = liveRequests.filter((r) => r.status === "pending").length;

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[#e5e2db]/35 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-bold text-[#403d38]">
          <Building2 className="w-5 h-5 animate-pulse text-[#2b6a48]" />
          <span>Loading Reception Control...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 p-6 md:p-10 pl-20 sm:pl-28 font-sans tracking-tight ${
        darkMode ? "bg-[#1f1d1a] text-[#e5e2db]" : "bg-[#e5e2db]/35 text-[#403d38]"
      }`}
    >
      {/* FLOATING VERTICAL DOCK */}
      <aside
        className={`fixed left-3 sm:left-5 top-1/2 -translate-y-1/2 z-40 py-4 px-2 sm:px-2.5 rounded-3xl border shadow-2xl flex flex-col items-center gap-3 backdrop-blur-md transition-colors ${
          darkMode ? "bg-[#2d2a26]/95 border-[#403d38]" : "bg-white/95 border-[#afd9c3]"
        }`}
      >
        <div
          className={`p-2.5 rounded-2xl border mb-1 ${
            darkMode ? "bg-[#403d38] border-[#afd9c3]/30 text-[#d6fce2]" : "bg-[#d6fce2] border-[#afd9c3] text-[#403d38]"
          }`}
        >
          <Building2 className="w-5 h-5" />
        </div>

        <div className="w-8 h-[1px] bg-[#afd9c3]/50" />

        {MAIN_DOCK_MODULES.map((feat) => {
          const Icon = feat.icon;
          const isNotif = feat.id === "live_notifications";

          return (
            <button
              key={feat.id}
              onClick={() => handleFeatureClick(feat.id)}
              title={feat.label}
              className={`group relative flex items-center justify-center p-3 rounded-2xl transition-all border border-transparent ${
                darkMode
                  ? "hover:border-[#afd9c3]/40 hover:bg-[#403d38] text-[#e5e2db]"
                  : "hover:border-[#afd9c3] hover:bg-[#d6fce2]/40 text-[#403d38]"
              }`}
            >
              <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {isNotif && pendingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
              <span
                className={`absolute left-16 text-[11px] font-semibold px-2.5 py-1 rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${
                  darkMode ? "bg-[#e5e2db] text-[#403d38]" : "bg-[#403d38] text-[#e5e2db]"
                }`}
              >
                {feat.label}
              </span>
            </button>
          );
        })}

        <div className="w-8 h-[1px] bg-[#afd9c3]/50 my-0.5" />

        <button
          onClick={() => setIsMoreAppsOpen(true)}
          title="All Applications"
          className="group relative flex items-center justify-center p-3 rounded-2xl bg-[#403d38] text-[#e5e2db] hover:bg-[#403d38]/90 transition-all shadow-md"
        >
          <LayoutGrid className="w-5 h-5 text-[#e3cf92] group-hover:rotate-45 transition-transform" />
          <span
            className={`absolute left-16 text-[11px] font-semibold px-2.5 py-1 rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${
              darkMode ? "bg-[#e5e2db] text-[#403d38]" : "bg-[#403d38] text-[#e5e2db]"
            }`}
          >
            All Modules
          </span>
        </button>
      </aside>

      {/* MAIN DASHBOARD */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div
          className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-3xl border shadow-sm transition-colors ${
            darkMode ? "bg-[#2d2a26] border-[#403d38]" : "bg-white border-[#afd9c3]/50"
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                  darkMode ? "bg-[#403d38] text-[#d6fce2] border-[#afd9c3]/40" : "bg-[#d6fce2] text-[#403d38] border-[#afd9c3]"
                }`}
              >
                {CURRENT_HOTEL.tenantId}
              </span>
              <Badge
                className={`font-bold text-xs border ${
                  darkMode ? "bg-[#d6fce2]/20 text-[#d6fce2] border-[#afd9c3]/40" : "bg-[#d6fce2] text-[#2b6a48] border-[#afd9c3]"
                }`}
              >
                ✓ {CURRENT_HOTEL.plan} (All Features Active)
              </Badge>
            </div>
            <h1 className={`text-2xl font-bold tracking-tight ${darkMode ? "text-[#e5e2db]" : "text-[#403d38]"}`}>
              {CURRENT_HOTEL.name} — Front Desk
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsCalendarOpen(true)}
              className="rounded-2xl px-3.5 py-2 text-xs font-bold border-[#afd9c3] hover:bg-[#d6fce2]/40 flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-[#2b6a48] dark:text-[#afd9c3]" /> Booking Calendar
            </Button>

            <Button
              variant="outline"
              onClick={() => setDarkMode(!darkMode)}
              className={`rounded-2xl border px-3.5 py-2 flex items-center gap-2 text-xs font-bold transition-all ${
                darkMode
                  ? "bg-[#403d38] text-[#e3cf92] border-[#e3cf92]/40 hover:bg-[#403d38]/80"
                  : "bg-[#e5e2db]/50 text-[#403d38] border-[#afd9c3] hover:bg-[#d6fce2]/40"
              }`}
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-[#e3cf92]" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#403d38]" /> Dark Mode
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
              className={`border font-semibold px-4 py-2 rounded-2xl flex items-center gap-1.5 transition-colors ${
                darkMode
                  ? "border-[#df918d]/60 text-[#df918d] hover:bg-[#df918d]/15"
                  : "border-[#df918d] text-[#403d38] hover:bg-[#df918d]/30"
              }`}
            >
              <LogOut className="w-4 h-4 text-[#df918d]" /> Logout
            </Button>
          </div>
        </div>

        {/* OCCUPANCY TRACKER */}
        <div
          className={`p-6 rounded-3xl border shadow-sm transition-colors ${
            darkMode ? "bg-[#2d2a26] border-[#403d38]" : "bg-white border-[#afd9c3]/50"
          }`}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <PieChart className="w-5 h-5 text-[#afd9c3]" />
                <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-[#e5e2db]/70" : "text-[#403d38]/70"}`}>
                  Real-time Occupancy Matrix
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  darkMode ? "bg-[#d6fce2]/15 text-[#d6fce2] border-[#afd9c3]/30" : "bg-[#d6fce2]/30 text-[#2b6a48] border-[#afd9c3]/50"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 animate-pulse ${darkMode ? "bg-[#d6fce2]" : "bg-[#2b6a48]"}`} />
                  Live Sync
                </span>
              </div>
              <h2 className={`text-xl font-bold ${darkMode ? "text-[#e5e2db]" : "text-[#403d38]"}`}>
                Room Inventory & Housekeeping Status
              </h2>
            </div>

            <div className="relative flex items-center justify-center w-36 h-36 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className={darkMode ? "stroke-[#403d38]" : "stroke-[#e5e2db]"} strokeWidth="11" fill="transparent" />
                <circle cx="50" cy="50" r="42" stroke="#afd9c3" strokeWidth="11" fill="transparent" strokeDasharray={`${availableDash} ${circumference}`} strokeLinecap="round" />
                <circle cx="50" cy="50" r="42" stroke="#df918d" strokeWidth="11" fill="transparent" strokeDasharray={`${occupiedDash} ${circumference}`} strokeDashoffset={occupiedOffset} strokeLinecap="round" />
                <circle cx="50" cy="50" r="42" stroke="#e3cf92" strokeWidth="11" fill="transparent" strokeDasharray={`${cleaningDash} ${circumference}`} strokeDashoffset={cleaningOffset} strokeLinecap="round" />
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-2xl font-black ${darkMode ? "text-[#e5e2db]" : "text-[#403d38]"}`}>{totalRooms}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-[#e5e2db]/60" : "text-[#403d38]/60"}`}>Total</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
              <div className={`p-3.5 rounded-2xl border text-center min-w-[100px] ${darkMode ? "bg-[#1f1d1a] border-[#afd9c3]/30" : "bg-[#d6fce2]/25 border-[#afd9c3]"}`}>
                <div className={`flex items-center justify-center gap-1.5 text-xs font-bold ${darkMode ? "text-[#d6fce2]" : "text-[#2b6a48]"}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#afd9c3]" /> Available
                </div>
                <div className={`text-2xl font-black mt-1 ${darkMode ? "text-[#e5e2db]" : "text-[#403d38]"}`}>{availableCount}</div>
              </div>

              <div className={`p-3.5 rounded-2xl border text-center min-w-[100px] ${darkMode ? "bg-[#1f1d1a] border-[#df918d]/30" : "bg-[#df918d]/15 border-[#df918d]/40"}`}>
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#df918d]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#df918d]" /> Occupied
                </div>
                <div className="text-2xl font-black mt-1 text-[#df918d]">{occupiedCount}</div>
              </div>

              <div className={`p-3.5 rounded-2xl border text-center min-w-[100px] ${darkMode ? "bg-[#1f1d1a] border-[#e3cf92]/30" : "bg-[#e3cf92]/20 border-[#e3cf92]"}`}>
                <div className={`flex items-center justify-center gap-1.5 text-xs font-bold ${darkMode ? "text-[#e3cf92]" : "text-[#94772d]"}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e3cf92]" /> Cleaning
                </div>
                <div className={`text-2xl font-black mt-1 ${darkMode ? "text-[#e5e2db]" : "text-[#403d38]"}`}>{cleaningCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* LIVE ROOM GRID */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${darkMode ? "text-[#e5e2db]" : "text-[#403d38]"}`}>
              <BedDouble className="w-4 h-4" /> Live Front-Desk Room Matrix
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRoomMatrixOpen(true)}
              className="text-xs font-bold rounded-xl border-[#afd9c3] hover:bg-[#d6fce2]/40"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add / Configure Rooms
            </Button>
          </div>

          {rooms.length === 0 ? (
            <div className={`p-12 rounded-3xl border-2 border-dashed text-center space-y-3 ${darkMode ? "border-[#403d38] bg-[#2d2a26]/40" : "border-[#afd9c3]/70 bg-white/50"}`}>
              <div className="w-12 h-12 rounded-2xl bg-[#d6fce2] text-[#403d38] border border-[#afd9c3] flex items-center justify-center mx-auto">
                <BedDouble className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">No Rooms Configured Yet</h3>
              <Button
                onClick={() => setIsRoomMatrixOpen(true)}
                className="bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db] rounded-2xl font-bold text-xs px-5 py-2"
              >
                <Plus className="w-4 h-4 mr-1.5 text-[#d6fce2]" /> Setup Hotel Rooms Now
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {rooms.map((room) => {
                const liveStatus = guestStatusMap[room.number] || "Room In";

                return (
                  <Card
                    key={room.id}
                    onClick={() => handleRoomCardClick(room)}
                    className={`transition-all border-2 rounded-3xl cursor-pointer hover:shadow-md ${
                      darkMode
                        ? room.status === "available"
                          ? "border-[#afd9c3]/40 bg-[#2d2a26]"
                          : room.status === "occupied"
                          ? "border-[#df918d]/40 bg-[#2d2a26]"
                          : "border-[#e3cf92]/40 bg-[#2d2a26]"
                        : room.status === "available"
                        ? "border-[#afd9c3] bg-white hover:border-[#2b6a48]"
                        : room.status === "occupied"
                        ? "border-[#df918d]/70 bg-[#df918d]/10 hover:border-[#df918d]"
                        : "border-[#e3cf92] bg-[#e3cf92]/15 hover:border-[#94772d]"
                    }`}
                  >
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="flex items-center gap-2">
                        <BedDouble className={`w-5 h-5 ${darkMode ? "text-[#afd9c3]" : "text-[#403d38]"}`} />
                        <CardTitle className={`text-xl font-bold ${darkMode ? "text-[#e5e2db]" : "text-[#403d38]"}`}>
                          Room {room.number}
                        </CardTitle>
                      </div>
                      <Badge
                        className={`font-bold text-xs ${
                          room.status === "available"
                            ? darkMode
                              ? "bg-[#d6fce2]/20 text-[#d6fce2] border border-[#afd9c3]/50"
                              : "bg-[#d6fce2] text-[#403d38] border border-[#afd9c3]"
                            : room.status === "occupied"
                            ? "bg-[#df918d] text-white"
                            : darkMode
                            ? "bg-[#e3cf92]/20 text-[#e3cf92] border border-[#e3cf92]/50"
                            : "bg-[#e3cf92] text-[#403d38]"
                        }`}
                      >
                        {room.status.toUpperCase()}
                      </Badge>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-1">
                      <div>
                        <div className={`text-xs font-semibold ${darkMode ? "text-[#e5e2db]/70" : "text-[#403d38]/70"}`}>
                          {room.type}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-base font-bold ${darkMode ? "text-[#e5e2db]" : "text-[#403d38]"}`}>
                            ₹{room.price} / night
                          </span>
                        </div>
                      </div>

                      {room.status === "occupied" ? (
                        <div
                          className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                            darkMode ? "bg-[#1f1d1a] border-[#df918d]/40" : "bg-white border-[#df918d]/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`block font-medium ${darkMode ? "text-[#e5e2db]/60" : "text-[#403d38]/60"}`}>
                              Guest:
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                liveStatus === "Do Not Disturb"
                                  ? "bg-red-100 text-red-700 border border-red-300"
                                  : liveStatus === "Room Out"
                                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                                  : "bg-emerald-100 text-emerald-700 border border-emerald-300"
                              }`}
                            >
                              {liveStatus}
                            </span>
                          </div>
                          <span className={`font-bold text-sm block ${darkMode ? "text-[#e5e2db]" : "text-[#403d38]"}`}>
                            {room.guest}
                          </span>
                        </div>
                      ) : (
                        <div className={`h-[46px] flex items-center text-xs font-medium ${darkMode ? "text-[#e5e2db]/60" : "text-[#403d38]/60"}`}>
                          {room.status === "cleaning" ? "Housekeeping in progress" : "Ready for next check-in"}
                        </div>
                      )}

                      {room.status === "available" && (
                        <Button
                          className={`w-full rounded-xl font-bold transition-all shadow-sm ${
                            darkMode
                              ? "bg-[#d6fce2] text-[#1f1d1a] hover:bg-[#afd9c3]"
                              : "bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db]"
                          }`}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCheckIn(room.id);
                          }}
                        >
                          <LogIn className={`w-3.5 h-3.5 mr-1.5 ${darkMode ? "text-[#1f1d1a]" : "text-[#d6fce2]"}`} />
                          Check In
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* SUB-MODALS */}
        <CheckInModal
          isOpen={isCheckInOpen}
          onClose={() => setIsCheckInOpen(false)}
          activeRoom={activeRoomObj || null}
          allRooms={rooms}
          onConfirm={handleConfirmCheckIn}
          darkMode={darkMode}
        />

        <RoomOpsModal
          isOpen={isOpsOpen}
          onClose={() => setIsOpsOpen(false)}
          room={opsRoom}
          guestEntry={eRegisterEntries.find((e) => e.roomNo === opsRoom?.number) || null}
          availableRooms={rooms}
          onMarkCleaned={handleMarkCleaned}
          onCheckOut={handleCheckOut}
          onRoomChange={handleRoomChange}
          onUpdateFoodOrders={handleUpdateFoodOrders}
          onVoidBooking={handleVoidBooking}
          darkMode={darkMode}
        />

        <VisitorsSecurityModal
          isOpen={isVisitorsOpen}
          onClose={() => setIsVisitorsOpen(false)}
          rooms={rooms}
          onVisitorApproved={handleVisitorApproved}
          darkMode={darkMode}
        />

        <ServicesSetupModal
          isOpen={isServicesSetupOpen}
          onClose={() => setIsServicesSetupOpen(false)}
          darkMode={darkMode}
        />

        <FoodServicesModal
          isOpen={isFoodServicesOpen}
          onClose={() => setIsFoodServicesOpen(false)}
          darkMode={darkMode}
        />

        <QRCodeModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          rooms={rooms}
          hotelName={CURRENT_HOTEL.name}
          darkMode={darkMode}
        />

        <ERegisterModal
          isOpen={isERegisterOpen}
          onClose={() => setIsERegisterOpen(false)}
          entries={eRegisterEntries}
          darkMode={darkMode}
        />

        <RoomMatrixModal
          isOpen={isRoomMatrixOpen}
          onClose={() => setIsRoomMatrixOpen(false)}
          rooms={rooms}
          setRooms={setRooms as any}
          darkMode={darkMode}
        />

        <NotepadModal
          isOpen={isNotepadOpen}
          onClose={() => setIsNotepadOpen(false)}
          darkMode={darkMode}
        />

        <BookingCalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          rooms={rooms}
          darkMode={darkMode}
        />

        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          requests={liveRequests}
          onUpdateStatus={handleUpdateRequestStatus}
          onClearAll={handleClearCompletedRequests}
          darkMode={darkMode}
        />

        <AnalyticsDashboardModal
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
          rooms={rooms}
          entries={eRegisterEntries}
          darkMode={darkMode}
        />

        <FinanceDashboardModal
          isOpen={isFinanceOpen}
          onClose={() => setIsFinanceOpen(false)}
          entries={eRegisterEntries}
          darkMode={darkMode}
        />

        {/* COMPANY MASTER MODAL */}
        <CompanyMasterModal
          isOpen={isCompanyMasterOpen}
          onClose={() => setIsCompanyMasterOpen(false)}
          darkMode={darkMode}
        />

        {/* CUSTOMER MASTER MODAL */}
        <CustomerMasterModal
          isOpen={isCustomerMasterOpen}
          onClose={() => setIsCustomerMasterOpen(false)}
          darkMode={darkMode}
        />

        {/* REPORT MASTER MODAL */}
        <ReportMasterModal
          isOpen={isReportMasterOpen}
          onClose={() => setIsReportMasterOpen(false)}
          darkMode={darkMode}
        />

        {/* BILL MASTER MODAL */}
        <BillMasterModal
          isOpen={isBillMasterOpen}
          onClose={() => setIsBillMasterOpen(false)}
          darkMode={darkMode}
        />

        {/* LOST & FOUND MODAL */}
        <LostAndFoundModal
          isOpen={isLostAndFoundOpen}
          onClose={() => setIsLostAndFoundOpen(false)}
          darkMode={darkMode}
        />

        {/* HOTEL SETTINGS MODAL */}
        <HotelSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          darkMode={darkMode}
        />

        {/* ALL MODULES DRAWER */}
        <Dialog open={isMoreAppsOpen} onOpenChange={setIsMoreAppsOpen}>
          <DialogContent
            showCloseButton={false}
            className={`max-w-3xl rounded-3xl border p-6 sm:p-8 shadow-2xl ${
              darkMode ? "bg-[#2d2a26] border-[#403d38] text-[#e5e2db]" : "bg-white border-[#afd9c3] text-[#403d38]"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#e5e2db] dark:border-[#403d38]">
              <div className="text-xl font-bold flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#2b6a48] dark:text-[#afd9c3]" /> All Hotel Applications & Modules
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-4">
              {ALL_MODULES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <button
                    key={feat.id}
                    onClick={() => handleFeatureClick(feat.id)}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all text-center gap-2 ${
                      darkMode
                        ? "border-[#afd9c3]/50 bg-[#1f1d1a] text-[#e5e2db] hover:border-[#afd9c3]"
                        : "border-[#afd9c3] bg-white hover:bg-[#d6fce2]/20 text-[#403d38] shadow-sm"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl border ${
                        darkMode ? "bg-[#403d38] border-[#afd9c3]/40 text-[#d6fce2]" : "bg-[#d6fce2] border-[#afd9c3] text-[#403d38]"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className={`text-xs font-bold leading-tight mt-1 ${darkMode ? "text-[#e5e2db]" : "text-[#403d38]"}`}>
                      {feat.label}
                    </span>

                    <span className={`text-[9px] font-bold uppercase tracking-wider ${darkMode ? "text-[#d6fce2]" : "text-[#2b6a48]"}`}>
                      Active
                    </span>
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}