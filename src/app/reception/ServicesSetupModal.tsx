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
  ConciergeBell,
  Plus,
  Trash2,
  Sparkles,
  Shirt,
  ShowerHead,
  Car,
  Wind,
  Tv,
  Coffee,
  Clock,
  Key,
  Flame,
  Shield,
  Briefcase,
  Footprints,
  IndianRupee,
  Layers,
  Search,
  Wifi,
  PhoneCall,
  Utensils,
  Wine,
  CupSoda,
  Beer,
  Pizza,
  IceCream,
  Bed,
  Bath,
  BellRing,
  Luggage,
  Compass,
  MapPin,
  Umbrella,
  Sun,
  Moon,
  Fan,
  Wrench,
  Hammer,
  Plug,
  Volume2,
  Lock,
  Unlock,
  CreditCard,
  Wallet,
  Gift,
  Heart,
  Smile,
  Baby,
  Dog,
  Printer,
  FileText,
  Mail,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// MEGA 56-ICON HOSPITALITY PACK
export const SERVICE_ICON_MAP: { [key: string]: any } = {
  // Housekeeping & Room
  Sparkles: Sparkles,
  ShowerHead: ShowerHead,
  Bath: Bath,
  Bed: Bed,
  Shirt: Shirt,
  Footprints: Footprints,
  Fan: Fan,
  Wind: Wind,
  Sun: Sun,
  Moon: Moon,
  Flame: Flame,
  
  // Front Desk, Reception & Concierge
  ConciergeBell: ConciergeBell,
  BellRing: BellRing,
  Luggage: Luggage,
  Key: Key,
  Lock: Lock,
  Unlock: Unlock,
  Briefcase: Briefcase,
  Clock: Clock,
  Calendar: Clock,
  PhoneCall: PhoneCall,
  Wifi: Wifi,
  Printer: Printer,
  FileText: FileText,
  Mail: Mail,

  // Travel & Outdoors
  Car: Car,
  Compass: Compass,
  MapPin: MapPin,
  Umbrella: Umbrella,
  Shield: Shield,

  // Dining & Refreshments
  Coffee: Coffee,
  CupSoda: CupSoda,
  Utensils: Utensils,
  Wine: Wine,
  Beer: Beer,
  Pizza: Pizza,
  IceCream: IceCream,

  // Tech & Maintenance
  Tv: Tv,
  Wrench: Wrench,
  Hammer: Hammer,
  Plug: Plug,
  Volume2: Volume2,
  AlertCircle: AlertCircle,
  HelpCircle: HelpCircle,

  // Special, Billing & Lifestyle
  CreditCard: CreditCard,
  Wallet: Wallet,
  Gift: Gift,
  Heart: Heart,
  Smile: Smile,
  Baby: Baby,
  Dog: Dog,
  CheckCircle2: CheckCircle2,
};

export interface HotelServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  iconName: string;
  isAvailable: boolean;
}

const DEFAULT_SERVICES: HotelServiceItem[] = [
  {
    id: "srv-1",
    name: "Fresh Towels & Linen",
    description: "Extra bath towels, hand towels, and clean bedsheets.",
    price: 0,
    iconName: "ShowerHead",
    isAvailable: true,
  },
  {
    id: "srv-2",
    name: "Room Cleaning & Sanitization",
    description: "Complete room dusting, mop, and dustbin clearance.",
    price: 0,
    iconName: "Sparkles",
    isAvailable: true,
  },
  {
    id: "srv-3",
    name: "Express Laundry & Ironing",
    description: "Wash, iron, and fold with doorstep delivery.",
    price: 150,
    iconName: "Shirt",
    isAvailable: true,
  },
  {
    id: "srv-4",
    name: "AC & Geyser Assistance",
    description: "Air conditioner cooling or hot water temperature check.",
    price: 0,
    iconName: "Wind",
    isAvailable: true,
  },
  {
    id: "srv-5",
    name: "Taxi / Airport Cab Booking",
    description: "Book on-demand cab for local travel or airport drops.",
    price: 0,
    iconName: "Car",
    isAvailable: true,
  },
  {
    id: "srv-6",
    name: "Morning Wake-Up Call",
    description: "Automated front-desk morning wake-up intercom ring.",
    price: 0,
    iconName: "Clock",
    isAvailable: true,
  },
  {
    id: "srv-7",
    name: "Mineral Water Refill",
    description: "Packaged mineral drinking water bottles delivered to room.",
    price: 30,
    iconName: "CupSoda",
    isAvailable: true,
  },
  {
    id: "srv-8",
    name: "Luggage Bellboy Assistance",
    description: "Porter service for heavy luggage check-in and checkout.",
    price: 0,
    iconName: "Luggage",
    isAvailable: true,
  },
];

interface ServicesSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export function ServicesSetupModal({
  isOpen,
  onClose,
  darkMode = false,
}: ServicesSetupModalProps) {
  const [services, setServices] = useState<HotelServiceItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hotel_pms_services_catalog");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_SERVICES;
  });

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState<number | "">(0);
  const [selectedIcon, setSelectedIcon] = useState("Sparkles");
  const [iconSearchTerm, setIconSearchTerm] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hotel_pms_services_catalog", JSON.stringify(services));
    }
  }, [services]);

  const handleAddService = () => {
    if (!newName.trim()) {
      alert("Service ka naam likhna zaroori hai!");
      return;
    }
    const newService: HotelServiceItem = {
      id: `srv-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || "On-demand guest room service.",
      price: Number(newPrice) || 0,
      iconName: selectedIcon,
      isAvailable: true,
    };
    const updated = [...services, newService];
    setServices(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("hotel_pms_services_catalog", JSON.stringify(updated));
    }
    setNewName("");
    setNewDesc("");
    setNewPrice(0);
    setSelectedIcon("Sparkles");
  };

  const handleDeleteService = (id: string) => {
    if (confirm("Kya aap sach me is service ko hatana chahte hain?")) {
      const updated = services.filter((s) => s.id !== id);
      setServices(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("hotel_pms_services_catalog", JSON.stringify(updated));
      }
    }
  };

  const handleToggleAvailability = (id: string) => {
    const updated = services.map((s) => (s.id === id ? { ...s, isAvailable: !s.isAvailable } : s));
    setServices(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("hotel_pms_services_catalog", JSON.stringify(updated));
    }
  };

  // Filter 56 Icons via search term
  const iconKeys = Object.keys(SERVICE_ICON_MAP).filter((key) =>
    key.toLowerCase().includes(iconSearchTerm.toLowerCase().trim())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`w-[96vw] max-w-5xl h-[92vh] rounded-3xl border p-6 shadow-2xl flex flex-col transition-colors overflow-hidden ${
          darkMode ? "bg-[#25221e] border-[#403d38] text-[#e5e2db]" : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Hotel Services Setup & Mega Icon Pack</DialogTitle>
        </DialogHeader>

        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#afd9c3]/40 gap-3 select-none">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold border ${
                darkMode ? "bg-[#403d38] text-[#d6fce2]" : "bg-[#d6fce2] text-[#2b6a48] border-[#afd9c3]"
              }`}
            >
              <ConciergeBell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg tracking-tight">Hotel Guest Services Matrix</h3>
                <Badge className="bg-[#d6fce2] text-[#2b6a48] border border-[#afd9c3] text-[10px] font-bold">
                  {services.length} Active Services
                </Badge>
                <Badge className="bg-[#403d38] text-[#d6fce2] text-[10px] font-bold">
                  56-Icon Mega Pack
                </Badge>
              </div>
              <p className="text-xs opacity-65">
                Manage all hotel services. Changes will instantly sync to guest portal.
              </p>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="h-8.5 px-4 rounded-xl text-xs font-bold bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db]"
          >
            Save & Done
          </Button>
        </div>

        {/* 2-COLUMN VIEW */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 pt-3 overflow-hidden text-xs">
          
          {/* LEFT: ADD NEW SERVICE FORM (5 Cols) */}
          <div className="md:col-span-5 p-4 rounded-3xl border border-[#afd9c3]/60 bg-white dark:bg-[#1f1d1a] flex flex-col justify-between overflow-hidden shadow-xs">
            <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
              <div className="font-black text-xs uppercase tracking-wider text-[#2b6a48] dark:text-[#afd9c3] flex items-center gap-1.5 pb-1 border-b">
                <Plus className="w-3.5 h-3.5" /> Add Custom Service
              </div>

              <div className="space-y-1">
                <label className="font-bold">Service Name *</label>
                <Input
                  placeholder="e.g. Ironing, Car Wash, Baby Cot..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-8.5 text-xs rounded-xl border-[#afd9c3]/70"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Short Description</label>
                <Input
                  placeholder="e.g. Delivered within 15 minutes"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="h-8.5 text-xs rounded-xl border-[#afd9c3]/70"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold">Price (₹ 0 = Free / Complimentary)</label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-50" />
                  <Input
                    type="number"
                    placeholder="0"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value ? Number(e.target.value) : "")}
                    className="h-8.5 pl-8 text-xs font-mono font-bold rounded-xl border-[#afd9c3]/70"
                  />
                </div>
              </div>

              {/* 56-ICON PACK SELECTOR WITH SEARCH */}
              <div className="space-y-1.5 flex-1 flex flex-col overflow-hidden pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[11px] block">
                    Pick Icon: <span className="font-mono text-[#2b6a48]">{selectedIcon}</span>
                  </label>
                  <div className="relative w-32">
                    <Search className="w-3 h-3 absolute left-2 top-2 opacity-40" />
                    <Input
                      placeholder="Find icon..."
                      value={iconSearchTerm}
                      onChange={(e) => setIconSearchTerm(e.target.value)}
                      className="h-7 pl-6 text-[10px] rounded-lg border-[#afd9c3]/60"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 rounded-2xl bg-slate-50 dark:bg-[#25221e] border border-slate-200 dark:border-slate-800 grid grid-cols-7 gap-1.5 max-h-40 [scrollbar-width:none]">
                  {iconKeys.map((iconKey) => {
                    const IconComp = SERVICE_ICON_MAP[iconKey];
                    const isSelected = selectedIcon === iconKey;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setSelectedIcon(iconKey)}
                        title={iconKey}
                        className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-[#2b6a48] text-white shadow-xs scale-110"
                            : "text-slate-600 dark:text-slate-300 hover:bg-[#d6fce2]/40"
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleAddService}
                className="w-full h-9 rounded-xl font-bold text-xs bg-[#2b6a48] hover:bg-[#23583c] text-white shadow-xs flex items-center justify-center gap-1.5 mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> Save Service to Catalog
              </Button>
            </div>
          </div>

          {/* RIGHT: ALL CONFIGURED SERVICES LIST (7 Cols) */}
          <div className="md:col-span-7 flex flex-col overflow-hidden">
            <div className="font-black text-xs uppercase tracking-wider opacity-60 flex items-center gap-1.5 pb-2 border-b">
              <Layers className="w-3.5 h-3.5" /> All Services Configured for Guest Portal ({services.length})
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pt-2 [scrollbar-width:none]">
              {services.map((item) => {
                const IconComp = SERVICE_ICON_MAP[item.iconName] || Sparkles;
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      item.isAvailable
                        ? "bg-white dark:bg-[#1f1d1a] border-[#afd9c3]/60 shadow-xs"
                        : "bg-red-50/30 dark:bg-red-950/20 border-red-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#d6fce2] text-[#2b6a48] border border-[#afd9c3] flex items-center justify-center shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs">{item.name}</span>
                          {item.price === 0 ? (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#d6fce2] text-[#2b6a48] border border-[#afd9c3]">
                              Free
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                              ₹{item.price}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] opacity-65 leading-tight mt-0.5">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleAvailability(item.id)}
                        className={`h-7 px-2.5 text-[10px] font-bold rounded-xl border ${
                          item.isAvailable
                            ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30"
                            : "border-red-300 text-red-600 bg-red-50 dark:bg-red-950/30"
                        }`}
                      >
                        {item.isAvailable ? "Active" : "Disabled"}
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteService(item.id)}
                        className="h-7 w-7 text-slate-400 hover:text-red-500 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}