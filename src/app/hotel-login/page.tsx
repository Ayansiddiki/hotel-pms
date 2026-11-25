"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, KeyRound, User, ArrowRight, AlertCircle, Hotel, ShieldCheck } from "lucide-react";

export default function HotelStaffLogin() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("delhi.grand@hotelpms.internal");
  const [password, setPassword] = useState("pass_grand#992");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleHotelLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (loginId.trim() && password.trim()) {
        // Tenant session storage
        localStorage.setItem("hotel_tenant_id", "DEL-GRAND-101");
        localStorage.setItem("hotel_name", "Grand Palace Hotel");
        localStorage.setItem("hotel_user", loginId);
        localStorage.setItem("user_role", "hotel_staff");
        router.push("/reception");
      } else {
        setError("Invalid Hotel Staff ID or Password");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] flex items-center justify-center p-4 font-sans text-[#403d38]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#afd9c3] p-8 shadow-xl space-y-6">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-[#d6fce2] rounded-3xl border border-[#afd9c3] text-[#2b6a48] mb-1 shadow-xs">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Grand Palace Hotel</h1>
          <p className="text-xs text-[#403d38]/70 font-medium">
            Front-Desk Reception & Administrative Staff Portal
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Staff Form */}
        <form onSubmit={handleHotelLogin} className="space-y-4">
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider block mb-1.5 text-[#403d38]/80">
              Staff Login ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#403d38]/50" />
              <Input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="hotelname.city@hotelpms.internal"
                className="pl-10 h-11 rounded-2xl border-[#afd9c3] focus-visible:ring-[#2b6a48] text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black uppercase tracking-wider block mb-1.5 text-[#403d38]/80">
              Assigned Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-[#403d38]/50" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="pl-10 h-11 rounded-2xl border-[#afd9c3] focus-visible:ring-[#2b6a48] text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="bg-[#d6fce2]/40 p-3.5 rounded-2xl border border-[#afd9c3]/70 text-xs text-[#403d38] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#2b6a48]">
              <ShieldCheck className="w-4 h-4" /> Demo Credentials:
            </div>
            <div className="font-mono text-[11px] opacity-80">
              ID: delhi.grand@hotelpms.internal<br />
              Pass: pass_grand#992
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all"
          >
            {loading ? "Authenticating Session..." : "Open Reception Dashboard"}
            <ArrowRight className="w-4 h-4 text-[#d6fce2]" />
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-[#afd9c3]/30">
          <a
            href="/super-admin/login"
            className="text-xs font-bold text-[#403d38]/70 hover:text-[#403d38] underline underline-offset-4"
          >
            Platform Owner? Super Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}