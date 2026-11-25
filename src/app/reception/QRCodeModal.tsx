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
  QrCode,
  Printer,
  Copy,
  Check,
  Wifi,
  ExternalLink,
  Layers,
  Globe,
} from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: any[];
  hotelName?: string;
  darkMode?: boolean;
}

export function QRCodeModal({
  isOpen,
  onClose,
  rooms,
  hotelName = "Grand Palace Hotel",
  darkMode = false,
}: QRCodeModalProps) {
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>(
    rooms.length > 0 ? rooms[0].number : "101"
  );
  const [copiedLink, setCopiedLink] = useState(false);

  // Host configuration for mobile scanning (e.g. 192.168.1.5:3000 or your domain)
  const defaultHost = typeof window !== "undefined" ? window.location.host : "localhost:3000";
  const [serverHost, setServerHost] = useState(defaultHost);

  const selectedRoomObj = rooms.find((r) => r.number === selectedRoomNumber);

  // Portal URL for phone scanning
  const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
  const getPortalUrl = (roomNo: string) => `${protocol}//${serverHost}/guest?room=${roomNo}`;

  const getQrSrc = (roomNo: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(
      getPortalUrl(roomNo)
    )}&margin=10`;
  };

  const currentPortalUrl = getPortalUrl(selectedRoomNumber);

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(currentPortalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const generateCardHtml = (roomNo: string, passcode?: string) => `
    <div class="card-wrapper">
      <div class="standee-card">
        <div class="top-strip"></div>
        <div class="hotel-title">${hotelName}</div>
        <div class="room-pill">ROOM ${roomNo}</div>
        <div class="qr-box">
          <img src="${getQrSrc(roomNo)}" alt="QR Code Room ${roomNo}" />
        </div>
        <div class="scan-heading">SCAN FOR IN-ROOM SERVICES</div>
        <div class="scan-sub">Order Food, Request Housekeeping & View Bill directly from your phone.</div>
        <div class="wifi-box">
          <div class="wifi-row">
            <span><strong>Wi-Fi:</strong> ${hotelName.replace(/\s+/g, "")}_WiFi</span>
            <span><strong>Pass:</strong> welcome@2026</span>
          </div>
          <div class="wifi-row pin-row">
            <span><strong>Guest Passcode:</strong> ${passcode ? `PIN: ${passcode}` : "Provided on Check-in"}</span>
          </div>
        </div>
        <div class="footer-tag">Powered by Smart Hotel PMS</div>
      </div>
    </div>
  `;

  const printStyles = `
    <style>
      @page { size: A4 portrait; margin: 10mm; }
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; }
      body { background: #fff; color: #222; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
      .card-wrapper { page-break-after: always; display: flex; align-items: center; justify-content: center; min-height: 85vh; width: 100%; }
      .card-wrapper:last-child { page-break-after: auto; }
      .standee-card { width: 320px; padding: 24px 20px; border: 2px solid #2b6a48; border-radius: 24px; text-align: center; position: relative; }
      .top-strip { position: absolute; top: 0; left: 0; right: 0; height: 6px; background: #2b6a48; }
      .hotel-title { font-size: 15px; font-weight: 800; text-transform: uppercase; color: #2b6a48; margin-top: 4px; }
      .room-pill { display: inline-block; margin: 8px 0 14px; padding: 4px 14px; font-size: 12px; font-weight: 900; font-family: monospace; background: #d6fce2; color: #2b6a48; border: 1px solid #afd9c3; border-radius: 999px; }
      .qr-box { padding: 10px; background: #fafafa; border: 2px dashed #afd9c3; border-radius: 18px; display: inline-block; margin-bottom: 12px; }
      .qr-box img { width: 190px; height: 190px; display: block; }
      .scan-heading { font-size: 13px; font-weight: 900; text-transform: uppercase; margin-bottom: 4px; }
      .scan-sub { font-size: 10px; color: #666; margin-bottom: 14px; }
      .wifi-box { background: #f8faf9; border: 1px solid #d1e7dd; border-radius: 12px; padding: 8px 10px; font-size: 10px; text-align: left; margin-bottom: 10px; }
      .wifi-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
      .pin-row { margin-bottom: 0; padding-top: 4px; border-top: 1px dashed #d1e7dd; color: #2b6a48; }
      .footer-tag { font-size: 9px; color: #999; font-family: monospace; }
    </style>
  `;

  const handlePrintSingle = () => {
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Standee - Room ${selectedRoomNumber}</title>${printStyles}</head>
      <body>${generateCardHtml(selectedRoomNumber, selectedRoomObj?.currentPasscode)}
      <script>window.onload=function(){window.focus();window.print();setTimeout(function(){window.close();},500);};</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const handlePrintAll = () => {
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;
    const allCardsContent = rooms.map((r) => generateCardHtml(r.number, r.currentPasscode)).join("");
    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Standees - All Rooms</title>${printStyles}</head>
      <body>${allCardsContent}
      <script>window.onload=function(){window.focus();window.print();setTimeout(function(){window.close();},500);};</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`w-[96vw] max-w-4xl max-h-[92vh] overflow-y-auto [scrollbar-width:none] rounded-3xl border p-6 shadow-2xl transition-colors ${
          darkMode ? "bg-[#25221e] border-[#403d38] text-[#e5e2db]" : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Smart Room QR Code Standee</DialogTitle>
        </DialogHeader>

        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#afd9c3]/40 gap-3 select-none">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold border ${darkMode ? "bg-[#403d38] text-[#d6fce2]" : "bg-[#d6fce2] text-[#2b6a48]"}`}>
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">Room QR Standee Generator</h3>
              <p className="text-xs opacity-65">Scannable QR cards with mobile phone support.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={handlePrintSingle}
              className="h-8.5 px-3.5 rounded-xl font-bold text-xs bg-[#2b6a48] hover:bg-[#23583c] text-white flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Room {selectedRoomNumber} Only
            </Button>
            {rooms.length > 1 && (
              <Button
                onClick={handlePrintAll}
                variant="outline"
                className="h-8.5 px-3 rounded-xl font-bold text-xs border-[#afd9c3] hover:bg-[#d6fce2]/40 flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" /> Print All ({rooms.length})
              </Button>
            )}
            <Button onClick={onClose} variant="outline" className="h-8.5 px-3 rounded-xl text-xs font-bold">
              Close
            </Button>
          </div>
        </div>

        {/* NETWORK IP CONFIG FOR MOBILE SCANNING */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 my-2">
          <div className="space-y-0.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
              <Globe className="w-4 h-4" /> Mobile Phone QR Scan Network Host:
            </div>
            <p className="text-[11px] opacity-75">
              Phone me scan karne ke liye <strong>localhost</strong> ke bajaye apna Wi-Fi IP daalein (e.g. <code>192.168.1.10:3000</code>).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={serverHost}
              onChange={(e) => setServerHost(e.target.value)}
              className="h-8 w-48 text-xs font-mono rounded-xl bg-white dark:bg-[#1f1d1a] border-amber-400"
            />
          </div>
        </div>

        {/* ROOM PICKER BAR */}
        <div className="py-2 select-none">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {rooms.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRoomNumber(r.number)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border shrink-0 ${
                  selectedRoomNumber === r.number
                    ? "bg-[#2b6a48] text-white border-[#2b6a48]"
                    : "bg-white dark:bg-[#1f1d1a] border-slate-200 dark:border-slate-800 opacity-70"
                }`}
              >
                Room {r.number}
              </button>
            ))}
          </div>
        </div>

        {/* PREVIEW CONTAINER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 text-xs">
          <div className="md:col-span-6 flex justify-center">
            <div className="w-full max-w-[340px] rounded-3xl border-2 border-[#afd9c3] p-6 bg-white text-[#403d38] shadow-lg flex flex-col items-center text-center space-y-3.5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-[#2b6a48]" />
              <h4 className="font-extrabold text-base uppercase tracking-tight text-[#2b6a48]">{hotelName}</h4>
              <div className="font-mono text-xs font-black px-3 py-0.5 rounded-full bg-[#d6fce2] text-[#2b6a48] border border-[#afd9c3]">
                Room {selectedRoomNumber}
              </div>
              <div className="p-3 rounded-2xl border-2 border-dashed border-[#afd9c3] bg-[#fcfbf9]">
                <img src={getQrSrc(selectedRoomNumber)} alt="QR" className="w-48 h-48 mx-auto" />
              </div>
              <span className="font-black text-sm block">Scan For Room Services</span>
              <p className="text-[11px] text-slate-500">Order Food, Request Housekeeping without calling.</p>
              <div className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] space-y-1 text-left font-mono">
                <div>Wi-Fi: {hotelName.replace(/\s+/g, "")}_WiFi</div>
                <div>Pass: welcome@2026</div>
                <div className="font-bold text-emerald-700">
                  {selectedRoomObj?.currentPasscode ? `PIN: ${selectedRoomObj.currentPasscode}` : "Active on Check-In"}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 space-y-4">
            <div className="p-4 rounded-3xl border border-[#afd9c3]/50 bg-white dark:bg-[#1f1d1a] space-y-2">
              <span className="font-extrabold text-xs block">Portal Link for Guest</span>
              <div className="flex items-center gap-2">
                <Input readOnly value={currentPortalUrl} className="h-8.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-[#25221e]" />
                <Button size="sm" onClick={handleCopyLink} className="h-8.5 px-3 rounded-xl font-bold text-xs bg-[#2b6a48] text-white">
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            <a
              href={currentPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 rounded-2xl bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db] font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#d6fce2]" /> Open Guest View in New Tab
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}