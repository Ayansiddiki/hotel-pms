"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Receipt, Printer, Edit3, Layers, Search, CheckCircle2, Calculator } from "lucide-react";

interface BillMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export function BillMasterModal({
  isOpen,
  onClose,
  darkMode = false,
}: BillMasterModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<"duplicate" | "edit" | "group">("duplicate");
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<any[]>([]);

  // Edit Bill State
  const [selectedBillForEdit, setSelectedBillForEdit] = useState<any | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editAdvance, setEditAdvance] = useState("");

  // Group Bill State
  const [selectedBillsForGroup, setSelectedBillsForGroup] = useState<string[]>([]);
  const [groupBillName, setGroupBillName] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("hotel_pms_eregister");
          if (saved) {
            const parsed = JSON.parse(saved);
            // Ensure every entry has a billNo if not present
            const enhanced = parsed.map((item: any, idx: number) => ({
              ...item,
              billNo: item.billNo || String(1700 + idx),
            }));
            setEntries(enhanced);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isOpen]);

  // Enhanced Search strictly targeting Bill Number (billNo), Guest Name, or Mobile Number
  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        (e.billNo && String(e.billNo).toLowerCase().includes(q)) ||
        (e.fullName && e.fullName.toLowerCase().includes(q)) ||
        (e.mobile && e.mobile.includes(q)) ||
        (e.roomNo && e.roomNo.toLowerCase().includes(q))
    );
  }, [entries, searchQuery]);

  const handleDuplicatePrint = (bill: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print duplicate bill.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Duplicate Invoice - Bill No #${bill.billNo}</title>
          <style>
            body { font-family: monospace; padding: 20px; font-size: 12px; color: #000; }
            .header { text-align: center; margin-bottom: 20px; }
            .details { margin-bottom: 15px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .table th, .table td { border: 1px solid #000; padding: 6px; text-align: left; }
            .total { text-align: right; margin-top: 15px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>GRAND PALACE HOTEL</h2>
            <p>DUPLICATE TAX INVOICE</p>
          </div>
          <div class="details">
            <p><strong>Bill No:</strong> #${bill.billNo}</p>
            <p><strong>Reg No:</strong> ${bill.id || "REG-001"}</p>
            <p><strong>Guest Name:</strong> ${bill.fullName}</p>
            <p><strong>Mobile:</strong> ${bill.mobile}</p>
            <p><strong>Room No:</strong> ${bill.roomNo}</p>
            <p><strong>Check-In:</strong> ${bill.checkInDateTime}</p>
            <p><strong>Check-Out:</strong> ${bill.checkOutDateTime || "Pending"}</p>
          </div>
          <table class="table">
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
            <tr>
              <td>Room Tariff & Stay Charges</td>
              <td>₹${bill.finalAmount || bill.advancePayment || 1500}</td>
            </tr>
          </table>
          <div class="total">
            <p>Advance Paid: ₹${bill.advancePayment || 0}</p>
            <p>Status: DUPLICATE REPRINT</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleStartEdit = (bill: any) => {
    setSelectedBillForEdit(bill);
    setEditAmount(String(bill.finalAmount || 1500));
    setEditAdvance(String(bill.advancePayment || 0));
  };

  const handleSaveEditedBill = () => {
    if (!selectedBillForEdit) return;
    const updated = entries.map((e) => {
      if (e.billNo === selectedBillForEdit.billNo) {
        return {
          ...e,
          finalAmount: Number(editAmount),
          advancePayment: Number(editAdvance),
        };
      }
      return e;
    });

    setEntries(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("hotel_pms_eregister", JSON.stringify(updated));
    }
    alert("Bill updated successfully!");
    setSelectedBillForEdit(null);
  };

  const toggleSelectForGroup = (billNo: string) => {
    setSelectedBillsForGroup((prev) =>
      prev.includes(billNo) ? prev.filter((item) => item !== billNo) : [...prev, billNo]
    );
  };

  const handleGenerateGroupBill = () => {
    if (selectedBillsForGroup.length < 2) {
      alert("Please select at least 2 bills to merge/group.");
      return;
    }
    if (!groupBillName.trim()) {
      alert("Please enter a Group / Corporate Name.");
      return;
    }

    const groupedBills = entries.filter((e) => selectedBillsForGroup.includes(e.billNo));
    const totalGroupAmount = groupedBills.reduce((acc, curr) => acc + Number(curr.finalAmount || 1500), 0);

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHtml = groupedBills
      .map(
        (b) => `
          <tr>
            <td>#${b.billNo}</td>
            <td>Room ${b.roomNo}</td>
            <td>${b.fullName}</td>
            <td>${b.mobile}</td>
            <td style="text-align:right;">₹${b.finalAmount || 1500}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Master Group Bill - ${groupBillName}</title>
          <style>
            body { font-family: monospace; padding: 20px; font-size: 12px; color: #000; }
            .header { text-align: center; margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .table th, .table td { border: 1px solid #000; padding: 6px; text-align: left; }
            .total { text-align: right; margin-top: 15px; font-weight: bold; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>GRAND PALACE HOTEL</h2>
            <p>MASTER GROUP / MERGED INVOICE</p>
            <p><strong>Group / Corporate Name:</strong> ${groupBillName}</p>
          </div>
          <table class="table">
            <tr>
              <th>Bill No</th>
              <th>Room</th>
              <th>Guest Name</th>
              <th>Mobile</th>
              <th style="text-align:right;">Subtotal</th>
            </tr>
            ${rowsHtml}
          </table>
          <div class="total">
            <p>Total Consolidated Group Amount: ₹${totalGroupAmount.toLocaleString("en-IN")}</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`w-[94vw] max-w-5xl max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-3xl border p-6 shadow-2xl transition-colors ${
          darkMode
            ? "bg-[#2d2a26] border-[#403d38] text-[#e5e2db]"
            : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Bill Master Control Center</DialogTitle>
        </DialogHeader>

        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-[#afd9c3]/40">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-[#2b6a48]" />
            <div>
              <h2 className="text-xl font-bold tracking-tight">Bill Master & Invoice Control Center</h2>
              <p className="text-xs opacity-60">Search by Bill Number (e.g. 1704), Guest Name, or Mobile to print, edit, or merge bills.</p>
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

        {/* SUB-TABS */}
        <div className="flex gap-2 pt-3">
          {[
            { id: "duplicate", label: "1. Duplicate Print", icon: Printer },
            { id: "edit", label: "2. Edit Bill", icon: Edit3 },
            { id: "group", label: "3. Merge / Group Bills", icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-[#2b6a48] text-white shadow-sm"
                    : darkMode
                    ? "bg-[#1f1d1a] border border-[#403d38] text-[#e5e2db] hover:bg-[#403d38]"
                    : "bg-white border border-[#afd9c3] text-[#403d38] hover:bg-[#d6fce2]/30"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* UNIVERSAL SEARCH BAR (Bill No, Name, Mobile) */}
        <div className="pt-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#afd9c3]/80 bg-white dark:bg-[#1f1d1a] w-full shadow-xs">
            <Search className="w-4 h-4 opacity-60 text-[#2b6a48]" />
            <input
              type="text"
              placeholder="🔍 Search by Bill Number (e.g. 1704), Guest Name, or Mobile Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs w-full focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* SUB-TAB 1: DUPLICATE PRINT */}
        {activeSubTab === "duplicate" && (
          <div className="space-y-3 pt-3 text-xs">
            <h3 className="font-bold text-sm text-[#2b6a48] dark:text-[#afd9c3]">Duplicate Bill Print (Searchable by Bill No / Name / Mobile)</h3>
            <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12 opacity-50">No billing records found matching your search.</div>
              ) : (
                filteredEntries.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-[#afd9c3]/60 bg-white dark:bg-[#1f1d1a] flex items-center justify-between gap-4 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-md bg-[#d6fce2] text-[#2b6a48]">
                          Bill #{item.billNo}
                        </span>
                        <span className="font-bold text-sm text-[#403d38] dark:text-[#e5e2db]">
                          Room {item.roomNo} — {item.fullName}
                        </span>
                      </div>
                      <div className="text-[11px] opacity-75 font-mono mt-1">
                        Mobile: {item.mobile} | Amount: ₹{item.finalAmount || 1500}
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleDuplicatePrint(item)}
                      className="h-8 px-3 text-xs rounded-xl bg-[#2b6a48] hover:bg-[#23583c] text-white font-bold flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Duplicate
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SUB-TAB 2: EDIT BILL */}
        {activeSubTab === "edit" && (
          <div className="space-y-4 pt-3 text-xs">
            {selectedBillForEdit ? (
              <div className="p-5 rounded-2xl border border-[#afd9c3] bg-white dark:bg-[#1f1d1a] space-y-4 shadow-md">
                <div className="flex items-center justify-between border-b border-[#afd9c3]/40 pb-2">
                  <h3 className="font-bold text-sm text-[#2b6a48]">
                    Editing Bill #{selectedBillForEdit.billNo} - Room {selectedBillForEdit.roomNo} ({selectedBillForEdit.fullName})
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedBillForEdit(null)}
                    className="h-7 text-[10px]"
                  >
                    Back to List
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1">Final Amount (₹)</label>
                    <Input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="h-9 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Advance Paid (₹)</label>
                    <Input
                      type="number"
                      value={editAdvance}
                      onChange={(e) => setEditAdvance(e.target.value)}
                      className="h-9 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleSaveEditedBill}
                  className="w-full h-9 rounded-xl bg-[#2b6a48] hover:bg-[#23583c] text-white font-bold flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Updated Bill
                </Button>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-sm text-[#2b6a48] dark:text-[#afd9c3]">Select Bill to Edit (Search by Bill No / Name / Mobile)</h3>
                <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                  {filteredEntries.length === 0 ? (
                    <div className="text-center py-12 opacity-50">No billing records found matching your search.</div>
                  ) : (
                    filteredEntries.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl border border-[#afd9c3]/60 bg-white dark:bg-[#1f1d1a] flex items-center justify-between gap-4 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#2d2a26]">
                              Bill #{item.billNo}
                            </span>
                            <span className="font-bold text-sm text-[#2b6a48] dark:text-[#afd9c3]">
                              Room {item.roomNo} — {item.fullName}
                            </span>
                          </div>
                          <div className="text-[11px] opacity-75 font-mono mt-1">
                            Mobile: {item.mobile} | Amount: ₹{item.finalAmount || 1500}
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="h-8 px-3 text-xs rounded-xl border border-[#afd9c3] font-bold"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Bill
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* SUB-TAB 3: GROUP / MERGE BILLS */}
        {activeSubTab === "group" && (
          <div className="space-y-4 pt-3 text-xs">
            <div className="flex items-center gap-3">
              <Input
                placeholder="Enter Group / Corporate Name (e.g. Mehta Wedding Group)"
                value={groupBillName}
                onChange={(e) => setGroupBillName(e.target.value)}
                className="h-9 text-xs rounded-xl flex-1 font-bold"
              />
              <Button
                type="button"
                disabled={selectedBillsForGroup.length < 2 || !groupBillName.trim()}
                onClick={handleGenerateGroupBill}
                className="h-9 px-4 text-xs rounded-xl bg-[#2b6a48] hover:bg-[#23583c] text-white font-bold flex items-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5" /> Merge & Print ({selectedBillsForGroup.length})
              </Button>
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12 opacity-50">No bills available for merging.</div>
              ) : (
                filteredEntries.map((item, idx) => {
                  const isSelected = selectedBillsForGroup.includes(item.billNo);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelectForGroup(item.billNo)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                        isSelected
                          ? "bg-[#d6fce2]/60 border-[#2b6a48] font-bold"
                          : "bg-white dark:bg-[#1f1d1a] border-[#afd9c3]/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 accent-[#2b6a48]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#2b6a48]">Bill #{item.billNo}</span>
                            <span className="text-sm">Room {item.roomNo} — {item.fullName}</span>
                          </div>
                          <div className="text-[10px] opacity-70 font-mono">Mobile: {item.mobile}</div>
                        </div>
                      </div>
                      <div className="font-mono font-bold">
                        ₹{item.finalAmount || 1500}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}