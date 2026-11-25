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
import { Users, Search, Trash2, Phone, Mail, MapPin, FileBadge } from "lucide-react";

interface CustomerRecord {
  mobile: string;
  fullName: string;
  address: string;
  city: string;
  stateName: string;
  pincode: string;
  email: string;
  idType: string;
  idNumber: string;
  companyName?: string;
  guestGstin?: string;
}

interface CustomerMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export function CustomerMasterModal({
  isOpen,
  onClose,
  darkMode = false,
}: CustomerMasterModalProps) {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("hotel_pms_customer_master");
        if (saved) {
          try {
            setCustomers(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to parse customer master:", e);
          }
        }
      }
    }
  }, [isOpen]);

  const handleDelete = (mobile: string) => {
    if (confirm("Are you sure you want to delete this customer record from master?")) {
      const updated = customers.filter((c) => c.mobile !== mobile);
      setCustomers(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("hotel_pms_customer_master", JSON.stringify(updated));
      }
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile?.includes(searchQuery) ||
      c.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`w-[90vw] max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl transition-colors ${
          darkMode
            ? "bg-[#2d2a26] border-[#403d38] text-[#e5e2db]"
            : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Customer Master Directory</DialogTitle>
        </DialogHeader>

        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-[#afd9c3]/40">
          <div className="flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#2b6a48]" />
            <div>
              <h2 className="text-xl font-bold tracking-tight">Customer Master (Guest Directory & CRM)</h2>
              <p className="text-xs opacity-60">Automatically tracks all checked-in guests for instant 1-click future check-ins.</p>
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

        {/* SEARCH & LIST */}
        <div className="space-y-4 pt-4 text-xs">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-bold text-sm">Saved Guest Profiles ({filteredCustomers.length})</h3>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#afd9c3]/70 bg-slate-50 dark:bg-[#1f1d1a] w-72">
              <Search className="w-4 h-4 opacity-50" />
              <input
                type="text"
                placeholder="Search by name, mobile or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-2.5 pr-1">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-16 opacity-50 space-y-2">
                <Users className="w-10 h-10 mx-auto opacity-30" />
                <p>No customer records found. They will appear here automatically after every check-in!</p>
              </div>
            ) : (
              filteredCustomers.map((c, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-[#afd9c3]/60 bg-white dark:bg-[#1f1d1a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-[#2b6a48] dark:text-[#afd9c3]">{c.fullName}</span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#d6fce2] text-[#403d38]">
                        {c.mobile}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] opacity-75 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#2b6a48]" /> {c.address}, {c.city} ({c.stateName})
                      </span>
                      {c.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#2b6a48]" /> {c.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-mono">
                        <FileBadge className="w-3 h-3 text-[#2b6a48]" /> {c.idType}: {c.idNumber || "N/A"}
                      </span>
                      {c.companyName && (
                        <span className="font-semibold text-[#2b6a48]">
                          🏢 {c.companyName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.mobile)}
                      className="p-2 text-red-600 hover:text-red-800 rounded-xl hover:bg-red-50 border border-red-200"
                      title="Delete Profile"
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