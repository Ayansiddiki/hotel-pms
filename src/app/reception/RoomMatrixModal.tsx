"use client";

import React, { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BedDouble,
  Plus,
  Trash2,
  Tags,
  IndianRupee,
  Layers,
  Sparkles,
  Percent,
  CheckCircle2,
} from "lucide-react";

export interface RoomCategory {
  id: string;
  name: string;
  defaultPrice: number;
}

export interface RoomItem {
  id: string;
  number: string;
  categoryId: string;
  type: string;
  price: number;
  status: "available" | "occupied" | "cleaning";
  guest?: string;
  customDiscountNote?: string;
}

interface RoomMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: RoomItem[];
  setRooms: React.Dispatch<React.SetStateAction<RoomItem[]>>;
  darkMode?: boolean;
}

export function RoomMatrixModal({
  isOpen,
  onClose,
  rooms,
  setRooms,
  darkMode = false,
}: RoomMatrixModalProps) {
  // Categories State
  const [categories, setCategories] = useState<RoomCategory[]>([
    { id: "cat-1", name: "Standard Non-AC", defaultPrice: 900 },
    { id: "cat-2", name: "Deluxe AC", defaultPrice: 1500 },
    { id: "cat-3", name: "Super Deluxe", defaultPrice: 2200 },
    { id: "cat-4", name: "Executive Suite", defaultPrice: 3500 },
  ]);

  // Category Inputs
  const [newCatName, setNewCatName] = useState("");
  const [newCatPrice, setNewCatPrice] = useState<number | "">("");

  // Room Inputs
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<string>("cat-2");

  // Custom Price Override State
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [overridePrice, setOverridePrice] = useState<number | "">("");
  const [relativeNote, setRelativeNote] = useState("");

  // Add Category Handler
  const handleAddCategory = () => {
    if (!newCatName || !newCatPrice) {
      alert("Category name aur base price dono bharein!");
      return;
    }
    const newCat: RoomCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      defaultPrice: Number(newCatPrice),
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCatName("");
    setNewCatPrice("");
  };

  // Add Room Handler
  const handleAddRoom = () => {
    if (!newRoomNumber) {
      alert("Room number daalein!");
      return;
    }
    const cat = categories.find((c) => c.id === selectedCatId);
    if (!cat) return;

    if (rooms.some((r) => r.number === newRoomNumber.trim())) {
      alert("Yeh room number pehle se exist karta hai!");
      return;
    }

    const newRoom: RoomItem = {
      id: `room-${Date.now()}`,
      number: newRoomNumber.trim(),
      categoryId: cat.id,
      type: cat.name,
      price: cat.defaultPrice,
      status: "available",
      guest: "",
    };

    setRooms((prev) => [...prev, newRoom]);
    setNewRoomNumber("");
  };

  // Delete Room Handler
  const handleDeleteRoom = (roomId: string) => {
    if (confirm("Kya aap is room ko delete karna chahte hain?")) {
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    }
  };

  // Save Custom / Relative Price
  const handleSaveCustomPrice = (roomId: string) => {
    if (overridePrice === "" || Number(overridePrice) < 0) return;

    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              price: Number(overridePrice),
              customDiscountNote: relativeNote || "Special Relative Rate",
            }
          : r
      )
    );
    setEditingRoomId(null);
    setOverridePrice("");
    setRelativeNote("");
  };

  // Reset to Base Category Price
  const handleResetToBasePrice = (roomId: string, categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;

    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              price: cat.defaultPrice,
              customDiscountNote: undefined,
            }
          : r
      )
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`w-[96vw] max-w-6xl max-h-[92vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-3xl border p-5 sm:p-7 shadow-2xl transition-colors ${
          darkMode
            ? "bg-[#2d2a26] border-[#403d38] text-[#e5e2db]"
            : "bg-white border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Room Matrix & Inventory Configuration</DialogTitle>
        </DialogHeader>

        {/* Modal Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#afd9c3]/40 gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-[#2b6a48] dark:text-[#afd9c3]" />
              Room Matrix & Inventory Configuration
            </h3>
            <p className="text-xs opacity-70 mt-0.5">
              Create custom room categories, add/remove rooms, and adjust rates for relatives & special guests.
            </p>
          </div>
          <Badge className="bg-[#d6fce2] text-[#403d38] border-[#afd9c3] font-bold px-3 py-1 self-start sm:self-auto">
            Total Inventory: {rooms.length} Rooms
          </Badge>
        </div>

        {/* Two-Column Top Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 my-3 text-xs">
          
          {/* Left: Custom Categories Creator & Base Rates */}
          <div
            className={`lg:col-span-6 p-4 rounded-2xl border space-y-2.5 ${
              darkMode ? "bg-[#1f1d1a] border-[#403d38]" : "bg-[#e5e2db]/35 border-[#afd9c3]/50"
            }`}
          >
            <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider text-[#2b6a48] dark:text-[#afd9c3]">
              <span className="flex items-center gap-1.5">
                <Tags className="w-3.5 h-3.5" /> 1. Manage Categories & Fix Base Rent
              </span>
              <span className="opacity-70 text-[10px]">{categories.length} Types</span>
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="Category Name (e.g. Honeymoon Suite)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="h-8.5 text-xs rounded-xl flex-1 border-[#afd9c3]/70"
              />
              <div className="relative w-28">
                <IndianRupee className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <Input
                  type="number"
                  placeholder="Base Rate"
                  value={newCatPrice}
                  onChange={(e) => setNewCatPrice(e.target.value ? Number(e.target.value) : "")}
                  className="h-8.5 text-xs pl-7 rounded-xl font-mono border-[#afd9c3]/70"
                />
              </div>
              <Button
                onClick={handleAddCategory}
                className="h-8.5 px-3 rounded-xl bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db] font-bold"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {/* Existing Categories Pill Grid */}
            <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-20 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="px-2.5 py-0.5 rounded-xl bg-white dark:bg-[#2d2a26] border border-[#afd9c3]/70 text-[11px] font-semibold flex items-center gap-1.5"
                >
                  <span>{cat.name}</span>
                  <span className="font-mono text-emerald-600 font-bold">₹{cat.defaultPrice}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Add New Room to Inventory */}
          <div
            className={`lg:col-span-6 p-4 rounded-2xl border space-y-2.5 ${
              darkMode ? "bg-[#1f1d1a] border-[#403d38]" : "bg-[#e5e2db]/35 border-[#afd9c3]/50"
            }`}
          >
            <div className="flex items-center justify-between font-bold text-xs uppercase tracking-wider text-[#2b6a48] dark:text-[#afd9c3]">
              <span className="flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5" /> 2. Add New Room To Inventory
              </span>
              <span className="opacity-70 text-[10px]">Instant Allotment</span>
            </div>

            {/* Room Input & Wide Category Dropdown */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-4">
                <Input
                  placeholder="Room No. (e.g. 201)"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="h-8.5 text-xs rounded-xl font-mono border-[#afd9c3]/70"
                />
              </div>

              <div className="sm:col-span-6">
                <Select value={selectedCatId} onValueChange={(val) => val && setSelectedCatId(val)}>
                  <SelectTrigger className="h-8.5 w-full text-xs rounded-xl border-[#afd9c3]/70 px-3">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[260px] max-w-[320px] rounded-2xl border-[#afd9c3] shadow-xl z-[60]">
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs py-2 cursor-pointer">
                        <div className="flex items-center justify-between w-full gap-4">
                          <span className="font-medium truncate">{c.name}</span>
                          <span className="font-mono font-bold text-emerald-600 shrink-0">₹{c.defaultPrice}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Button
                  onClick={handleAddRoom}
                  className="w-full h-8.5 rounded-xl bg-[#2b6a48] hover:bg-[#2b6a48]/90 text-white font-bold"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-[11px] opacity-70">
              Rooms added here will automatically show up on the live Front Desk room grid and Walk-in check-in forms.
            </p>
          </div>

        </div>

        {/* Room Inventory List with Relative Pricing Customization */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider opacity-80">
              Configured Room Inventory & Pricing Status
            </h4>
            <span className="text-[11px] opacity-60">
              Click "Adjust Rate" on any room to set relative discounts
            </span>
          </div>

          {/* Table Container without any visible scrollbars */}
          <div className="border border-[#afd9c3]/50 rounded-2xl overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead
                className={`border-b border-[#afd9c3]/40 font-bold uppercase text-[11px] ${
                  darkMode ? "bg-[#1f1d1a]" : "bg-[#e5e2db]/40"
                }`}
              >
                <tr>
                  <th className="p-2.5 pl-3">Room No.</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Base Price</th>
                  <th className="p-2.5">Active Nightly Rate</th>
                  <th className="p-2.5">Pricing Note</th>
                  <th className="p-2.5 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => {
                  const parentCat = categories.find((c) => c.id === room.categoryId);
                  const basePrice = parentCat ? parentCat.defaultPrice : room.price;
                  const isDiscounted = room.price !== basePrice;

                  return (
                    <tr
                      key={room.id}
                      className={`border-b border-[#afd9c3]/20 last:border-0 transition-colors ${
                        darkMode ? "hover:bg-[#1f1d1a]/50" : "hover:bg-[#d6fce2]/15"
                      }`}
                    >
                      <td className="p-2.5 pl-3 font-mono font-bold">
                        <span className="bg-[#d6fce2] text-[#403d38] border border-[#afd9c3] px-2 py-0.5 rounded-lg text-xs">
                          Room {room.number}
                        </span>
                      </td>

                      <td className="p-2.5 font-semibold">{room.type}</td>

                      <td className="p-2.5 font-mono opacity-70">
                        ₹{basePrice}
                      </td>

                      <td className="p-2.5 font-mono font-bold text-xs sm:text-sm">
                        <span className={isDiscounted ? "text-amber-600" : "text-emerald-600"}>
                          ₹{room.price}
                        </span>
                        {isDiscounted && (
                          <span className="text-[10px] text-amber-600 font-semibold ml-2">
                            ({room.price < basePrice ? `₹${basePrice - room.price} Less` : `₹${room.price - basePrice} Extra`})
                          </span>
                        )}
                      </td>

                      <td className="p-2.5">
                        {room.customDiscountNote ? (
                          <Badge className="bg-[#e3cf92]/30 text-[#94772d] dark:text-[#e3cf92] border border-[#e3cf92] text-[10px] py-0">
                            {room.customDiscountNote}
                          </Badge>
                        ) : (
                          <span className="text-[11px] opacity-50">Standard Fixed Rent</span>
                        )}
                      </td>

                      <td className="p-2.5 pr-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingRoomId(room.id);
                              setOverridePrice(room.price);
                              setRelativeNote(room.customDiscountNote || "");
                            }}
                            className="h-6.5 px-2 text-[11px] rounded-xl border-[#afd9c3] hover:bg-[#d6fce2]/40"
                          >
                            <Percent className="w-2.5 h-2.5 mr-1 text-amber-600" />
                            Adjust Rate
                          </Button>

                          {isDiscounted && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleResetToBasePrice(room.id, room.categoryId)}
                              className="h-6.5 px-1.5 text-[10px] text-slate-500 hover:text-slate-800"
                            >
                              Reset
                            </Button>
                          )}

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteRoom(room.id)}
                            className="h-6.5 w-6.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Relative Custom Price Popup */}
        {editingRoomId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div
              className={`p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-4 ${
                darkMode ? "bg-[#2d2a26] border-[#403d38] text-[#e5e2db]" : "bg-white border-[#afd9c3] text-[#403d38]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-base">
                  Special / Relative Rate for Room {rooms.find((r) => r.id === editingRoomId)?.number}
                </h4>
              </div>

              <p className="text-xs opacity-70">
                Fix kiye hue rent ko is guest ya relative ke liye kam ya zyada karein.
              </p>

              <div>
                <label className="text-xs font-semibold block mb-1">New Custom Rate (₹ / night)</label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    type="number"
                    value={overridePrice}
                    onChange={(e) => setOverridePrice(e.target.value ? Number(e.target.value) : "")}
                    className="h-10 pl-9 rounded-xl font-mono font-bold text-sm border-[#afd9c3]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Reason / Note (Optional)</label>
                <Input
                  placeholder="e.g. Relative Discount, VIP Guest"
                  value={relativeNote}
                  onChange={(e) => setRelativeNote(e.target.value)}
                  className="h-10 rounded-xl text-xs border-[#afd9c3]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingRoomId(null)}
                  className="rounded-xl h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveCustomPrice(editingRoomId)}
                  className="rounded-xl h-9 text-xs bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db] font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1 text-[#d6fce2]" /> Save Custom Rate
                </Button>
              </div>
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}