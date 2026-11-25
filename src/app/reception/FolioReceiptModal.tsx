"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

interface FolioReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any | null;
  guestEntry: any | null;
  foodItems?: any[];
  applyGst?: boolean;
}

export function FolioReceiptModal({
  isOpen,
  onClose,
  room,
  guestEntry,
  foodItems = [],
  applyGst = true,
}: FolioReceiptModalProps) {
  const [billMode, setBillMode] = useState<"combined" | "room_only" | "food_only">("combined");
  const [hotelInfo, setHotelInfo] = useState({
    name: "APPLE RESIDENCY",
    address: "1st floor, Panchavati, Near Railway Overbridge,\nChansma Highway Road, Patan - 384265",
    email: "appleresidencyonline@gmail.com",
    gstin: "24AAAAA0000A1Z5",
    phone: "+91 9876543210",
    bankName: "HDFC Bank",
    accountNo: "5010015014187",
    ifsc: "HDFC0001852",
    branch: "Patan, Main Branch",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("hotel_pms_settings") || localStorage.getItem("hotel_details");
        if (saved) {
          const parsed = JSON.parse(saved);
          setHotelInfo({
            name: parsed.hotelName || parsed.name || "APPLE RESIDENCY",
            address: parsed.address || parsed.hotelAddress || "1st floor, Panchavati, Near Railway Overbridge, Chansma Highway Road, Patan - 384265",
            email: parsed.email || "appleresidencyonline@gmail.com",
            gstin: parsed.gstin || parsed.taxNumber || "24AAAAA0000A1Z5",
            phone: parsed.phone || parsed.mobile || "+91 9876543210",
            bankName: parsed.bankName || "HDFC Bank",
            accountNo: parsed.accountNo || "5010015014187",
            ifsc: parsed.ifsc || "HDFC0001852",
            branch: parsed.branch || "Patan, Main Branch",
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  if (!room) return null;

  const roomTariff = room.price || 2048;
  const foodTotal = foodItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  const gstRate = roomTariff <= 7500 ? 0.05 : 0.18;
  const gstAmount = applyGst ? roomTariff * (gstRate / 2) : 0;
  const cgst = gstAmount;
  const sgst = gstAmount;

  const advance = Number(guestEntry?.advancePayment) || 0;
  const days = 1;

  let rCharges = roomTariff;
  let taxCgst = cgst;
  let taxSgst = sgst;
  let fCharges = foodTotal;
  const laundryCharges = 0;
  const taxiCharges = 0;
  const miscCharges = 0;
  let advPaid = advance;

  if (billMode === "room_only") {
    fCharges = 0;
  } else if (billMode === "food_only") {
    rCharges = 0;
    taxCgst = 0;
    taxSgst = 0;
    advPaid = 0;
  }

  const roomSubtotal = rCharges * days;
  const totalRoomBill = roomSubtotal + taxCgst + taxSgst;
  const totalCharges = totalRoomBill + fCharges + laundryCharges + taxiCharges + miscCharges;
  const amountReceivable = Math.max(0, totalCharges - advPaid);

  const guestName = guestEntry?.fullName || room.guest || "Mohammad Oves A Mansur";
  const guestAddress = guestEntry?.address || guestEntry?.city || "SURAT";
  const billNo = `1704`;
  const regNo = `1668`;
  const billDate = new Date().toLocaleDateString("en-GB");

  const handlePrint = () => {
    setTimeout(() => window.print(), 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[94vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-4 shadow-2xl bg-white text-[#111] print:p-0 print:m-0 print:max-w-none print:w-full print:max-h-none print:overflow-visible print:shadow-none print:border-none print:rounded-none"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Tax Invoice - Apple Residency Style</DialogTitle>
        </DialogHeader>

        {/* A4 PRINT STYLES: readable spacing, safe margins, single invoice */}
        <style jsx global>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 8mm;
            }

            html,
            body {
              width: auto !important;
              height: auto !important;
              min-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              background: #fff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body > *:not(:has(#apple-residency-invoice)) {
              display: none !important;
            }

            [data-slot="dialog-overlay"],
            [data-radix-dialog-overlay] {
              display: none !important;
            }

            [role="dialog"] {
              position: static !important;
              inset: auto !important;
              transform: none !important;
              translate: none !important;
              width: 100% !important;
              max-width: none !important;
              height: auto !important;
              max-height: none !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              background: #fff !important;
            }

            .print\\:hidden {
              display: none !important;
            }

            #apple-residency-invoice {
              display: flex !important;
              flex-direction: column !important;
              gap: 3mm !important;
              width: 100% !important;
              max-width: 194mm !important;
              height: auto !important;
              margin: 0 auto !important;
              padding: 0 !important;
              box-sizing: border-box !important;
              background: #fff !important;
              color: #111 !important;
              font-family: Arial, Helvetica, sans-serif !important;
              font-size: 10pt !important;
              line-height: 1.25 !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
            }

            #apple-residency-invoice > * {
              margin-top: 0 !important;
              margin-bottom: 0 !important;
            }

            #apple-residency-invoice table {
              width: 100% !important;
              table-layout: fixed !important;
              border-collapse: collapse !important;
            }

            #apple-residency-invoice th,
            #apple-residency-invoice td {
              padding: 1.5mm 1mm !important;
              vertical-align: middle !important;
              overflow-wrap: anywhere !important;
            }

            #apple-residency-invoice th {
              font-size: 8.5pt !important;
              line-height: 1.2 !important;
            }

            #apple-residency-invoice td {
              font-size: 9pt !important;
            }

            #apple-residency-invoice h2 {
              font-size: 15pt !important;
              line-height: 1.2 !important;
              margin: 1mm 0 !important;
            }

            #apple-residency-invoice p {
              line-height: 1.25 !important;
            }

            #apple-residency-invoice .text-\\[8px\\],
            #apple-residency-invoice .text-\\[8\\.5px\\],
            #apple-residency-invoice .text-\\[9px\\],
            #apple-residency-invoice .text-\\[9\\.5px\\] {
              font-size: 8pt !important;
            }

            #apple-residency-invoice .text-\\[10px\\],
            #apple-residency-invoice .text-\\[11px\\] {
              font-size: 9pt !important;
            }

            #apple-residency-invoice .border-black {
              border-color: #222 !important;
            }

            #apple-residency-invoice .bg-slate-100 {
              background: #f1f5f9 !important;
            }

            #apple-residency-invoice .rounded-xs {
              border-radius: 1.5mm !important;
            }
          }
        `}</style>

        {/* SCREEN TOP ACTION BAR */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 print:hidden gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setBillMode("combined")}
              className={`px-2.5 py-1 rounded-md transition-all ${billMode === "combined" ? "bg-[#2b6a48] text-white shadow-xs" : "text-slate-600 hover:text-black"}`}
            >
              Combined Bill
            </button>
            <button
              type="button"
              onClick={() => setBillMode("room_only")}
              className={`px-2.5 py-1 rounded-md transition-all ${billMode === "room_only" ? "bg-[#2b6a48] text-white shadow-xs" : "text-slate-600 hover:text-black"}`}
            >
              Room Bill Only
            </button>
            <button
              type="button"
              onClick={() => setBillMode("food_only")}
              className={`px-2.5 py-1 rounded-md transition-all ${billMode === "food_only" ? "bg-[#2b6a48] text-white shadow-xs" : "text-slate-600 hover:text-black"}`}
            >
              Food Bill Only
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              className="h-7 px-3 bg-[#2b6a48] hover:bg-[#23583c] text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm"
            >
              <Printer className="w-3 h-3" /> Print Invoice
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="h-7 w-7 p-0 rounded-lg border-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* APPLE RESIDENCY INVOICE LAYOUT */}
        <div id="apple-residency-invoice" className="bg-white text-black font-sans text-[11px] space-y-2">
          {/* HEADER */}
          <div className="text-center space-y-0 border-b pb-1.5 border-slate-300">
            <div className="w-9 h-9 mx-auto rounded-full border border-slate-400 flex items-center justify-center font-black text-xs text-slate-700 bg-slate-50">
              {hotelInfo.name.substring(0, 2).toUpperCase()}
            </div>
            <h2 className="text-sm font-black tracking-widest uppercase text-slate-900">{hotelInfo.name}</h2>
            <p className="text-[9px] text-slate-600 whitespace-pre-line leading-tight">{hotelInfo.address}</p>
            <p className="text-[8.5px] text-slate-500">Email: {hotelInfo.email}</p>
            <div className="pt-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider border-b border-black pb-0">TAX INVOICE</span>
            </div>
          </div>

          {/* GUEST & BILL META */}
          <div className="border border-black rounded-xs overflow-hidden">
            <div className="grid grid-cols-12 divide-x divide-black text-[10px]">
              <div className="col-span-7 p-1 space-y-0">
                <div className="flex">
                  <span className="w-20 font-bold">Guest Name</span>
                  <span className="flex-1 uppercase font-semibold">: {guestName}</span>
                </div>
                <div className="flex">
                  <span className="w-20 font-bold">Address</span>
                  <span className="flex-1 uppercase">: {guestAddress}</span>
                </div>
              </div>
              <div className="col-span-5 p-1 space-y-0 text-[10px]">
                <div className="flex justify-between">
                  <span className="font-bold">Bill Date</span>
                  <span className="font-mono">: {billDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Bill No</span>
                  <span className="font-mono">: {billNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Reg No</span>
                  <span className="font-mono">: {regNo}</span>
                </div>
              </div>
            </div>

            {/* ROOM TABLE */}
            <div className="border-t border-black">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black text-[8.5px] font-bold bg-slate-100">
                    <th className="p-0.5 border-r border-black w-12 text-center">Room No</th>
                    <th className="p-0.5 border-r border-black text-center">Arrival Date</th>
                    <th className="p-0.5 border-r border-black text-center">Departure Date</th>
                    <th className="p-0.5 border-r border-black text-center w-10">Person</th>
                    <th className="p-0.5 border-r border-black text-right">Tariff</th>
                    <th className="p-0.5 border-r border-black text-center w-10">Disc.</th>
                    <th className="p-0.5 border-r border-black text-right">Rate</th>
                    <th className="p-0.5 border-r border-black text-center w-8">Days</th>
                    <th className="p-0.5 text-right pr-1">Amount</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[10px]">
                  {billMode === "combined" || billMode === "room_only" ? (
                    <tr className="border-b border-black">
                      <td className="p-0.5 border-r border-black font-bold text-center">{room.number}</td>
                      <td className="p-0.5 border-r border-black text-center">22-10-2026</td>
                      <td className="p-0.5 border-r border-black text-center">26-10-2026</td>
                      <td className="p-0.5 border-r border-black text-center">1</td>
                      <td className="p-0.5 border-r border-black text-right">₹{roomTariff}</td>
                      <td className="p-0.5 border-r border-black text-center">0.00(0%)</td>
                      <td className="p-0.5 border-r border-black text-right">{roomTariff}</td>
                      <td className="p-0.5 border-r border-black text-center">{days}</td>
                      <td className="p-0.5 text-right font-bold pr-1">₹{roomSubtotal.toFixed(2)}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-1 text-center text-slate-400 italic">
                        Room Charges Excluded (Food Only Mode)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TAX CALCULATIONS */}
            {(billMode === "combined" || billMode === "room_only") && (
              <div className="p-1 space-y-0 border-t border-black font-mono text-[10px]">
                <div className="flex justify-end gap-10 pr-2">
                  <span className="font-bold">Room Charges:</span>
                  <span className="w-20 text-right">₹{roomSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-end gap-10 pr-2">
                  <span className="font-bold">CGST Tax:</span>
                  <span className="w-20 text-right">₹{taxCgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black pb-0.5">
                  <span className="text-[8.5px] text-slate-500 italic pl-1">GSTIN: {hotelInfo.gstin}</span>
                  <div className="flex justify-end gap-10 pr-2">
                    <span className="font-bold">SGST Tax:</span>
                    <span className="w-20 text-right">₹{taxSgst.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-10 pr-2 pt-0.5 font-black text-xs">
                  <span>Bill Amount:</span>
                  <span className="w-24 text-right">₹{totalRoomBill.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* BANK DETAILS & CHARGES */}
          <div className="border border-black rounded-xs overflow-hidden grid grid-cols-12 divide-x divide-black text-[10px]">
            <div className="col-span-7 p-1.5 space-y-0">
              <p className="font-bold uppercase underline tracking-wide text-[9px]">BANK DETAILS :</p>
              <div className="flex"><span className="w-16 font-bold">NAME</span><span>: {hotelInfo.name}</span></div>
              <div className="flex"><span className="w-16 font-bold">BANK</span><span>: {hotelInfo.bankName}</span></div>
              <div className="flex"><span className="w-16 font-bold">A/C No</span><span>: {hotelInfo.accountNo}</span></div>
              <div className="flex"><span className="w-16 font-bold">IFSC</span><span>: {hotelInfo.ifsc}</span></div>
              <div className="flex"><span className="w-16 font-bold">BRANCH</span><span>: {hotelInfo.branch}</span></div>
            </div>

            <div className="col-span-5 p-1.5 space-y-0 font-mono text-[10px]">
              <div className="flex justify-between"><span className="font-sans font-medium">Out Food</span><span>0.00</span></div>
              <div className="flex justify-between"><span className="font-sans font-medium">Food</span><span>{fCharges.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="font-sans font-medium">Laundry</span><span>{laundryCharges.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="font-sans font-medium">Taxi</span><span>{taxiCharges.toFixed(2)}</span></div>
              <div className="flex justify-between border-b border-black pb-0.5"><span className="font-sans font-medium">Misc</span><span>{miscCharges.toFixed(2)}</span></div>

              <div className="flex justify-between pt-0.5 font-bold"><span className="font-sans">Total Charges</span><span>₹{totalCharges.toFixed(2)}</span></div>
              <div className="flex justify-between text-emerald-700"><span className="font-sans">Less:- Advance</span><span>- ₹{advPaid.toFixed(2)}</span></div>
              <div className="flex justify-between pt-0.5 border-t border-black font-black text-xs text-[#2b6a48]">
                <span className="font-sans">Amount Receivable</span>
                <span>₹{amountReceivable.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* SIGNATURE & FOOTER */}
          <div className="border border-black rounded-xs p-1.5 flex items-end justify-between pt-2">
            <div className="space-y-1">
              <div className="border border-black w-32 h-6 rounded-xs p-0.5 text-[8px] text-slate-500">
                Guest Sign:
              </div>
              <div className="text-[8.5px] space-y-0">
                <p><span className="font-bold">GST No.</span> : {hotelInfo.gstin}</p>
                <p><span className="font-bold">SAC Code</span> : 996311</p>
              </div>
            </div>

            <div className="text-center space-y-1">
              <div className="text-[9.5px] font-bold">Sign:</div>
              <div className="h-4 border-b border-black w-32" />
            </div>
          </div>

          <div className="text-center font-bold text-[9.5px] pt-0 italic text-slate-700">
            Thanks For Staying With Us.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}