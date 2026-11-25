"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

export default function SuperAdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@hotelpms.internal");
  const [password, setPassword] = useState("supersecret#2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Mock Super Admin verification
    setTimeout(() => {
      if (email.trim() && password.trim()) {
        localStorage.setItem("user_role", "super_admin");
        localStorage.setItem("user_email", email);
        router.push("/super-admin");
      } else {
        setError("Please enter valid super admin credentials");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#e5e2db]/40 flex items-center justify-center p-4 font-sans text-[#403d38]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#afd9c3]/70 p-8 shadow-xl space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-[#d6fce2] rounded-2xl border border-[#afd9c3] text-[#403d38] mb-1">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Super Admin Portal</h1>
          <p className="text-xs text-[#403d38]/70">
            Platform Owner & Multi-Tenant Infrastructure Control
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-[#df918d]/20 border border-[#df918d] rounded-xl text-xs font-semibold text-[#403d38]">
            <AlertCircle className="w-4 h-4 text-[#df918d] flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1 text-[#403d38]">
              Admin Email ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#403d38]/50" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hotelpms.internal"
                className="pl-10 h-11 rounded-xl border-[#afd9c3] focus-visible:ring-[#afd9c3] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-1 text-[#403d38]">
              Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#403d38]/50" />
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="pl-10 h-11 rounded-xl border-[#afd9c3] focus-visible:ring-[#afd9c3] text-sm font-mono"
              />
            </div>
          </div>

          <div className="bg-[#e3cf92]/30 p-3 rounded-xl border border-[#e3cf92] text-[11px] text-[#403d38]/80">
            <strong>Default Sandbox Login:</strong> email: <span className="font-mono font-bold">owner@hotelpms.internal</span> | pass: <span className="font-mono font-bold">supersecret#2026</span>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db] font-bold rounded-xl flex items-center justify-center gap-2"
          >
            {loading ? "Authenticating..." : "Login to Control Panel"}
            <ArrowRight className="w-4 h-4 text-[#d6fce2]" />
          </Button>
        </form>

        <div className="text-center pt-2">
          <a
            href="/hotel-login"
            className="text-xs font-semibold text-[#403d38]/70 hover:text-[#403d38] underline underline-offset-4"
          >
            Hotel Staff or Manager? Go to Client Login
          </a>
        </div>
      </div>
    </div>
  );
}