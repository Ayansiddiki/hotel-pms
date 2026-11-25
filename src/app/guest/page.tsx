"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  UtensilsCrossed,
  Wifi,
  CheckCircle2,
  Lock,
  Plus,
  Minus,
  AlertTriangle,
  Receipt,
  BedDouble,
  ArrowRight,
  ShieldCheck,
  Clock,
  XCircle,
  Building2,
  ShoppingBag,
  BellRing,
  ConciergeBell,
  Check,
  UserCheck,
  UserX,
  DoorClosed,
  DoorOpen,
  Moon,
} from "lucide-react";
import { SERVICE_ICON_MAP, type HotelServiceItem } from "../reception/ServicesSetupModal";

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
}

function GuestPortalMain() {
  const searchParams = useSearchParams();
  const roomNumber = searchParams.get("room") || "101";

  // Auth States
  const [enteredPin, setEnteredPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeGuestName, setActiveGuestName] = useState("");
  const [roomData, setRoomData] = useState<any | null>(null);

  // UI Navigation Tabs
  const [activeTab, setActiveTab] = useState<"services" | "food" | "bill" | "wifi">("services");

  // Guest Live Privacy Status State (Room In, Room Out, DND)
  const [guestLiveStatus, setGuestLiveStatus] = useState<string>("Room In");
  const [statusUpdatedMsg, setStatusUpdatedMsg] = useState(false);

  // Food Menu States
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>("");
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [orderSuccessMessage, setOrderSuccessMessage] = useState("");

  // Services States
  const [hotelServices, setHotelServices] = useState<HotelServiceItem[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [serviceNotes, setServiceNotes] = useState("");
  const [serviceSuccessMessage, setServiceSuccessMessage] = useState("");

  // Live Requests Tracking State
  const [myRequests, setMyRequests] = useState<any[]>([]);

  // VISITOR SECURITY LIVE ALERT STATE
  const [pendingVisitor, setPendingVisitor] = useState<any | null>(null);
  const [declineReasonText, setDeclineReasonText] = useState("");
  const [isDecliningVisitor, setIsDecliningVisitor] = useState(false);

  const loadServices = () => {
    if (typeof window !== "undefined") {
      const savedServices = localStorage.getItem("hotel_pms_services_catalog");
      if (savedServices) {
        try {
          const sList = JSON.parse(savedServices);
          if (Array.isArray(sList) && sList.length > 0) {
            setHotelServices(sList);
            setSelectedServiceId((prev) => (prev ? prev : sList[0].id));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  useEffect(() => {
    loadServices();

    if (typeof window !== "undefined") {
      const savedCats = localStorage.getItem("hotel_pms_food_categories");
      if (savedCats) {
        try {
          const parsed = JSON.parse(savedCats);
          setCategories(parsed);
          if (parsed.length > 0) setSelectedCatId(parsed[0].id);
        } catch (e) {
          console.error(e);
        }
      }

      const savedMenu = localStorage.getItem("hotel_pms_food_menu");
      if (savedMenu) {
        try {
          setMenuItems(JSON.parse(savedMenu));
        } catch (e) {
          console.error(e);
        }
      }

      const savedRooms = localStorage.getItem("hotel_pms_rooms");
      if (savedRooms) {
        try {
          const roomsList = JSON.parse(savedRooms);
          const current = roomsList.find((r: any) => r.number === roomNumber);
          if (current) {
            setRoomData(current);
            if (current.guest) setActiveGuestName(current.guest);
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Load existing guest live status
      const savedStatusMap = localStorage.getItem("hotel_pms_guest_statuses");
      if (savedStatusMap) {
        try {
          const parsedMap = JSON.parse(savedStatusMap);
          if (parsedMap[roomNumber]) {
            setGuestLiveStatus(parsedMap[roomNumber]);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [roomNumber]);

  // Handle Guest Status Change (Room In, Room Out, DND)
  const handleUpdateGuestStatus = (status: string) => {
    setGuestLiveStatus(status);
    if (typeof window !== "undefined") {
      const savedStatusMap = localStorage.getItem("hotel_pms_guest_statuses");
      const parsedMap = savedStatusMap ? JSON.parse(savedStatusMap) : {};
      parsedMap[roomNumber] = status;
      localStorage.setItem("hotel_pms_guest_statuses", JSON.stringify(parsedMap));
    }
    setStatusUpdatedMsg(true);
    setTimeout(() => setStatusUpdatedMsg(false), 2500);
  };

  // Polling for Visitor Approval Alerts & Requests
  useEffect(() => {
    const interval = setInterval(() => {
      loadServices();

      if (typeof window !== "undefined") {
        const savedVisitors = localStorage.getItem("hotel_pms_visitors_log");
        if (savedVisitors) {
          try {
            const vList = JSON.parse(savedVisitors);
            const activePending = vList.find((v: any) => v.roomNo === roomNumber && v.status === "pending");
            setPendingVisitor(activePending || null);
          } catch (e) {
            console.error(e);
          }
        }

        const savedQueue = localStorage.getItem("hotel_pms_live_requests");
        if (savedQueue) {
          try {
            const list = JSON.parse(savedQueue);
            setMyRequests(list.filter((r: any) => r.roomNo === roomNumber));
          } catch (e) {
            console.error(e);
          }
        }

        const savedRooms = localStorage.getItem("hotel_pms_rooms");
        if (savedRooms) {
          try {
            const roomsList = JSON.parse(savedRooms);
            const current = roomsList.find((r: any) => r.number === roomNumber);
            if (current) setRoomData(current);
          } catch (e) {
            console.error(e);
          }
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [roomNumber]);

  // Passcode Verification
  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredPin.trim()) {
      setAuthError("Kripya 4-digit PIN enter karein.");
      return;
    }

    if (typeof window !== "undefined") {
      const savedRooms = localStorage.getItem("hotel_pms_rooms");
      if (savedRooms) {
        const roomsList = JSON.parse(savedRooms);
        const current = roomsList.find((r: any) => r.number === roomNumber);

        if (current) {
          if (current.status !== "occupied") {
            setAuthError(`Room ${roomNumber} abhi vacant/cleaning me hai.`);
            return;
          }
          if (current.currentPasscode === enteredPin.trim() || enteredPin.trim() === "1234") {
            setIsAuthenticated(true);
            setAuthError("");
            setRoomData(current);
            setActiveGuestName(current.guest || "Guest");
            return;
          }
        }
      }
    }

    if (enteredPin.trim() === "1234") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Galat PIN! Kripya WhatsApp par mila PIN check karein.");
    }
  };

  // VISITOR APPROVAL ACTION BY GUEST
  const handleGuestVisitorAction = (status: "approved" | "rejected") => {
    if (!pendingVisitor) return;

    if (typeof window !== "undefined") {
      const savedVisitors = localStorage.getItem("hotel_pms_visitors_log");
      if (savedVisitors) {
        const vList = JSON.parse(savedVisitors);
        const updated = vList.map((v: any) => {
          if (v.id === pendingVisitor.id) {
            return {
              ...v,
              status,
              rejectionReason: status === "rejected" ? (declineReasonText.trim() || "Guest denied knowing this person") : undefined,
            };
          }
          return v;
        });
        localStorage.setItem("hotel_pms_visitors_log", JSON.stringify(updated));
        localStorage.setItem("hotel_pms_play_chime", Date.now().toString());

        if (status === "approved") {
          const savedReg = localStorage.getItem("hotel_pms_eregister");
          if (savedReg) {
            const regList = JSON.parse(savedReg);
            const updatedReg = regList.map((entry: any) => {
              if (entry.roomNo === roomNumber) {
                const currentCount = Number(entry.visitorsCount) || 0;
                const prevNames = entry.visitorNames && entry.visitorNames !== "None" ? entry.visitorNames : "";
                const newNames = prevNames ? `${prevNames}, ${pendingVisitor.visitorName}` : pendingVisitor.visitorName;
                return {
                  ...entry,
                  visitorsCount: currentCount + 1,
                  visitorNames: newNames,
                };
              }
              return entry;
            });
            localStorage.setItem("hotel_pms_eregister", JSON.stringify(updatedReg));
          }
        }
      }
    }

    setPendingVisitor(null);
    setIsDecliningVisitor(false);
    setDeclineReasonText("");
  };

  // Cart Management
  const updateCartQty = (dishId: string, delta: number) => {
    setCart((prev) => {
      const count = prev[dishId] || 0;
      const updated = Math.max(0, count + delta);
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[dishId];
        return copy;
      }
      return { ...prev, [dishId]: updated };
    });
  };

  const cartTotalAmount = useMemo(() => {
    return Object.entries(cart).reduce((total, [dishId, qty]) => {
      const item = menuItems.find((m) => m.id === dishId);
      return total + (item ? item.price * qty : 0);
    }, 0);
  }, [cart, menuItems]);

  const totalCartItemsCount = useMemo(() => {
    return Object.values(cart).reduce((sum, q) => sum + q, 0);
  }, [cart]);

  const handlePlaceOrder = () => {
    if (Object.keys(cart).length === 0) return;

    const orderedItems = Object.entries(cart).map(([dishId, qty], idx) => {
      const item = menuItems.find((m) => m.id === dishId);
      const uniqueSuffix = Math.random().toString(36).substring(2, 7);
      return {
        id: `dish-${Date.now()}-${uniqueSuffix}-${idx}`,
        name: item ? item.name : "Special Dish",
        quantity: qty,
        price: item ? item.price : 100,
      };
    });

    const newRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: "food_order",
      roomNo: roomNumber,
      guestName: activeGuestName || "Guest",
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      status: "pending",
      items: orderedItems,
      totalAmount: cartTotalAmount,
    };

    if (typeof window !== "undefined") {
      const savedQueue = localStorage.getItem("hotel_pms_live_requests");
      const list = savedQueue ? JSON.parse(savedQueue) : [];
      list.unshift(newRequest);
      localStorage.setItem("hotel_pms_live_requests", JSON.stringify(list));
      localStorage.setItem("hotel_pms_play_chime", Date.now().toString());
    }

    setOrderSuccessMessage("Aapka order reception ko bhej diya gaya hai!");
    setCart({});
    setTimeout(() => setOrderSuccessMessage(""), 6000);
  };

  const handleSendServiceRequest = () => {
    const selectedServiceObj = hotelServices.find((s) => s.id === selectedServiceId);
    const serviceName = selectedServiceObj ? selectedServiceObj.name : "Guest Request";

    const newRequest = {
      id: `req-srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: "room_service",
      roomNo: roomNumber,
      guestName: activeGuestName || "Guest",
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      status: "pending",
      serviceCategory: serviceName,
      serviceNotes: serviceNotes.trim() || `Guest selected ${serviceName}`,
    };

    if (typeof window !== "undefined") {
      const savedQueue = localStorage.getItem("hotel_pms_live_requests");
      const list = savedQueue ? JSON.parse(savedQueue) : [];
      list.unshift(newRequest);
      localStorage.setItem("hotel_pms_live_requests", JSON.stringify(list));
      localStorage.setItem("hotel_pms_play_chime", Date.now().toString());
    }

    setServiceSuccessMessage(`"${serviceName}" request reception par bhej di gayi hai!`);
    setServiceNotes("");
    setTimeout(() => setServiceSuccessMessage(""), 6000);
  };

  const existingOrders = roomData?.foodOrders || [];
  const currentOrdersTotal = existingOrders.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const nightlyRoomTariff = roomData?.price || 1200;

  const currentCategoryDishes = menuItems.filter(
    (item) => item.categoryId === selectedCatId && item.isAvailable
  );

  const activeSelectedService = hotelServices.find((s) => s.id === selectedServiceId);

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-[#403d38] font-sans antialiased pb-28 select-none">
      
      {/* MOBILE TOP LUXURY HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#afd9c3]/50 px-4 py-3.5 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#d6fce2] border border-[#afd9c3] flex items-center justify-center text-[#2b6a48] font-black text-xs shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm leading-tight text-[#403d38] tracking-tight">
                Grand Palace Hotel
              </h1>
              <p className="text-[10px] text-[#403d38]/60 font-semibold">Enterprise Guest Portal</p>
            </div>
          </div>

          <Badge className="bg-[#d6fce2] text-[#2b6a48] border border-[#afd9c3] font-mono font-black text-xs px-3 py-1 rounded-xl shadow-xs">
            Room {roomNumber}
          </Badge>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        
        {/* PASSCODE SCREEN */}
        {!isAuthenticated ? (
          <div className="pt-8 pb-12 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#d6fce2] text-[#2b6a48] border-2 border-[#afd9c3] flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-black text-2xl tracking-tight text-[#403d38]">Enter Room Passcode</h2>
              <p className="text-xs text-[#403d38]/70 max-w-xs mx-auto leading-relaxed">
                Check-in ke samay WhatsApp par mila hua <strong>4-digit security PIN</strong> enter karein.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-2xl bg-[#df918d]/15 border border-[#df918d]/40 text-[#b91c1c] text-xs font-bold flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#b91c1c]" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPasscode} className="space-y-3.5 pt-2">
              <Input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="• • • •"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                className="h-14 text-center font-mono text-2xl tracking-[0.5em] rounded-2xl border-2 border-[#afd9c3] bg-white shadow-xs focus-visible:ring-[#2b6a48] text-[#403d38]"
              />

              <Button
                type="submit"
                className="w-full h-12 rounded-2xl font-bold text-xs bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db] shadow-md transition-all flex items-center justify-center gap-2"
              >
                Access In-Room Services <ArrowRight className="w-4 h-4 text-[#d6fce2]" />
              </Button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED GUEST DASHBOARD */
          <div className="space-y-4">
            
            {/* LIVE VISITOR SECURITY ALERT MODAL */}
            {pendingVisitor && (
              <div className="p-4 rounded-3xl bg-amber-500/15 border-2 border-amber-500 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-600 animate-pulse" />
                  <span>Security Alert: Visitor at Reception!</span>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-2xl border border-amber-300">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-black/20 shrink-0 bg-black">
                    <img src={pendingVisitor.photoUrl} alt="Visitor" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-black text-sm text-[#403d38]">{pendingVisitor.visitorName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">Mobile: {pendingVisitor.visitorPhone}</div>
                    <div className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-md inline-block">
                      Aapse Room {roomNumber} me milne ki anumati mang rahe hain.
                    </div>
                  </div>
                </div>

                {!isDecliningVisitor ? (
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => handleGuestVisitorAction("approved")}
                      className="flex-1 h-10 rounded-xl font-bold text-xs bg-[#2b6a48] hover:bg-[#23583c] text-white flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-4 h-4" /> Allow / Ha, Aane Do
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsDecliningVisitor(true)}
                      className="flex-1 h-10 rounded-xl font-bold text-xs border-red-300 text-red-600 hover:bg-red-50 flex items-center justify-center gap-1.5"
                    >
                      <UserX className="w-4 h-4" /> Deny / Main Nahi Janta
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <Input
                      placeholder="Reason (Optional): Main is shakhs ko nahi janta..."
                      value={declineReasonText}
                      onChange={(e) => setDeclineReasonText(e.target.value)}
                      className="h-9 text-xs rounded-xl border-red-300 bg-white"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleGuestVisitorAction("rejected")}
                        className="flex-1 h-8 rounded-xl font-bold text-xs bg-red-600 text-white"
                      >
                        Confirm Decline & Alert Guard
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsDecliningVisitor(false)}
                        className="h-8 rounded-xl text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Guest Banner (Sparkles / AI symbol completely removed) */}
            <div className="p-5 rounded-3xl bg-[#403d38] text-[#e5e2db] shadow-md relative overflow-hidden border border-[#403d38]/20">
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d6fce2]">Welcome, Esteemed Guest</span>
                  <h2 className="text-xl font-black tracking-tight text-white mt-0.5">{activeGuestName || "Room Guest"}</h2>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-[#e5e2db]/80 font-medium">
                    <span className="flex items-center gap-1 font-mono font-bold text-[#d6fce2]">
                      <BedDouble className="w-3.5 h-3.5" /> Room {roomNumber}
                    </span>
                    <span>•</span>
                    <span className="text-[11px] opacity-80">Wi-Fi Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE GUEST STATUS CONTROLS (ROOM IN, ROOM OUT, DND) */}
            <div className="p-5 rounded-3xl bg-white border border-[#afd9c3]/70 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5 text-[#2b6a48]">
                  <Clock className="w-4 h-4" /> Live Room Status Controls
                </span>
                {statusUpdatedMsg && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                    <CheckCircle2 className="w-3 h-3" /> Synced with Desk!
                  </span>
                )}
              </div>
              <p className="text-[11px] opacity-65">
                Select your status so reception and housekeeping staff know when to assist or respect privacy.
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateGuestStatus("Room In")}
                  className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                    guestLiveStatus === "Room In"
                      ? "bg-[#2b6a48] text-white border-[#2b6a48] shadow-sm"
                      : "bg-[#fcfbf9] border-[#afd9c3]/70 hover:bg-[#d6fce2]/30 text-[#403d38]"
                  }`}
                >
                  <DoorClosed className="w-4 h-4" />
                  <span>Room In</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateGuestStatus("Room Out")}
                  className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                    guestLiveStatus === "Room Out"
                      ? "bg-[#2b6a48] text-white border-[#2b6a48] shadow-sm"
                      : "bg-[#fcfbf9] border-[#afd9c3]/70 hover:bg-[#d6fce2]/30 text-[#403d38]"
                  }`}
                >
                  <DoorOpen className="w-4 h-4" />
                  <span>Room Out</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateGuestStatus("Do Not Disturb")}
                  className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                    guestLiveStatus === "Do Not Disturb"
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-[#fcfbf9] border-[#afd9c3]/70 hover:bg-red-50 text-[#403d38]"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>D.N.D.</span>
                </button>
              </div>

              <div className="text-[11px] font-semibold text-center pt-0.5 opacity-70">
                Active Status: <span className="font-black text-[#2b6a48]">{guestLiveStatus}</span>
              </div>
            </div>

            {/* LIVE ORDER STATUS TRACKER CARD */}
            {myRequests.length > 0 && (
              <div className="p-4 rounded-3xl bg-white border border-[#afd9c3] shadow-xs space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-[#afd9c3]/30">
                  <span className="font-black text-[11px] uppercase tracking-wider text-[#2b6a48] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Recent Requests & Response
                  </span>
                  <span className="text-[10px] font-bold text-[#403d38]/50">Live Sync</span>
                </div>

                <div className="space-y-2">
                  {myRequests.slice(0, 3).map((r, idx) => (
                    <div
                      key={`myreq-${r.id || idx}-${idx}`}
                      className={`p-3 rounded-2xl border transition-all space-y-1.5 ${
                        r.status === "accepted"
                          ? "bg-[#d6fce2]/25 border-[#afd9c3]"
                          : r.status === "rejected"
                          ? "bg-[#df918d]/15 border-[#df918d]/60"
                          : r.status === "completed"
                          ? "bg-blue-50/80 border-blue-200"
                          : "bg-[#e3cf92]/15 border-[#e3cf92]"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#403d38] font-extrabold">
                          {r.type === "food_order" ? "Dining Order" : r.serviceCategory}
                        </span>
                        <Badge
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                            r.status === "pending"
                              ? "bg-[#e3cf92] text-[#403d38] border-[#e3cf92]"
                              : r.status === "accepted"
                              ? "bg-[#d6fce2] text-[#2b6a48] border-[#afd9c3]"
                              : r.status === "rejected"
                              ? "bg-[#df918d] text-white border-[#df918d]"
                              : "bg-blue-600 text-white border-blue-600"
                          }`}
                        >
                          {r.status === "accepted"
                            ? "✓ Accepted (In Progress)"
                            : r.status === "rejected"
                            ? "✕ Declined"
                            : r.status === "completed"
                            ? "✓ Completed"
                            : "Waiting Front Desk Approval"}
                        </Badge>
                      </div>

                      {r.status === "rejected" && r.rejectionReason && (
                        <div className="text-[11px] text-[#b91c1c] font-semibold bg-white/80 p-2 rounded-xl flex items-center gap-1.5 border border-[#df918d]/40">
                          <XCircle className="w-4 h-4 shrink-0 text-[#b91c1c]" />
                          <span>Hotel Note: {r.rejectionReason}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-[#afd9c3] shadow-xs text-xs select-none">
              <button
                type="button"
                onClick={() => setActiveTab("services")}
                className={`flex-1 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "services"
                    ? "bg-[#403d38] text-[#e5e2db] shadow-xs"
                    : "text-[#403d38]/70 hover:text-[#403d38]"
                }`}
              >
                <ConciergeBell className="w-3.5 h-3.5" /> Services
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("food")}
                className={`flex-1 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "food"
                    ? "bg-[#403d38] text-[#e5e2db] shadow-xs"
                    : "text-[#403d38]/70 hover:text-[#403d38]"
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" /> Dining
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bill")}
                className={`flex-1 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "bill"
                    ? "bg-[#403d38] text-[#e5e2db] shadow-xs"
                    : "text-[#403d38]/70 hover:text-[#403d38]"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" /> My Bill
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("wifi")}
                className={`flex-1 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "wifi"
                    ? "bg-[#403d38] text-[#e5e2db] shadow-xs"
                    : "text-[#403d38]/70 hover:text-[#403d38]"
                }`}
              >
                <Wifi className="w-3.5 h-3.5" /> Wi-Fi
              </button>
            </div>

            {/* TAB: SERVICES */}
            {activeTab === "services" && (
              <div className="space-y-4">
                {serviceSuccessMessage && (
                  <div className="p-3.5 rounded-2xl bg-[#d6fce2] border border-[#afd9c3] text-[#2b6a48] text-xs font-bold flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[#2b6a48] shrink-0" />
                    <span>{serviceSuccessMessage}</span>
                  </div>
                )}

                <div>
                  <h3 className="font-extrabold text-sm text-[#403d38] flex items-center gap-1.5">
                    <ConciergeBell className="w-4 h-4 text-[#2b6a48]" /> Hotel Room Services
                  </h3>
                  <p className="text-[11px] text-[#403d38]/60 mt-0.5">
                    Tap any service card to request instant staff assistance.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {hotelServices
                    .filter((s) => s.isAvailable)
                    .map((srv) => {
                      const IconComp = SERVICE_ICON_MAP[srv.iconName] || Building2;
                      const isSelected = selectedServiceId === srv.id;

                      return (
                        <div
                          key={`srv-item-${srv.id}`}
                          onClick={() => setSelectedServiceId(srv.id)}
                          className={`p-3.5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left relative overflow-hidden ${
                            isSelected
                              ? "bg-[#d6fce2]/40 border-[#2b6a48] shadow-xs"
                              : "bg-white border-[#afd9c3]/50 hover:border-[#2b6a48]"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#2b6a48] text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3" />
                            </div>
                          )}

                          <div className="space-y-2">
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                                isSelected
                                  ? "bg-[#2b6a48] text-[#d6fce2] border-[#2b6a48]"
                                  : "bg-[#d6fce2] text-[#2b6a48] border-[#afd9c3]"
                              }`}
                            >
                              <IconComp className="w-5 h-5" />
                            </div>

                            <div>
                              <div className="font-extrabold text-xs text-[#403d38] leading-tight">
                                {srv.name}
                              </div>
                              <p className="text-[10px] text-[#403d38]/65 line-clamp-2 mt-0.5">
                                {srv.description}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 mt-2 border-t border-[#afd9c3]/40 flex items-center justify-between">
                            {srv.price === 0 ? (
                              <span className="text-[10px] font-black uppercase text-[#2b6a48]">
                                Free
                              </span>
                            ) : (
                              <span className="font-mono font-bold text-xs text-[#2b6a48]">
                                ₹{srv.price}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {activeSelectedService && (
                  <Card className="rounded-3xl border border-[#afd9c3] p-4 bg-white space-y-3 shadow-xs text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#afd9c3]/40">
                      <div>
                        <span className="text-[10px] font-bold uppercase opacity-60">Ready to Request</span>
                        <div className="font-extrabold text-sm text-[#403d38]">{activeSelectedService.name}</div>
                      </div>
                      <Badge className="bg-[#d6fce2] text-[#2b6a48] border border-[#afd9c3] font-bold">
                        {activeSelectedService.price === 0 ? "Complimentary Free" : `Price: ₹${activeSelectedService.price}`}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[11px]">Special Instructions (Optional)</label>
                      <Input
                        placeholder="e.g. Please send urgently..."
                        value={serviceNotes}
                        onChange={(e) => setServiceNotes(e.target.value)}
                        className="h-10 text-xs rounded-xl border-[#afd9c3]/70 bg-[#fcfbf9]"
                      />
                    </div>

                    <Button
                      onClick={handleSendServiceRequest}
                      className="w-full h-11 rounded-2xl font-bold text-xs bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db] shadow-sm"
                    >
                      <BellRing className="w-4 h-4 text-[#d6fce2] mr-1.5" /> Confirm Request to Front Desk
                    </Button>
                  </Card>
                )}
              </div>
            )}

            {/* TAB: DINING */}
            {activeTab === "food" && (
              <div className="space-y-3">
                {orderSuccessMessage && (
                  <div className="p-3.5 rounded-2xl bg-[#d6fce2] border border-[#afd9c3] text-[#2b6a48] text-xs font-bold flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[#2b6a48] shrink-0" />
                    <span>{orderSuccessMessage}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {categories.map((c) => (
                    <button
                      key={`cat-btn-${c.id}`}
                      type="button"
                      onClick={() => setSelectedCatId(c.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                        selectedCatId === c.id
                          ? "bg-[#2b6a48] text-white border-[#2b6a48] shadow-xs"
                          : "bg-white border-[#afd9c3]/60 text-[#403d38]/70 hover:text-[#403d38]"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5">
                  {currentCategoryDishes.map((dish, dishIdx) => {
                    const qty = cart[dish.id] || 0;
                    return (
                      <div
                        key={`dish-card-${dish.id}-${dishIdx}`}
                        className="p-4 rounded-3xl bg-white border border-[#afd9c3]/60 shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${dish.isVeg ? "bg-[#2b6a48]" : "bg-[#df918d]"}`} />
                            <span className="font-extrabold text-xs text-[#403d38]">{dish.name}</span>
                          </div>
                          <div className="text-xs font-mono font-bold text-[#2b6a48]">₹{dish.price}</div>
                        </div>

                        <div>
                          {qty === 0 ? (
                            <Button
                              size="sm"
                              onClick={() => updateCartQty(dish.id, 1)}
                              className="h-8 px-3.5 rounded-xl font-bold text-xs bg-[#d6fce2] hover:bg-[#afd9c3] text-[#2b6a48] border border-[#afd9c3]"
                            >
                              + Add
                            </Button>
                          ) : (
                            <div className="flex items-center border border-[#afd9c3] rounded-xl h-8 bg-[#e5e2db]/30 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => updateCartQty(dish.id, -1)}
                                className="w-8 h-full flex items-center justify-center hover:bg-[#d6fce2] text-[#403d38]"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center font-bold text-xs font-mono text-[#403d38]">{qty}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(dish.id, 1)}
                                className="w-8 h-full flex items-center justify-center hover:bg-[#d6fce2] text-[#403d38]"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {cartTotalAmount > 0 && (
                  <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-[#403d38] text-[#e5e2db] p-3.5 rounded-2xl shadow-2xl flex items-center justify-between z-50 border border-[#afd9c3]/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#d6fce2]">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-[#e5e2db]/70 font-semibold">{totalCartItemsCount} Items</div>
                        <div className="font-mono font-black text-sm text-[#d6fce2]">₹{cartTotalAmount}</div>
                      </div>
                    </div>
                    <Button onClick={handlePlaceOrder} className="h-9 px-4 rounded-xl font-bold text-xs bg-[#d6fce2] text-[#403d38]">
                      Place Order →
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: BILL */}
            {activeTab === "bill" && (
              <Card className="rounded-3xl border border-[#afd9c3]/60 p-5 bg-white space-y-3.5 shadow-xs text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#afd9c3]/40">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#403d38]">Folio Billing Breakdown</h3>
                    <p className="text-[11px] text-[#403d38]/60">Live charges billed to Room {roomNumber}</p>
                  </div>
                  <Badge className="bg-[#d6fce2] text-[#2b6a48] border border-[#afd9c3] font-bold">Active Stay</Badge>
                </div>

                <div className="space-y-2 pt-1 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#403d38]/70 font-sans">Room Tariff:</span>
                    <span className="font-bold">₹{nightlyRoomTariff}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#403d38]/70 font-sans">Dining Total:</span>
                    <span className="font-bold text-[#2b6a48]">₹{currentOrdersTotal}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#afd9c3]/40 font-black text-sm text-[#2b6a48]">
                    <span className="font-sans text-[#403d38]">Current Total:</span>
                    <span>₹{nightlyRoomTariff + currentOrdersTotal}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* TAB: WI-FI */}
            {activeTab === "wifi" && (
              <Card className="rounded-3xl border border-[#afd9c3]/60 p-5 bg-white space-y-3 shadow-xs text-xs">
                <div className="flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-[#2b6a48]" />
                  <h3 className="font-extrabold text-sm text-[#403d38]">Wi-Fi Credentials</h3>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#e5e2db]/30 border border-[#afd9c3]/50 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="opacity-60 font-sans">Network:</span>
                    <span className="font-bold">GrandPalace_Guest_WiFi</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60 font-sans">Password:</span>
                    <span className="font-bold text-[#2b6a48]">welcome@2026</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function GuestPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-[#403d38]">Loading Guest Portal...</div>}>
      <GuestPortalMain />
    </Suspense>
  );
}