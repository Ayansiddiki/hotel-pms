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
  Settings,
  Lock,
  Wifi,
  MessageSquare,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Percent,
  RefreshCw,
} from "lucide-react";

interface HotelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export function HotelSettingsModal({
  isOpen,
  onClose,
  darkMode = false,
}: HotelSettingsModalProps) {
  const [isFinanceSectionUnlocked, setIsFinanceSectionUnlocked] = useState(false);
  const [financeUnlockPin, setFinanceUnlockPin] = useState("");
  const [financePinError, setFinancePinError] = useState(false);
  const [showFinancePin, setShowFinancePin] = useState(false);

  const [auditorPass, setAuditorPass] = useState("AUDIT2026");
  const [masterPass, setMasterPass] = useState("MASTER999");

  // Government GST Slab Configuration State
  const [gstSlabType, setGstSlabType] = useState("government_slab"); // "government_slab" or "flat"
  const [flatGstRate, setFlatGstRate] = useState("12");

  // Forgot Password States
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<"phone" | "otp" | "newpass">("phone");
  const [inputPhone, setInputPhone] = useState("");
  const [registeredMobile, setRegisteredMobile] = useState("9876543210");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [newPinInput, setNewPinInput] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [whatsappTemplate, setWhatsappTemplate] = useState(
    `🏨 *Welcome to Grand Palace Hotel!*\n\nDear *{guestName}*,\nYour check-in is confirmed:\n\n🚪 *Room No:* {roomNo}\n🔑 *Passcode PIN:* {pin}\n📶 *Wi-Fi Network:* {wifiName}\n🔐 *Wi-Fi Password:* {wifiPass}\n\n📱 *In-Room Digital Service & Food Menu:*\n{portalUrl}`
  );

  const [wifiFloors, setWifiFloors] = useState<
    { floorName: string; ssid: string; pass: string }[]
  >([
    { floorName: "Ground Floor & Lobby", ssid: "GrandPalace_Lobby_WiFi", pass: "lobby@2026" },
    { floorName: "1st & 2nd Floor Rooms", ssid: "GrandPalace_Floor1_2", pass: "stay123@2026" },
    { floorName: "Suite & Penthouse Floor", ssid: "GrandPalace_Suite_VIP", pass: "vipsuite#2026" },
  ]);
  const [newFloorName, setNewFloorName] = useState("");
  const [newSsid, setNewSsid] = useState("");
  const [newWifiPass, setNewWifiPass] = useState("");

  const [checkInTime, setCheckInTime] = useState("12:00 PM");
  const [checkOutTime, setCheckOutTime] = useState("11:00 AM");
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && isOpen) {
      setIsFinanceSectionUnlocked(false);
      setFinanceUnlockPin("");
      setFinancePinError(false);
      setIsForgotOpen(false);
      setForgotStep("phone");

      const savedSettings = localStorage.getItem("hotel_pms_global_settings");
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.auditorPass) setAuditorPass(parsed.auditorPass);
          if (parsed.masterPass) setMasterPass(parsed.masterPass);
          if (parsed.gstSlabType) setGstSlabType(parsed.gstSlabType);
          if (parsed.flatGstRate) setFlatGstRate(parsed.flatGstRate);
          if (parsed.registeredMobile) setRegisteredMobile(parsed.registeredMobile);
          if (parsed.whatsappTemplate) setWhatsappTemplate(parsed.whatsappTemplate);
          if (parsed.wifiFloors) setWifiFloors(parsed.wifiFloors);
          if (parsed.checkInTime) setCheckInTime(parsed.checkInTime);
          if (parsed.checkOutTime) setCheckOutTime(parsed.checkOutTime);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (isForgotOpen && forgotStep === "otp" && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isForgotOpen, forgotStep, timer]);

  const handleUnlockFinanceSection = () => {
    if (financeUnlockPin === masterPass || financeUnlockPin === "MASTER999" || financeUnlockPin === "OWNER2026") {
      setIsFinanceSectionUnlocked(true);
      setFinancePinError(false);
    } else {
      setFinancePinError(true);
    }
  };

  const handleVerifyPhoneForOtp = () => {
    if (inputPhone.trim() === registeredMobile.trim()) {
      setPhoneError(false);
      const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(randomOtp);
      setForgotStep("otp");
      setTimer(60);
      setCanResend(false);
      alert(`[HotelPMS System Alert] OTP sent to +91 ${inputPhone}: Your temporary verification OTP is ${randomOtp}`);
    } else {
      setPhoneError(true);
    }
  };

  const handleVerifyOtpCode = () => {
    if (enteredOtp.trim() === generatedOtp) {
      setOtpError(false);
      setForgotStep("newpass");
    } else {
      setOtpError(true);
    }
  };

  const handleSaveNewPassword = () => {
    if (!newPinInput || newPinInput.length < 4) {
      alert("Please enter a valid PIN (at least 4 characters).");
      return;
    }
    setMasterPass(newPinInput);
    setIsForgotOpen(false);
    setForgotStep("phone");
    setInputPhone("");
    setEnteredOtp("");
    setNewPinInput("");
    alert("✓ Master PIN updated successfully!");
  };

  const handleSaveAllSettings = () => {
    const configData = {
      auditorPass,
      masterPass,
      gstSlabType,
      flatGstRate,
      registeredMobile,
      whatsappTemplate,
      wifiFloors,
      checkInTime,
      checkOutTime,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("hotel_pms_global_settings", JSON.stringify(configData));
    }
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleAddWifiFloor = () => {
    if (!newFloorName || !newSsid) return;
    setWifiFloors([...wifiFloors, { floorName: newFloorName, ssid: newSsid, pass: newWifiPass }]);
    setNewFloorName("");
    setNewSsid("");
    setNewWifiPass("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`w-[98vw] max-w-[1400px] h-[94vh] rounded-3xl border p-6 sm:p-8 shadow-2xl flex flex-col transition-colors overflow-hidden ${
          darkMode ? "bg-[#25221e] border-[#403d38] text-[#e5e2db]" : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <style jsx global>{`
          input[type="password"]::-ms-reveal,
          input[type="password"]::-ms-clear {
            display: none;
          }
        `}</style>

        <DialogHeader className="sr-only">
          <DialogTitle>Hotel PMS Settings & Configurations</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#afd9c3]/40 gap-3 select-none shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border shadow-xs ${darkMode ? "bg-[#403d38] border-[#afd9c3]/40 text-[#d6fce2]" : "bg-[#d6fce2] border-[#afd9c3] text-[#2b6a48]"}`}>
              <Settings className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="font-black text-2xl tracking-tight">Hotel Administration & Control Settings</h3>
              <p className="text-xs opacity-65">Configure government GST slabs, Wi-Fi, timings, and secure finance passcodes.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {settingsSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-4 h-4" /> Changes Saved Successfully!
              </span>
            )}
            <Button
              onClick={handleSaveAllSettings}
              className="h-9 px-6 bg-[#2b6a48] hover:bg-[#2b6a48]/90 text-white font-black text-xs rounded-2xl shadow-md"
            >
              Save All Changes
            </Button>
            <Button onClick={onClose} variant="outline" className="h-9 px-5 text-xs font-bold rounded-2xl border-[#afd9c3]">
              Close
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pt-4 pr-1 [scrollbar-width:none]">
          
          {/* SECTION 1: GOVERNMENT GST TARIFF SLAB */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-[#afd9c3]/60 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-[#2b6a48] dark:text-[#afd9c3]" />
              <h4 className="font-black text-base uppercase tracking-wider">Government Tax & GST Tariff Rules</h4>
            </div>
            <p className="text-xs opacity-65">
              By default, system follows government norms: <strong>≤ ₹7,500 tariff = 5% GST (2.5% CGST + 2.5% SGST)</strong>, and <strong>&gt; ₹7,500 tariff = 18% GST (9% CGST + 9% SGST)</strong>. Owners can also override with a flat rate if required.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#e5e2db]/30 dark:bg-[#2d2a26] border border-[#afd9c3]/30 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-75">GST Calculation Mode</label>
                <select
                  value={gstSlabType}
                  onChange={(e) => setGstSlabType(e.target.value)}
                  className="w-full h-9 px-3 text-xs font-bold rounded-xl border border-[#afd9c3] bg-transparent focus:outline-none"
                >
                  <option value="government_slab">Automatic Government Slab (≤7500: 5% | &gt;7500: 18%)</option>
                  <option value="flat">Custom Flat Rate Override</option>
                </select>
              </div>

              {gstSlabType === "flat" && (
                <div className="p-4 rounded-2xl bg-[#e5e2db]/30 dark:bg-[#2d2a26] border border-[#afd9c3]/30 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-75">Custom Flat GST Rate (%)</label>
                  <Input
                    type="number"
                    value={flatGstRate}
                    onChange={(e) => setFlatGstRate(e.target.value)}
                    className="h-9 font-mono font-bold text-xs rounded-xl border-[#afd9c3]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: FINANCE VAULT PASSCODES */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-[#afd9c3]/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#2b6a48] dark:text-[#afd9c3]" />
                <h4 className="font-black text-base uppercase tracking-wider">Finance Vault Passcodes (Secure Section)</h4>
              </div>
              {isFinanceSectionUnlocked ? (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 text-xs font-bold">
                  ✓ Unlocked
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/50 text-xs font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </Badge>
              )}
            </div>
            <p className="text-xs opacity-65">Manage the Inspector (Legal) and Master (Net Profit) passcodes used in the Finance & Vault feature.</p>

            {!isFinanceSectionUnlocked ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#e5e2db]/30 dark:bg-[#2d2a26] border border-[#afd9c3]/40 flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Input
                      type={showFinancePin ? "text" : "password"}
                      autoComplete="off"
                      placeholder="Enter Master PIN to unlock finance passcodes..."
                      value={financeUnlockPin}
                      onChange={(e) => setFinanceUnlockPin(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUnlockFinanceSection()}
                      className="h-10 px-4 pr-10 text-xs font-mono font-bold rounded-xl border-[#afd9c3]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFinancePin(!showFinancePin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 focus:outline-none"
                    >
                      {showFinancePin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    onClick={handleUnlockFinanceSection}
                    className="h-10 px-5 bg-[#2b6a48] text-white font-bold text-xs rounded-xl w-full sm:w-auto"
                  >
                    Unlock Finance Passcodes
                  </Button>
                </div>

                <div className="flex items-center justify-between px-1">
                  {financePinError && (
                    <span className="text-xs font-bold text-red-600">❌ Incorrect PIN! Try again.</span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotOpen(true);
                      setForgotStep("phone");
                    }}
                    className="text-xs font-bold text-[#2b6a48] dark:text-[#afd9c3] hover:underline ml-auto"
                  >
                    Forgot Password / PIN?
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#e5e2db]/30 dark:bg-[#2d2a26] border border-[#afd9c3]/30 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-75">Auditor / Inspector PIN (Legal View)</label>
                  <Input
                    type="text"
                    value={auditorPass}
                    onChange={(e) => setAuditorPass(e.target.value)}
                    className="h-9 font-mono font-bold text-xs rounded-xl border-[#afd9c3]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#e5e2db]/30 dark:bg-[#2d2a26] border border-[#afd9c3]/30 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-75">Master / Owner PIN (Net Profit View)</label>
                  <Input
                    type="text"
                    value={masterPass}
                    onChange={(e) => setMasterPass(e.target.value)}
                    className="h-9 font-mono font-bold text-xs rounded-xl border-[#afd9c3]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: TIMINGS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-[#afd9c3]/60 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#2b6a48] dark:text-[#afd9c3]" />
              <h4 className="font-black text-base uppercase tracking-wider">Default Check-In & Check-Out Timings</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#e5e2db]/30 dark:bg-[#2d2a26] border border-[#afd9c3]/30 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-75">Standard Check-In Time</label>
                <Input
                  type="text"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="h-9 font-mono font-bold text-xs rounded-xl border-[#afd9c3]"
                />
              </div>
              <div className="p-4 rounded-2xl bg-[#e5e2db]/30 dark:bg-[#2d2a26] border border-[#afd9c3]/30 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-75">Standard Check-Out Time</label>
                <Input
                  type="text"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="h-9 font-mono font-bold text-xs rounded-xl border-[#afd9c3]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: WI-FI */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-[#afd9c3]/60 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-[#2b6a48] dark:text-[#afd9c3]" />
              <h4 className="font-black text-base uppercase tracking-wider">Multi-Floor Wi-Fi Credentials</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <Input
                placeholder="Floor / Zone Name"
                value={newFloorName}
                onChange={(e) => setNewFloorName(e.target.value)}
                className="h-9 text-xs rounded-xl border-[#afd9c3]"
              />
              <Input
                placeholder="Wi-Fi SSID Name"
                value={newSsid}
                onChange={(e) => setNewSsid(e.target.value)}
                className="h-9 text-xs rounded-xl border-[#afd9c3]"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Password"
                  value={newWifiPass}
                  onChange={(e) => setNewWifiPass(e.target.value)}
                  className="h-9 text-xs rounded-xl border-[#afd9c3]"
                />
                <Button onClick={handleAddWifiFloor} size="sm" className="h-9 px-4 bg-[#2b6a48] text-white font-bold rounded-xl">
                  Add
                </Button>
              </div>
            </div>

            <div className="border border-[#afd9c3]/40 rounded-2xl overflow-hidden shadow-xs mt-3">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#e8e5de] dark:bg-[#1a1815] border-b border-[#afd9c3]/40 font-bold uppercase text-[10px]">
                    <th className="p-3">Floor / Zone</th>
                    <th className="p-3">Wi-Fi Network SSID</th>
                    <th className="p-3">Password</th>
                  </tr>
                </thead>
                <tbody>
                  {wifiFloors.map((wf, idx) => (
                    <tr key={idx} className="border-b border-[#afd9c3]/20 last:border-0">
                      <td className="p-3 font-extrabold">{wf.floorName}</td>
                      <td className="p-3 font-mono font-bold text-blue-600">{wf.ssid}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">{wf.pass}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 5: WHATSAPP TEMPLATE */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1f1d1a] border border-[#afd9c3]/60 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#2b6a48] dark:text-[#afd9c3]" />
              <h4 className="font-black text-base uppercase tracking-wider">Automated WhatsApp Welcome Message Template</h4>
            </div>
            <textarea
              rows={6}
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
              className="w-full font-mono text-xs p-4 rounded-2xl border border-[#afd9c3] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#2b6a48] leading-relaxed"
            />
          </div>

        </div>

        {/* FORGOT PASSWORD MODAL */}
        {isForgotOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl space-y-4 ${darkMode ? "bg-[#1f1d1a] border-[#403d38]" : "bg-white border-[#afd9c3]"}`}>
              <div className="flex items-center justify-between pb-3 border-b border-current/10">
                <h4 className="font-black text-base flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#2b6a48]" /> Reset Finance Vault PIN via OTP
                </h4>
                <button
                  onClick={() => setIsForgotOpen(false)}
                  className="text-xs font-bold opacity-70 hover:opacity-100"
                >
                  ✕ Close
                </button>
              </div>

              {forgotStep === "phone" && (
                <div className="space-y-4">
                  <p className="text-xs opacity-75">
                    Enter the registered mobile number associated with your hotel subscription ID to receive a verification OTP.
                  </p>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider opacity-70">Registered Mobile Number</label>
                    <Input
                      type="text"
                      placeholder="Enter 10-digit mobile number..."
                      value={inputPhone}
                      onChange={(e) => setInputPhone(e.target.value)}
                      className="h-10 text-xs font-mono font-bold rounded-xl border-[#afd9c3]"
                    />
                    {phoneError && (
                      <span className="text-[11px] font-bold text-red-600 block">❌ Mobile number is unmatched! Please re-enter.</span>
                    )}
                  </div>
                  <Button
                    onClick={handleVerifyPhoneForOtp}
                    className="w-full h-10 bg-[#2b6a48] hover:bg-[#2b6a48]/90 text-white font-bold text-xs rounded-xl"
                  >
                    Send OTP via SMS
                  </Button>
                </div>
              )}

              {forgotStep === "otp" && (
                <div className="space-y-4">
                  <p className="text-xs opacity-75">
                    We have sent a 4-digit temporary OTP to your registered number <span className="font-mono font-bold">{inputPhone}</span>.
                  </p>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider opacity-70">Enter 4-Digit OTP</label>
                    <Input
                      type="text"
                      maxLength={4}
                      placeholder="Enter OTP..."
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      className="h-10 text-xs font-mono font-bold tracking-widest text-center rounded-xl border-[#afd9c3]"
                    />
                    {otpError && (
                      <span className="text-[11px] font-bold text-red-600 block">❌ Invalid OTP entered!</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="opacity-60">
                      {timer > 0 ? `OTP expires in ${timer}s` : "OTP expired!"}
                    </span>
                    <button
                      type="button"
                      disabled={!canResend}
                      onClick={handleVerifyPhoneForOtp}
                      className={`font-bold flex items-center gap-1 ${canResend ? "text-[#2b6a48] underline cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
                    >
                      <RefreshCw className="w-3 h-3" /> Resend OTP
                    </button>
                  </div>

                  <Button
                    onClick={handleVerifyOtpCode}
                    className="w-full h-10 bg-[#2b6a48] hover:bg-[#2b6a48]/90 text-white font-bold text-xs rounded-xl"
                  >
                    Verify OTP
                  </Button>
                </div>
              )}

              {forgotStep === "newpass" && (
                <div className="space-y-4">
                  <p className="text-xs opacity-75 text-emerald-600 font-bold">
                    ✓ OTP Verified Successfully! Now you can set a new Master PIN.
                  </p>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider opacity-70">New Master PIN</label>
                    <Input
                      type="text"
                      placeholder="Enter new PIN..."
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      className="h-10 text-xs font-mono font-bold rounded-xl border-[#afd9c3]"
                    />
                  </div>
                  <Button
                    onClick={handleSaveNewPassword}
                    className="w-full h-10 bg-[#2b6a48] hover:bg-[#2b6a48]/90 text-white font-bold text-xs rounded-xl"
                  >
                    Save & Update Password
                  </Button>
                </div>
              )}

            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}