"use client";

import React, { useState, useRef, useEffect } from "react";
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
  ShieldCheck,
  Camera,
  UserCheck,
  UserX,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Upload,
  User,
  Phone,
  DoorOpen,
  Eye,
} from "lucide-react";

export interface VisitorLogItem {
  id: string;
  roomNo: string;
  guestName: string;
  visitorName: string;
  visitorPhone: string;
  idProofNumber?: string;
  photoUrl: string;
  entryTime: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

interface VisitorsSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: any[];
  onVisitorApproved: (roomNo: string, visitor: VisitorLogItem) => void;
  darkMode?: boolean;
}

export function VisitorsSecurityModal({
  isOpen,
  onClose,
  rooms,
  onVisitorApproved,
  darkMode = false,
}: VisitorsSecurityModalProps) {
  // All Visitors List
  const [visitors, setVisitors] = useState<VisitorLogItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hotel_pms_visitors_log");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  // Form States
  const [targetRoomNo, setTargetRoomNo] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [idProof, setIdProof] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string>("");

  // Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Save to LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hotel_pms_visitors_log", JSON.stringify(visitors));
    }
  }, [visitors]);

  // Real-Time Polling: Check if Guest Approved or Rejected from their phone
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("hotel_pms_visitors_log");
        if (saved) {
          try {
            const list: VisitorLogItem[] = JSON.parse(saved);
            setVisitors(list);
          } catch (e) {
            console.error(e);
          }
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // WebCam Handler
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert("Camera access denied ya camera available nahi hai!");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 320, 320);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setPhotoDataUrl(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Visitor Verification Request to Guest
  const handleRegisterVisitor = () => {
    if (!targetRoomNo) {
      alert("Kripya guest ka Room Number select karein!");
      return;
    }
    if (!visitorName.trim() || !visitorPhone.trim()) {
      alert("Visitor ka Naam aur Mobile Number zaroori hai!");
      return;
    }
    if (!photoDataUrl) {
      alert("Security ke liye visitor ki photo capture ya upload karna anivarya hai!");
      return;
    }

    const targetRoomObj = rooms.find((r) => r.number === targetRoomNo);
    const guestName = targetRoomObj?.guest || "Hotel Guest";

    const newVisitor: VisitorLogItem = {
      id: `vis-${Date.now()}`,
      roomNo: targetRoomNo,
      guestName,
      visitorName: visitorName.trim(),
      visitorPhone: visitorPhone.trim(),
      idProofNumber: idProof.trim() || "N/A",
      photoUrl: photoDataUrl,
      entryTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      status: "pending",
    };

    const updated = [newVisitor, ...visitors];
    setVisitors(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("hotel_pms_visitors_log", JSON.stringify(updated));
      // Trigger chime signal for guest
      localStorage.setItem("hotel_pms_visitor_alert", Date.now().toString());
    }

    // Reset Form
    setVisitorName("");
    setVisitorPhone("");
    setIdProof("");
    setPhotoDataUrl("");
    stopCamera();

    alert(`Security Verification sent to Room ${targetRoomNo} (${guestName})! Guest ke approve karte hi yahan update aayega.`);
  };

  // Manual Override (Receptionist approval if guest calls front desk)
  const handleManualAction = (id: string, status: "approved" | "rejected") => {
    const targetVis = visitors.find((v) => v.id === id);
    if (!targetVis) return;

    const updated = visitors.map((v) => (v.id === id ? { ...v, status } : v));
    setVisitors(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("hotel_pms_visitors_log", JSON.stringify(updated));
    }

    if (status === "approved") {
      onVisitorApproved(targetVis.roomNo, targetVis);
    }
  };

  const occupiedRooms = rooms.filter((r) => r.status === "occupied");

  const filteredVisitors = visitors.filter(
    (v) =>
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.roomNo.includes(searchQuery) ||
      v.visitorPhone.includes(searchQuery)
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) stopCamera();
      !open && onClose();
    }}>
      <DialogContent
        showCloseButton={false}
        className={`w-[96vw] max-w-5xl h-[92vh] rounded-3xl border p-6 shadow-2xl flex flex-col transition-colors overflow-hidden ${
          darkMode ? "bg-[#25221e] border-[#403d38] text-[#e5e2db]" : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Visitor Security & Face Verification</DialogTitle>
        </DialogHeader>

        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#afd9c3]/40 gap-3 select-none">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold border ${
                darkMode ? "bg-[#403d38] text-[#d6fce2]" : "bg-[#d6fce2] text-[#2b6a48] border-[#afd9c3]"
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg tracking-tight">Guest Safety & Visitor Verification</h3>
                <Badge className="bg-[#d6fce2] text-[#2b6a48] border border-[#afd9c3] text-[10px] font-bold">
                  Anti-Crime Protocol
                </Badge>
              </div>
              <p className="text-xs opacity-65">
                Capture live photo, verify identity with in-room guest, and log for police compliance audits.
              </p>
            </div>
          </div>

          <Button onClick={onClose} variant="outline" className="h-8.5 px-4 text-xs font-bold rounded-xl border-[#afd9c3]">
            Close Console
          </Button>
        </div>

        {/* 2-COLUMN VIEW */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 pt-3 overflow-hidden text-xs">
          
          {/* LEFT: VISITOR ENTRY & CAMERA (5 Cols) */}
          <div className="md:col-span-5 p-4 rounded-3xl border border-[#afd9c3]/60 bg-white dark:bg-[#1f1d1a] flex flex-col justify-between overflow-y-auto [scrollbar-width:none] shadow-xs space-y-3">
            <div className="font-black text-xs uppercase tracking-wider text-[#2b6a48] dark:text-[#afd9c3] flex items-center gap-1.5 pb-1 border-b">
              <Camera className="w-3.5 h-3.5" /> New Visitor Check-In & Photo
            </div>

            {/* Target Room Picker */}
            <div className="space-y-1">
              <label className="font-bold">Visiting Room & Guest *</label>
              <select
                value={targetRoomNo}
                onChange={(e) => setTargetRoomNo(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#afd9c3] px-3 font-semibold text-xs bg-white dark:bg-[#25221e] outline-none"
              >
                <option value="">-- Select Occupied Room --</option>
                {occupiedRooms.map((r) => (
                  <option key={r.id} value={r.number}>
                    Room {r.number} — Guest: {r.guest}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold">Visitor Full Name *</label>
                <Input
                  placeholder="e.g. Rahul Sharma"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="h-8.5 text-xs rounded-xl border-[#afd9c3]/70"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold">Mobile Number *</label>
                <Input
                  placeholder="e.g. 9876543210"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  className="h-8.5 text-xs rounded-xl border-[#afd9c3]/70"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold">Govt ID Proof Number (Optional)</label>
              <Input
                placeholder="Aadhaar / Driving License / Voter ID"
                value={idProof}
                onChange={(e) => setIdProof(e.target.value)}
                className="h-8.5 text-xs rounded-xl border-[#afd9c3]/70"
              />
            </div>

            {/* LIVE CAMERA CAPTURE BOX */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[11px]">Visitor Photo Proof *</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-6 text-[10px] text-slate-500 hover:text-[#2b6a48] px-1"
                >
                  <Upload className="w-3 h-3 mr-1" /> Upload Image
                </Button>
              </div>

              {isCameraActive ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#2b6a48] bg-black text-center aspect-square max-h-56 mx-auto">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={capturePhoto}
                      className="h-8 px-4 font-bold text-xs bg-[#2b6a48] text-white rounded-xl shadow-lg"
                    >
                      <Camera className="w-3.5 h-3.5 mr-1" /> Click Photo
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={stopCamera}
                      className="h-8 px-3 text-xs rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : photoDataUrl ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-50 text-center max-h-48 mx-auto aspect-square">
                  <img src={photoDataUrl} alt="Captured" className="w-full h-full object-cover" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPhotoDataUrl("");
                      startCamera();
                    }}
                    className="absolute bottom-2 right-2 h-7 text-[10px] bg-white/90 font-bold rounded-lg"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Retake
                  </Button>
                </div>
              ) : (
                <div
                  onClick={startCamera}
                  className="border-2 border-dashed border-[#afd9c3] rounded-2xl p-6 text-center cursor-pointer hover:bg-[#d6fce2]/20 transition-all space-y-1.5"
                >
                  <div className="w-10 h-10 rounded-full bg-[#d6fce2] text-[#2b6a48] flex items-center justify-center mx-auto">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs">Start Camera & Capture Face</div>
                  <p className="text-[10px] opacity-60">Webcam ya security mobile camera se click karein</p>
                </div>
              )}
            </div>

            <Button
              onClick={handleRegisterVisitor}
              className="w-full h-10 rounded-xl font-bold text-xs bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db] shadow-xs flex items-center justify-center gap-1.5 mt-2"
            >
              <UserCheck className="w-4 h-4 text-[#d6fce2]" /> Send Authorization to Guest
            </Button>
          </div>

          {/* RIGHT: LIVE VERIFICATION & AUDIT LOGS (7 Cols) */}
          <div className="md:col-span-7 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-[#afd9c3]/30 gap-2">
              <span className="font-black text-xs uppercase tracking-wider opacity-60 flex items-center gap-1.5">
                <DoorOpen className="w-3.5 h-3.5" /> Visitor Security Queue ({visitors.length})
              </span>
              <div className="relative w-48">
                <Search className="w-3 h-3 absolute left-2.5 top-2.5 opacity-40" />
                <Input
                  placeholder="Search visitor, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs rounded-xl border-[#afd9c3]/60"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pt-2 [scrollbar-width:none]">
              {filteredVisitors.length === 0 ? (
                <div className="text-center py-20 opacity-40 space-y-2">
                  <ShieldCheck className="w-12 h-12 mx-auto text-[#2b6a48]" />
                  <div className="font-extrabold text-sm">Koi visitor record nahi mila.</div>
                  <p className="text-xs">Left form se visitor ka face capture karke verification start karein.</p>
                </div>
              ) : (
                filteredVisitors.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex items-start justify-between gap-3 ${
                      item.status === "pending"
                        ? "bg-amber-500/10 border-amber-400"
                        : item.status === "approved"
                        ? "bg-[#d6fce2]/25 border-[#2b6a48]"
                        : "bg-red-500/10 border-red-400 opacity-75"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Photo Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-black/20 shrink-0 bg-black">
                        <img src={item.photoUrl} alt={item.visitorName} className="w-full h-full object-cover" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm">{item.visitorName}</span>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#2b6a48] text-white">
                            Room {item.roomNo}
                          </span>
                          <Badge
                            className={`text-[9px] font-bold uppercase ${
                              item.status === "pending"
                                ? "bg-amber-500 text-white"
                                : item.status === "approved"
                                ? "bg-[#2b6a48] text-white"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {item.status === "pending" ? "Waiting Guest Approval" : item.status}
                          </Badge>
                        </div>

                        <div className="text-[11px] opacity-75 flex items-center gap-2 font-mono">
                          <span>Phone: {item.visitorPhone}</span>
                          <span>•</span>
                          <span>In: {item.entryTime}</span>
                        </div>

                        <div className="text-[10px] opacity-60">
                          Visiting Guest: <strong>{item.guestName}</strong> | ID: {item.idProofNumber}
                        </div>

                        {item.status === "rejected" && item.rejectionReason && (
                          <div className="text-[10px] text-red-600 font-bold bg-red-100 p-1 rounded">
                            Decline Reason: {item.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons for Reception */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {item.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleManualAction(item.id, "approved")}
                            className="h-7 px-2.5 text-[10px] font-bold bg-[#2b6a48] hover:bg-[#23583c] text-white rounded-lg"
                          >
                            Manual Allow
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleManualAction(item.id, "rejected")}
                            className="h-7 px-2.5 text-[10px] font-bold rounded-lg"
                          >
                            Deny Entry
                          </Button>
                        </>
                      )}
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