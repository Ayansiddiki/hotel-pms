"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  FileBadge,
  CalendarDays,
  CheckCircle2,
  Layers,
  Percent,
  Plus,
  Trash2,
  Search,
  ChevronDown,
  Building2,
  History,
} from "lucide-react";

/* ================================================================== */
/* CONSTANTS & DATA                                                  */
/* ================================================================== */

const COUNTRY_DATA: [string, string, string][] = [
  ["AF", "Afghanistan", "+93"], ["AL", "Albania", "+355"], ["DZ", "Algeria", "+213"],
  ["AD", "Andorra", "+376"], ["AO", "Angola", "+244"], ["AR", "Argentina", "+54"],
  ["AM", "Armenia", "+374"], ["AU", "Australia", "+61"], ["AT", "Austria", "+43"],
  ["AZ", "Azerbaijan", "+994"], ["BH", "Bahrain", "+973"], ["BD", "Bangladesh", "+880"],
  ["BY", "Belarus", "+375"], ["BE", "Belgium", "+32"], ["BT", "Bhutan", "+975"],
  ["BO", "Bolivia", "+591"], ["BA", "Bosnia and Herzegovina", "+387"], ["BW", "Botswana", "+267"],
  ["BR", "Brazil", "+55"], ["BN", "Brunei", "+673"], ["BG", "Bulgaria", "+359"],
  ["KH", "Cambodia", "+855"], ["CM", "Cameroon", "+237"], ["CA", "Canada", "+1"],
  ["CL", "Chile", "+56"], ["CN", "China", "+86"], ["CO", "Colombia", "+57"],
  ["HR", "Croatia", "+385"], ["CU", "Cuba", "+53"], ["CY", "Cyprus", "+357"],
  ["CZ", "Czech Republic", "+420"], ["DK", "Denmark", "+45"], ["EC", "Ecuador", "+593"],
  ["EG", "Egypt", "+20"], ["EE", "Estonia", "+372"], ["ET", "Ethiopia", "+251"],
  ["FJ", "Fiji", "+679"], ["FI", "Finland", "+358"], ["FR", "France", "+33"],
  ["GE", "Georgia", "+995"], ["DE", "Germany", "+49"], ["GH", "Ghana", "+233"],
  ["GR", "Greece", "+30"], ["HK", "Hong Kong", "+852"], ["HU", "Hungary", "+36"],
  ["IS", "Iceland", "+354"], ["IN", "India", "+91"], ["ID", "Indonesia", "+62"],
  ["IR", "Iran", "+98"], ["IQ", "Iraq", "+964"], ["IE", "Ireland", "+353"],
  ["IL", "Israel", "+972"], ["IT", "Italy", "+39"], ["JP", "Japan", "+81"],
  ["JO", "Jordan", "+962"], ["KZ", "Kazakhstan", "+7"], ["KE", "Kenya", "+254"],
  ["KW", "Kuwait", "+965"], ["KG", "Kyrgyzstan", "+996"], ["LA", "Laos", "+856"],
  ["LV", "Latvia", "+371"], ["LB", "Lebanon", "+961"], ["LT", "Lithuania", "+370"],
  ["LU", "Luxembourg", "+352"], ["MO", "Macau", "+853"], ["MG", "Madagascar", "+261"],
  ["MY", "Malaysia", "+60"], ["MV", "Maldives", "+960"], ["MT", "Malta", "+356"],
  ["MU", "Mauritius", "+230"], ["MX", "Mexico", "+52"], ["MN", "Mongolia", "+976"],
  ["MA", "Morocco", "+212"], ["MZ", "Mozambique", "+258"], ["MM", "Myanmar", "+95"],
  ["NP", "Nepal", "+977"], ["NL", "Netherlands", "+31"], ["NZ", "New Zealand", "+64"],
  ["NG", "Nigeria", "+234"], ["NO", "Norway", "+47"], ["OM", "Oman", "+968"],
  ["PK", "Pakistan", "+92"], ["PS", "Palestine", "+970"], ["PA", "Panama", "+507"],
  ["PE", "Peru", "+51"], ["PH", "Philippines", "+63"], ["PL", "Poland", "+48"],
  ["PT", "Portugal", "+351"], ["QA", "Qatar", "+974"], ["RO", "Romania", "+40"],
  ["RU", "Russia", "+7"], ["RW", "Rwanda", "+250"], ["SA", "Saudi Arabia", "+966"],
  ["RS", "Serbia", "+381"], ["SG", "Singapore", "+65"], ["SK", "Slovakia", "+421"],
  ["SI", "Slovenia", "+386"], ["ZA", "South Africa", "+27"], ["KR", "South Korea", "+82"],
  ["ES", "Spain", "+34"], ["LK", "Sri Lanka", "+94"], ["SD", "Sudan", "+249"],
  ["SE", "Sweden", "+46"], ["CH", "Switzerland", "+41"], ["SY", "Syria", "+963"],
  ["TW", "Taiwan", "+886"], ["TZ", "Tanzania", "+255"], ["TH", "Thailand", "+66"],
  ["TR", "Turkey", "+90"], ["UG", "Uganda", "+256"], ["UA", "Ukraine", "+380"],
  ["AE", "United Arab Emirates", "+971"], ["GB", "United Kingdom", "+44"],
  ["US", "United States", "+1"], ["UY", "Uruguay", "+598"], ["UZ", "Uzbekistan", "+998"],
  ["VE", "Venezuela", "+58"], ["VN", "Vietnam", "+84"], ["YE", "Yemen", "+967"],
  ["ZM", "Zambia", "+260"], ["ZW", "Zimbabwe", "+263"],
];

const phoneCountries = COUNTRY_DATA.map(([iso2, name, dialCode]) => ({ iso2, name, dialCode }));
type Country = (typeof phoneCountries)[number];

const ID_TYPES = ["Aadhaar Card", "Passport", "Driving License", "Voter ID"];
const ID_PLACEHOLDERS: Record<string, string> = {
  "Aadhaar Card": "12-digit Aadhaar number",
  Passport: "Passport number",
  "Driving License": "Driving licence number",
  "Voter ID": "EPIC number",
};

const ROOM_PLANS = [
  { value: "CP", label: "CP (Room + Breakfast)" },
  { value: "MAP", label: "MAP (Room + BF + Dinner)" },
  { value: "AP", label: "AP (All Meals)" },
  { value: "EP", label: "EP (Room Only)" },
];

const REFERRED_BY = ["Direct Walk-in", "MakeMyTrip", "Goibibo", "Agoda", "Corporate Tie-up"];
const VISIT_PURPOSES = ["Personal Stay", "Business / Corporate", "Wedding / Function", "Medical"];
const PAYMENT_MODES = [
  { value: "Cash", label: "Cash" },
  { value: "UPI", label: "UPI / QR" },
  { value: "Card", label: "Credit / Debit Card" },
  { value: "Bank Transfer", label: "Bank Transfer" },
];

const DEFAULT_ROOM_RATE = 3200;
const DOUBLE_OCCUPANCY_SURCHARGE = 800;
const DEFAULT_EXTRA_PERSON_RATE = "500";
const GST_SLAB_LIMIT = 7500;
const DEFAULT_CHECK_IN = "12:00 PM";
const DEFAULT_CHECK_OUT = "11:00 AM";

const EMPTY_ROOMS: { id: string; number: string; type: string; status: string }[] = [];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

/* ================================================================== */
/* HELPERS                                                           */
/* ================================================================== */

const toNum = (v: string): number => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const toInt = (v: string, fallback = 0): number => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

const onlyDigits = (v: string) => v.replace(/\D/g, "");

const formatLocalDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const normalizeTime = (v: string): string | null => {
  const m = v.trim().match(/^(\d{1,2}):?(\d{2})?$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = m[2] ?? "00";
  if (h < 1 || h > 12 || parseInt(min, 10) > 59) return null;
  return `${String(h).padStart(2, "0")}:${min}`;
};

const clampPercent = (v: string): string => {
  if (v === "") return "";
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return "";
  if (n > 100) return "100";
  if (n < 0) return "0";
  return v;
};

/* ================================================================== */
/* SMALL UI PIECES                                                   */
/* ================================================================== */

const INPUT = "h-9 text-xs rounded-xl border-[#afd9c3]/70";
const INPUT_MONO = `${INPUT} font-mono`;
const NUM_INPUT = `${INPUT_MONO} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="font-semibold block mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

function SectionCard({
  darkMode,
  className = "",
  children,
}: {
  darkMode: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`md:col-span-4 p-5 rounded-2xl border space-y-3 ${
        darkMode ? "bg-[#1f1d1a] border-[#403d38]" : "bg-white border-[#afd9c3]/50 shadow-xs"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[#2b6a48] dark:text-[#afd9c3]">
      <Icon className="w-3.5 h-3.5" /> {children}
    </div>
  );
}

function CountryPicker({
  selectedIso,
  onSelect,
  darkMode = false,
}: {
  selectedIso: string;
  onSelect: (country: Country) => void;
  darkMode?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = phoneCountries.find((c) => c.iso2 === selectedIso);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return phoneCountries;
    return phoneCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.iso2.toLowerCase() === q
    );
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const label = selected ? `${selected.name} (${selected.dialCode})` : "Select country";

  return (
    <div ref={wrapperRef} className="relative w-44 shrink-0">
      <button
        type="button"
        title={label}
        onClick={() => setOpen((o) => !o)}
        className={`${INPUT} w-full flex items-center justify-between gap-1 px-2.5 border font-medium bg-transparent`}
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
      </button>

      {open && (
        <div
          className={`absolute left-0 top-10 z-50 w-72 rounded-xl border shadow-lg ${
            darkMode
              ? "bg-[#2d2a26] border-[#403d38] text-[#e5e2db]"
              : "bg-white border-[#afd9c3] text-[#403d38]"
          }`}
        >
          <div className="p-2 border-b border-[#afd9c3]/40">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-[#afd9c3]/70">
              <Search className="w-3.5 h-3.5 opacity-50" />
              <input
                autoFocus
                type="text"
                placeholder="Search country or code..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent text-xs w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="p-2 text-center text-xs text-slate-400">No country found</div>
            ) : (
              filtered.map((c) => (
                <button
                  type="button"
                  key={c.iso2}
                  onClick={() => {
                    onSelect(c);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-xs hover:bg-[#d6fce2] hover:text-[#403d38] ${
                    c.iso2 === selectedIso ? "bg-[#d6fce2]/60 font-bold text-[#403d38]" : ""
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="font-mono opacity-70">{c.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* TYPES                                                             */
/* ================================================================== */

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoom: { id: string; number: string; type: string; price?: number } | null;
  allRooms?: { id: string; number: string; type: string; status: string }[];
  onConfirm: (bookingData: any) => void;
  darkMode?: boolean;
  defaultRegisterNumber?: string;
}

interface AdditionalPerson {
  name: string;
  mobile: string;
  age: string;
  idType: string;
  idNo: string;
}

interface CompanyRecord {
  id: string;
  name: string;
  gstin: string;
}

interface CustomerMasterRecord {
  mobile: string;
  fullName: string;
  address: string;
  city: string;
  stateName: string;
  pincode: string;
  email: string;
  idType: string;
  idNumber: string;
  idDocFileName?: string;
  companyName?: string;
  guestGstin?: string;
  selectedIso?: string;
}

/* ================================================================== */
/* MAIN COMPONENT                                                    */
/* ================================================================== */

export function CheckInModal({
  isOpen,
  onClose,
  activeRoom,
  allRooms = EMPTY_ROOMS,
  onConfirm,
  darkMode = false,
  defaultRegisterNumber = "1681",
}: CheckInModalProps) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    if (!isOpen) return;
    setCurrentDateTime(new Date());
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const [registerNumber, setRegisterNumber] = useState(defaultRegisterNumber);
  const [bookingId, setBookingId] = useState("");

  const [selectedIso, setSelectedIso] = useState("IN");
  const selectedCountry: Country =
    phoneCountries.find((c) => c.iso2 === selectedIso) ||
    phoneCountries.find((c) => c.iso2 === "IN")!;
  const countryCode = selectedCountry.dialCode;
  const nationality = selectedCountry.name;
  const isIndia = selectedCountry.iso2 === "IN";

  const [mobileNumber, setMobileNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("PATAN");
  const [stateName, setStateName] = useState("Gujarat");
  const [pincode, setPincode] = useState("384265");
  const [email, setEmail] = useState("");
  const [idType, setIdType] = useState("Aadhaar Card");
  const [idNumber, setIdNumber] = useState("");
  const [idDocFileName, setIdDocFileName] = useState("");

  // Customer Master Database & Suggestions State
  const [customerMasterList, setCustomerMasterList] = useState<CustomerMasterRecord[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  // Company Master States
  const [companyList, setCompanyList] = useState<CompanyRecord[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [guestGstin, setGuestGstin] = useState("");

  const [remarks, setRemarks] = useState("");

  const [roomStatus, setRoomStatus] = useState("Single");
  const [noOfPersons, setNoOfPersons] = useState("1");
  const [roomRate, setRoomRate] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountSource, setDiscountSource] = useState<"percent" | "amount">("percent");
  const [extraPersonCount, setExtraPersonCount] = useState("");
  const [extraPersonRate, setExtraPersonRate] = useState(DEFAULT_EXTRA_PERSON_RATE);
  const [roomPlan, setRoomPlan] = useState("CP");
  const [planAmount, setPlanAmount] = useState("");
  const [referredCompanyBy, setReferredCompanyBy] = useState(REFERRED_BY[0]);
  const [visitPurpose, setVisitPurpose] = useState(VISIT_PURPOSES[0]);
  const [applyGst, setApplyGst] = useState(true);

  const [checkInDate, setCheckInDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("12:00");
  const [checkInAmPm, setCheckInAmPm] = useState("PM");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [checkOutAmPm, setCheckOutAmPm] = useState("AM");

  const [advancePayment, setAdvancePayment] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [advanceInvoiceNo, setAdvanceInvoiceNo] = useState("");
  const [cardExpiryDate, setCardExpiryDate] = useState("");

  const [otherPersons, setOtherPersons] = useState<AdditionalPerson[]>([]);
  const [mergedRoomNumbers, setMergedRoomNumbers] = useState<string[]>([]);
  const [liveInventoryRooms, setLiveInventoryRooms] = useState<
    { id: string; number: string; type: string; status: string }[]
  >([]);

  const [formError, setFormError] = useState("");

  // Load Companies & Customer Master from localStorage
  useEffect(() => {
    if (!isOpen) return;
    try {
      const savedCompanies = localStorage.getItem("hotel_pms_companies");
      if (savedCompanies) {
        setCompanyList(JSON.parse(savedCompanies));
      }
      const savedCustomers = localStorage.getItem("hotel_pms_customer_master");
      if (savedCustomers) {
        setCustomerMasterList(JSON.parse(savedCustomers));
      }
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  // Filter returning customers based on typed mobile number or name
  const matchedCustomerSuggestions = useMemo(() => {
    const mobQuery = mobileNumber.trim();
    const nameQuery = fullName.trim().toLowerCase();
    if (mobQuery.length < 2 && nameQuery.length < 2) return [];

    const map = new Map<string, CustomerMasterRecord>();
    customerMasterList.forEach((cust) => {
      const matchMob = mobQuery && cust.mobile && cust.mobile.includes(mobQuery);
      const matchName = nameQuery && cust.fullName && cust.fullName.toLowerCase().includes(nameQuery);
      if (matchMob || matchName) {
        if (!map.has(cust.mobile)) {
          map.set(cust.mobile, cust);
        }
      }
    });
    return Array.from(map.values()).slice(0, 5); // Max 5 suggestions
  }, [mobileNumber, fullName, customerMasterList]);

  const handleSelectCustomerMaster = (cust: CustomerMasterRecord) => {
    setMobileNumber(cust.mobile || "");
    setFullName(cust.fullName || "");
    setAddress(cust.address || "");
    setCity(cust.city || "PATAN");
    setStateName(cust.stateName || "Gujarat");
    setPincode(cust.pincode || "384265");
    setEmail(cust.email || "");
    if (cust.idType) setIdType(cust.idType);
    if (cust.idNumber) setIdNumber(cust.idNumber);
    if (cust.idDocFileName) setIdDocFileName(cust.idDocFileName);
    if (cust.companyName) setCompanyName(cust.companyName);
    if (cust.guestGstin) setGuestGstin(cust.guestGstin);
    if (cust.selectedIso) setSelectedIso(cust.selectedIso);
    setShowCustomerSuggestions(false);
  };

  const filteredCompanies = useMemo(() => {
    if (!companySearch) return companyList;
    return companyList.filter(
      (c) =>
        c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.gstin.toLowerCase().includes(companySearch.toLowerCase())
    );
  }, [companySearch, companyList]);

  useEffect(() => {
    if (!isOpen) return;
    if (allRooms.length > 0) {
      setLiveInventoryRooms(allRooms);
      return;
    }
    try {
      const saved = localStorage.getItem("hotel_pms_rooms");
      if (saved) setLiveInventoryRooms(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, [isOpen, allRooms]);

  useEffect(() => {
    if (!isOpen) return;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    setCheckInDate(formatLocalDate(now));
    setCheckOutDate(formatLocalDate(tomorrow));

    let cfgCheckIn = DEFAULT_CHECK_IN;
    let cfgCheckOut = DEFAULT_CHECK_OUT;
    try {
      const raw = localStorage.getItem("hotel_pms_global_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.checkInTime) cfgCheckIn = parsed.checkInTime;
        if (parsed.checkOutTime) cfgCheckOut = parsed.checkOutTime;
      }
    } catch (e) {
      console.error(e);
    }

    const applyConfiguredTime = (
      value: string,
      setTime: (v: string) => void,
      setPeriod: (v: string) => void
    ) => {
      const [t, p] = value.trim().split(/\s+/);
      const nt = t ? normalizeTime(t) : null;
      if (nt) setTime(nt);
      if (p && /^(AM|PM)$/i.test(p)) setPeriod(p.toUpperCase());
    };
    applyConfiguredTime(cfgCheckIn, setCheckInTime, setCheckInAmPm);
    applyConfiguredTime(cfgCheckOut, setCheckOutTime, setCheckOutAmPm);

    setRegisterNumber(defaultRegisterNumber);
    setBookingId("");
    setSelectedIso("IN");
    setMobileNumber("");
    setFullName("");
    setAddress("");
    setCity("PATAN");
    setStateName("Gujarat");
    setPincode("384265");
    setEmail("");
    setIdType("Aadhaar Card");
    setIdNumber("");
    setIdDocFileName("");
    setCompanyName("");
    setGuestGstin("");
    setCompanySearch("");
    setShowCustomerSuggestions(false);
    setRemarks("");
    setRoomStatus("Single");
    setNoOfPersons("1");
    setDiscountPercent("");
    setDiscountAmount("");
    setDiscountSource("percent");
    setExtraPersonCount("");
    setExtraPersonRate(DEFAULT_EXTRA_PERSON_RATE);
    setRoomPlan("CP");
    setPlanAmount("");
    setReferredCompanyBy(REFERRED_BY[0]);
    setVisitPurpose(VISIT_PURPOSES[0]);
    setApplyGst(true);
    setAdvancePayment("");
    setPaymentMode("Cash");
    setAdvanceInvoiceNo("");
    setCardExpiryDate("");
    setOtherPersons([]);
    setFormError("");
    setMergedRoomNumbers(activeRoom ? [activeRoom.number] : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeRoom?.id, defaultRegisterNumber]);

  const baseRate = activeRoom?.price || DEFAULT_ROOM_RATE;
  useEffect(() => {
    if (!isOpen) return;
    const rate = baseRate + (roomStatus === "Double" ? DOUBLE_OCCUPANCY_SURCHARGE : 0);
    setRoomRate(String(rate));
  }, [isOpen, baseRate, roomStatus]);

  useEffect(() => {
    setNoOfPersons((prev) => String(Math.max(toInt(prev, 1), 1 + otherPersons.length)));
  }, [otherPersons.length]);

  const roomsCount = mergedRoomNumbers.length > 0 ? mergedRoomNumbers.length : 1;

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 1;
    const a = new Date(`${checkInDate}T00:00:00`).getTime();
    const b = new Date(`${checkOutDate}T00:00:00`).getTime();
    if (Number.isNaN(a) || Number.isNaN(b)) return 1;
    return Math.max(1, Math.round((b - a) / 86400000));
  }, [checkInDate, checkOutDate]);

  const rateNum = toNum(roomRate);
  const actualTariff = rateNum * roomsCount;

  const discountValue =
    discountSource === "percent"
      ? Math.round((actualTariff * Math.min(toNum(discountPercent), 100)) / 100)
      : Math.min(toNum(discountAmount), actualTariff);

  const displayPercent =
    discountSource === "percent"
      ? discountPercent
      : actualTariff > 0 && discountValue > 0
      ? String(Number(((discountValue / actualTariff) * 100).toFixed(2)))
      : "";
  const displayAmount =
    discountSource === "amount" ? discountAmount : discountValue > 0 ? String(discountValue) : "";

  const discountedTariff = Math.max(0, actualTariff - discountValue);
  const extraCharges = toInt(extraPersonCount) * toNum(extraPersonRate);
  const taxableNightly = discountedTariff + extraCharges;

  const gstRate = taxableNightly / roomsCount <= GST_SLAB_LIMIT ? 0.05 : 0.18;
  const gstNightly = applyGst ? taxableNightly * gstRate : 0;

  const tariffIncludingTaxes = Math.round(taxableNightly + gstNightly);
  const finalAmount = tariffIncludingTaxes * nights;
  const advanceNum = toNum(advancePayment);
  const balanceDue = Math.max(0, finalAmount - advanceNum);

  const handleAddPerson = () =>
    setOtherPersons((prev) => [
      ...prev,
      { name: "", mobile: "", age: "", idType: "Aadhaar Card", idNo: "" },
    ]);

  const handleRemovePerson = (index: number) =>
    setOtherPersons((prev) => prev.filter((_, i) => i !== index));

  const handlePersonChange = (index: number, field: keyof AdditionalPerson, value: string) =>
    setOtherPersons((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));

  const toggleRoomSelection = (room: { number: string; status: string }) => {
    if (activeRoom && room.number === activeRoom.number) return;
    if (String(room.status).toLowerCase() !== "available") return;
    setMergedRoomNumbers((prev) =>
      prev.includes(room.number) ? prev.filter((r) => r !== room.number) : [...prev, room.number]
    );
  };

  const handleCheckInDateChange = (value: string) => {
    setCheckInDate(value);
    if (value && checkOutDate && checkOutDate < value) {
      const d = new Date(`${value}T00:00:00`);
      d.setDate(d.getDate() + 1);
      setCheckOutDate(formatLocalDate(d));
    }
  };

  const mobileValid = isIndia
    ? /^[6-9]\d{9}$/.test(mobileNumber)
    : /^\d{5,15}$/.test(mobileNumber);

  const validate = (): string => {
    if (!fullName.trim()) return "Enter the guest's full name.";
    if (!mobileValid)
      return isIndia
        ? "Enter a valid 10-digit Indian mobile number."
        : "Enter a valid mobile number (5 to 15 digits).";
    if (!address.trim()) return "Enter the guest's address.";
    if (email.trim() && !EMAIL_RE.test(email.trim())) return "Enter a valid email address.";
    if (isIndia && pincode && !/^\d{6}$/.test(pincode)) return "Pincode must be 6 digits.";
    if (idType === "Aadhaar Card" && idNumber && !/^\d{12}$/.test(idNumber.replace(/\s/g, "")))
      return "Aadhaar number must be 12 digits.";
    if (guestGstin && !GSTIN_RE.test(guestGstin)) return "Enter a valid 15-character GSTIN.";
    if (!normalizeTime(checkInTime)) return "Check-in time is invalid. Use hh:mm, e.g. 12:00.";
    if (!normalizeTime(checkOutTime)) return "Check-out time is invalid. Use hh:mm, e.g. 11:00.";
    if (!checkInDate || !checkOutDate) return "Select check-in and check-out dates.";
    if (checkOutDate < checkInDate) return "Check-out date cannot be before check-in date.";
    if (rateNum <= 0) return "Enter a room rate greater than 0.";
    if (advanceNum > finalAmount) return "Advance cannot be more than the final amount.";
    const missingIdx = otherPersons.findIndex((p) => !p.name.trim());
    if (missingIdx !== -1)
      return `Enter a name for Other Person ${missingIdx + 1}, or remove that entry.`;
    return "";
  };

  const handleSubmit = () => {
    const error = validate();
    if (error) {
      setFormError(error);
      return;
    }
    setFormError("");

    // SAVE/UPDATE CUSTOMER MASTER RECORD IN LOCALSTORAGE
    try {
      const currentMaster: CustomerMasterRecord[] = JSON.parse(
        localStorage.getItem("hotel_pms_customer_master") || "[]"
      );
      const newRecord: CustomerMasterRecord = {
        mobile: mobileNumber.trim(),
        fullName: fullName.trim(),
        address: address.trim(),
        city,
        stateName,
        pincode,
        email: email.trim(),
        idType,
        idNumber,
        idDocFileName,
        companyName,
        guestGstin,
        selectedIso,
      };

      // Remove existing record for this mobile number if any, then prepend new
      const filtered = currentMaster.filter((c) => c.mobile !== newRecord.mobile);
      const updatedMaster = [newRecord, ...filtered];
      localStorage.setItem("hotel_pms_customer_master", JSON.stringify(updatedMaster));
    } catch (e) {
      console.error("Failed to save customer master", e);
    }

    const ciTime = normalizeTime(checkInTime) as string;
    const coTime = normalizeTime(checkOutTime) as string;
    const rooms = mergedRoomNumbers.length > 0 ? mergedRoomNumbers : [activeRoom?.number || "101"];

    onConfirm({
      registerNumber,
      bookingId,
      fullName: fullName.trim(),
      mobile: `${countryCode} ${mobileNumber}`,
      address: address.trim(),
      city,
      stateName,
      pincode,
      nationality,
      email: email.trim(),
      idType,
      idNumber,
      idDocFileName,
      companyName,
      guestGstin,
      remarks,
      roomStatus,
      noOfPersons: Math.max(1, toInt(noOfPersons, 1)),
      roomNumbers: rooms,
      roomRate: rateNum,
      actualTariff,
      discountPercent: Number(displayPercent) || 0,
      discountRs: discountValue,
      extraPersonCount: toInt(extraPersonCount),
      extraPersonRate: toNum(extraPersonRate),
      extraBeds: toInt(extraPersonCount),
      extraBedRate: toNum(extraPersonRate),
      roomPlan,
      planAmount,
      referredCompanyBy,
      visitPurpose,
      checkInDateTime: `${checkInDate} ${ciTime} ${checkInAmPm}`,
      checkOutDateTime: `${checkOutDate} ${coTime} ${checkOutAmPm}`,
      nights,
      applyGst,
      gstRate: applyGst ? gstRate : 0,
      tariffIncludingTaxes,
      finalAmount,
      advancePayment: advanceNum,
      balanceAmount: balanceDue,
      paymentMode,
      advanceInvoiceNo,
      cardExpiryDate,
      otherPersons: otherPersons.map((p) => ({ ...p, name: p.name.trim() })),
    });

    onClose();
  };

  const panelCls = darkMode
    ? "bg-[#25221e] border-[#403d38]"
    : "bg-slate-50 border-[#afd9c3]/60";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`w-[96vw] max-w-7xl max-h-[94vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-3xl border p-6 sm:p-7 shadow-2xl transition-colors ${
          darkMode
            ? "bg-[#2d2a26] border-[#403d38] text-[#e5e2db]"
            : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Guest Check-In - Complete Form</DialogTitle>
        </DialogHeader>

        {/* ---------------- HEADER ---------------- */}
        <div className="flex items-center justify-between pb-4 border-b border-[#afd9c3]/40">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight">Check-In Guest (Apple Residency Standard)</h2>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#d6fce2] text-[#403d38] border border-[#afd9c3]">
                Primary Room {activeRoom?.number || "101"}
              </span>
              <span className="text-xs opacity-70 font-semibold">({activeRoom?.type || "Standard Room"})</span>
            </div>
            <p className="text-[11px] opacity-60 mt-0.5">
              Guest registration with customer master auto-fill, live room pricing, and GST slabs.
            </p>
          </div>

          <div className="text-right border-l border-[#afd9c3]/40 pl-4 select-none">
            <div className="font-black text-sm font-mono tracking-tight text-[#2b6a48] dark:text-[#d6fce2]">
              {currentDateTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })}
            </div>
            <div className="text-[11px] opacity-75 font-semibold">
              {currentDateTime.toLocaleDateString("en-US", {
                weekday: "long",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* ---------------- 3-COLUMN GRID ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4 text-xs">
          {/* ============ COLUMN 1: GUEST ============ */}
          <SectionCard darkMode={darkMode}>
            <SectionTitle icon={User}>Guest & ID Details</SectionTitle>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Register Number">
                <Input
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  className={`${INPUT_MONO} font-bold`}
                />
              </Field>
              <Field label="Booking ID">
                <Input
                  placeholder="Optional"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className={INPUT_MONO}
                />
              </Field>
            </div>

            {/* CUSTOMER MASTER AUTO-SUGGEST MOBILE FIELD */}
            <div className="relative">
              <Field label="Country & Mobile Number" required>
                <div className="flex gap-2">
                  <CountryPicker
                    selectedIso={selectedIso}
                    onSelect={(c) => setSelectedIso(c.iso2)}
                    darkMode={darkMode}
                  />
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder={isIndia ? "10-digit mobile" : "Mobile number"}
                    maxLength={isIndia ? 10 : 15}
                    value={mobileNumber}
                    onChange={(e) => {
                      setMobileNumber(onlyDigits(e.target.value));
                      setShowCustomerSuggestions(true);
                    }}
                    onFocus={() => setShowCustomerSuggestions(true)}
                    className={`${INPUT_MONO} flex-1 min-w-0`}
                  />
                </div>
              </Field>

              {/* Customer Master Suggestions Popup */}
              {showCustomerSuggestions && matchedCustomerSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-16 z-50 rounded-2xl border shadow-xl bg-white dark:bg-[#2d2a26] border-[#afd9c3] p-1.5 space-y-1">
                  <div className="flex items-center justify-between px-2 py-1 border-b border-[#afd9c3]/40 text-[10px] font-bold text-[#2b6a48] dark:text-[#afd9c3]">
                    <span className="flex items-center gap-1">
                      <History className="w-3 h-3" /> Returning Guest Found in Customer Master:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCustomerSuggestions(false)}
                      className="opacity-70 hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                  {matchedCustomerSuggestions.map((cust, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleSelectCustomerMaster(cust)}
                      className="w-full text-left p-2 rounded-xl hover:bg-[#d6fce2]/40 dark:hover:bg-[#403d38] transition-colors flex flex-col gap-0.5 cursor-pointer"
                    >
                      <div className="font-bold text-xs flex justify-between">
                        <span className="text-[#2b6a48] dark:text-[#afd9c3] font-black">{cust.fullName}</span>
                        <span className="font-mono">{cust.mobile}</span>
                      </div>
                      <div className="text-[10px] opacity-75 truncate">
                        {cust.address}, {cust.city} | ID: {cust.idType} ({cust.idNumber || "N/A"})
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Field label="Person Name" required>
              <Input
                placeholder="Guest's full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={INPUT}
              />
            </Field>

            <Field label="Address" required>
              <Input
                placeholder="House No, Street, Area..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={INPUT}
              />
            </Field>

            <div className="grid grid-cols-3 gap-2">
              <Field label="City">
                <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className={INPUT} />
              </Field>
              <Field label="State">
                <Input
                  placeholder="State"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Pincode">
                <Input
                  inputMode="numeric"
                  placeholder="Pincode"
                  maxLength={isIndia ? 6 : 10}
                  value={pincode}
                  onChange={(e) => setPincode(isIndia ? onlyDigits(e.target.value) : e.target.value)}
                  className={INPUT_MONO}
                />
              </Field>
            </div>

            <Field label="Email ID">
              <Input
                type="email"
                placeholder="guest@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT}
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="ID Proof Type">
                <Select
                  value={idType}
                  onValueChange={(val: string) => {
                    setIdType(val);
                    setIdNumber("");
                  }}
                >
                  <SelectTrigger className={INPUT}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ID_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Document Number">
                <Input
                  placeholder={ID_PLACEHOLDERS[idType] || "Document number"}
                  value={idNumber}
                  onChange={(e) =>
                    setIdNumber(
                      idType === "Aadhaar Card"
                        ? onlyDigits(e.target.value).slice(0, 12)
                        : e.target.value.toUpperCase()
                    )
                  }
                  className={`${INPUT_MONO} uppercase`}
                />
              </Field>
            </div>

            {idDocFileName && (
              <div className="text-[10px] font-bold text-[#2b6a48] dark:text-[#afd9c3] bg-[#d6fce2]/30 p-2 rounded-xl flex items-center justify-between">
                <span>📎 Restored Document: {idDocFileName}</span>
                <span className="opacity-75">Auto-attached</span>
              </div>
            )}

            {/* COMPANY MASTER INTEGRATED SELECTOR */}
            <div className="space-y-3 pt-1 border-t border-[#afd9c3]/30">
              <Field label="Company Name (Corporate Directory)">
                <Select
                  value={companyName}
                  onValueChange={(val: string) => {
                    if (val === "none") {
                      setCompanyName("");
                      setGuestGstin("");
                    } else {
                      setCompanyName(val);
                      const found = companyList.find((c) => c.name === val);
                      if (found) {
                        setGuestGstin(found.gstin || "");
                      }
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-10 text-xs rounded-xl border-[#afd9c3]/80 font-medium px-3 flex justify-between bg-white dark:bg-[#2d2a26] shadow-xs">
                    <SelectValue placeholder="🔍 Select or Search Corporate Company..." />
                  </SelectTrigger>
                  <SelectContent className="w-[340px] max-h-72 p-1 rounded-2xl shadow-xl border-[#afd9c3]">
                    <div className="p-2 sticky top-0 bg-white dark:bg-[#2d2a26] z-10 border-b border-[#afd9c3]/40">
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#afd9c3]/70 bg-slate-50 dark:bg-[#1f1d1a]">
                        <Search className="w-4 h-4 opacity-60" />
                        <input
                          type="text"
                          placeholder="Type company name or GSTIN to search..."
                          value={companySearch}
                          onChange={(e) => setCompanySearch(e.target.value)}
                          className="bg-transparent text-xs w-full focus:outline-none font-medium"
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="pt-1 space-y-0.5">
                      <SelectItem value="none" className="py-2.5 rounded-xl text-xs font-semibold opacity-70">
                        -- None / Direct Guest --
                      </SelectItem>
                      {filteredCompanies.length === 0 ? (
                        <div className="p-4 text-center text-xs opacity-50">No company found in Master</div>
                      ) : (
                        filteredCompanies.map((c) => (
                          <SelectItem key={c.id} value={c.name} className="py-2.5 px-3 rounded-xl text-xs font-bold my-0.5 cursor-pointer">
                            <div className="flex flex-col">
                              <span className="text-[#2b6a48] dark:text-[#afd9c3] font-bold text-xs">{c.name}</span>
                              <span className="font-mono text-[10px] opacity-75">GSTIN: {c.gstin || "N/A"}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Guest GST No (Auto-Filled)">
                <Input
                  placeholder="15-character GSTIN"
                  maxLength={15}
                  value={guestGstin}
                  onChange={(e) => setGuestGstin(e.target.value.toUpperCase())}
                  className={`${INPUT_MONO} uppercase font-bold`}
                />
              </Field>
            </div>

            <Field label="Remarks">
              <Input
                placeholder="Special requests or notes"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className={INPUT}
              />
            </Field>
          </SectionCard>

          {/* ============ COLUMN 2: ROOM, PLAN & PRICING ============ */}
          <SectionCard darkMode={darkMode}>
            <SectionTitle icon={FileBadge}>2. Room, Plan & Pricing</SectionTitle>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Room Status">
                <Select value={roomStatus} onValueChange={(val: string) => setRoomStatus(val)}>
                  <SelectTrigger className={`${INPUT} font-medium`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Double">Double</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="No. of Persons">
                <Input
                  type="number"
                  min={1}
                  placeholder="1"
                  value={noOfPersons}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setNoOfPersons(onlyDigits(e.target.value))}
                  onBlur={() =>
                    setNoOfPersons(String(Math.max(1 + otherPersons.length, toInt(noOfPersons, 1))))
                  }
                  className={`${NUM_INPUT} font-bold`}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Room Rate / Night (₹)">
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={roomRate}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setRoomRate(e.target.value)}
                  className={NUM_INPUT}
                />
              </Field>
              <Field label={`Act. Tariff (${roomsCount} room${roomsCount > 1 ? "s" : ""})`}>
                <Input
                  readOnly
                  tabIndex={-1}
                  value={actualTariff}
                  className={`${NUM_INPUT} font-bold opacity-80 cursor-default`}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Discount %">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={displayPercent}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    setDiscountSource("percent");
                    setDiscountPercent(clampPercent(e.target.value));
                  }}
                  className={NUM_INPUT}
                />
              </Field>
              <Field label="Discount (₹)">
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={displayAmount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    setDiscountSource("amount");
                    setDiscountAmount(e.target.value);
                  }}
                  className={NUM_INPUT}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Extra Person (Charged)">
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={extraPersonCount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setExtraPersonCount(onlyDigits(e.target.value))}
                  className={NUM_INPUT}
                />
              </Field>
              <Field label="Extra Rate (₹)">
                <Input
                  type="number"
                  min={0}
                  placeholder="500"
                  value={extraPersonRate}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setExtraPersonRate(e.target.value)}
                  className={NUM_INPUT}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Room Plan">
                <Select value={roomPlan} onValueChange={(val: string) => setRoomPlan(val)}>
                  <SelectTrigger className={INPUT}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_PLANS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Plan Amt. (₹)">
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={planAmount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setPlanAmount(e.target.value)}
                  className={NUM_INPUT}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Referred By">
                <Select value={referredCompanyBy} onValueChange={(val: string) => setReferredCompanyBy(val)}>
                  <SelectTrigger className={INPUT}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REFERRED_BY.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Visit Purpose">
                <Select value={visitPurpose} onValueChange={(val: string) => setVisitPurpose(val)}>
                  <SelectTrigger className={INPUT}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIT_PURPOSES.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Merge rooms */}
            <div className={`p-2.5 rounded-xl border space-y-1 ${panelCls}`}>
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <Layers className="w-3.5 h-3.5 text-[#2b6a48]" /> Merge Extra Rooms ({mergedRoomNumbers.length})
              </span>
              <div className="grid grid-cols-3 gap-1 pt-1 max-h-24 overflow-y-auto [scrollbar-width:none]">
                {liveInventoryRooms.length === 0 && (
                  <span className="col-span-3 text-[11px] opacity-60">No rooms found.</span>
                )}
                {liveInventoryRooms.map((r) => {
                  const isSelected = mergedRoomNumbers.includes(r.number);
                  const isPrimary = activeRoom?.number === r.number;
                  const isAvailable = String(r.status).toLowerCase() === "available" || isPrimary;
                  return (
                    <button
                      type="button"
                      key={r.id}
                      disabled={!isAvailable}
                      onClick={() => toggleRoomSelection(r)}
                      className={`p-1.5 rounded-lg text-left font-mono text-[11px] font-bold border ${
                        isSelected
                          ? "bg-[#2b6a48] text-white border-[#2b6a48]"
                          : isAvailable
                          ? `${darkMode ? "bg-[#1f1d1a]" : "bg-white"} border-[#afd9c3]`
                          : `opacity-40 cursor-not-allowed ${darkMode ? "bg-red-900/30" : "bg-red-100"}`
                      }`}
                    >
                      Room {r.number}
                    </button>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          {/* ============ COLUMN 3: STAY, PAYMENT & SUMMARY ============ */}
          <SectionCard darkMode={darkMode} className="flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <SectionTitle icon={CalendarDays}>3. Stay, Payment & Summary</SectionTitle>
                <Button
                  type="button"
                  onClick={handleAddPerson}
                  className="h-6 px-2 text-[10px] bg-[#2b6a48] hover:bg-[#23583c] text-white rounded-md flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Person
                </Button>
              </div>

              {/* Check-in */}
              <Field label="Check-In Date & Time">
                <div className="grid grid-cols-12 gap-1">
                  <Input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => handleCheckInDateChange(e.target.value)}
                    className="col-span-6 h-8 text-[11px] font-mono rounded-xl border-[#afd9c3]/70"
                  />
                  <Input
                    type="text"
                    placeholder="hh:mm"
                    maxLength={5}
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    onBlur={() => setCheckInTime(normalizeTime(checkInTime) ?? "12:00")}
                    className="col-span-3 h-8 text-[11px] font-mono rounded-xl border-[#afd9c3]/70 text-center"
                  />
                  <div className="col-span-3">
                    <Select value={checkInAmPm} onValueChange={(val: string) => setCheckInAmPm(val)}>
                      <SelectTrigger className="h-8 text-[11px] font-bold rounded-xl border-[#afd9c3]/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Field>

              {/* Check-out */}
              <Field label="Check-Out Date & Time">
                <div className="grid grid-cols-12 gap-1">
                  <Input
                    type="date"
                    min={checkInDate}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="col-span-6 h-8 text-[11px] font-mono rounded-xl border-[#afd9c3]/70"
                  />
                  <Input
                    type="text"
                    placeholder="hh:mm"
                    maxLength={5}
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    onBlur={() => setCheckOutTime(normalizeTime(checkOutTime) ?? "11:00")}
                    className="col-span-3 h-8 text-[11px] font-mono rounded-xl border-[#afd9c3]/70 text-center"
                  />
                  <div className="col-span-3">
                    <Select value={checkOutAmPm} onValueChange={(val: string) => setCheckOutAmPm(val)}>
                      <SelectTrigger className="h-8 text-[11px] font-bold rounded-xl border-[#afd9c3]/70">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Field>

              {/* Advance */}
              <div className={`p-2 rounded-xl border space-y-1.5 ${panelCls}`}>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold block mb-0.5">Advance (₹)</label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={advancePayment}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setAdvancePayment(e.target.value)}
                      className="h-7 text-xs font-mono font-bold rounded-lg border-[#afd9c3] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold block mb-0.5">Payment Mode</label>
                    <Select value={paymentMode} onValueChange={(val: string) => setPaymentMode(val)}>
                      <SelectTrigger className="h-7 text-xs rounded-lg border-[#afd9c3]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_MODES.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {advanceNum > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold block mb-0.5">
                        {paymentMode === "Cash" ? "Receipt No." : "Reference / Txn No."}
                      </label>
                      <Input
                        placeholder="Optional"
                        value={advanceInvoiceNo}
                        onChange={(e) => setAdvanceInvoiceNo(e.target.value)}
                        className="h-7 text-xs font-mono rounded-lg border-[#afd9c3]"
                      />
                    </div>
                    {paymentMode === "Card" && (
                      <div>
                        <label className="font-semibold block mb-0.5">Card Expiry</label>
                        <Input
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardExpiryDate}
                          onChange={(e) => {
                            const d = onlyDigits(e.target.value).slice(0, 4);
                            setCardExpiryDate(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                          }}
                          className="h-7 text-xs font-mono rounded-lg border-[#afd9c3]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Other persons */}
              {otherPersons.length > 0 && (
                <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                  {otherPersons.map((p, idx) => (
                    <div key={idx} className={`p-2.5 rounded-xl border space-y-2 ${panelCls}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] text-[#2b6a48]">Other Person {idx + 1} Details</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePerson(idx)}
                          className="text-red-600 hover:text-red-800 p-0.5"
                          aria-label={`Remove other person ${idx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-12 gap-1">
                        <Input
                          placeholder="Full name"
                          value={p.name}
                          onChange={(e) => handlePersonChange(idx, "name", e.target.value)}
                          className="col-span-8 h-7 text-[10px] rounded-lg border-[#afd9c3]"
                        />
                        <Input
                          inputMode="numeric"
                          placeholder="Age"
                          maxLength={3}
                          value={p.age}
                          onChange={(e) => handlePersonChange(idx, "age", onlyDigits(e.target.value))}
                          className="col-span-4 h-7 text-[10px] rounded-lg border-[#afd9c3]"
                        />
                      </div>

                      <Input
                        type="tel"
                        inputMode="numeric"
                        placeholder="Mobile number (optional)"
                        maxLength={15}
                        value={p.mobile}
                        onChange={(e) => handlePersonChange(idx, "mobile", onlyDigits(e.target.value))}
                        className="h-7 text-[10px] rounded-lg border-[#afd9c3] font-mono"
                      />

                      <div className="grid grid-cols-12 gap-1">
                        <div className="col-span-6">
                          <Select
                            value={p.idType}
                            onValueChange={(val: string) => {
                              handlePersonChange(idx, "idType", val);
                              handlePersonChange(idx, "idNo", "");
                            }}
                          >
                            <SelectTrigger className="h-7 text-[10px] rounded-lg border-[#afd9c3]">
                              <SelectValue placeholder="Doc type" />
                            </SelectTrigger>
                            <SelectContent>
                              {ID_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-6">
                          <Input
                            placeholder={ID_PLACEHOLDERS[p.idType] || "Document number"}
                            value={p.idNo}
                            onChange={(e) => handlePersonChange(idx, "idNo", e.target.value.toUpperCase())}
                            className="h-7 text-[10px] rounded-lg border-[#afd9c3] font-mono uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* GST toggle */}
              <label className="p-2 rounded-xl border border-[#afd9c3]/60 bg-[#d6fce2]/20 flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-[#2b6a48]" />
                  <span className="font-bold text-[11px]">Apply Government GST Slabs</span>
                </span>
                <input
                  type="checkbox"
                  checked={applyGst}
                  onChange={(e) => setApplyGst(e.target.checked)}
                  className="w-4 h-4 accent-[#2b6a48] cursor-pointer"
                />
              </label>

              {/* Bill summary */}
              <div className="p-3 rounded-xl border border-[#afd9c3]/60 bg-[#d6fce2]/30 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>
                    Tariff ({roomsCount} room{roomsCount > 1 ? "s" : ""} × {inr(rateNum)})
                  </span>
                  <span className="font-mono">{inr(actualTariff)}</span>
                </div>
                {discountValue > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="font-mono">− {inr(discountValue)}</span>
                  </div>
                )}
                {extraCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Extra persons</span>
                    <span className="font-mono">+ {inr(extraCharges)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{applyGst ? `GST @ ${Math.round(gstRate * 100)}%` : "GST"}</span>
                  <span className="font-mono">{applyGst ? `+ ${inr(gstNightly)}` : "Not applied"}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-[#afd9c3]/50 pt-1">
                  <span>Per night incl. taxes</span>
                  <span className="font-mono">{inr(tariffIncludingTaxes)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs text-[#2b6a48]">
                  <span>
                    Final Amount ({nights} night{nights > 1 ? "s" : ""})
                  </span>
                  <span className="font-mono">{inr(finalAmount)}</span>
                </div>
                {advanceNum > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>Advance paid</span>
                      <span className="font-mono">− {inr(advanceNum)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Balance due</span>
                      <span className="font-mono">{inr(balanceDue)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Error + actions */}
            <div className="space-y-2 pt-1">
              {formError && (
                <div
                  role="alert"
                  className="px-3 py-2 rounded-xl border border-red-300 bg-red-50 text-red-700 text-[11px] font-semibold"
                >
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-10 rounded-xl font-semibold border-[#afd9c3]"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="col-span-2 h-10 font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm bg-[#2b6a48] hover:bg-[#23583c] text-white"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Confirm Check-In {mergedRoomNumbers.length > 1 ? `(${mergedRoomNumbers.length} Rooms)` : ""}
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>
      </DialogContent>
    </Dialog>
  );
}