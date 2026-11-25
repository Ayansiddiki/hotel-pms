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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PackageSearch, Plus, Search, CheckCircle2, Trash2, ShieldAlert } from "lucide-react";

interface LostItemRecord {
  id: string;
  itemName: string;
  category: string;
  roomNo: string;
  foundDate: string;
  foundBy: string;
  description: string;
  status: "Safe / Stored" | "Claimed & Returned";
  claimantName?: string;
}

interface LostAndFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

const CATEGORIES = ["Electronics & Gadgets", "Valuables / Jewelry", "Clothing / Apparel", "Documents / Cards", "Others"];

export function LostAndFoundModal({
  isOpen,
  onClose,
  darkMode = false,
}: LostAndFoundModalProps) {
  const [items, setItems] = useState<LostItemRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State for New Item
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [roomNo, setRoomNo] = useState("");
  const [foundBy, setFoundBy] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("hotel_pms_lost_found");
        if (saved) {
          try {
            setItems(JSON.parse(saved));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  }, [isOpen]);

  const saveItems = (updated: LostItemRecord[]) => {
    setItems(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("hotel_pms_lost_found", JSON.stringify(updated));
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !roomNo.trim()) {
      alert("Please enter Item Name and Room Number.");
      return;
    }

    const newItem: LostItemRecord = {
      id: `LF-${Date.now().toString().slice(-4)}`,
      itemName: itemName.trim(),
      category,
      roomNo: roomNo.trim(),
      foundDate: new Date().toLocaleDateString(),
      foundBy: foundBy.trim() || "Housekeeping Staff",
      description: description.trim(),
      status: "Safe / Stored",
    };

    saveItems([newItem, ...items]);
    setItemName("");
    setRoomNo("");
    setFoundBy("");
    setDescription("");
  };

  const handleMarkClaimed = (id: string) => {
    const claimant = prompt("Enter claimant / guest full name who collected the item:");
    if (!claimant) return;

    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, status: "Claimed & Returned" as const, claimantName: claimant };
      }
      return item;
    });
    saveItems(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      const updated = items.filter((item) => item.id !== id);
      saveItems(updated);
    }
  };

  const filteredItems = items.filter(
    (i) =>
      i.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.roomNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`w-[94vw] max-w-5xl max-h-[92vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-3xl border p-6 shadow-2xl transition-colors ${
          darkMode
            ? "bg-[#2d2a26] border-[#403d38] text-[#e5e2db]"
            : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Lost & Found Management</DialogTitle>
        </DialogHeader>

        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-[#afd9c3]/40">
          <div className="flex items-center gap-2.5">
            <PackageSearch className="w-6 h-6 text-[#2b6a48]" />
            <div>
              <h2 className="text-xl font-bold tracking-tight">Lost & Found Inventory</h2>
              <p className="text-xs opacity-60">Track items left behind by guests, store them safely, and manage claims.</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-8 text-xs rounded-xl border-[#afd9c3]"
          >
            Close
          </Button>
        </div>

        {/* ADD ITEM FORM */}
        <form onSubmit={handleAddItem} className="p-4 rounded-2xl border border-[#afd9c3]/60 bg-slate-50 dark:bg-[#1f1d1a] space-y-3 mt-4 text-xs">
          <h3 className="font-bold text-sm text-[#2b6a48] dark:text-[#afd9c3] flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Log New Lost & Found Item
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <Input
              placeholder="Item Name (e.g. Gold Watch, iPhone)"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="h-9 text-xs rounded-xl bg-white dark:bg-[#2d2a26]"
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 text-xs rounded-xl bg-white dark:bg-[#2d2a26]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Room No (e.g. 102)"
              value={roomNo}
              onChange={(e) => setRoomNo(e.target.value)}
              className="h-9 text-xs rounded-xl bg-white dark:bg-[#2d2a26]"
            />
            <Input
              placeholder="Found By (Staff Name)"
              value={foundBy}
              onChange={(e) => setFoundBy(e.target.value)}
              className="h-9 text-xs rounded-xl bg-white dark:bg-[#2d2a26]"
            />
          </div>
          <div className="flex gap-2.5">
            <Input
              placeholder="Description / Exact location found (e.g. Under bed in room 102)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-9 text-xs rounded-xl bg-white dark:bg-[#2d2a26] flex-1"
            />
            <Button
              type="submit"
              className="h-9 px-5 text-xs rounded-xl bg-[#2b6a48] hover:bg-[#23583c] text-white font-bold"
            >
              Save Item
            </Button>
          </div>
        </form>

        {/* SEARCH & LIST */}
        <div className="space-y-3 pt-3 text-xs">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-sm">Stored Items Directory ({filteredItems.length})</h3>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#afd9c3]/70 bg-white dark:bg-[#1f1d1a] w-64">
              <Search className="w-3.5 h-3.5 opacity-50" />
              <input
                type="text"
                placeholder="Search item, room or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 opacity-50">No lost & found records found.</div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
                    item.status === "Claimed & Returned"
                      ? "bg-slate-100 dark:bg-[#1f1d1a]/50 opacity-70 border-slate-300"
                      : "bg-white dark:bg-[#1f1d1a] border-[#afd9c3]/60"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#d6fce2] text-[#2b6a48]">
                        {item.id}
                      </span>
                      <span className="font-black text-sm text-[#403d38] dark:text-[#e5e2db]">{item.itemName}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.status === "Safe / Stored" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[11px] opacity-75 flex items-center gap-3 flex-wrap">
                      <span>📁 <strong>{item.category}</strong></span>
                      <span>🚪 Room {item.roomNo}</span>
                      <span>👤 Found by: {item.foundBy} ({item.foundDate})</span>
                      {item.claimantName && <span className="text-emerald-700 font-bold">✓ Claimed by: {item.claimantName}</span>}
                    </div>
                    {item.description && <p className="text-[11px] opacity-60 italic">{item.description}</p>}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {item.status === "Safe / Stored" && (
                      <Button
                        type="button"
                        onClick={() => handleMarkClaimed(item.id)}
                        className="h-8 px-3 text-xs rounded-xl bg-[#2b6a48] hover:bg-[#23583c] text-white font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Claimed
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-600 hover:text-red-800 rounded-xl hover:bg-red-50 border border-red-200"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}