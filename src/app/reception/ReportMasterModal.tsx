"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Printer,
  Search,
  Calendar,
  DollarSign,
  Users,
  BedDouble,
  Receipt,
} from "lucide-react";

/* ==================================================== */
/* CONFIG                                              */
/* ==================================================== */
// false => stored amount (finalAmount) is the taxable value, GST is added on top.
// true  => stored amount already includes GST (GST is backed out of it).
const TAX_INCLUSIVE = false;
// Used only when a record has no explicit gstRate: per-night tariff above this => 18%, else 5%.
const GST_SLAB_LIMIT = 7500;
const MAX_OCCUPANCY_DAYS = 3660;

interface ReportMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
  hotelName?: string;
  hotelAddress?: string;
  hotelGstin?: string;
}

/* ==================================================== */
/* TYPES                                               */
/* ==================================================== */
type TabId = "checkin" | "booking" | "expense" | "occupancy" | "gst";
type Preset = "today" | "month" | "year" | "all" | "custom";
type GroupBy = "day" | "month" | "year";

interface TabFilter {
  preset: Preset;
  from: string; // YYYY-MM-DD or ""
  to: string;
  groupBy: GroupBy;
}

interface Column {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
}
type Row = Record<string, React.ReactNode>;
interface Section {
  title: string;
  columns: Column[];
  rows: Row[];
  footer?: Row;
  empty: string;
}
interface Metric {
  label: string;
  value: React.ReactNode;
  tone?: "green" | "red" | "amber" | "plain";
}
interface ReportModel {
  title: string;
  sections: Section[];
  metrics: Metric[];
  orientation: "portrait" | "landscape";
}

interface Stay {
  id: string;
  name: string;
  mobile: string;
  room: string;
  checkIn: Date | null;
  checkOut: Date | null;
  checkedOut: boolean;
  via: string;
  amount: number;
  gstRate: number | null;
  gstin: string;
  nights: number;
}

interface Booking {
  id: string;
  guest: string;
  phone: string;
  room: string;
  start: Date | null;
  end: Date | null;
  total: number;
  advance: number;
  status: string;
}

interface Expense {
  id: string;
  date: Date | null;
  category: string;
  amount: number;
  notes: string;
}

/* ==================================================== */
/* DATE / FORMAT HELPERS                               */
/* ==================================================== */
const DAY = 86400000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const fmtDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const fmtDateTime = (d: Date) =>
  d.getHours() || d.getMinutes() ? `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}` : fmtDate(d);
const fmtINR = (n: number, dec = 0) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const nightsBetween = (a: Date, b: Date) =>
  Math.max(1, Math.round((dayStart(b).getTime() - dayStart(a).getTime()) / DAY));

function parseDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  const s = String(v).trim();
  let m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})(?:[,\sT]+(\d{1,2}):(\d{2}))?/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0));
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}):(\d{2}))?/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0));
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function inRange(d: Date | null, from: string, to: string) {
  if (!from && !to) return true;
  if (!d) return false;
  const iso = toISO(d);
  return (!from || iso >= from) && (!to || iso <= to);
}

function presetRange(p: Preset, now: Date): { from: string; to: string } {
  const y = now.getFullYear();
  const m = now.getMonth();
  if (p === "today") return { from: toISO(now), to: toISO(now) };
  if (p === "month") return { from: toISO(new Date(y, m, 1)), to: toISO(new Date(y, m + 1, 0)) };
  if (p === "year") return { from: `${y}-01-01`, to: `${y}-12-31` };
  return { from: "", to: "" };
}

function defaultFilters(): Record<TabId, TabFilter> {
  const now = new Date();
  const mk = (preset: Preset, groupBy: GroupBy): TabFilter => ({
    preset,
    groupBy,
    ...presetRange(preset, now),
  });
  return {
    checkin: mk("today", "day"),
    booking: mk("all", "month"),
    expense: mk("month", "month"),
    occupancy: mk("year", "month"),
    gst: mk("month", "month"),
  };
}

function periodLabel(f: TabFilter, now: Date) {
  if (!f.from && !f.to) return "All Time";
  const a = f.from ? fmtDate(parseDate(f.from)!) : "Beginning";
  const b = f.to ? fmtDate(parseDate(f.to)!) : "Onwards";
  if (f.from && f.from === f.to) return f.from === toISO(now) ? `${a} (Today)` : a;
  return `${a} to ${b}`;
}

const bucketKey = (d: Date, g: GroupBy) =>
  g === "day" ? toISO(d) : g === "month" ? toISO(d).slice(0, 7) : String(d.getFullYear());
function bucketLabel(key: string, g: GroupBy) {
  if (g === "day") return fmtDate(parseDate(key)!);
  if (g === "month") return `${MONTHS[+key.slice(5, 7) - 1]} ${key.slice(0, 4)}`;
  return key;
}

function readList(key: string): any[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* ==================================================== */
/* DOMAIN HELPERS                                      */
/* ==================================================== */
const OTAS: [string, RegExp][] = [
  ["MakeMyTrip", /makemytrip|\bmmt\b/],
  ["Agoda", /agoda/],
  ["Goibibo", /goibibo/],
  ["Booking.com", /booking\.com|booking com/],
  ["Expedia", /expedia/],
  ["Cleartrip", /cleartrip/],
  ["Yatra", /yatra/],
  ["Ixigo", /ixigo/],
  ["Airbnb", /airbnb/],
  ["OYO", /\boyo\b/],
];
function detectOta(via: string): string | null {
  const v = (via || "").toLowerCase();
  const hit = OTAS.find(([, re]) => re.test(v));
  return hit ? hit[0] : null;
}

function normalizeStays(entries: any[], now: Date): Stay[] {
  return entries.map((e, i) => {
    const checkIn = parseDate(e.checkInDateTime ?? e.checkInDate);
    const outRaw = parseDate(e.checkOutDateTime ?? e.checkOutDate);
    const rawRate = e.gstRate;
    let gstRate: number | null = null;
    if (rawRate !== undefined && rawRate !== null && rawRate !== "" && !isNaN(Number(rawRate))) {
      gstRate = Number(rawRate) > 1 ? Number(rawRate) / 100 : Number(rawRate);
    }
    return {
      id: String(e.id ?? e.regNo ?? `REG-${i + 1}`),
      name: e.fullName || "—",
      mobile: e.mobile || "",
      room: String(e.roomNo ?? ""),
      checkIn,
      checkOut: outRaw,
      checkedOut: !!outRaw && outRaw.getTime() <= now.getTime(),
      via: e.bookedVia || "",
      amount: Number(e.finalAmount) || Number(e.advancePayment) || 0,
      gstRate,
      gstin: e.guestGstin || "",
      nights: checkIn ? nightsBetween(checkIn, outRaw ?? now) : 0,
    };
  });
}

function taxOf(s: Stay) {
  let rate = s.gstRate;
  if (rate === null) rate = s.amount / Math.max(1, s.nights) > GST_SLAB_LIMIT ? 0.18 : 0.05;
  const taxable = TAX_INCLUSIVE ? s.amount / (1 + rate) : s.amount;
  const gst = TAX_INCLUSIVE ? s.amount - taxable : s.amount * rate;
  return { rate, taxable, gst, cgst: gst / 2, sgst: gst / 2, total: taxable + gst };
}

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

/* ==================================================== */
/* SMALL UI PIECES                                     */
/* ==================================================== */
function SourceBadge({ via }: { via: string }) {
  const ota = detectOta(via);
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
        ota
          ? "bg-amber-100 text-amber-800 border-amber-300"
          : "bg-emerald-100 text-emerald-800 border-emerald-300"
      }`}
    >
      {ota ? `${ota} (Online)` : via || "Walk-in"}
    </span>
  );
}

function Tag({ text, tone }: { text: string; tone: "red" | "green" | "gray" }) {
  const cls =
    tone === "red"
      ? "bg-red-100 text-red-700 border-red-300"
      : tone === "green"
      ? "bg-emerald-100 text-emerald-700 border-emerald-300"
      : "bg-slate-100 text-slate-700 border-slate-300";
  return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${cls}`}>{text}</span>;
}

const GuestCell = ({ name, sub }: { name: string; sub?: string }) => (
  <>
    <div className="font-bold">{name}</div>
    {sub ? <div className="font-mono text-[10px] opacity-75">{sub}</div> : null}
  </>
);

/* ==================================================== */
/* REPORT BUILDERS (pure functions)                    */
/* ==================================================== */
function buildCheckIn(
  stays: Stay[],
  f: TabFilter,
  q: string,
  now: Date
): ReportModel {
  const query = q.trim().toLowerCase();
  const history = new Map<string, number>();
  stays.forEach((s) => s.mobile && history.set(s.mobile, (history.get(s.mobile) || 0) + 1));

  const list = stays
    .filter((s) => {
      const dateHit =
        inRange(s.checkIn, f.from, f.to) || (s.checkedOut && inRange(s.checkOut, f.from, f.to));
      const textHit =
        !query || [s.name, s.mobile, s.room, s.id].some((v) => String(v).toLowerCase().includes(query));
      return dateHit && textHit;
    })
    .sort((a, b) => (a.checkIn?.getTime() ?? 0) - (b.checkIn?.getTime() ?? 0));

  const revenue = sum(list.map((s) => s.amount));
  const gst = sum(list.map((s) => taxOf(s).gst));
  const repeat = new Set(list.filter((s) => s.mobile && (history.get(s.mobile) || 0) > 1).map((s) => s.mobile)).size;
  const done = list.filter((s) => s.checkedOut && s.checkIn);
  const avgStay = done.length ? sum(done.map((s) => s.nights)) / done.length : null;

  const platform = new Map<string, number>();
  let online = 0;
  list.forEach((s) => {
    const ota = detectOta(s.via);
    if (ota) {
      online++;
      platform.set(ota, (platform.get(ota) || 0) + 1);
    }
  });
  const walkins = list.length - online;
  const platformText = platform.size
    ? Array.from(platform.entries()).map(([k, v]) => `${k}: ${v}`).join(", ")
    : "—";

  return {
    title: "Check-In & Check-Out Analytics Report",
    orientation: "landscape",
    sections: [
      {
        title: "Guest Register",
        empty: "No check-in or check-out records found for this period.",
        columns: [
          { key: "id", label: "Reg / ID" },
          { key: "guest", label: "Guest Name & Mobile" },
          { key: "room", label: "Room" },
          { key: "in", label: "Check-In" },
          { key: "out", label: "Check-Out" },
          { key: "nights", label: "Nights", align: "center" },
          { key: "src", label: "Booking Source" },
          { key: "rev", label: "Revenue", align: "right" },
        ],
        rows: list.map((s) => ({
          id: <span className="font-mono font-bold">{s.id}</span>,
          guest: <GuestCell name={s.name} sub={s.mobile} />,
          room: <span className="font-mono font-bold">Room {s.room}</span>,
          in: s.checkIn ? fmtDateTime(s.checkIn) : "—",
          out: s.checkedOut && s.checkOut ? fmtDateTime(s.checkOut) : <Tag text="In-house" tone="green" />,
          nights: s.checkIn ? s.nights : "—",
          src: <SourceBadge via={s.via} />,
          rev: <span className="font-mono font-bold">{fmtINR(s.amount)}</span>,
        })),
        footer: {
          id: `Total (${list.length})`,
          rev: <span className="font-mono font-bold">{fmtINR(revenue)}</span>,
        },
      },
    ],
    metrics: [
      { label: "Total Revenue", value: fmtINR(revenue), tone: "green" },
      { label: "Total Tax (GST)", value: fmtINR(gst) },
      { label: "Repeated Customers", value: repeat, tone: "green" },
      { label: "Average Stay", value: avgStay === null ? "N/A" : `${avgStay.toFixed(1)} Days` },
      { label: "Walk-ins", value: walkins },
      { label: "Online Bookings", value: online, tone: "amber" },
      { label: "Online Platform-wise", value: platformText, tone: "amber" },
      { label: "Total Guests", value: list.length },
    ],
  };
}

function buildBooking(bookings: Booking[], f: TabFilter, now: Date): ReportModel {
  const today = dayStart(now);
  const closed = ["cancelled", "canceled", "checked_out", "checked-out", "completed", "no_show", "no-show"];
  const list = bookings
    .filter(
      (b) =>
        b.start &&
        dayStart(b.start).getTime() >= today.getTime() &&
        !closed.includes(b.status.toLowerCase()) &&
        inRange(b.start, f.from, f.to)
    )
    .sort((a, b) => a.start!.getTime() - b.start!.getTime());

  const total = sum(list.map((b) => b.total));
  const adv = sum(list.map((b) => b.advance));
  const rooms = Array.from(new Set(list.map((b) => b.room).filter(Boolean)));

  const groups = new Map<string, { n: number; total: number; adv: number }>();
  list.forEach((b) => {
    const k = bucketKey(b.start!, f.groupBy);
    const g = groups.get(k) || { n: 0, total: 0, adv: 0 };
    g.n++;
    g.total += b.total;
    g.adv += b.advance;
    groups.set(k, g);
  });
  const periodRows = Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, g]) => ({
      p: <span className="font-bold">{bucketLabel(k, f.groupBy)}</span>,
      n: g.n,
      total: fmtINR(g.total),
      adv: fmtINR(g.adv),
      bal: fmtINR(g.total - g.adv),
    }));

  return {
    title: "Upcoming Bookings Statement",
    orientation: "landscape",
    sections: [
      {
        title: `${f.groupBy === "day" ? "Day" : f.groupBy === "month" ? "Month" : "Year"}-wise Summary`,
        empty: "No upcoming bookings found.",
        columns: [
          { key: "p", label: "Period" },
          { key: "n", label: "Bookings", align: "center" },
          { key: "total", label: "Projected Revenue", align: "right" },
          { key: "adv", label: "Advance Received", align: "right" },
          { key: "bal", label: "Balance Due", align: "right" },
        ],
        rows: periodRows,
      },
      {
        title: "Booking Details",
        empty: "No upcoming bookings found for this period.",
        columns: [
          { key: "id", label: "Booking ID" },
          { key: "guest", label: "Guest Name & Phone" },
          { key: "room", label: "Room Assigned" },
          { key: "in", label: "Check-In" },
          { key: "out", label: "Check-Out" },
          { key: "total", label: "Total", align: "right" },
          { key: "adv", label: "Advance", align: "right" },
          { key: "bal", label: "Balance", align: "right" },
        ],
        rows: list.map((b) => ({
          id: <span className="font-mono font-bold">{b.id}</span>,
          guest: <GuestCell name={b.guest} sub={b.phone} />,
          room: <span className="font-mono font-bold">{b.room ? `Room ${b.room}` : "Not assigned"}</span>,
          in: fmtDate(b.start!),
          out: b.end ? fmtDate(b.end) : "—",
          total: fmtINR(b.total),
          adv: fmtINR(b.advance),
          bal: <span className="font-mono font-bold">{fmtINR(b.total - b.advance)}</span>,
        })),
        footer: {
          id: `Total (${list.length})`,
          total: fmtINR(total),
          adv: fmtINR(adv),
          bal: fmtINR(total - adv),
        },
      },
    ],
    metrics: [
      { label: "Upcoming Bookings", value: list.length, tone: "green" },
      { label: "Projected Revenue", value: fmtINR(total) },
      { label: "Advance Received", value: fmtINR(adv), tone: "green" },
      { label: "Balance Due", value: fmtINR(total - adv), tone: "red" },
      { label: "Rooms Assigned", value: rooms.length ? rooms.join(", ") : "—" },
    ],
  };
}

function buildExpense(expenses: Expense[], f: TabFilter): ReportModel {
  const list = expenses
    .filter((e) => inRange(e.date, f.from, f.to))
    .sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));
  const total = sum(list.map((e) => e.amount));

  const cat = new Map<string, { n: number; amt: number }>();
  const mon = new Map<string, { n: number; amt: number }>();
  list.forEach((e) => {
    const c = cat.get(e.category) || { n: 0, amt: 0 };
    c.n++;
    c.amt += e.amount;
    cat.set(e.category, c);
    const mk = e.date ? bucketKey(e.date, "month") : "Unknown";
    const m = mon.get(mk) || { n: 0, amt: 0 };
    m.n++;
    m.amt += e.amount;
    mon.set(mk, m);
  });
  const catSorted = Array.from(cat.entries()).sort((a, b) => b[1].amt - a[1].amt);
  const monSorted = Array.from(mon.entries()).sort(([a], [b]) => a.localeCompare(b));
  const topMonth = monSorted.slice().sort((a, b) => b[1].amt - a[1].amt)[0];

  return {
    title: "Expense Management Report",
    orientation: "portrait",
    sections: [
      {
        title: "Category-wise Expenses",
        empty: "No expense records found.",
        columns: [
          { key: "c", label: "Category" },
          { key: "n", label: "Entries", align: "center" },
          { key: "a", label: "Amount", align: "right" },
          { key: "p", label: "Share", align: "right" },
        ],
        rows: catSorted.map(([k, v]) => ({
          c: <span className="font-bold">{k}</span>,
          n: v.n,
          a: fmtINR(v.amt),
          p: total ? `${((v.amt / total) * 100).toFixed(1)}%` : "0%",
        })),
        footer: { c: "Total", n: list.length, a: fmtINR(total), p: "100%" },
      },
      {
        title: "Month-wise Expenses",
        empty: "No expense records found.",
        columns: [
          { key: "m", label: "Month" },
          { key: "n", label: "Entries", align: "center" },
          { key: "a", label: "Amount", align: "right" },
        ],
        rows: monSorted.map(([k, v]) => ({
          m: <span className="font-bold">{k === "Unknown" ? k : bucketLabel(k, "month")}</span>,
          n: v.n,
          a: fmtINR(v.amt),
        })),
        footer: { m: "Total", n: list.length, a: fmtINR(total) },
      },
      {
        title: "Date-wise Expense Details",
        empty: "No expense records found for this period.",
        columns: [
          { key: "id", label: "Expense ID" },
          { key: "d", label: "Date" },
          { key: "c", label: "Category" },
          { key: "n", label: "Notes / Description" },
          { key: "a", label: "Amount", align: "right" },
        ],
        rows: list.map((e) => ({
          id: <span className="font-mono font-bold">{e.id}</span>,
          d: e.date ? fmtDate(e.date) : "—",
          c: e.category,
          n: e.notes || "—",
          a: <span className="font-mono font-bold">{fmtINR(e.amount)}</span>,
        })),
        footer: { id: `Total (${list.length})`, a: fmtINR(total) },
      },
    ],
    metrics: [
      { label: "Total Expenses", value: fmtINR(total), tone: "red" },
      { label: "Entries", value: list.length },
      { label: "Top Category", value: catSorted[0] ? `${catSorted[0][0]} (${fmtINR(catSorted[0][1].amt)})` : "—" },
      { label: "Highest-Spend Month", value: topMonth && topMonth[0] !== "Unknown" ? `${bucketLabel(topMonth[0], "month")} (${fmtINR(topMonth[1].amt)})` : "—" },
    ],
  };
}

function buildOccupancy(stays: Stay[], rooms: any[], f: TabFilter, now: Date): ReportModel {
  const todayS = dayStart(now);
  const meta = new Map<string, { type: string }>();
  rooms.forEach((r) => meta.set(String(r.number), { type: r.type || "Unknown" }));
  const totalRooms = rooms.length;
  const dated = stays.filter((s) => s.checkIn);

  const minIn = dated.reduce((m, s) => Math.min(m, dayStart(s.checkIn!).getTime()), todayS.getTime());
  let start = f.from ? dayStart(parseDate(f.from)!) : new Date(minIn);
  let end = f.to ? dayStart(parseDate(f.to)!) : todayS;
  if (end.getTime() > todayS.getTime()) end = todayS; // register only has actual stays
  if (end.getTime() - start.getTime() > (MAX_OCCUPANCY_DAYS - 1) * DAY) start = addDays(end, -(MAX_OCCUPANCY_DAYS - 1));
  const days = end >= start ? Math.round((end.getTime() - start.getTime()) / DAY) + 1 : 0;

  const dayOcc = new Map<string, number>();
  const roomAgg = new Map<string, { nights: number; stays: number; rev: number }>();
  const typeAgg = new Map<string, { nights: number; stays: number; rev: number }>();
  const bump = (m: Map<string, any>, k: string, nights: number, rev: number) => {
    const v = m.get(k) || { nights: 0, stays: 0, rev: 0 };
    v.nights += nights;
    v.stays += 1;
    v.rev += rev;
    m.set(k, v);
  };

  if (days > 0) {
    dated.forEach((s) => {
      const sIn = dayStart(s.checkIn!);
      let sOut = s.checkOut ? dayStart(s.checkOut) : addDays(todayS, 1);
      if (sOut <= sIn) sOut = addDays(sIn, 1);
      const totalN = Math.max(1, Math.round((sOut.getTime() - sIn.getTime()) / DAY));
      let counted = 0;
      for (let d = sIn > start ? sIn : start; d <= end && d < sOut; d = addDays(d, 1)) {
        const k = toISO(d);
        dayOcc.set(k, (dayOcc.get(k) || 0) + 1);
        counted++;
      }
      if (counted > 0) {
        const rev = (s.amount * counted) / totalN;
        bump(roomAgg, s.room || "—", counted, rev);
        bump(typeAgg, meta.get(s.room)?.type || "Unknown", counted, rev);
      }
    });
  }

  // Period buckets
  const buckets = new Map<string, { sold: number; avail: number }>();
  let totalSold = 0;
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    const sold = Math.min(dayOcc.get(toISO(d)) || 0, totalRooms);
    const k = bucketKey(d, f.groupBy);
    const b = buckets.get(k) || { sold: 0, avail: 0 };
    b.sold += sold;
    b.avail += totalRooms;
    buckets.set(k, b);
    totalSold += sold;
  }
  const totalAvail = days * totalRooms;
  const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : 0);

  const periods = Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({ k, ...v, occ: pct(v.sold, v.avail) }));
  const avgOcc = periods.length ? sum(periods.map((p) => p.occ)) / periods.length : 0;
  const season = (occ: number) => (occ >= avgOcc * 1.15 && occ > 0 ? "High" : occ <= avgOcc * 0.85 ? "Low" : "Normal");
  const peak = periods.slice().sort((a, b) => b.occ - a.occ)[0];
  const low = periods.slice().sort((a, b) => a.occ - b.occ)[0];

  const typeCount = new Map<string, number>();
  rooms.forEach((r) => typeCount.set(r.type || "Unknown", (typeCount.get(r.type || "Unknown") || 0) + 1));
  const typeRows = Array.from(typeAgg.entries()).sort((a, b) => b[1].nights - a[1].nights);
  const roomRows = Array.from(roomAgg.entries()).sort((a, b) => b[1].nights - a[1].nights);
  const nowOccupied = rooms.filter((r) => String(r.status).toLowerCase() === "occupied").length;

  return {
    title: "Room Occupancy & Demand Report",
    orientation: "landscape",
    sections: [
      {
        title: "Category-wise Demand",
        empty: "No stays found for this period.",
        columns: [
          { key: "rank", label: "Demand Rank", align: "center" },
          { key: "t", label: "Room Category" },
          { key: "r", label: "Rooms", align: "center" },
          { key: "s", label: "Stays", align: "center" },
          { key: "n", label: "Room-Nights Sold", align: "center" },
          { key: "o", label: "Occupancy", align: "right" },
          { key: "rev", label: "Revenue", align: "right" },
          { key: "adr", label: "Avg. Rate / Night", align: "right" },
        ],
        rows: typeRows.map(([t, v], i) => {
          const rc = typeCount.get(t) || 0;
          return {
            rank: `#${i + 1}`,
            t: <span className="font-bold">{t}</span>,
            r: rc,
            s: v.stays,
            n: v.nights,
            o: `${pct(v.nights, rc * days).toFixed(1)}%`,
            rev: fmtINR(v.rev),
            adr: fmtINR(v.nights ? v.rev / v.nights : 0),
          };
        }),
      },
      {
        title: "Room-wise Occupancy",
        empty: "No stays found for this period.",
        columns: [
          { key: "rank", label: "Rank", align: "center" },
          { key: "no", label: "Room No." },
          { key: "t", label: "Category" },
          { key: "s", label: "Stays", align: "center" },
          { key: "n", label: "Nights Occupied", align: "center" },
          { key: "o", label: "Occupancy", align: "right" },
          { key: "rev", label: "Revenue", align: "right" },
        ],
        rows: roomRows.map(([no, v], i) => ({
          rank: `#${i + 1}`,
          no: <span className="font-mono font-bold">Room {no}</span>,
          t: meta.get(no)?.type || "Unknown",
          s: v.stays,
          n: v.nights,
          o: `${pct(v.nights, days).toFixed(1)}%`,
          rev: fmtINR(v.rev),
        })),
      },
      {
        title: `${f.groupBy === "day" ? "Day" : f.groupBy === "month" ? "Month" : "Year"}-wise Season Analysis (Pricing Guide)`,
        empty: "No data for this period.",
        columns: [
          { key: "p", label: "Period" },
          { key: "sold", label: "Room-Nights Sold", align: "center" },
          { key: "avail", label: "Available", align: "center" },
          { key: "o", label: "Occupancy", align: "right" },
          { key: "season", label: "Season", align: "center" },
          { key: "hint", label: "Rate Suggestion" },
        ],
        rows: periods.map((p) => {
          const s = season(p.occ);
          return {
            p: <span className="font-bold">{bucketLabel(p.k, f.groupBy)}</span>,
            sold: p.sold,
            avail: p.avail,
            o: `${p.occ.toFixed(1)}%`,
            season: <Tag text={s === "High" ? "Peak" : s === "Low" ? "Low" : "Normal"} tone={s === "High" ? "red" : s === "Low" ? "gray" : "green"} />,
            hint: s === "High" ? "Increase rates (~10–20%)" : s === "Low" ? "Offer discounts / packages" : "Keep base rate",
          };
        }),
      },
    ],
    metrics: [
      { label: "Total Rooms", value: totalRooms, tone: "green" },
      { label: "Occupancy (Period)", value: `${pct(totalSold, totalAvail).toFixed(1)}%` },
      { label: "Occupied Right Now", value: `${nowOccupied} / ${totalRooms}` },
      { label: "Most Demanded Category", value: typeRows[0]?.[0] ?? "—", tone: "green" },
      { label: "Most Occupied Room", value: roomRows[0] ? `Room ${roomRows[0][0]}` : "—" },
      { label: "Peak Period", value: peak ? `${bucketLabel(peak.k, f.groupBy)} (${peak.occ.toFixed(0)}%)` : "—", tone: "red" },
      { label: "Lowest Period", value: low ? `${bucketLabel(low.k, f.groupBy)} (${low.occ.toFixed(0)}%)` : "—", tone: "amber" },
    ],
  };
}

function buildGst(stays: Stay[], f: TabFilter, q: string): ReportModel {
  const query = q.trim().toLowerCase();
  const list = stays
    .filter(
      (s) =>
        inRange(s.checkIn, f.from, f.to) &&
        (!query || [s.name, s.mobile, s.room, s.id, s.gstin].some((v) => String(v).toLowerCase().includes(query)))
    )
    .sort((a, b) => (a.checkIn?.getTime() ?? 0) - (b.checkIn?.getTime() ?? 0));

  const calc = list.map((s) => ({ s, t: taxOf(s) }));
  const taxable = sum(calc.map((c) => c.t.taxable));
  const cgst = sum(calc.map((c) => c.t.cgst));
  const sgst = sum(calc.map((c) => c.t.sgst));
  const gst = cgst + sgst;
  const b2b = list.filter((s) => s.gstin).length;

  const slabs = new Map<number, { n: number; taxable: number; cgst: number; sgst: number }>();
  calc.forEach(({ t }) => {
    const v = slabs.get(t.rate) || { n: 0, taxable: 0, cgst: 0, sgst: 0 };
    v.n++;
    v.taxable += t.taxable;
    v.cgst += t.cgst;
    v.sgst += t.sgst;
    slabs.set(t.rate, v);
  });

  return {
    title: "GST Summary Report",
    orientation: "landscape",
    sections: [
      {
        title: "Rate-wise Summary",
        empty: "No tax records found.",
        columns: [
          { key: "rate", label: "GST Rate" },
          { key: "n", label: "Invoices", align: "center" },
          { key: "tv", label: "Taxable Value", align: "right" },
          { key: "c", label: "CGST", align: "right" },
          { key: "s", label: "SGST", align: "right" },
          { key: "g", label: "Total GST", align: "right" },
        ],
        rows: Array.from(slabs.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([rate, v]) => ({
            rate: <span className="font-bold">{+(rate * 100).toFixed(2)}% ({+(rate * 50).toFixed(2)}% + {+(rate * 50).toFixed(2)}%)</span>,
            n: v.n,
            tv: fmtINR(v.taxable, 2),
            c: fmtINR(v.cgst, 2),
            s: fmtINR(v.sgst, 2),
            g: fmtINR(v.cgst + v.sgst, 2),
          })),
        footer: { rate: "Total", n: list.length, tv: fmtINR(taxable, 2), c: fmtINR(cgst, 2), s: fmtINR(sgst, 2), g: fmtINR(gst, 2) },
      },
      {
        title: "Invoice-wise Details",
        empty: "No tax records found for this period.",
        columns: [
          { key: "id", label: "Invoice / Reg" },
          { key: "d", label: "Date" },
          { key: "g", label: "Guest Name & GSTIN" },
          { key: "room", label: "Room" },
          { key: "tv", label: "Taxable Value", align: "right" },
          { key: "rate", label: "Rate", align: "center" },
          { key: "c", label: "CGST", align: "right" },
          { key: "s", label: "SGST", align: "right" },
          { key: "gst", label: "Total GST", align: "right" },
          { key: "inv", label: "Invoice Total", align: "right" },
        ],
        rows: calc.map(({ s, t }) => ({
          id: <span className="font-mono font-bold">{s.id}</span>,
          d: s.checkIn ? fmtDate(s.checkIn) : "—",
          g: <GuestCell name={s.name} sub={`GSTIN: ${s.gstin || "Unregistered"}`} />,
          room: <span className="font-mono font-bold">Room {s.room}</span>,
          tv: fmtINR(t.taxable, 2),
          rate: `${+(t.rate * 100).toFixed(2)}%`,
          c: fmtINR(t.cgst, 2),
          s: fmtINR(t.sgst, 2),
          gst: <span className="font-mono font-bold">{fmtINR(t.gst, 2)}</span>,
          inv: fmtINR(t.total, 2),
        })),
        footer: {
          id: `Total (${list.length})`,
          tv: fmtINR(taxable, 2),
          c: fmtINR(cgst, 2),
          s: fmtINR(sgst, 2),
          gst: fmtINR(gst, 2),
          inv: fmtINR(taxable + gst, 2),
        },
      },
    ],
    metrics: [
      { label: "Taxable Value", value: fmtINR(taxable, 2) },
      { label: "CGST Collected", value: fmtINR(cgst, 2) },
      { label: "SGST Collected", value: fmtINR(sgst, 2) },
      { label: "Total GST Collected", value: fmtINR(gst, 2), tone: "green" },
      { label: "B2B Invoices (GSTIN)", value: b2b },
      { label: "B2C Invoices", value: list.length - b2b },
    ],
  };
}

/* ==================================================== */
/* PRINT LAYER (only the active report is rendered)    */
/* ==================================================== */
function buildPrintCss(orientation: "portrait" | "landscape") {
  return `
#report-print-root{display:none}
@page{size:A4 ${orientation};margin:10mm}
@media print{
  html,body{height:auto!important;min-height:0!important;overflow:visible!important;margin:0!important;padding:0!important;background:#fff!important}
  body>*:not(#report-print-root){display:none!important}
  #report-print-root{display:block!important;position:static!important;color:#000;background:#fff;font-family:Arial,Helvetica,sans-serif;font-size:9pt;line-height:1.35}
  #report-print-root>:last-child{margin-bottom:0!important}
  #report-print-root .rp-head{border-bottom:1.5pt solid #000;padding-bottom:4pt;margin-bottom:8pt}
  #report-print-root .rp-hotel{font-size:13pt;font-weight:700}
  #report-print-root .rp-title{font-size:11pt;font-weight:700;margin-top:2pt}
  #report-print-root .rp-meta{font-size:8.5pt;color:#333}
  #report-print-root .rp-sec{margin-bottom:10pt}
  #report-print-root .rp-sec h3{font-size:10pt;margin:0 0 3pt;break-after:avoid;page-break-after:avoid}
  #report-print-root table{width:100%;border-collapse:collapse}
  #report-print-root th,#report-print-root td{border:.5pt solid #666;padding:3pt 4pt;vertical-align:top;text-align:left}
  #report-print-root th{background:#e8e8e8!important;font-weight:700;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  #report-print-root thead{display:table-header-group}
  #report-print-root tr{break-inside:avoid;page-break-inside:avoid}
  #report-print-root .r{text-align:right}
  #report-print-root .c{text-align:center}
  #report-print-root tr.rp-foot td{font-weight:700;background:#f2f2f2!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  #report-print-root .rp-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:4pt;break-inside:avoid;page-break-inside:avoid}
  #report-print-root .rp-metric{border:.5pt solid #666;padding:4pt 6pt}
  #report-print-root .rp-metric small{display:block;font-size:7.5pt;color:#333}
  #report-print-root .rp-metric b{font-size:10pt}
}
@page{@bottom-right{content:"Page " counter(page) " of " counter(pages);font-size:8pt}}
`;
}

const alignCls = (a?: string, print = false) =>
  a === "right" ? (print ? "r" : "text-right") : a === "center" ? (print ? "c" : "text-center") : "";

function PrintReport({
  report,
  period,
  now,
  hotelName,
  hotelAddress,
  hotelGstin,
}: {
  report: ReportModel;
  period: string;
  now: Date;
  hotelName: string;
  hotelAddress?: string;
  hotelGstin?: string;
}) {
  const sections = report.sections.filter((s) => s.rows.length > 0);
  return (
    <div id="report-print-root">
      <style>{buildPrintCss(report.orientation)}</style>
      <div className="rp-head">
        <div className="rp-hotel">{hotelName}</div>
        {(hotelAddress || hotelGstin) && (
          <div className="rp-meta">
            {hotelAddress}
            {hotelAddress && hotelGstin ? " | " : ""}
            {hotelGstin ? `GSTIN: ${hotelGstin}` : ""}
          </div>
        )}
        <div className="rp-title">{report.title}</div>
        <div className="rp-meta">
          Period: {period} | Generated: {fmtDateTime(now)} {pad(now.getHours())}:{pad(now.getMinutes())}
        </div>
      </div>

      {sections.map((sec, i) => (
        <div className="rp-sec" key={i}>
          <h3>{sec.title}</h3>
          <table>
            <thead>
              <tr>
                {sec.columns.map((c) => (
                  <th key={c.key} className={alignCls(c.align, true)}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sec.rows.map((r, ri) => (
                <tr key={ri}>
                  {sec.columns.map((c) => (
                    <td key={c.key} className={alignCls(c.align, true)}>{r[c.key]}</td>
                  ))}
                </tr>
              ))}
              {sec.footer && (
                <tr className="rp-foot">
                  {sec.columns.map((c) => (
                    <td key={c.key} className={alignCls(c.align, true)}>{sec.footer![c.key] ?? ""}</td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}

      <div className="rp-summary">
        {report.metrics.map((m, i) => (
          <div className="rp-metric" key={i}>
            <small>{m.label}</small>
            <b>{m.value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==================================================== */
/* MAIN COMPONENT                                      */
/* ==================================================== */
const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "checkin", label: "Check-In & Revenue", icon: Users },
  { id: "booking", label: "Booking Statements", icon: Calendar },
  { id: "expense", label: "Expense Management", icon: DollarSign },
  { id: "occupancy", label: "Room Occupancy & Demand", icon: BedDouble },
  { id: "gst", label: "GST Summary Report", icon: Receipt },
];

const PRESETS: { id: Preset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
  { id: "all", label: "All Time" },
  { id: "custom", label: "Custom" },
];

export function ReportMasterModal({
  isOpen,
  onClose,
  darkMode = false,
  hotelName = "Hotel",
  hotelAddress,
  hotelGstin,
}: ReportMasterModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("checkin");
  const [filters, setFilters] = useState<Record<TabId, TabFilter>>(() => defaultFilters());
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [raw, setRaw] = useState<{ reg: any[]; bk: any[]; rm: any[]; ex: any[] }>({
    reg: [],
    bk: [],
    rm: [],
    ex: [],
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    setNow(new Date());
    setFilters(defaultFilters());
    setSearchQuery("");
    setRaw({
      reg: readList("hotel_pms_eregister"),
      bk: readList("hotel_pms_bookings"),
      rm: readList("hotel_pms_rooms"),
      ex: readList("hotel_pms_expenses"),
    });
  }, [isOpen]);

  const stays = useMemo(() => normalizeStays(raw.reg, now), [raw.reg, now]);
  const bookings = useMemo<Booking[]>(
    () =>
      raw.bk.map((b, i) => ({
        id: String(b.id ?? `BK-${i + 1}`),
        guest: b.guestName || "—",
        phone: b.phone || "",
        room: String(b.roomNumber ?? ""),
        start: parseDate(b.startDate),
        end: parseDate(b.endDate),
        total: Number(b.totalAmount) || 0,
        advance: Number(b.advancePaid) || 0,
        status: String(b.status || ""),
      })),
    [raw.bk]
  );
  const expenses = useMemo<Expense[]>(
    () =>
      raw.ex.map((e, i) => ({
        id: e.id ? `EXP-${e.id}` : `EXP-${i + 1}`,
        date: parseDate(e.date),
        category: e.category || "Uncategorized",
        amount: Number(e.amount) || 0,
        notes: e.notes || "",
      })),
    [raw.ex]
  );

  const f = filters[activeTab];

  const report = useMemo<ReportModel>(() => {
    switch (activeTab) {
      case "checkin":
        return buildCheckIn(stays, f, searchQuery, now);
      case "booking":
        return buildBooking(bookings, f, now);
      case "expense":
        return buildExpense(expenses, f);
      case "occupancy":
        return buildOccupancy(stays, raw.rm, f, now);
      default:
        return buildGst(stays, f, searchQuery);
    }
  }, [activeTab, stays, bookings, expenses, raw.rm, f, searchQuery, now]);

  const hasData = report.sections.some((s) => s.rows.length > 0);
  const period = periodLabel(f, now);

  const patchFilter = (patch: Partial<TabFilter>) =>
    setFilters((p) => ({ ...p, [activeTab]: { ...p[activeTab], ...patch } }));
  const applyPreset = (p: Preset) =>
    p === "custom" ? patchFilter({ preset: "custom" }) : patchFilter({ preset: p, ...presetRange(p, now) });

  const monthValue =
    f.from && f.to && f.from.endsWith("-01") && f.from.slice(0, 7) === f.to.slice(0, 7) ? f.from.slice(0, 7) : "";
  const yearValue =
    f.from.endsWith("-01-01") && f.to.endsWith("-12-31") && f.from.slice(0, 4) === f.to.slice(0, 4)
      ? f.from.slice(0, 4)
      : "";
  const thisYear = now.getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => String(thisYear - 6 + i));

  const handlePrint = () => {
    if (hasData) window.print();
  };

  /* ---------- styling tokens ---------- */
  const panel = darkMode ? "bg-[#1f1d1a] border-[#403d38]" : "bg-white border-[#afd9c3]/60";
  const toneCls = (t?: Metric["tone"]) =>
    t === "green"
      ? "text-[#2b6a48]"
      : t === "red"
      ? "text-red-600"
      : t === "amber"
      ? "text-[#94772d]"
      : "";
  const selectCls = `h-8 text-xs rounded-xl border px-2 ${
    darkMode ? "bg-[#2d2a26] border-[#403d38]" : "bg-white border-[#afd9c3]"
  }`;
  const showSearch = activeTab === "checkin" || activeTab === "gst";
  const showGroup = activeTab === "booking" || activeTab === "occupancy";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          showCloseButton={false}
          className={`w-[94vw] max-w-6xl max-h-[92vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-3xl border p-6 shadow-2xl transition-colors ${
            darkMode
              ? "bg-[#2d2a26] border-[#403d38] text-[#e5e2db]"
              : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
          }`}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Report Master & Business Analytics</DialogTitle>
          </DialogHeader>

          {/* HEADER */}
          <div className="flex items-center justify-between pb-4 border-b border-[#afd9c3]/40">
            <div className="flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-[#2b6a48]" />
              <div>
                <h2 className="text-xl font-bold tracking-tight">Report Master & Business Intelligence</h2>
                <p className="text-xs opacity-60">
                  Check-in analytics, booking statements, expenses, occupancy and GST reports.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handlePrint}
                disabled={!hasData}
                title={hasData ? "Print the selected report (A4)" : "No data to print"}
                variant="outline"
                className="h-8 text-xs rounded-xl border-[#afd9c3] flex items-center gap-1.5 font-bold"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Export
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-8 text-xs rounded-xl border-[#afd9c3]"
              >
                Close
              </Button>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-2 pt-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
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

          <div className="space-y-4 pt-3 text-xs">
            {/* FILTER BAR */}
            <div className={`flex flex-wrap items-end gap-3 p-3 rounded-2xl border ${panel}`}>
              <div className="flex gap-1 flex-wrap">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    className={`px-3 h-8 rounded-xl text-[11px] font-bold border transition-colors ${
                      f.preset === p.id
                        ? "bg-[#2b6a48] text-white border-[#2b6a48]"
                        : darkMode
                        ? "border-[#403d38] hover:bg-[#403d38]"
                        : "border-[#afd9c3] hover:bg-[#d6fce2]/40"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div>
                <span className="block text-[10px] font-semibold opacity-70 mb-0.5">From Date</span>
                <Input
                  type="date"
                  value={f.from}
                  onChange={(e) => patchFilter({ from: e.target.value, preset: "custom" })}
                  className="h-8 text-xs rounded-xl"
                />
              </div>
              <div>
                <span className="block text-[10px] font-semibold opacity-70 mb-0.5">To Date</span>
                <Input
                  type="date"
                  value={f.to}
                  onChange={(e) => patchFilter({ to: e.target.value, preset: "custom" })}
                  className="h-8 text-xs rounded-xl"
                />
              </div>
              <div>
                <span className="block text-[10px] font-semibold opacity-70 mb-0.5">Month</span>
                <Input
                  type="month"
                  value={monthValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    const [y, m] = v.split("-").map(Number);
                    patchFilter({ preset: "custom", from: `${y}-${pad(m)}-01`, to: toISO(new Date(y, m, 0)) });
                  }}
                  className="h-8 text-xs rounded-xl"
                />
              </div>
              <div>
                <span className="block text-[10px] font-semibold opacity-70 mb-0.5">Year</span>
                <select
                  value={yearValue}
                  onChange={(e) =>
                    e.target.value &&
                    patchFilter({ preset: "custom", from: `${e.target.value}-01-01`, to: `${e.target.value}-12-31` })
                  }
                  className={selectCls}
                >
                  <option value="">Select</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              {showGroup && (
                <div>
                  <span className="block text-[10px] font-semibold opacity-70 mb-0.5">Group By</span>
                  <select
                    value={f.groupBy}
                    onChange={(e) => patchFilter({ groupBy: e.target.value as GroupBy })}
                    className={selectCls}
                  >
                    <option value="day">Day</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>
              )}
              {showSearch && (
                <div className="w-60">
                  <span className="block text-[10px] font-semibold opacity-70 mb-0.5">Quick Search</span>
                  <div className={`flex items-center gap-1.5 px-2.5 h-8 rounded-xl border ${darkMode ? "border-[#403d38] bg-[#2d2a26]" : "border-[#afd9c3]/70 bg-white"}`}>
                    <Search className="w-3.5 h-3.5 opacity-50" />
                    <input
                      type="text"
                      placeholder="Guest, mobile, room or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-xs w-full focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] opacity-70">
              <b>{report.title}</b> — Period: {period}
            </div>

            {/* SECTIONS */}
            {report.sections.map((sec, si) => (
              <div key={`${activeTab}-${si}`} className="space-y-1.5">
                <h3 className="font-bold text-sm">{sec.title}</h3>
                <div className="border rounded-2xl overflow-x-auto border-[#afd9c3]/50">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#2b6a48] text-white text-[11px]">
                        {sec.columns.map((c) => (
                          <th key={c.key} className={`p-3 ${alignCls(c.align)}`}>{c.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#afd9c3]/30">
                      {sec.rows.length === 0 ? (
                        <tr>
                          <td colSpan={sec.columns.length} className="p-8 text-center opacity-50">
                            {sec.empty}
                          </td>
                        </tr>
                      ) : (
                        sec.rows.map((r, ri) => (
                          <tr key={ri} className={darkMode ? "hover:bg-[#1f1d1a]/50" : "hover:bg-slate-50"}>
                            {sec.columns.map((c) => (
                              <td key={c.key} className={`p-3 ${alignCls(c.align)}`}>{r[c.key]}</td>
                            ))}
                          </tr>
                        ))
                      )}
                      {sec.rows.length > 0 && sec.footer && (
                        <tr className={`font-bold ${darkMode ? "bg-[#1f1d1a]" : "bg-[#d6fce2]/30"}`}>
                          {sec.columns.map((c) => (
                            <td key={c.key} className={`p-3 ${alignCls(c.align)}`}>{sec.footer![c.key] ?? ""}</td>
                          ))}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* SUMMARY (bottom) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {report.metrics.map((m, i) => (
                <div key={i} className={`p-3 rounded-2xl border text-center ${panel}`}>
                  <div className="text-[10px] opacity-70 font-bold uppercase">{m.label}</div>
                  <div className={`text-sm font-black mt-0.5 break-words ${toneCls(m.tone)}`}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print-only copy of the ACTIVE report. Everything else is display:none while printing,
          so no blank / duplicate sheets. Pages are created automatically by content length. */}
      {mounted && isOpen && hasData &&
        createPortal(
          <PrintReport
            report={report}
            period={period}
            now={now}
            hotelName={hotelName}
            hotelAddress={hotelAddress}
            hotelGstin={hotelGstin}
          />,
          document.body
        )}
    </>
  );
}