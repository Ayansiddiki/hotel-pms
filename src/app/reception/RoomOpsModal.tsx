"use client";

import React, { useState, useEffect } from "react";
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
  User,
  UtensilsCrossed,
  ArrowRightLeft,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Sparkles,
  Coffee,
  Minus,
  Percent,
  XCircle,
  Printer,
  Edit3,
  Save,
  Building,
} from "lucide-react";
import { type MenuItem, type MenuCategory } from "./FoodServicesModal";
import { FolioReceiptModal } from "./FolioReceiptModal";

export interface FoodBillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface RoomOpsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any | null;
  guestEntry: any | null;
  availableRooms: any[];
  onMarkCleaned: (roomId: string) => void;
  onCheckOut: (roomId: string, totalBill: number) => void;
  onRoomChange: (currentRoomId: string, newRoomId: string, reason: string) => void;
  onUpdateFoodOrders: (roomId: string, items: FoodBillItem[]) => void;
  onVoidBooking?: (roomId: string) => void;
  darkMode?: boolean;
}

export function RoomOpsModal({
  isOpen,
  onClose,
  room,
  guestEntry,
  availableRooms,
  onMarkCleaned,
  onCheckOut,
  onRoomChange,
  onUpdateFoodOrders,
  onVoidBooking,
  darkMode = false,
}: RoomOpsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "food" | "shift">("overview");

  const [foodItems, setFoodItems] = useState<FoodBillItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>("");
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [orderQty, setOrderQty] = useState(1);

  const [isManualInput, setIsManualInput] = useState(false);
  const [customDishName, setCustomDishName] = useState("");
  const [customDishPrice, setCustomDishPrice] = useState<number | "">("");

  const [targetRoomId, setTargetRoomId] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [applyGst, setApplyGst] = useState(true);

  // Edit Guest Details States
  const [isEditingGuest, setIsEditingGuest] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editGstin, setEditGstin] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Folio Receipt Modal Preview State
  const [isFolioOpen, setIsFolioOpen] = useState(false);

  useEffect(() => {
    if (isOpen && room) {
      setFoodItems(room.foodOrders || []);
      setApplyGst(true);
      setIsEditingGuest(false);

      if (guestEntry) {
        setEditFullName(guestEntry.fullName || room.guest || "");
        setEditMobile(guestEntry.mobile || "");
        setEditCompany(guestEntry.companyName || "");
        setEditGstin(guestEntry.guestGstin || "");
        setEditAddress(guestEntry.address || "");
      }

      if (typeof window !== "undefined") {
        const savedCats = localStorage.getItem("hotel_pms_food_categories");
        const savedMenu = localStorage.getItem("hotel_pms_food_menu");
        if (savedCats) {
          const cats = JSON.parse(savedCats);
          setCategories(cats);
          if (cats.length > 0) setSelectedCatId(cats[0].id);
        }
        if (savedMenu) {
          setMenuItems(JSON.parse(savedMenu));
        }
      }
    }
  }, [isOpen, room, guestEntry]);

  if (!room) return null;

  const handleSaveGuestDetails = () => {
    if (!editFullName.trim()) {
      alert("Guest name cannot be empty!");
      return;
    }

    if (typeof window !== "undefined") {
      const savedReg = localStorage.getItem("hotel_pms_eregister");
      if (savedReg) {
        try {
          const regList = JSON.parse(savedReg);
          const updatedReg = regList.map((entry: any) => {
            if (entry.roomNo === room.number && (entry.fullName === room.guest || entry.id === guestEntry?.id)) {
              return {
                ...entry,
                fullName: editFullName.trim(),
                mobile: editMobile.trim(),
                companyName: editCompany.trim(),
                guestGstin: editGstin.trim(),
                address: editAddress.trim(),
              };
            }
            return entry;
          });
          localStorage.setItem("hotel_pms_eregister", JSON.stringify(updatedReg));
        } catch (e) {
          console.error(e);
        }
      }

      const savedRooms = localStorage.getItem("hotel_pms_rooms");
      if (savedRooms) {
        try {
          const roomsList = JSON.parse(savedRooms);
          const updatedRooms = roomsList.map((r: any) => {
            if (r.id === room.id || r.number === room.number) {
              return { ...r, guest: editFullName.trim() };
            }
            return r;
          });
          localStorage.setItem("hotel_pms_rooms", JSON.stringify(updatedRooms));
        } catch (e) {
          console.error(e);
        }
      }
    }

    setIsEditingGuest(false);
    alert("✓ Guest details updated successfully!");
    window.location.reload();
  };

  const handleAddFromMenu = () => {
    if (!selectedMenuItem) return;
    const existingIndex = foodItems.findIndex((f) => f.name === selectedMenuItem.name);
    let updated: FoodBillItem[];

    if (existingIndex > -1) {
      updated = [...foodItems];
      updated[existingIndex].quantity += orderQty;
    } else {
      updated = [
        ...foodItems,
        {
          id: `food-${Date.now()}`,
          name: selectedMenuItem.name,
          quantity: orderQty,
          price: selectedMenuItem.price,
        },
      ];
    }

    setFoodItems(updated);
    onUpdateFoodOrders(room.id, updated);
    setSelectedMenuItem(null);
    setOrderQty(1);
  };

  const handleAddCustomDish = () => {
    if (!customDishName.trim() || !customDishPrice) return;
    const newItem: FoodBillItem = {
      id: `food-${Date.now()}`,
      name: customDishName.trim(),
      quantity: Number(orderQty) || 1,
      price: Number(customDishPrice),
    };
    const updated = [...foodItems, newItem];
    setFoodItems(updated);
    onUpdateFoodOrders(room.id, updated);
    setCustomDishName("");
    setCustomDishPrice("");
    setOrderQty(1);
    setIsManualInput(false);
  };

  const handleRemoveFoodItem = (id: string) => {
    const updated = foodItems.filter((f) => f.id !== id);
    setFoodItems(updated);
    onUpdateFoodOrders(room.id, updated);
  };

  const foodTotal = foodItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const roomTariff = room.price || 1500;

  const gstRate = roomTariff <= 7500 ? 0.05 : 0.18;
  const gstAmount = applyGst ? roomTariff * gstRate : 0;
  const cgstAmount = gstAmount / 2;
  const sgstAmount = gstAmount / 2;

  const advanceDeduction = Number(guestEntry?.advancePayment) || 0;
  const netPayable = Math.max(0, roomTariff + gstAmount + foodTotal - advanceDeduction);

  const handleExecuteRoomChange = () => {
    if (!targetRoomId) {
      alert("Please select a target available room.");
      return;
    }
    if (!transferReason.trim()) {
      alert("Please enter a valid reason for the room change.");
      return;
    }
    onRoomChange(room.id, targetRoomId, transferReason.trim());
    onClose();
  };

  const handleVoidBookingAction = () => {
    if (confirm(`⚠️ Instant Cancel / Void Booking for Room ${room.number}?\n\nGuest ne room use nahi kiya hai. Room turant available kar diya jayega aur advance (₹${advanceDeduction}) refund mark ho jayega.`)) {
      if (onVoidBooking) {
        onVoidBooking(room.id);
      } else {
        if (typeof window !== "undefined") {
          const savedRooms = localStorage.getItem("hotel_pms_rooms");
          if (savedRooms) {
            const roomsList = JSON.parse(savedRooms);
            const updated = roomsList.map((r: any) => 
              r.id === room.id ? { ...r, status: "available", guest: undefined, foodOrders: [], currentPasscode: undefined } : r
            );
            localStorage.setItem("hotel_pms_rooms", JSON.stringify(updated));
          }
        }
      }
      onClose();
      window.location.reload();
    }
  };

  if (room.status === "cleaning") {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          showCloseButton={false}
          className={`max-w-md rounded-3xl border p-6 shadow-2xl transition-colors ${
            darkMode ? "bg-[#2d2a26] border-[#403d38] text-[#e5e2db]" : "bg-white border-[#afd9c3] text-[#403d38]"
          }`}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Confirm Room Cleaning</DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e3cf92]/20 border border-[#e3cf92] text-[#94772d] dark:text-[#e3cf92] flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-extrabold text-lg">Housekeeping Confirmation</h3>
              <p className="text-xs opacity-75 mt-1">
                Has <strong>Room {room.number}</strong> ({room.type}) been fully cleaned and sanitized?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-2xl h-10 font-bold text-xs"
              >
                No, Still In Progress
              </Button>
              <Button
                onClick={() => {
                  onMarkCleaned(room.id);
                  onClose();
                }}
                className="flex-1 rounded-2xl h-10 font-bold text-xs bg-[#2b6a48] hover:bg-[#23583c] text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Yes, Mark Available
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const categoryDishes = menuItems.filter((m) => m.categoryId === selectedCatId && m.isAvailable);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          showCloseButton={false}
          className={`w-[96vw] max-w-3xl max-h-[92vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-3xl border p-6 shadow-2xl transition-colors ${
            darkMode ? "bg-[#25221e] border-[#403d38] text-[#e5e2db]" : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
          }`}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Room Operations - Room {room.number}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between pb-3.5 border-b border-[#afd9c3]/40">
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-black px-3 py-1 rounded-xl bg-[#df918d] text-white shadow-xs">
                Room {room.number}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-tight">{room.type}</h3>
                  <Badge className="bg-[#df918d] text-white text-[10px] font-bold">Occupied</Badge>
                </div>
                <p className="text-[11px] opacity-60">Manage guest folio, in-room dining orders, and departures</p>
              </div>
            </div>

            <Button
              onClick={() => setIsFolioOpen(true)}
              className="h-9 px-4 rounded-xl font-bold text-xs bg-[#2b6a48] hover:bg-[#23583c] text-white shadow-sm flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4" /> View Folio Receipt
            </Button>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-[#afd9c3]/50 bg-white/70 dark:bg-[#1f1d1a] my-2 select-none">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "overview"
                  ? "bg-[#403d38] text-[#e5e2db] dark:bg-[#d6fce2] dark:text-[#1f1d1a]"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <User className="w-3.5 h-3.5" /> Guest & Bill
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("food")}
              className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "food"
                  ? "bg-[#403d38] text-[#e5e2db] dark:bg-[#d6fce2] dark:text-[#1f1d1a]"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" /> Food Service ({foodItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shift")}
              className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "shift"
                  ? "bg-[#403d38] text-[#e5e2db] dark:bg-[#d6fce2] dark:text-[#1f1d1a]"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Change Room
            </button>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-4 pt-1 text-xs">
              <div className="p-4 rounded-2xl border border-[#afd9c3]/50 bg-white dark:bg-[#1f1d1a] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#afd9c3]/30">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-[#2b6a48] dark:text-[#afd9c3]">
                    Guest & Corporate Details
                  </span>
                  {!isEditingGuest ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingGuest(true)}
                      className="h-7 px-2.5 text-xs text-[#2b6a48] dark:text-[#afd9c3] hover:bg-[#d6fce2]/30 rounded-lg font-bold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Details
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleSaveGuestDetails}
                      className="h-7 px-3 text-xs bg-[#2b6a48] text-white hover:bg-[#23583c] rounded-lg font-bold flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </Button>
                  )}
                </div>

                {!isEditingGuest ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Primary Guest</span>
                        <div className="text-base font-extrabold flex items-center gap-1.5 mt-0.5">
                          <User className="w-4 h-4 text-[#2b6a48] dark:text-[#afd9c3]" />
                          {room.guest || guestEntry?.fullName || "Guest"}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Mobile</span>
                        <div className="font-mono font-bold">{guestEntry?.mobile || "N/A"}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <div>
                        <span className="opacity-60">Company / B2B: </span>
                        <span className="font-bold">{guestEntry?.companyName || "Personal"}</span>
                      </div>
                      <div>
                        <span className="opacity-60">GSTIN: </span>
                        <span className="font-mono font-semibold">{guestEntry?.guestGstin || "N/A"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="opacity-60">Check-In: </span>
                        <span className="font-mono font-semibold">{guestEntry?.checkInDateTime || "Live"}</span>
                      </div>
                      <div>
                        <span className="opacity-60">Advance Paid: </span>
                        <span className="font-mono font-bold text-emerald-600">₹{advanceDeduction}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold block mb-1">Full Name</label>
                        <Input
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          className="h-8 text-xs rounded-xl border-[#afd9c3]"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">Mobile Number</label>
                        <Input
                          value={editMobile}
                          onChange={(e) => setEditMobile(e.target.value)}
                          className="h-8 text-xs rounded-xl border-[#afd9c3] font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold block mb-1">Company Name (B2B)</label>
                        <Input
                          value={editCompany}
                          onChange={(e) => setEditCompany(e.target.value)}
                          className="h-8 text-xs rounded-xl border-[#afd9c3]"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">GSTIN Number</label>
                        <Input
                          value={editGstin}
                          onChange={(e) => setEditGstin(e.target.value)}
                          className="h-8 text-xs rounded-xl border-[#afd9c3] font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold block mb-1">Address</label>
                      <Input
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="h-8 text-xs rounded-xl border-[#afd9c3]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-red-700 dark:text-red-400 block text-xs">Instant Zero-Stay Void</span>
                  <span className="text-[10px] opacity-75">Cancel check-in if guest left within minutes without staying.</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVoidBookingAction}
                  className="h-8 rounded-xl font-bold text-xs border-red-300 text-red-600 hover:bg-red-100"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" /> Void Booking
                </Button>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#afd9c3]/60 bg-[#d6fce2]/20 dark:bg-[#1f1d1a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-[#2b6a48]" />
                  <div>
                    <span className="font-bold block text-xs">Apply Government GST Slab</span>
                    <span className="text-[10px] opacity-65">
                      {roomTariff <= 7500 ? "Tariff <= ₹7500 (5% GST: 2.5% CGST + 2.5% SGST)" : "Tariff > ₹7500 (18% GST: 9% CGST + 9% SGST)"}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={applyGst}
                  onChange={(e) => setApplyGst(e.target.checked)}
                  className="w-4 h-4 accent-[#2b6a48] cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl border border-[#afd9c3]/50 bg-white dark:bg-[#1f1d1a] space-y-2">
                <span className="font-bold flex items-center gap-1.5 text-xs">
                  <Receipt className="w-4 h-4 text-[#2b6a48] dark:text-[#afd9c3]" /> Folio Billing Breakdown
                </span>

                <div className="space-y-1.5 pt-1 text-xs font-mono">
                  <div className="flex justify-between font-sans">
                    <span className="opacity-70">Room Nightly Tariff:</span>
                    <span className="font-bold">₹{roomTariff}</span>
                  </div>

                  {applyGst && (
                    <>
                      <div className="flex justify-between text-[11px] opacity-75">
                        <span>CGST ({roomTariff <= 7500 ? "2.5%" : "9%"}):</span>
                        <span>₹{cgstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] opacity-75">
                        <span>SGST ({roomTariff <= 7500 ? "2.5%" : "9%"}):</span>
                        <span>₹{sgstAmount.toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between font-sans">
                    <span className="opacity-70">Room Dining & Food Total:</span>
                    <span className="font-bold">₹{foodTotal}</span>
                  </div>

                  <div className="flex justify-between text-emerald-600 font-sans">
                    <span>Advance Received:</span>
                    <span className="font-bold">- ₹{advanceDeduction}</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t font-black text-sm text-[#2b6a48] dark:text-[#d6fce2] font-sans">
                    <span>Net Payable at Checkout:</span>
                    <span>₹{netPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => {
                    if (confirm(`Check-out Room ${room.number}? Total settlement amount: ₹${netPayable.toFixed(2)}. Room will be set to Housekeeping.`)) {
                      onCheckOut(room.id, netPayable);
                      setIsFolioOpen(true); // Automatically opens folio upon checkout confirmation
                    }
                  }}
                  className="w-full h-11 rounded-2xl font-bold text-xs bg-[#e11d48] hover:bg-[#c8193f] text-white flex items-center justify-center gap-2 shadow-sm"
                >
                  <LogOut className="w-4 h-4" /> Settle Bill & Complete Check-Out
                </Button>
              </div>
            </div>
          )}

          {activeTab === "food" && (
            <div className="space-y-4 pt-1 text-xs">
              <div className="p-4 rounded-3xl border border-[#afd9c3]/60 bg-white dark:bg-[#1f1d1a] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs flex items-center gap-1.5">
                    <Coffee className="w-4 h-4 text-[#2b6a48] dark:text-[#afd9c3]" />
                    Hotel Food Menu Order
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsManualInput(!isManualInput)}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {isManualInput ? "← Select from Hotel Menu" : "+ Custom / Off-Menu Dish"}
                  </button>
                </div>

                {!isManualInput ? (
                  <>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCatId(c.id);
                            setSelectedMenuItem(null);
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                            selectedCatId === c.id
                              ? "bg-[#2b6a48] text-white border-[#2b6a48]"
                              : "bg-[#e5e2db]/30 dark:bg-[#25221e] border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100"
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1 [scrollbar-width:none]">
                      {categoryDishes.length === 0 ? (
                        <div className="col-span-3 text-center py-6 opacity-40 text-xs italic">
                          No dishes added in this category yet.
                        </div>
                      ) : (
                        categoryDishes.map((item) => {
                          const isChosen = selectedMenuItem?.id === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedMenuItem(item)}
                              className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                                isChosen
                                  ? "bg-[#d6fce2] dark:bg-[#d6fce2]/20 border-[#2b6a48] shadow-xs"
                                  : "bg-slate-50 dark:bg-[#25221e] border-slate-200 dark:border-slate-800 hover:border-[#afd9c3]"
                              }`}
                            >
                              <div className="font-extrabold text-xs truncate">{item.name}</div>
                              <div className="flex items-center justify-between mt-1 text-[11px]">
                                <span className="font-mono font-bold text-emerald-600">₹{item.price}</span>
                                {isChosen && <CheckCircle2 className="w-3.5 h-3.5 text-[#2b6a48]" />}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {selectedMenuItem && (
                      <div className="p-3 rounded-2xl bg-[#d6fce2]/25 border border-[#afd9c3] flex items-center justify-between gap-3">
                        <div>
                          <div className="font-extrabold text-xs">{selectedMenuItem.name}</div>
                          <div className="text-[10px] font-mono text-emerald-700">₹{selectedMenuItem.price} each</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-[#afd9c3] rounded-xl h-8 overflow-hidden bg-white dark:bg-[#25221e]">
                            <button
                              type="button"
                              onClick={() => setOrderQty(Math.max(1, orderQty - 1))}
                              className="w-8 h-full flex items-center justify-center hover:bg-[#d6fce2]/40"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-bold text-xs">{orderQty}</span>
                            <button
                              type="button"
                              onClick={() => setOrderQty(orderQty + 1)}
                              className="w-8 h-full flex items-center justify-center hover:bg-[#d6fce2]/40"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <Button
                            onClick={handleAddFromMenu}
                            className="h-8 px-4 font-bold text-xs rounded-xl bg-[#2b6a48] hover:bg-[#23583c] text-white shadow-xs"
                          >
                            Add (₹{selectedMenuItem.price * orderQty})
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2">
                      <Input
                        placeholder="Custom dish or beverage name"
                        value={customDishName}
                        onChange={(e) => setCustomDishName(e.target.value)}
                        className="col-span-6 h-8.5 text-xs rounded-xl border-[#afd9c3]/60"
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={orderQty}
                        onChange={(e) => setOrderQty(Number(e.target.value))}
                        className="col-span-2 h-8.5 text-xs font-mono rounded-xl border-[#afd9c3]/60 text-center"
                      />
                      <Input
                        type="number"
                        placeholder="Price (₹)"
                        value={customDishPrice}
                        onChange={(e) => setCustomDishPrice(e.target.value ? Number(e.target.value) : "")}
                        className="col-span-4 h-8.5 text-xs font-mono rounded-xl border-[#afd9c3]/60"
                      />
                    </div>
                    <Button
                      onClick={handleAddCustomDish}
                      className="w-full h-8.5 rounded-xl font-bold text-xs bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db]"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1 text-[#d6fce2]" /> Add Custom Dish to Bill
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-3xl border border-[#afd9c3]/50 bg-white dark:bg-[#1f1d1a] space-y-2">
                <div className="flex items-center justify-between font-bold pb-2 border-b">
                  <span>Room {room.number} Orders Billed</span>
                  <span className="font-mono text-emerald-600 text-sm">Total: ₹{foodTotal}</span>
                </div>

                {foodItems.length === 0 ? (
                  <div className="text-center py-6 opacity-40 text-xs italic">
                    No food orders billed to this room yet. Select dishes from menu above!
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto [scrollbar-width:none]">
                    {foodItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#25221e] border border-slate-200/60 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{item.name}</span>
                          <span className="text-[10px] opacity-60">x{item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs">₹{item.price * item.quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveFoodItem(item.id)}
                            className="h-6 w-6 text-red-500 hover:bg-red-100 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "shift" && (
            <div className="space-y-4 pt-1 text-xs">
              <div className="p-4 rounded-2xl border border-amber-300 dark:border-amber-900 bg-amber-500/10 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" /> Guest Relocation Protocol
                </span>
                <p className="text-[11px] opacity-75">
                  Moving guest from <strong>Room {room.number}</strong> to another room. The previous room will be set to Housekeeping (Cleaning).
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-[#afd9c3]/50 bg-white dark:bg-[#1f1d1a] space-y-3">
                <div>
                  <label className="font-bold block mb-1">Select New Available Room *</label>
                  <select
                    value={targetRoomId}
                    onChange={(e) => setTargetRoomId(e.target.value)}
                    className="w-full h-9 rounded-xl border border-[#afd9c3] px-3 font-semibold text-xs bg-transparent outline-none"
                  >
                    <option value="">-- Choose Target Room --</option>
                    {availableRooms
                      .filter((r) => r.status === "available" && r.id !== room.id)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          Room {r.number} ({r.type} - ₹{r.price}/n)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Reason for Room Shift *</label>
                  <Input
                    placeholder="e.g. AC cooling issue, guest requested higher floor..."
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    className="h-9 text-xs rounded-xl border-[#afd9c3]/60"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    onClick={handleExecuteRoomChange}
                    className="w-full h-10 rounded-2xl font-bold text-xs bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db] flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-[#d6fce2]" /> Confirm & Transfer Guest
                  </Button>
                </div>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>

      {/* INTEGRATED FOLIO RECEIPT / FINAL BILL PRINTING MODAL */}
      <FolioReceiptModal
        isOpen={isFolioOpen}
        onClose={() => {
          setIsFolioOpen(false);
          onClose();
        }}
        room={room}
        guestEntry={guestEntry}
        foodItems={foodItems}
        applyGst={applyGst}
      />
    </>
  );
}