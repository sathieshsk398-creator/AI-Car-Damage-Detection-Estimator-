import React, { useState } from "react";
import { 
  Database, 
  Plus, 
  RotateCcw, 
  Edit2, 
  Save, 
  X, 
  Trash2, 
  Coins, 
  Info, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { saveAdminPrices, fetchAdminPrices } from "../utils/pricingApi";
import { getAdminUser, getUserData } from "../utils/authStorage";

interface InventoryPricingEditorProps {
  shopOwnerPricing: Record<string, Record<string, { repair: number; replace: number }>>;
  setShopOwnerPricing: React.Dispatch<React.SetStateAction<Record<string, Record<string, { repair: number; replace: number }>>>>;
  currency: "INR" | "USD";
}

const DEFAULT_PRICING = {
  "Mid-size Sedan": {
    "Window Glass": { repair: 0, replace: 9500 },
    "Rear Bumper Panel": { repair: 4500, replace: 9000 },
    "Front Bumper": { repair: 5000, replace: 11000 },
    "Headlight": { repair: 1200, replace: 3500 },
    "Fender": { repair: 1800, replace: 4500 },
    "Side Door": { repair: 5400, replace: 12000 },
    "Side View Mirror": { repair: 1000, replace: 2800 },
    "Wiper Blades": { repair: 0, replace: 850 },
    "Grille": { repair: 1500, replace: 6000 },
    "Hood": { repair: 3500, replace: 14000 },
    "Reflector": { repair: 0, replace: 950 },
    "A-Pillar Trim": { repair: 2500, replace: 5000 }
  },
  "SUV / Crossover": {
    "Window Glass": { repair: 0, replace: 12000 },
    "Rear Bumper Panel": { repair: 5500, replace: 11000 },
    "Front Bumper": { repair: 6000, replace: 13500 },
    "Headlight": { repair: 1500, replace: 4800 },
    "Fender": { repair: 2200, replace: 5500 },
    "Side Door": { repair: 6500, replace: 15000 },
    "Side View Mirror": { repair: 1200, replace: 3500 },
    "Wiper Blades": { repair: 0, replace: 1000 },
    "Grille": { repair: 1800, replace: 8000 },
    "Hood": { repair: 4500, replace: 18000 },
    "Reflector": { repair: 0, replace: 1200 },
    "A-Pillar Trim": { repair: 3000, replace: 6000 }
  },
  "Hatchback": {
    "Window Glass": { repair: 0, replace: 7500 },
    "Rear Bumper Panel": { repair: 3500, replace: 7500 },
    "Front Bumper": { repair: 4000, replace: 8500 },
    "Headlight": { repair: 1000, replace: 2800 },
    "Fender": { repair: 1500, replace: 3500 },
    "Side Door": { repair: 4500, replace: 9500 },
    "Side View Mirror": { repair: 800, replace: 2200 },
    "Wiper Blades": { repair: 0, replace: 700 },
    "Grille": { repair: 1200, replace: 4500 },
    "Hood": { repair: 2800, replace: 10000 },
    "Reflector": { repair: 0, replace: 800 },
    "A-Pillar Trim": { repair: 2000, replace: 4000 }
  }
};

export default function InventoryPricingEditor({
  shopOwnerPricing,
  setShopOwnerPricing,
  currency
}: InventoryPricingEditorProps) {
  const [selectedSegment, setSelectedSegment] = useState<string>("Mid-size Sedan");
  
  // Inline editing state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editRepairVal, setEditRepairVal] = useState<number>(0);
  const [editReplaceVal, setEditReplaceVal] = useState<number>(0);

  // New component form state
  const [newPartName, setNewPartName] = useState("");
  const [newRepairPrice, setNewRepairPrice] = useState(0);
  const [newReplacePrice, setNewReplacePrice] = useState(0);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const currencySymbol = currency === "USD" ? "$" : "₹";
  const currencyRate = currency === "USD" ? 95.34 : 1;

  // Convert prices for display
  const formatPrice = (val: number) => {
    const converted = val / currencyRate;
    return currency === "USD"
      ? `${currencySymbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `${currencySymbol}${Math.round(converted).toLocaleString("en-IN")}`;
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);

  const activeAdmin = getAdminUser() || getUserData();

  const handlePersistToCloud = async (overrideData?: Record<string, Record<string, { repair: number; replace: number }>>) => {
    setIsSaving(true);
    setSaveStatusMessage(null);
    try {
      const dataToSave = overrideData || shopOwnerPricing;
      const res = await saveAdminPrices(dataToSave);
      if (res.success) {
        setSaveStatusMessage("All price modifications successfully saved and locked to your Admin account in database.");
        setTimeout(() => setSaveStatusMessage(null), 4000);
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to persist prices to database.");
      setTimeout(() => setFormError(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Switch Segment Handler
  const handleSegmentChange = (segment: string) => {
    setSelectedSegment(segment);
    setEditingKey(null);
  };

  // Start Editing Handler
  const startEditing = (key: string, repair: number, replace: number) => {
    setEditingKey(key);
    setEditRepairVal(repair);
    setEditReplaceVal(replace);
  };

  // Cancel Editing
  const cancelEditing = () => {
    setEditingKey(null);
  };

  // Save Inline Edit
  const saveInlineEdit = (key: string) => {
    const updatedPricing = {
      ...shopOwnerPricing,
      [selectedSegment]: {
        ...shopOwnerPricing[selectedSegment],
        [key]: {
          repair: Number(editRepairVal),
          replace: Number(editReplaceVal),
        },
      },
    };
    setShopOwnerPricing(updatedPricing);
    setEditingKey(null);
    handlePersistToCloud(updatedPricing);
  };

  // Delete Component
  const deleteComponent = (key: string) => {
    if (confirm(`Are you sure you want to remove "${key}" from the custom database?`)) {
      const updatedSegment = { ...shopOwnerPricing[selectedSegment] };
      delete updatedSegment[key];
      const updatedPricing = {
        ...shopOwnerPricing,
        [selectedSegment]: updatedSegment,
      };
      setShopOwnerPricing(updatedPricing);
      handlePersistToCloud(updatedPricing);
    }
  };

  // Add Custom Component
  const handleAddCustomComponent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const trimmedName = newPartName.trim();
    if (!trimmedName) {
      setFormError("Component name is required.");
      return;
    }

    const currentKeys = Object.keys(shopOwnerPricing[selectedSegment] || {});
    const duplicate = currentKeys.find((k) => k.toLowerCase() === trimmedName.toLowerCase());
    if (duplicate) {
      setFormError(`A component with the name "${trimmedName}" already exists.`);
      return;
    }

    const updatedPricing = {
      ...shopOwnerPricing,
      [selectedSegment]: {
        ...shopOwnerPricing[selectedSegment],
        [trimmedName]: {
          repair: Number(newRepairPrice),
          replace: Number(newReplacePrice),
        },
      },
    };

    setShopOwnerPricing(updatedPricing);
    setFormSuccess(`Successfully added "${trimmedName}" to inventory.`);
    setNewPartName("");
    setNewRepairPrice(0);
    setNewReplacePrice(0);

    handlePersistToCloud(updatedPricing);

    setTimeout(() => {
      setFormSuccess(null);
    }, 3000);
  };

  // Reset all prices to master default database
  const handleResetToDefaults = () => {
    if (
      confirm(
        "Are you sure you want to revert all custom prices and items back to factory default standards? This will overwrite your current admin price list in database."
      )
    ) {
      const defaultData = JSON.parse(JSON.stringify(DEFAULT_PRICING));
      setShopOwnerPricing(defaultData);
      setFormSuccess("Database pricing successfully restored to master default standards.");
      handlePersistToCloud(defaultData);
      setTimeout(() => setFormSuccess(null), 3000);
    }
  };

  // Metrics for active segment
  const pricingData = shopOwnerPricing[selectedSegment] || {};
  const totalItems = Object.keys(pricingData).length;
  
  let totalReplaceCost = 0;
  let maxReplaceCost = 0;
  let activeMaxPart = "None";

  Object.entries(pricingData).forEach(([key, val]) => {
    totalReplaceCost += val.replace;
    if (val.replace > maxReplaceCost) {
      maxReplaceCost = val.replace;
      activeMaxPart = key;
    }
  });

  const avgReplaceCost = totalItems > 0 ? Math.round(totalReplaceCost / totalItems) : 0;

  return (
    <div className="space-y-6 w-full animate-fade-in p-1">
      {/* Informative Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-transparent pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded tracking-widest uppercase font-mono">
              Database Console
            </span>
            <span className="text-slate-400 text-xs font-mono">ID: SECURE_PRICING_API_v1.2</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-sky-400" /> Customized Inventory Pricing System
          </h2>
          <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
            Configure the central, verified rate cards for each vehicle class. The AI appraiser maps visual components directly to these values to guarantee a 100% deterministic, zero-variance insurance valuation output.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => handlePersistToCloud()}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold py-2 px-4 rounded-xl text-xs transition cursor-pointer shadow-md disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> Save Price List to Database
              </>
            )}
          </button>
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Revert to Defaults
          </button>
        </div>
      </div>

      {/* Admin Isolation Status Ribbon */}
      <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Isolated Admin Account:{" "}
            <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">
              {activeAdmin?.email || "Current Admin"}
            </span>
          </span>
          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold border border-emerald-500/20">
            Per-Admin Isolation Active
          </span>
        </div>
        {saveStatusMessage && (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1 animate-fade-in">
            <CheckCircle className="w-3.5 h-3.5" /> {saveStatusMessage}
          </span>
        )}
      </div>

      {/* Segment Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        {Object.keys(shopOwnerPricing).map((segment) => (
          <button
            key={segment}
            onClick={() => handleSegmentChange(segment)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${
              selectedSegment === segment
                ? "bg-sky-500 text-slate-950 shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>{segment}</span>
            <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
              selectedSegment === segment 
                ? "bg-slate-950/20 text-slate-950" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
            }`}>
              {Object.keys(shopOwnerPricing[segment] || {}).length} parts
            </span>
          </button>
        ))}
      </div>

      {/* Quick Metrics Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono uppercase font-bold tracking-wider">Average Replacement Cost</span>
            <h3 className="text-xl font-extrabold text-slate-950 dark:text-white mt-0.5">{formatPrice(avgReplaceCost)}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono uppercase font-bold tracking-wider">Highest Replacement Cost</span>
            <h3 className="text-xl font-extrabold text-slate-950 dark:text-white mt-0.5">{formatPrice(maxReplaceCost)}</h3>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-mono block mt-0.5 uppercase truncate max-w-[200px]">Part: {activeMaxPart}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono uppercase font-bold tracking-wider">Tracked Catalog Items</span>
            <h3 className="text-xl font-extrabold text-slate-950 dark:text-white mt-0.5">{totalItems} Components</h3>
          </div>
        </div>
      </div>

      {/* Central Interface split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Price Catalog Table */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Database className="w-5 h-5 text-sky-500" /> Segment Component Rate Card
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Define fixed labor/material costs mapped exactly on matching damage triggers.</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/40 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Post-Processing Override Active
            </span>
          </div>

          {formSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl p-3 flex items-center gap-2 text-emerald-800 dark:text-emerald-400 text-xs animate-fade-in font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-950/40">
                  <th className="py-3 px-4">Component Name</th>
                  <th className="py-3 px-4">Repair Rate ({currencySymbol})</th>
                  <th className="py-3 px-4">Replacement Rate ({currencySymbol})</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-slate-700 dark:text-slate-300">
                {Object.entries(pricingData).map(([key, value]) => {
                  const isEditing = editingKey === key;
                  return (
                    <tr key={key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-sans font-semibold text-slate-900 dark:text-white max-w-[150px] truncate">
                        {key}
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 dark:text-slate-500">{currencySymbol}</span>
                            <input
                              type="number"
                              value={Math.round(editRepairVal / currencyRate)}
                              onChange={(e) => setEditRepairVal(Number(e.target.value) * currencyRate)}
                              className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />
                          </div>
                        ) : (
                          <span className={value.repair === 0 ? "text-slate-400 dark:text-slate-500 font-sans italic" : "text-slate-900 dark:text-slate-100 font-bold"}>
                            {value.repair === 0 ? "Free / Non-Repairable" : formatPrice(value.repair)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 dark:text-slate-500">{currencySymbol}</span>
                            <input
                              type="number"
                              value={Math.round(editReplaceVal / currencyRate)}
                              onChange={(e) => setEditReplaceVal(Number(e.target.value) * currencyRate)}
                              className="w-24 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />
                          </div>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 font-bold">
                            {formatPrice(value.replace)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => saveInlineEdit(key)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg transition cursor-pointer"
                              title="Save changes"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEditing(key, value.repair, value.replace)}
                              className="text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 p-1.5 rounded-lg transition cursor-pointer"
                              title="Edit Component Rates"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteComponent(key)}
                              className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-lg transition cursor-pointer"
                              title="Remove Component"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Component Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4 h-fit">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-500" /> Expand Inventory Catalog
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Register a custom component and specify standard regional pricing.</p>
          </div>

          <form onSubmit={handleAddCustomComponent} className="space-y-4">
            {formError && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl p-3 flex items-center gap-2 text-rose-800 dark:text-rose-400 text-xs animate-fade-in font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="custom-part-name" className="text-xs font-bold text-slate-700 dark:text-slate-300">Part/Component Name</label>
              <input
                id="custom-part-name"
                type="text"
                placeholder="e.g. Carbon Spoiler Panel"
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="custom-repair-price" className="text-xs font-bold text-slate-700 dark:text-slate-300">Repair Price ({currencySymbol})</label>
                <input
                  id="custom-repair-price"
                  type="number"
                  placeholder="0"
                  value={newRepairPrice === 0 ? "" : Math.round(newRepairPrice / currencyRate)}
                  onChange={(e) => setNewRepairPrice(Number(e.target.value) * currencyRate)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="custom-replace-price" className="text-xs font-bold text-slate-700 dark:text-slate-300">Replace Price ({currencySymbol})</label>
                <input
                  id="custom-replace-price"
                  type="number"
                  placeholder="0"
                  value={newReplacePrice === 0 ? "" : Math.round(newReplacePrice / currencyRate)}
                  onChange={(e) => setNewReplacePrice(Number(e.target.value) * currencyRate)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-600 text-slate-950 py-3 rounded-xl text-xs font-extrabold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Save Component to Database
            </button>
          </form>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-amber-900 dark:text-amber-300 text-xs flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0" /> Policy Standards Reminder
            </h4>
            <p className="text-amber-800 dark:text-amber-400 text-[11px] leading-relaxed">
              When an insurance claim photo is evaluated, the neural segment filter will search for parts that match or contain these identifiers. Adding custom components here instantly updates the central pipeline mapping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
