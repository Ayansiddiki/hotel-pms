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
  UtensilsCrossed,
  Plus,
  Trash2,
  FolderPlus,
  Coffee,
  CheckCircle2,
  Layers,
  Search,
  IndianRupee,
  AlertCircle,
} from "lucide-react";

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
}

interface FoodServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

const DEFAULT_CATEGORIES: MenuCategory[] = [
  { id: "cat-1", name: "Beverages & Drinks" },
  { id: "cat-2", name: "Quick Snacks" },
  { id: "cat-3", name: "Main Course / Meals" },
  { id: "cat-4", name: "Breakfast" },
];

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: "item-1", categoryId: "cat-1", name: "Masala Chai", price: 30, isVeg: true, isAvailable: true },
  { id: "item-2", categoryId: "cat-1", name: "Cold Coffee", price: 90, isVeg: true, isAvailable: true },
  { id: "item-3", categoryId: "cat-2", name: "Veg Sandwich", price: 120, isVeg: true, isAvailable: true },
  { id: "item-4", categoryId: "cat-2", name: "French Fries", price: 100, isVeg: true, isAvailable: true },
  { id: "item-5", categoryId: "cat-3", name: "Special Gujarati Thali", price: 220, isVeg: true, isAvailable: true },
  { id: "item-6", categoryId: "cat-3", name: "Paneer Butter Masala + Roti", price: 260, isVeg: true, isAvailable: true },
  { id: "item-7", categoryId: "cat-4", name: "Poha / Upma", price: 70, isVeg: true, isAvailable: true },
];

export function FoodServicesModal({
  isOpen,
  onClose,
  darkMode = false,
}: FoodServicesModalProps) {
  // State for Categories & Items
  const [categories, setCategories] = useState<MenuCategory[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hotel_pms_food_categories");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_CATEGORIES;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hotel_pms_food_menu");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_MENU_ITEMS;
  });

  // Active Category Selection
  const [selectedCatId, setSelectedCatId] = useState<string>("cat-1");
  const [searchQuery, setSearchQuery] = useState("");

  // New Category Creation States
  const [newCatName, setNewCatName] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  // New Item Creation States
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState<number | "">("");
  const [newItemIsVeg, setNewItemIsVeg] = useState(true);

  // Save to LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hotel_pms_food_categories", JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hotel_pms_food_menu", JSON.stringify(menuItems));
    }
  }, [menuItems]);

  // Add Category Handler
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: MenuCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
    };
    setCategories((prev) => [...prev, newCat]);
    setSelectedCatId(newCat.id);
    setNewCatName("");
    setIsAddingCat(false);
  };

  // Delete Category & Related Items
  const handleDeleteCategory = (catId: string, catName: string) => {
    if (categories.length <= 1) {
      alert("At least one food category must exist!");
      return;
    }
    if (confirm(`Delete "${catName}" and all items inside it?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      setMenuItems((prev) => prev.filter((item) => item.categoryId !== catId));
      if (selectedCatId === catId) {
        const remaining = categories.filter((c) => c.id !== catId);
        if (remaining.length > 0) setSelectedCatId(remaining[0].id);
      }
    }
  };

  // Add Item to Active Category
  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemPrice) {
      alert("Please provide Item Name and Price!");
      return;
    }
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      categoryId: selectedCatId,
      name: newItemName.trim(),
      price: Number(newItemPrice),
      isVeg: newItemIsVeg,
      isAvailable: true,
    };
    setMenuItems((prev) => [...prev, newItem]);
    setNewItemName("");
    setNewItemPrice("");
  };

  // Toggle Item Availability
  const handleToggleAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  // Delete Item
  const handleDeleteItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Filtered Items for active category & search
  const visibleItems = menuItems.filter((item) => {
    const matchesCategory = item.categoryId === selectedCatId;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCategoryObj = categories.find((c) => c.id === selectedCatId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={`w-[96vw] max-w-5xl h-[88vh] rounded-3xl border p-6 shadow-2xl flex flex-col transition-colors overflow-hidden ${
          darkMode
            ? "bg-[#25221e] border-[#403d38] text-[#e5e2db]"
            : "bg-[#fcfbf9] border-[#afd9c3] text-[#403d38]"
        }`}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Food & Kitchen Services Setup</DialogTitle>
        </DialogHeader>

        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#afd9c3]/40 gap-3 select-none">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold border ${
                darkMode
                  ? "bg-[#403d38] border-[#afd9c3]/40 text-[#d6fce2]"
                  : "bg-[#d6fce2] border-[#afd9c3] text-[#2b6a48]"
              }`}
            >
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg tracking-tight">
                  Food Services & Custom Menu Matrix
                </h3>
                <Badge className="bg-[#d6fce2] text-[#2b6a48] border border-[#afd9c3] text-[10px] font-bold">
                  {categories.length} Categories • {menuItems.length} Dishes
                </Badge>
              </div>
              <p className="text-xs opacity-65">
                Create unlimited custom categories (Snacks, Meals, Drinks) and customize their pricing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onClose}
              className="h-8.5 px-4 rounded-xl text-xs font-bold bg-[#403d38] hover:bg-[#403d38]/90 text-[#e5e2db]"
            >
              Done & Save
            </Button>
          </div>
        </div>

        {/* 2-PANEL LAYOUT (LEFT: CATEGORIES | RIGHT: ITEMS & PRICING) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 pt-4 overflow-hidden text-xs">
          
          {/* PANEL 1: CATEGORIES LIST (4 Cols) */}
          <div
            className={`md:col-span-4 p-4 rounded-3xl border flex flex-col justify-between overflow-hidden ${
              darkMode ? "bg-[#1f1d1a] border-[#403d38]" : "bg-white border-[#afd9c3]/50 shadow-xs"
            }`}
          >
            <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-[#afd9c3]/30">
                <span className="font-extrabold uppercase tracking-wider text-[11px] opacity-70 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Food Categories
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingCat(true)}
                  className="h-7 px-2 text-[11px] font-bold rounded-xl border-[#afd9c3] hover:bg-[#d6fce2]/40"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Category
                </Button>
              </div>

              {/* Add Category Input */}
              {isAddingCat && (
                <div className="p-3 rounded-2xl border border-[#afd9c3] bg-[#d6fce2]/15 space-y-2">
                  <label className="font-bold text-[11px] block">Category Name *</label>
                  <Input
                    placeholder="e.g. Chinese, Desserts, Mocktails"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="h-8 text-xs rounded-xl bg-white dark:bg-[#25221e]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddCategory}
                      className="flex-1 h-7 text-xs font-bold bg-[#2b6a48] text-white rounded-lg"
                    >
                      Save Category
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsAddingCat(false)}
                      className="h-7 text-xs rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Category Buttons List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 [scrollbar-width:none]">
                {categories.map((cat) => {
                  const isSelected = selectedCatId === cat.id;
                  const count = menuItems.filter((i) => i.categoryId === cat.id).length;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#403d38] text-[#e5e2db] border-[#403d38] shadow-sm dark:bg-[#d6fce2] dark:text-[#1f1d1a]"
                          : "border-slate-200/80 dark:border-slate-800 hover:bg-[#d6fce2]/20"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Coffee className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="font-bold text-xs truncate">{cat.name}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-white/20 text-inherit"
                              : "bg-[#e5e2db]/50 dark:bg-[#25221e] opacity-70"
                          }`}
                        >
                          {count} Items
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(cat.id, cat.name);
                          }}
                          className={`h-6 w-6 rounded-md ${
                            isSelected
                              ? "text-red-300 hover:bg-white/20"
                              : "text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          }`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PANEL 2: ITEMS IN ACTIVE CATEGORY & PRICING SETUP (8 Cols) */}
          <div
            className={`md:col-span-8 p-4 rounded-3xl border flex flex-col justify-between overflow-hidden ${
              darkMode ? "bg-[#1f1d1a] border-[#403d38]" : "bg-white border-[#afd9c3]/50 shadow-xs"
            }`}
          >
            <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
              
              {/* Header & Item Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#afd9c3]/30 gap-2">
                <div>
                  <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                    <span>{activeCategoryObj?.name || "Category Items"}</span>
                  </h4>
                  <p className="text-[11px] opacity-60">Add items, set custom selling prices, and control stock status.</p>
                </div>

                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-40" />
                  <Input
                    placeholder="Search dish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs rounded-xl border-[#afd9c3]/60 bg-transparent"
                  />
                </div>
              </div>

              {/* Add New Item Form Row */}
              <div className="p-3.5 rounded-2xl border border-[#afd9c3]/60 bg-[#e5e2db]/20 dark:bg-[#25221e] space-y-2">
                <span className="font-bold text-[11px] block">
                  Add Item to "{activeCategoryObj?.name}"
                </span>
                <div className="grid grid-cols-12 gap-2">
                  <Input
                    placeholder="Item / Dish Name (e.g. Masala Dosa, Fresh Lime)"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="col-span-6 h-8.5 text-xs rounded-xl bg-white dark:bg-[#1f1d1a] border-[#afd9c3]/60"
                  />
                  <div className="col-span-3 relative">
                    <IndianRupee className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-50" />
                    <Input
                      type="number"
                      placeholder="Rate (₹)"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value ? Number(e.target.value) : "")}
                      className="h-8.5 pl-8 text-xs font-mono font-bold rounded-xl bg-white dark:bg-[#1f1d1a] border-[#afd9c3]/60"
                    />
                  </div>
                  <div className="col-span-3">
                    <Button
                      onClick={handleAddItem}
                      className="w-full h-8.5 rounded-xl font-bold text-xs bg-[#2b6a48] hover:bg-[#23583c] text-white flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Dish
                    </Button>
                  </div>
                </div>
              </div>

              {/* Items List in Category */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 [scrollbar-width:none]">
                {visibleItems.length === 0 ? (
                  <div className="text-center py-16 opacity-40 text-xs font-semibold">
                    No items in this category yet. Use the form above to add dishes!
                  </div>
                ) : (
                  visibleItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        item.isAvailable
                          ? "bg-slate-50 dark:bg-[#25221e] border-slate-200/80 dark:border-slate-800"
                          : "bg-red-50/40 dark:bg-red-950/20 border-red-200/50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                        <div>
                          <div className="font-extrabold text-xs">{item.name}</div>
                          <div className="text-[10px] font-mono text-emerald-600 font-bold">
                            ₹{item.price} per portion
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Stock Status Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleAvailability(item.id)}
                          className={`h-7 px-2.5 text-[10px] font-bold rounded-xl border ${
                            item.isAvailable
                              ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30"
                              : "border-red-300 text-red-600 bg-red-50 dark:bg-red-950/30"
                          }`}
                        >
                          {item.isAvailable ? "In-Stock" : "Out of Stock"}
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteItem(item.id)}
                          className="h-7 w-7 text-slate-400 hover:text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}