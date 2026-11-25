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
import {
  Search,
  Plus,
  Trash2,
  Pin,
  CheckSquare,
  Square,
  AlertCircle,
  BedDouble,
  Copy,
  Check,
  ClipboardList,
} from "lucide-react";

export type NoteCategory = "all" | "guest_request" | "shift_handover" | "maintenance";

export interface FrontDeskNote {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  isUrgent: boolean;
  roomNo?: string;
  staffName: string;
  updatedAt: string;
  isPinned: boolean;
  todos: { id: string; text: string; completed: boolean }[];
}

interface NotepadModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

const initialNotes: FrontDeskNote[] = [
  {
    id: "note-1",
    title: "VIP Check-In: Welcome Amenities",
    content: "Mr. Singhania arriving at 6:00 PM. Prepare complimentary welcome drinks and deliver extra bath towels to the room.",
    category: "guest_request",
    isUrgent: true,
    roomNo: "107",
    staffName: "Duty Desk",
    updatedAt: "Today, 4:20 PM",
    isPinned: true,
    todos: [
      { id: "t1", text: "Place extra fresh linen & towels", completed: true },
      { id: "t2", text: "Arrange welcome drinks on arrival", completed: false },
    ],
  },
  {
    id: "note-2",
    title: "Night Shift: Morning Wake-Up Call",
    content: "Guest requested an automated intercom wake-up call at 05:30 AM sharp. Total advance collected: ₹14,500.",
    category: "shift_handover",
    isUrgent: true,
    roomNo: "102",
    staffName: "Evening Staff",
    updatedAt: "Today, 2:15 PM",
    isPinned: true,
    todos: [
      { id: "t3", text: "Schedule 05:30 AM morning wake-up call", completed: false },
      { id: "t4", text: "Handover cash drawer to night audit", completed: true },
    ],
  },
  {
    id: "note-3",
    title: "Air Conditioner Inspection",
    content: "Cooling complaint logged. Maintenance technician scheduled to inspect unit at 7:00 PM.",
    category: "maintenance",
    isUrgent: false,
    roomNo: "103",
    staffName: "Staff Desk",
    updatedAt: "Yesterday, 6:00 PM",
    isPinned: false,
    todos: [
      { id: "t5", text: "Verify cooling after technician visit", completed: false },
    ],
  },
];

export function NotepadModal({
  isOpen,
  onClose,
  darkMode = false,
}: NotepadModalProps) {
  const [notes, setNotes] = useState<FrontDeskNote[]>(initialNotes);
  const [activeNoteId, setActiveNoteId] = useState<string>(initialNotes[0].id);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<NoteCategory>("all");
  const [copied, setCopied] = useState(false);
  const [newTodoInput, setNewTodoInput] = useState("");

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const filteredNotes = notes.filter((n) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      n.title.toLowerCase().includes(term) ||
      n.content.toLowerCase().includes(term) ||
      (n.roomNo && n.roomNo.includes(term));
    const matchesCategory = activeCategory === "all" || n.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNote = () => {
    const newNote: FrontDeskNote = {
      id: `note-${Date.now()}`,
      title: "New Front Desk Note",
      content: "",
      category: activeCategory === "all" ? "guest_request" : activeCategory,
      isUrgent: false,
      roomNo: "",
      staffName: "Duty Staff",
      updatedAt: "Just now",
      isPinned: false,
      todos: [],
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleUpdateNote = (field: keyof FrontDeskNote, value: any) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNoteId
          ? { ...n, [field]: value, updatedAt: "Just now" }
          : n
      )
    );
  };

  const handleDeleteNote = (id: string) => {
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (remaining.length > 0) {
      setActiveNoteId(remaining[0].id);
    }
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleToggleTodo = (todoId: string) => {
    if (!activeNote) return;
    const updatedTodos = activeNote.todos.map((t) =>
      t.id === todoId ? { ...t, completed: !t.completed } : t
    );
    handleUpdateNote("todos", updatedTodos);
  };

  const handleAddTodo = () => {
    if (!newTodoInput.trim() || !activeNote) return;
    const newTodo = {
      id: `todo-${Date.now()}`,
      text: newTodoInput.trim(),
      completed: false,
    };
    handleUpdateNote("todos", [...activeNote.todos, newTodo]);
    setNewTodoInput("");
  };

  const handleCopyNote = () => {
    if (!activeNote) return;
    const taskList = activeNote.todos.map((t) => `${t.completed ? "[✓]" : "[ ]"} ${t.text}`).join("\n");
    const formatted = `[${activeNote.title}]\nRoom: ${activeNote.roomNo || "General Front Desk"}\n\n${activeNote.content}\n\nTasks:\n${taskList}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`w-[96vw] max-w-5xl h-[86vh] rounded-3xl border p-0 shadow-2xl overflow-hidden flex flex-col transition-colors ${
          darkMode
            ? "bg-[#1f1d1a] border-[#403d38] text-[#e5e2db]"
            : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Front Desk Operations Notepad</DialogTitle>
        </DialogHeader>

        {/* TOP BAR */}
        <div
          className={`flex items-center justify-between px-6 py-3.5 border-b select-none transition-colors ${
            darkMode
              ? "bg-[#2d2a26] border-[#403d38]"
              : "bg-[#e5e2db]/40 border-[#afd9c3]/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold shadow-xs border ${
                darkMode
                  ? "bg-[#403d38] border-[#afd9c3]/40 text-[#d6fce2]"
                  : "bg-[#d6fce2] border-[#afd9c3] text-[#2b6a48]"
              }`}
            >
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-extrabold text-sm sm:text-base tracking-tight ${darkMode ? "text-[#e5e2db]" : "text-[#403d38]"}`}>
                  Front Desk Smart Log & Duty Notepad
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    darkMode
                      ? "bg-[#d6fce2]/15 text-[#d6fce2] border-[#afd9c3]/30"
                      : "bg-[#d6fce2] text-[#2b6a48] border-[#afd9c3]"
                  }`}
                >
                  Internal Desk Sync
                </span>
              </div>
              <p className={`text-[11px] ${darkMode ? "text-[#e5e2db]/60" : "text-[#403d38]/70"}`}>
                Log guest instructions, shift handovers, and operational checklists.
              </p>
            </div>
          </div>

          <Button
            onClick={handleCreateNote}
            className={`rounded-2xl px-4 py-2 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all ${
              darkMode
                ? "bg-[#d6fce2] text-[#1f1d1a] hover:bg-[#afd9c3]"
                : "bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db]"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </Button>
        </div>

        {/* 2-PANEL WORKSPACE */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT LIST PANEL */}
          <aside
            className={`w-72 sm:w-84 flex-shrink-0 flex flex-col border-r select-none overflow-hidden transition-colors ${
              darkMode
                ? "bg-[#25221e] border-[#403d38]"
                : "bg-[#e5e2db]/25 border-[#afd9c3]/50"
            }`}
          >
            {/* Search Box */}
            <div className={`p-3 border-b ${darkMode ? "border-[#403d38]" : "border-[#afd9c3]/30"}`}>
              <div className="relative">
                <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${darkMode ? "text-[#e5e2db]/40" : "text-slate-400"}`} />
                <Input
                  placeholder="Search by title, note, or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`h-8 pl-8 text-xs rounded-xl border focus-visible:ring-[#afd9c3] ${
                    darkMode
                      ? "bg-[#1f1d1a] border-[#403d38] text-[#e5e2db] placeholder:text-[#e5e2db]/40"
                      : "bg-white border-[#afd9c3]/60 text-[#403d38]"
                  }`}
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {[
                  { id: "all", label: "All Notes" },
                  { id: "guest_request", label: "Guest Request" },
                  { id: "shift_handover", label: "Shift Log" },
                  { id: "maintenance", label: "Maintenance" },
                ].map((c) => {
                  const isCurrent = activeCategory === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveCategory(c.id as any)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-xl whitespace-nowrap transition-all border ${
                        isCurrent
                          ? darkMode
                            ? "bg-[#403d38] text-[#d6fce2] border-[#afd9c3]/50"
                            : "bg-[#403d38] text-[#e5e2db] border-[#403d38]"
                          : darkMode
                          ? "border-transparent text-[#e5e2db]/60 hover:text-[#e5e2db]"
                          : "border-transparent text-[#403d38]/70 hover:text-[#403d38]"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note Cards List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {filteredNotes.length === 0 ? (
                <div className={`text-center py-12 text-xs font-semibold ${darkMode ? "text-[#e5e2db]/40" : "text-slate-400"}`}>
                  No notes found
                </div>
              ) : (
                filteredNotes.map((note) => {
                  const isSelected = note.id === activeNote?.id;
                  const completedCount = note.todos.filter((t) => t.completed).length;

                  return (
                    <div
                      key={note.id}
                      onClick={() => setActiveNoteId(note.id)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all border text-left ${
                        isSelected
                          ? darkMode
                            ? "bg-[#2d2a26] border-[#afd9c3] shadow-md ring-1 ring-[#afd9c3]/40"
                            : "bg-white border-[#afd9c3] shadow-sm ring-1 ring-[#afd9c3]/70"
                          : darkMode
                          ? "bg-[#1f1d1a]/70 border-[#403d38]/50 hover:bg-[#2d2a26]/60 text-[#e5e2db]"
                          : "bg-white/60 border-transparent hover:bg-white text-[#403d38]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5">
                          {note.roomNo ? (
                            <span
                              className={`font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${
                                darkMode
                                  ? "bg-[#403d38] text-[#d6fce2] border-[#afd9c3]/40"
                                  : "bg-[#d6fce2] text-[#403d38] border border-[#afd9c3]"
                              }`}
                            >
                              Room {note.roomNo}
                            </span>
                          ) : (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                darkMode
                                  ? "bg-[#403d38]/80 text-[#e5e2db]/70"
                                  : "bg-slate-100 text-[#403d38]/70"
                              }`}
                            >
                              Desk Log
                            </span>
                          )}

                          {note.isUrgent && (
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 border ${
                                darkMode
                                  ? "bg-[#df918d]/20 text-[#df918d] border-[#df918d]/40"
                                  : "bg-red-100 text-red-600 border-red-200"
                              }`}
                            >
                              <AlertCircle className="w-2.5 h-2.5" /> Urgent
                            </span>
                          )}
                        </div>

                        {note.isPinned && (
                          <Pin className="w-3.5 h-3.5 text-[#e3cf92] fill-[#e3cf92]" />
                        )}
                      </div>

                      <div className={`font-bold text-xs truncate mb-0.5 ${darkMode ? "text-[#e5e2db]" : "text-[#403d38]"}`}>
                        {note.title || "Untitled Instruction"}
                      </div>

                      <p className={`text-[11px] line-clamp-1 leading-relaxed mb-1.5 ${darkMode ? "text-[#e5e2db]/70" : "text-[#403d38]/70"}`}>
                        {note.content || "No details provided..."}
                      </p>

                      <div className={`flex items-center justify-between text-[10px] font-medium pt-1.5 border-t ${darkMode ? "border-[#403d38] text-[#e5e2db]/50" : "border-slate-100 text-[#403d38]/60"}`}>
                        <span>{note.staffName}</span>
                        <div className="flex items-center gap-2">
                          {note.todos.length > 0 && (
                            <span className={`font-mono font-bold ${darkMode ? "text-[#d6fce2]" : "text-emerald-600"}`}>
                              ✓ {completedCount}/{note.todos.length}
                            </span>
                          )}
                          <span>{note.updatedAt}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* RIGHT EDITING WORKSPACE */}
          <main className="flex-1 flex flex-col p-6 sm:p-7 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {activeNote ? (
              <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col space-y-4">
                
                {/* 1. ROOM & CATEGORY BAR */}
                <div
                  className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-xs transition-colors ${
                    darkMode
                      ? "bg-[#25221e] border-[#403d38]"
                      : "bg-white border-[#afd9c3]/50"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    
                    {/* Room Input */}
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${
                        darkMode
                          ? "bg-[#1f1d1a] border-[#403d38] text-[#e5e2db]"
                          : "bg-slate-50 border-[#afd9c3]/60 text-[#403d38]"
                      }`}
                    >
                      <BedDouble className={`w-3.5 h-3.5 ${darkMode ? "text-[#afd9c3]" : "text-[#2b6a48]"}`} />
                      <span className="font-semibold text-[11px]">Room:</span>
                      <input
                        type="text"
                        placeholder="101"
                        value={activeNote.roomNo || ""}
                        onChange={(e) => handleUpdateNote("roomNo", e.target.value)}
                        className={`w-14 bg-transparent font-mono font-bold text-xs outline-none ${
                          darkMode ? "text-[#e5e2db] placeholder:text-[#e5e2db]/30" : "text-[#403d38]"
                        }`}
                      />
                    </div>

                    {/* Category Selector Buttons */}
                    <div className="flex items-center gap-1">
                      {[
                        { id: "guest_request", label: "Guest Request" },
                        { id: "shift_handover", label: "Shift Log" },
                        { id: "maintenance", label: "Maintenance" },
                      ].map((cat) => {
                        const isSelected = activeNote.category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleUpdateNote("category", cat.id)}
                            className={`h-7 px-2.5 text-[11px] font-bold rounded-lg border transition-all ${
                              isSelected
                                ? darkMode
                                  ? "bg-[#d6fce2] text-[#1f1d1a] border-[#afd9c3]"
                                  : "bg-[#403d38] text-[#e5e2db] border-[#403d38]"
                                : darkMode
                                ? "border-[#403d38] bg-[#1f1d1a] text-[#e5e2db]/60 hover:text-[#e5e2db]"
                                : "border-slate-200 text-[#403d38]/70 hover:opacity-100"
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Priority Toggle */}
                    <button
                      type="button"
                      onClick={() => handleUpdateNote("isUrgent", !activeNote.isUrgent)}
                      className={`h-7 px-2.5 text-[11px] font-bold rounded-lg border transition-all ${
                        activeNote.isUrgent
                          ? darkMode
                            ? "bg-[#df918d]/20 text-[#df918d] border-[#df918d]/60"
                            : "bg-red-500 text-white border-red-500"
                          : darkMode
                          ? "border-[#403d38] bg-[#1f1d1a] text-[#e5e2db]/60"
                          : "border-slate-200 text-[#403d38]/70"
                      }`}
                    >
                      {activeNote.isUrgent ? "🚨 Urgent" : "Normal"}
                    </button>
                  </div>

                  {/* Top Actions: Pin, Copy & Delete */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTogglePin(activeNote.id)}
                      className={`h-7 px-2 text-xs rounded-lg ${
                        activeNote.isPinned
                          ? "text-[#e3cf92] bg-[#e3cf92]/20 hover:bg-[#e3cf92]/30"
                          : darkMode
                          ? "text-[#e5e2db]/60 hover:bg-[#403d38]"
                          : "text-[#403d38]/60 hover:bg-slate-100"
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyNote}
                      className={`h-7 px-2 text-xs rounded-lg ${
                        darkMode
                          ? "text-[#e5e2db]/70 hover:bg-[#403d38]"
                          : "text-[#403d38]/70 hover:bg-slate-100"
                      }`}
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteNote(activeNote.id)}
                      className={`h-7 w-7 rounded-lg ${
                        darkMode
                          ? "text-[#df918d] hover:bg-[#df918d]/20"
                          : "text-[#df918d] hover:bg-[#df918d]/15"
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* 2. TITLE & NOTE BODY */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 shadow-xs transition-colors ${
                    darkMode
                      ? "bg-[#25221e] border-[#403d38]"
                      : "bg-white border-[#afd9c3]/50"
                  }`}
                >
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => handleUpdateNote("title", e.target.value)}
                    placeholder="Topic / Title..."
                    className={`w-full text-base sm:text-lg font-bold bg-transparent border-b pb-1.5 outline-none tracking-tight ${
                      darkMode
                        ? "border-[#403d38] text-[#e5e2db] placeholder:text-[#e5e2db]/30"
                        : "border-slate-100 text-[#403d38] placeholder:text-slate-400"
                    }`}
                  />

                  <textarea
                    value={activeNote.content}
                    onChange={(e) => handleUpdateNote("content", e.target.value)}
                    placeholder="Write operational instructions or duty remarks here..."
                    rows={4}
                    className={`w-full bg-transparent border-none outline-none resize-none text-xs sm:text-sm leading-relaxed ${
                      darkMode
                        ? "text-[#e5e2db] placeholder:text-[#e5e2db]/30"
                        : "text-[#403d38] placeholder:text-slate-400"
                    }`}
                  />
                </div>

                {/* 3. CHECKLIST (TO-DO TASKS) */}
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 shadow-xs transition-colors ${
                    darkMode
                      ? "bg-[#25221e] border-[#403d38]"
                      : "bg-white border-[#afd9c3]/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-xs flex items-center gap-1.5 ${darkMode ? "text-[#e5e2db]" : "text-[#403d38]"}`}>
                      <CheckSquare className="w-4 h-4 text-emerald-500" /> Actionable Task Checklist
                    </span>
                    <span className={`text-[11px] font-mono font-bold ${darkMode ? "text-[#d6fce2]" : "text-emerald-600"}`}>
                      {activeNote.todos.filter((t) => t.completed).length} / {activeNote.todos.length} Done
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-1">
                    {activeNote.todos.length === 0 ? (
                      <p className={`text-[11px] italic py-1 ${darkMode ? "text-[#e5e2db]/40" : "text-slate-400"}`}>
                        No tasks added to this note yet.
                      </p>
                    ) : (
                      activeNote.todos.map((todo) => (
                        <div
                          key={todo.id}
                          onClick={() => handleToggleTodo(todo.id)}
                          className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                            todo.completed
                              ? darkMode
                                ? "bg-[#d6fce2]/10 border-transparent line-through text-[#e5e2db]/40"
                                : "bg-[#d6fce2]/20 border-transparent line-through text-slate-400"
                              : darkMode
                              ? "bg-[#1f1d1a] border-[#403d38] text-[#e5e2db] hover:border-[#afd9c3]/50"
                              : "bg-slate-50 border-slate-200/70 text-[#403d38] hover:border-[#afd9c3]"
                          }`}
                        >
                          {todo.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Square className={`w-4 h-4 shrink-0 ${darkMode ? "text-[#e5e2db]/40" : "text-slate-400"}`} />
                          )}
                          <span className="text-xs font-medium">{todo.text}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Task Input */}
                  <div className={`flex items-center gap-2 pt-2 border-t ${darkMode ? "border-[#403d38]" : "border-slate-100"}`}>
                    <Input
                      placeholder="Add an actionable step (e.g. Deliver extra towels)..."
                      value={newTodoInput}
                      onChange={(e) => setNewTodoInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
                      className={`h-8 text-xs rounded-xl border focus-visible:ring-[#afd9c3] ${
                        darkMode
                          ? "bg-[#1f1d1a] border-[#403d38] text-[#e5e2db] placeholder:text-[#e5e2db]/40"
                          : "bg-slate-50 border-[#afd9c3]/60 text-[#403d38]"
                      }`}
                    />
                    <Button
                      size="sm"
                      onClick={handleAddTodo}
                      className={`h-8 px-3 rounded-xl font-bold text-xs shrink-0 transition-all ${
                        darkMode
                          ? "bg-[#d6fce2] text-[#1f1d1a] hover:bg-[#afd9c3]"
                          : "bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db]"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Task
                    </Button>
                  </div>
                </div>

              </div>
            ) : (
              <div className={`flex-1 flex items-center justify-center text-xs ${darkMode ? "text-[#e5e2db]/40" : "text-slate-400"}`}>
                Select or create a note
              </div>
            )}
          </main>

        </div>
      </DialogContent>
    </Dialog>
  );
}