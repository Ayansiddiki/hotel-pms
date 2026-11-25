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
import { Building2, Plus, Trash2, CheckCircle2, Search, Edit3 } from "lucide-react";

interface CompanyRecord {
  id: string;
  name: string;
  gstin: string;
  address?: string;
  phone?: string;
}

interface CompanyMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export function CompanyMasterModal({
  isOpen,
  onClose,
  darkMode = false,
}: CompanyMasterModalProps) {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form States for Adding/Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Load saved companies from localStorage on open
  useEffect(() => {
    if (isOpen) {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("hotel_pms_companies");
        if (saved) {
          try {
            setCompanies(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to parse companies:", e);
          }
        } else {
          // Default sample companies
          const defaultCompanies: CompanyRecord[] = [
            { id: "1", name: "Reliance Industries Ltd", gstin: "24AABCR1234F1Z5", address: "Ahmedabad", phone: "9876543210" },
            { id: "2", name: "Tata Consultancy Services", gstin: "27AAACT9876G1Z9", address: "Mumbai", phone: "9123456789" }
          ];
          setCompanies(defaultCompanies);
          localStorage.setItem("hotel_pms_companies", JSON.stringify(defaultCompanies));
        }
      }
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEditingId(null);
    setCompanyName("");
    setGstin("");
    setAddress("");
    setPhone("");
    setErrorMsg("");
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setErrorMsg("Company Name is required!");
      return;
    }

    const trimmedName = companyName.trim();
    const trimmedGstin = gstin.trim().toUpperCase();

    let updatedList: CompanyRecord[];
    if (editingId) {
      updatedList = companies.map((c) =>
        c.id === editingId ? { ...c, name: trimmedName, gstin: trimmedGstin, address, phone } : c
      );
    } else {
      const newRecord: CompanyRecord = {
        id: Date.now().toString(),
        name: trimmedName,
        gstin: trimmedGstin,
        address,
        phone,
      };
      updatedList = [newRecord, ...companies];
    }

    setCompanies(updatedList);
    if (typeof window !== "undefined") {
      localStorage.setItem("hotel_pms_companies", JSON.stringify(updatedList));
    }
    resetForm();
  };

  const handleEdit = (comp: CompanyRecord) => {
    setEditingId(comp.id);
    setCompanyName(comp.name);
    setGstin(comp.gstin);
    setAddress(comp.address || "");
    setPhone(comp.phone || "");
    setErrorMsg("");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this company record?")) {
      const updatedList = companies.filter((c) => c.id !== id);
      setCompanies(updatedList);
      if (typeof window !== "undefined") {
        localStorage.setItem("hotel_pms_companies", JSON.stringify(updatedList));
      }
    }
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gstin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl transition-colors ${
          darkMode
            ? "bg-[#2d2a26] border-[#403d38] text-[#e5e2db]"
            : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Company Master Management</DialogTitle>
        </DialogHeader>

        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-[#afd9c3]/40">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-[#2b6a48]" />
            <div>
              <h2 className="text-xl font-bold tracking-tight">Company Master (Corporate Directory)</h2>
              <p className="text-xs opacity-60">Manage corporate client names and GSTIN records for fast check-in auto-fill.</p>
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 text-xs">
          
          {/* LEFT COLUMN: Add / Edit Form */}
          <div className={`md:col-span-5 p-5 rounded-2xl border space-y-3 ${darkMode ? "bg-[#1f1d1a] border-[#403d38]" : "bg-white border-[#afd9c3]/50 shadow-xs"}`}>
            <h3 className="font-bold text-sm text-[#2b6a48] dark:text-[#afd9c3] flex items-center gap-1.5">
              {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? "Edit Company Record" : "Add New Corporate Client"}
            </h3>

            <form onSubmit={handleSaveCompany} className="space-y-3 pt-1">
              <div>
                <label className="font-semibold block mb-1">Company Name *</label>
                <Input
                  placeholder="e.g. Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-9 text-xs rounded-xl border-[#afd9c3]/70"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">GSTIN (GST Number)</label>
                <Input
                  placeholder="e.g. 24AAAAA0000A1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="h-9 text-xs rounded-xl border-[#afd9c3]/70 font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Office Address</label>
                <Input
                  placeholder="City or Full Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-9 text-xs rounded-xl border-[#afd9c3]/70"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Contact Phone</label>
                <Input
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs rounded-xl border-[#afd9c3]/70 font-mono"
                />
              </div>

              {errorMsg && <p className="text-red-500 text-[11px] font-semibold">{errorMsg}</p>}

              <div className="flex gap-2 pt-2">
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="w-1/2 h-9 text-xs rounded-xl border-[#afd9c3]"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  className={`${editingId ? "w-1/2" : "w-full"} h-9 text-xs rounded-xl bg-[#2b6a48] hover:bg-[#23583c] text-white font-bold flex items-center justify-center gap-1.5`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {editingId ? "Update Company" : "Save Company"}
                </Button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Company List & Search */}
          <div className={`md:col-span-7 p-5 rounded-2xl border space-y-3 flex flex-col ${darkMode ? "bg-[#1f1d1a] border-[#403d38]" : "bg-white border-[#afd9c3]/50 shadow-xs"}`}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-sm">Saved Companies ({filteredCompanies.length})</h3>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-[#afd9c3]/70 bg-slate-50 dark:bg-[#2d2a26] w-48">
                <Search className="w-3.5 h-3.5 opacity-50" />
                <input
                  type="text"
                  placeholder="Search company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs w-full focus:outline-none"
                />
              </div>
            </div>

            {/* List Table */}
            <div className="flex-1 max-h-[340px] overflow-y-auto space-y-2 pr-1">
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-12 opacity-50">No company records found. Add one from the left form!</div>
              ) : (
                filteredCompanies.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-[#afd9c3]/60 bg-slate-50/50 dark:bg-[#25221e] flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="font-bold text-xs truncate text-[#2b6a48] dark:text-[#afd9c3]">{c.name}</div>
                      <div className="font-mono text-[11px] opacity-75">GSTIN: {c.gstin || "N/A"}</div>
                      {c.address && <div className="text-[10px] opacity-60">{c.address}</div>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleEdit(c)}
                        className="h-7 px-2 text-[10px] rounded-lg border-[#afd9c3]"
                      >
                        Edit
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}