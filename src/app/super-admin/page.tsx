"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  PlusCircle,
  Copy,
  FileText,
  KeyRound,
  CheckCircle2,
  Calendar,
  Layers,
  FileCheck2,
  ShieldCheck,
  Eye,
  LogOut,
} from "lucide-react";

// 11 Core Features Definition
const ALL_FEATURES = [
  { id: "booking", label: "Booking (Walk-in)" },
  { id: "rooms", label: "Rooms Management" },
  { id: "e_register", label: "E-Register" },
  { id: "notepad", label: "Note Pad" },
  { id: "booking_calendar", label: "Booking Calendar" },
  { id: "live_notifications", label: "Live Notification Center" },
  { id: "services", label: "Services Management" },
  { id: "visitors_security", label: "Visitors Security (ID Logs)" },
  { id: "food_services", label: "Food Services" },
  { id: "laundry", label: "Laundry Management" },
  { id: "qr_code", label: "QR Code Generator" },
];

const TIER_DEFAULTS: Record<string, string[]> = {
  High: ALL_FEATURES.map((f) => f.id),
  Mid: [
    "booking",
    "rooms",
    "e_register",
    "notepad",
    "booking_calendar",
    "live_notifications",
    "services",
    "visitors_security",
  ],
  Low: ["booking", "rooms", "e_register", "notepad"],
};

export default function SuperAdminPortal() {
  const router = useRouter();

  const [hotels, setHotels] = useState([
    {
      tenantId: "DEL-GRAND-101",
      name: "Grand Palace Hotel",
      location: "New Delhi, Connaught Place",
      owner: "Vikram Malhotra",
      contact: "+91 9876543210",
      email: "delhi.grand@hotelpms.internal",
      password: "pass_grand#992",
      gstin: "07AAAAA0000A1Z5",
      planTier: "High",
      duration: "12 Months",
      discountApplied: "20%",
      validTill: "28-09-2027",
      docName: "trade_license_grand.pdf",
      features: TIER_DEFAULTS["High"],
    },
    {
      tenantId: "JAI-SUNRISE-102",
      name: "Sunrise Guest House",
      location: "Jaipur, MI Road",
      owner: "Amit Rathore",
      contact: "+91 9123456789",
      email: "sunrise.jaipur@hotelpms.internal",
      password: "pass_sun#410",
      gstin: "08BBBBB1111B1Z9",
      planTier: "Low",
      duration: "3 Months",
      discountApplied: "0%",
      validTill: "28-12-2026",
      docName: "gst_certificate_jaipur.pdf",
      features: TIER_DEFAULTS["Low"],
    },
  ]);

  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form States
  const [newHotelModal, setNewHotelModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formOwner, setFormOwner] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formGstin, setFormGstin] = useState("");
  const [formDocName, setFormDocName] = useState("");
  const [formPlan, setFormPlan] = useState("Mid");
  const [formDuration, setFormDuration] = useState("6 Months");
  const [formDiscount, setFormDiscount] = useState("10%");
  const [formFeatures, setFormFeatures] = useState<string[]>(TIER_DEFAULTS["Mid"]);

  const handleAdminLogout = () => {
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_email");
    router.push("/super-admin/login");
  };

  const handlePlanChange = (val: string | null) => {
    if (!val) return;
    setFormPlan(val);
    setFormFeatures(TIER_DEFAULTS[val] || []);
  };

  const handleDurationChange = (val: string | null) => {
    if (!val) return;
    setFormDuration(val);
  };

  const toggleFeatureInForm = (featId: string) => {
    setFormFeatures((prev) =>
      prev.includes(featId) ? prev.filter((id) => id !== featId) : [...prev, featId]
    );
  };

  const toggleFeatureInModal = (featId: string) => {
    if (!selectedHotel) return;
    const updatedFeatures = selectedHotel.features.includes(featId)
      ? selectedHotel.features.filter((id: string) => id !== featId)
      : [...selectedHotel.features, featId];

    const updatedHotel = { ...selectedHotel, features: updatedFeatures };
    setSelectedHotel(updatedHotel);
    setHotels((prev) =>
      prev.map((h) => (h.tenantId === selectedHotel.tenantId ? updatedHotel : h))
    );
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleCreateHotel = () => {
    if (!formName || !formCity || !formOwner) return;

    const cityCode = formCity.trim().slice(0, 3).toUpperCase();
    const hotelPrefix = formName.trim().split(" ")[0].slice(0, 5).toUpperCase();
    const uniqueTenantId = `${cityCode}-${hotelPrefix}-${Math.floor(100 + Math.random() * 900)}`;

    const autoPassword = `pms@${Math.random().toString(36).slice(-6)}`;
    const autoEmail = `${formName.toLowerCase().replace(/\s+/g, "")}.${cityCode.toLowerCase()}@hotelpms.internal`;

    const newEntry = {
      tenantId: uniqueTenantId,
      name: formName,
      location: formCity,
      owner: formOwner,
      contact: formPhone,
      email: autoEmail,
      password: autoPassword,
      gstin: formGstin || "N/A",
      planTier: formPlan,
      duration: formDuration,
      discountApplied: formDiscount,
      validTill: "Calculated automatically",
      docName: formDocName || "registration_doc.pdf",
      features: formFeatures,
    };

    setHotels([newEntry, ...hotels]);
    setNewHotelModal(false);
    setFormName("");
    setFormCity("");
    setFormOwner("");
    setFormPhone("");
    setFormGstin("");
    setFormDocName("");
  };

  const getBadgeStyle = (tier: string) => {
    switch (tier) {
      case "High":
        return "bg-[#d6fce2] text-[#403d38] border-[#afd9c3]";
      case "Mid":
        return "bg-[#e3cf92]/50 text-[#403d38] border-[#e3cf92]";
      case "Low":
        return "bg-[#df918d]/30 text-[#403d38] border-[#df918d]";
      default:
        return "bg-[#e5e2db] text-[#403d38] border-[#403d38]/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#e5e2db]/35 p-6 md:p-10 font-sans text-[#403d38] tracking-tight">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#afd9c3]/50 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#d6fce2] rounded-2xl text-[#403d38] border border-[#afd9c3]">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#403d38]">Super Admin SaaS Control</h1>
                <p className="text-sm text-[#403d38]/70 font-normal">
                  Multi-tenant Isolation, Client Access, Subscriptions & Feature Toggles
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              className="bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db] font-semibold px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-2 border border-[#403d38]"
              onClick={() => setNewHotelModal(true)}
            >
              <PlusCircle className="w-4 h-4 text-[#e3cf92]" /> Add Hotel
            </Button>
            
            <Button 
              variant="outline"
              className="border-[#df918d] text-[#403d38] hover:bg-[#df918d]/30 font-semibold px-3 py-2.5 rounded-2xl flex items-center gap-1.5"
              onClick={handleAdminLogout}
            >
              <LogOut className="w-4 h-4 text-[#df918d]" /> Logout
            </Button>
          </div>
        </div>

        {/* Master Table Card */}
        <div className="bg-white rounded-3xl border border-[#afd9c3]/50 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-[#e5e2db]/50">
              <TableRow className="border-b border-[#afd9c3]/40">
                <TableHead className="font-bold text-xs uppercase text-[#403d38] tracking-wider">Tenant ID</TableHead>
                <TableHead className="font-bold text-xs uppercase text-[#403d38] tracking-wider">Hotel & Location</TableHead>
                <TableHead className="font-bold text-xs uppercase text-[#403d38] tracking-wider">Owner Contact</TableHead>
                <TableHead className="font-bold text-xs uppercase text-[#403d38] tracking-wider">Plan Tier</TableHead>
                <TableHead className="font-bold text-xs uppercase text-[#403d38] tracking-wider">Duration</TableHead>
                <TableHead className="font-bold text-xs uppercase text-[#403d38] tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotels.map((h) => (
                <TableRow
                  key={h.tenantId}
                  className="hover:bg-[#d6fce2]/20 transition-colors border-b border-[#e5e2db]"
                >
                  <TableCell className="font-mono text-xs font-bold text-[#403d38]">
                    <span className="bg-[#e5e2db]/60 px-2 py-0.5 rounded-md border border-[#afd9c3]/60">
                      {h.tenantId}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-[#403d38] text-sm">{h.name}</div>
                    <div className="text-xs text-[#403d38]/70 font-normal">{h.location}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-semibold text-[#403d38]">{h.owner}</div>
                    <div className="text-xs text-[#403d38]/70 font-mono">{h.contact}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`font-bold text-xs px-3 py-0.5 border ${getBadgeStyle(h.planTier)}`}>
                      {h.planTier}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-[#403d38]">{h.duration}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-medium rounded-xl text-xs gap-1.5 border-[#afd9c3] text-[#403d38] hover:bg-[#d6fce2] hover:border-[#afd9c3]"
                      onClick={() => setSelectedHotel(h)}
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 1. Add Hotel Modal */}
        <Dialog open={newHotelModal} onOpenChange={setNewHotelModal}>
          <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 bg-white border border-[#afd9c3]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#403d38]">Onboard New Client Hotel</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-3 text-[#403d38]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#403d38]">Hotel Name</label>
                  <Input
                    placeholder="e.g. Grand Palace Hotel"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="mt-1.5 h-10 rounded-xl text-sm border-[#afd9c3] focus-visible:ring-[#afd9c3]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#403d38]">Location / City</label>
                  <Input
                    placeholder="e.g. Ahmedabad, Gujarat"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="mt-1.5 h-10 rounded-xl text-sm border-[#afd9c3] focus-visible:ring-[#afd9c3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#403d38]">Owner Full Name</label>
                  <Input
                    placeholder="Owner name"
                    value={formOwner}
                    onChange={(e) => setFormOwner(e.target.value)}
                    className="mt-1.5 h-10 rounded-xl text-sm border-[#afd9c3] focus-visible:ring-[#afd9c3]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#403d38]">Contact Number</label>
                  <Input
                    placeholder="+91 Mobile number"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="mt-1.5 h-10 rounded-xl text-sm border-[#afd9c3] focus-visible:ring-[#afd9c3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#e5e2db] pt-4">
                <div>
                  <label className="text-xs font-semibold text-[#403d38]">Hotel GSTIN Number</label>
                  <Input
                    placeholder="24AAAAA0000A1Z5"
                    value={formGstin}
                    onChange={(e) => setFormGstin(e.target.value)}
                    className="mt-1.5 h-10 rounded-xl font-mono text-sm uppercase border-[#afd9c3] focus-visible:ring-[#afd9c3]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#403d38]">
                    Legal Proof Document (Trade License / Registration)
                  </label>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setFormDocName(e.target.files?.[0]?.name || "uploaded_proof.pdf")
                    }
                    className="mt-1.5 h-10 text-xs rounded-xl border-[#afd9c3]"
                  />
                </div>
              </div>

              <div className="border-t border-[#e5e2db] pt-4 space-y-3">
                <h3 className="text-sm font-bold text-[#403d38]">Subscription & Plan Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#403d38]/70">Plan Tier</label>
                    <Select value={formPlan} onValueChange={handlePlanChange}>
                      <SelectTrigger className="mt-1.5 h-10 rounded-xl text-sm border-[#afd9c3]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High (All Features)</SelectItem>
                        <SelectItem value="Mid">Mid Plan</SelectItem>
                        <SelectItem value="Low">Low (Basic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#403d38]/70">Duration</label>
                    <Select value={formDuration} onValueChange={handleDurationChange}>
                      <SelectTrigger className="mt-1.5 h-10 rounded-xl text-sm border-[#afd9c3]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 Month">1 Month</SelectItem>
                        <SelectItem value="3 Months">3 Months</SelectItem>
                        <SelectItem value="6 Months">6 Months</SelectItem>
                        <SelectItem value="9 Months">9 Months</SelectItem>
                        <SelectItem value="12 Months">12 Months (1 Year)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#403d38]/70">Manual Discount %</label>
                    <Input
                      placeholder="e.g. 15%"
                      value={formDiscount}
                      onChange={(e) => setFormDiscount(e.target.value)}
                      className="mt-1.5 h-10 rounded-xl text-sm border-[#afd9c3] focus-visible:ring-[#afd9c3]"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#e5e2db] pt-4">
                <label className="text-xs font-bold text-[#403d38] block mb-2.5">
                  Features Assigned to Client:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-[#e5e2db]/30 p-4 rounded-2xl border border-[#afd9c3]/60">
                  {ALL_FEATURES.map((feat) => (
                    <div key={feat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`new-${feat.id}`}
                        checked={formFeatures.includes(feat.id)}
                        onCheckedChange={() => toggleFeatureInForm(feat.id)}
                        className="data-[state=checked]:bg-[#403d38] data-[state=checked]:border-[#403d38]"
                      />
                      <label
                        htmlFor={`new-${feat.id}`}
                        className="text-xs cursor-pointer font-medium text-[#403d38]"
                      >
                        {feat.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full mt-4 bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db] font-semibold py-3 rounded-2xl" 
                onClick={handleCreateHotel}
              >
                Confirm & Provision Hotel Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 2. Client Details Dialog (CENTER SCREEN ULTRA-WIDE RESPONSIVE MODAL) */}
        <Dialog open={!!selectedHotel} onOpenChange={(open) => !open && setSelectedHotel(null)}>
          <DialogContent className="!w-[94vw] !max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-10 bg-white shadow-2xl border border-[#afd9c3]">
            {selectedHotel && (
              <div className="space-y-6">
                
                {/* Header Profile Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e2db] pb-5">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="font-mono text-xs font-bold text-[#403d38] bg-[#d6fce2] border border-[#afd9c3] px-3 py-1 rounded-xl">
                        {selectedHotel.tenantId}
                      </span>
                      <Badge className="bg-[#afd9c3]/40 text-[#403d38] border-[#afd9c3] border font-bold text-xs py-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#403d38]" /> Active Hotel Tenant
                      </Badge>
                    </div>
                    <DialogTitle className="text-3xl font-extrabold text-[#403d38] tracking-tight">
                      {selectedHotel.name}
                    </DialogTitle>
                    <p className="text-sm text-[#403d38]/75 font-normal mt-1">
                      {selectedHotel.location} • Owner: <span className="font-semibold text-[#403d38]">{selectedHotel.owner}</span> ({selectedHotel.contact})
                    </p>
                  </div>
                </div>

                {/* 2-Column Balanced Master Grid (Spacious & Clean) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  
                  {/* Left Column: Credentials + Tax Verification */}
                  <div className="space-y-5">
                    
                    {/* Staff Credentials Box */}
                    <div className="bg-[#e5e2db]/35 p-5 rounded-3xl border border-[#afd9c3]/60 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#403d38] uppercase tracking-wider">
                        <KeyRound className="w-4 h-4 text-[#e3cf92]" />
                        Staff Login Credentials
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white p-3.5 rounded-2xl border border-[#afd9c3]/60 flex items-center justify-between">
                          <div className="truncate max-w-[170px]">
                            <span className="text-[11px] font-semibold text-[#403d38]/60 uppercase tracking-wider block">Staff Login ID</span>
                            <span className="font-mono text-xs font-bold text-[#403d38] mt-1 block truncate">{selectedHotel.email}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs hover:bg-[#d6fce2] text-[#403d38]"
                            onClick={() => copyToClipboard(selectedHotel.email, "email")}
                          >
                            {copiedKey === "email" ? <CheckCircle2 className="w-4 h-4 text-[#403d38]" /> : <Copy className="w-4 h-4 text-[#403d38]/70" />}
                          </Button>
                        </div>

                        <div className="bg-white p-3.5 rounded-2xl border border-[#afd9c3]/60 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-semibold text-[#403d38]/60 uppercase tracking-wider block">Password</span>
                            <span className="font-mono text-xs font-bold text-[#403d38] mt-1 block">{selectedHotel.password}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-xs hover:bg-[#d6fce2] text-[#403d38]"
                            onClick={() => copyToClipboard(selectedHotel.password, "pass")}
                          >
                            {copiedKey === "pass" ? <CheckCircle2 className="w-4 h-4 text-[#403d38]" /> : <Copy className="w-4 h-4 text-[#403d38]/70" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Tax & Verification Details */}
                    <div className="bg-[#e5e2db]/35 p-5 rounded-3xl border border-[#afd9c3]/60 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#403d38] uppercase tracking-wider">
                        <FileCheck2 className="w-4 h-4 text-[#403d38]" /> Tax & Proof Documents
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white p-3.5 rounded-2xl border border-[#afd9c3]/60">
                          <span className="text-[11px] font-semibold text-[#403d38]/60 uppercase tracking-wider block">GSTIN Number</span>
                          <span className="font-mono text-sm font-bold text-[#403d38] mt-1 block">{selectedHotel.gstin}</span>
                        </div>
                        <div className="bg-white p-3.5 rounded-2xl border border-[#afd9c3]/60 flex items-center justify-between">
                          <div className="truncate max-w-[170px]">
                            <span className="text-[11px] font-semibold text-[#403d38]/60 uppercase tracking-wider block">Legal Proof</span>
                            <span className="text-xs font-bold text-[#403d38] truncate block mt-1">{selectedHotel.docName}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] bg-[#d6fce2] text-[#403d38] border-[#afd9c3]">Verified</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Subscription Specs */}
                    <div className="bg-[#e5e2db]/35 p-5 rounded-3xl border border-[#afd9c3]/60 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#403d38] uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-[#403d38]" /> Active Subscription Plan
                      </div>
                      <div className="grid grid-cols-4 gap-2 bg-white p-4 rounded-2xl border border-[#afd9c3]/60 text-center">
                        <div>
                          <span className="text-[10px] font-semibold text-[#403d38]/60 uppercase block">Plan</span>
                          <span className="font-bold text-[#403d38] text-sm mt-0.5 block">{selectedHotel.planTier}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-[#403d38]/60 uppercase block">Duration</span>
                          <span className="font-bold text-[#403d38] text-sm mt-0.5 block">{selectedHotel.duration}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-[#403d38]/60 uppercase block">Discount</span>
                          <span className="font-bold text-[#403d38] text-sm mt-0.5 block bg-[#d6fce2] rounded px-1">{selectedHotel.discountApplied}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-[#403d38]/60 uppercase block">Valid Till</span>
                          <span className="font-bold text-[#403d38] text-xs mt-1 block truncate">{selectedHotel.validTill}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: 11 SaaS Module Access Control */}
                  <div className="bg-[#e5e2db]/35 p-6 rounded-3xl border border-[#afd9c3]/60 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-bold text-[#403d38] uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-[#403d38]" /> Module Access Control (11 Features)
                      </div>
                      <span className="text-[11px] font-bold text-[#403d38] bg-[#d6fce2] px-3 py-1 rounded-full border border-[#afd9c3]">
                        Live Dynamic Sync
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ALL_FEATURES.map((feat) => {
                        const isChecked = selectedHotel.features.includes(feat.id);
                        return (
                          <div
                            key={feat.id}
                            className={`flex items-center space-x-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              isChecked
                                ? "border-[#afd9c3] bg-white text-[#403d38] shadow-sm ring-1 ring-[#afd9c3]"
                                : "border-[#e5e2db] text-[#403d38]/60 bg-white/50 hover:bg-white"
                            }`}
                            onClick={() => toggleFeatureInModal(feat.id)}
                          >
                            <Checkbox 
                              checked={isChecked} 
                              className="data-[state=checked]:bg-[#403d38] data-[state=checked]:border-[#403d38]" 
                            />
                            <span className={`text-xs ${isChecked ? "font-bold text-[#403d38]" : "font-medium"}`}>
                              {feat.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}