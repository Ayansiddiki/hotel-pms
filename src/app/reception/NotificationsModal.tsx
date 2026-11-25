"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Bell,
  UtensilsCrossed,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Printer,
  ShieldCheck,
  ConciergeBell,
} from "lucide-react";

export interface GuestOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface LiveRequestItem {
  id: string;
  type: "food_order" | "room_service" | "visitor_security";
  roomNo: string;
  guestName: string;
  timestamp: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  rejectionReason?: string;
  // Food Details
  items?: GuestOrderItem[];
  totalAmount?: number;
  // Service Details
  serviceCategory?: string;
  serviceNotes?: string;
  // Visitor Details
  visitorName?: string;
  visitorPhone?: string;
  photoUrl?: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: LiveRequestItem[];
  onUpdateStatus: (id: string, status: LiveRequestItem["status"], reason?: string) => void;
  onClearAll: () => void;
  darkMode?: boolean;
}

export function NotificationsModal({
  isOpen,
  onClose,
  requests,
  onUpdateStatus,
  onClearAll,
  darkMode = false,
}: NotificationsModalProps) {
  // 3 Parts / Tabs: "food" | "visitors" | "services"
  const [activeTab, setActiveTab] = useState<"food" | "visitors" | "services">("food");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  // Filter requests based on 3 distinct sections
  const filteredRequests = requests.filter((r) => {
    if (activeTab === "food") return r.type === "food_order";
    if (activeTab === "visitors") return r.type === "visitor_security";
    if (activeTab === "services") return r.type === "room_service";
    return true;
  });

  const handleConfirmReject = (id: string) => {
    onUpdateStatus(id, "rejected", rejectReason.trim() || "Item currently not available.");
    setRejectingId(null);
    setRejectReason("");
  };

  // KOT (Kitchen Order Ticket) Print Function
  const handlePrintKOT = (req: LiveRequestItem) => {
    const kotWindow = window.open("", "_blank", "width=400,height=600");
    if (!kotWindow) {
      alert("Kripya popup blocker disable karein KOT print karne ke liye!");
      return;
    }

    const itemsHtml = req.items
      ? req.items
          .map(
            (it) => `
            <div class="item-row">
              <span><b>${it.name}</b> (x${it.quantity})</span>
              <span>₹${it.price * it.quantity}</span>
            </div>`
          )
          .join("")
      : "<p>No items</p>";

    kotWindow.document.open();
    kotWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KOT - Room ${req.roomNo}</title>
          <style>
            body { font-family: monospace; padding: 15px; width: 300px; color: #000; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 10px; }
            .title { font-size: 16px; font-weight: bold; }
            .meta { font-size: 12px; margin-bottom: 10px; }
            .item-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
            .footer { border-top: 1px dashed #000; margin-top: 10px; padding-top: 8px; text-align: center; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">KITCHEN ORDER TICKET (KOT)</div>
            <div>Grand Palace Hotel</div>
          </div>
          <div class="meta">
            <div><b>Room No:</b> ${req.roomNo}</div>
            <div><b>Guest Name:</b> ${req.guestName}</div>
            <div><b>Time:</b> ${req.timestamp}</div>
          </div>
          <div style="border-bottom: 1px solid #000; margin-bottom: 8px;"></div>
          <div>${itemsHtml}</div>
          <div class="footer">
            <div>Total: ₹${req.totalAmount || 0}</div>
            <div>*** Please Prepare Immediately ***</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    kotWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`w-[96vw] max-w-4xl h-[90vh] rounded-3xl border p-6 shadow-2xl flex flex-col transition-colors overflow-hidden ${
          darkMode ? "bg-[#25221e] border-[#403d38] text-[#e5e2db]" : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Notification Center - 3 Parts Division</DialogTitle>
        </DialogHeader>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#afd9c3]/40 gap-3 select-none">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold border ${
                darkMode ? "bg-[#403d38] border-[#afd9c3]/40 text-[#d6fce2]" : "bg-[#d6fce2] border-[#afd9c3] text-[#2b6a48]"
              }`}
            >
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg tracking-tight">Hotel Notification Center</h3>
                {pendingCount > 0 && (
                  <Badge className="bg-red-500 text-white font-black text-xs px-2.5 py-0.5 rounded-full animate-pulse">
                    {pendingCount} Pending
                  </Badge>
                )}
              </div>
              <p className="text-xs opacity-65">Managed in 3 dedicated sections: Food (KOT), Visitors, and Services.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {requests.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onClearAll}
                className="h-8 px-2.5 text-xs text-red-500 hover:bg-red-50 font-bold rounded-xl"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Completed
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className="h-8 px-3 text-xs font-bold rounded-xl border-[#afd9c3]"
            >
              Close
            </Button>
          </div>
        </div>

        {/* 3 DISTINCT TABS / SECTIONS */}
        <div className="flex items-center gap-2 p-1 rounded-2xl border border-[#afd9c3]/50 bg-white/70 dark:bg-[#1f1d1a] my-3 text-xs select-none">
          <button
            onClick={() => setActiveTab("food")}
            className={`flex-1 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "food"
                ? "bg-[#403d38] text-white shadow-xs dark:bg-[#d6fce2] dark:text-[#1f1d1a]"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" /> Food & KOT ({requests.filter((r) => r.type === "food_order").length})
          </button>

          <button
            onClick={() => setActiveTab("visitors")}
            className={`flex-1 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "visitors"
                ? "bg-[#403d38] text-white shadow-xs dark:bg-[#d6fce2] dark:text-[#1f1d1a]"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Visitors Security ({requests.filter((r) => r.type === "visitor_security").length})
          </button>

          <button
            onClick={() => setActiveTab("services")}
            className={`flex-1 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "services"
                ? "bg-[#403d38] text-white shadow-xs dark:bg-[#d6fce2] dark:text-[#1f1d1a]"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            <ConciergeBell className="w-4 h-4" /> Services ({requests.filter((r) => r.type === "room_service").length})
          </button>
        </div>

        {/* QUEUE CARDS LIST */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 [scrollbar-width:none]">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-24 opacity-40 space-y-2">
              <CheckCircle2 className="w-12 h-12 mx-auto text-[#2b6a48]" />
              <div className="font-extrabold text-sm">Is section me abhi koi notification pending nahi hai.</div>
              <p className="text-xs">Real-time sync active hai.</p>
            </div>
          ) : (
            filteredRequests.map((req, idx) => (
              <div
                key={`notif-card-${req.id || idx}-${idx}`}
                className={`p-4 rounded-3xl border-2 transition-all space-y-3 ${
                  req.status === "pending"
                    ? "bg-amber-500/10 border-amber-400 shadow-sm"
                    : req.status === "accepted"
                    ? "bg-[#d6fce2]/20 border-emerald-500"
                    : req.status === "rejected"
                    ? "bg-red-500/10 border-red-400 opacity-80"
                    : "bg-white dark:bg-[#1f1d1a] border-slate-200 dark:border-slate-800 opacity-60"
                }`}
              >
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-[#2b6a48] text-white">
                      Room {req.roomNo}
                    </span>
                    <div>
                      <div className="font-extrabold text-sm flex items-center gap-1.5">
                        {req.type === "food_order" ? (
                          <>
                            <UtensilsCrossed className="w-4 h-4 text-emerald-700" />
                            <span>In-Room Dining Order</span>
                          </>
                        ) : req.type === "visitor_security" ? (
                          <>
                            <ShieldCheck className="w-4 h-4 text-blue-700" />
                            <span>Visitor Security Request</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-700" />
                            <span>Service: {req.serviceCategory}</span>
                          </>
                        )}
                      </div>
                      <span className="text-[11px] opacity-60">Guest: {req.guestName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-mono opacity-50">
                      <Clock className="w-3 h-3" /> {req.timestamp}
                    </span>
                    <Badge
                      className={`text-[10px] font-bold uppercase ${
                        req.status === "pending"
                          ? "bg-amber-500 text-white"
                          : req.status === "accepted"
                          ? "bg-emerald-600 text-white"
                          : req.status === "rejected"
                          ? "bg-red-600 text-white"
                          : "bg-slate-500 text-white"
                      }`}
                    >
                      {req.status}
                    </Badge>
                  </div>
                </div>

                {/* FOOD ITEMS + KOT PRINT BUTTON */}
                {req.type === "food_order" && req.items && (
                  <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#1f1d1a]/90 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1 border-b">
                      <span className="font-bold text-[11px] uppercase tracking-wider opacity-60">Ordered Dishes:</span>
                      <Button
                        size="sm"
                        onClick={() => handlePrintKOT(req)}
                        className="h-7 px-3 text-[11px] font-bold bg-[#403d38] text-[#e5e2db] hover:bg-[#403d38]/90 flex items-center gap-1.5 rounded-xl shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#d6fce2]" /> Print KOT Slip
                      </Button>
                    </div>

                    <div className="space-y-1 pt-1">
                      {req.items.map((it, i) => (
                        <div key={`kot-item-${it.id || i}-${i}`} className="flex justify-between font-medium">
                          <span>
                            <strong>{it.name}</strong> × {it.quantity}
                          </span>
                          <span className="font-mono font-bold text-emerald-700">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-1.5 border-t flex justify-between font-black text-xs">
                      <span>Total Billed:</span>
                      <span className="font-mono text-sm text-[#2b6a48]">₹{req.totalAmount}</span>
                    </div>
                  </div>
                )}

                {/* ROOM SERVICE DETAILS */}
                {req.type === "room_service" && (
                  <div className="p-3 rounded-2xl bg-white/90 dark:bg-[#1f1d1a]/90 border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-[11px] opacity-60 uppercase">Service Note:</span>
                    <p className="font-semibold">{req.serviceNotes || "No notes provided."}</p>
                  </div>
                )}

                {/* REJECTION REASON */}
                {req.status === "rejected" && req.rejectionReason && (
                  <div className="p-2.5 rounded-xl bg-red-100 text-red-800 text-xs font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Reason: {req.rejectionReason}</span>
                  </div>
                )}

                {/* REJECT INPUT BOX */}
                {rejectingId === req.id && (
                  <div className="p-3 rounded-2xl bg-white border border-red-300 space-y-2 text-xs">
                    <label className="font-bold text-red-600 block">Kripya Decline hone ka reason likhein:</label>
                    <Input
                      placeholder="e.g. Item currently not available..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="h-8.5 text-xs rounded-xl border-red-300"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleConfirmReject(req.id)}
                        className="h-7 px-3 text-xs font-bold bg-red-600 text-white rounded-xl"
                      >
                        Confirm Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRejectingId(null)}
                        className="h-7 text-xs rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* ACTIONS */}
                {rejectingId !== req.id && (
                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      {req.status !== "accepted" && req.status !== "completed" && (
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(req.id, "accepted")}
                          className="h-8 px-3.5 rounded-xl font-bold bg-[#2b6a48] hover:bg-[#23583c] text-white flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept Request
                        </Button>
                      )}

                      {req.status === "accepted" && (
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(req.id, "completed")}
                          className="h-8 px-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed / Delivered
                        </Button>
                      )}

                      {req.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRejectingId(req.id);
                            setRejectReason("");
                          }}
                          className="h-8 px-3 rounded-xl font-bold border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Decline
                        </Button>
                      )}
                    </div>

                    {(req.status === "accepted" || req.status === "rejected") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setRejectingId(req.id);
                          setRejectReason("");
                        }}
                        className="h-7 text-[11px] opacity-60 hover:opacity-100 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Update Reason
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}