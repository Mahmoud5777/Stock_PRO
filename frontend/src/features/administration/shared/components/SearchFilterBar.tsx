"use client";

import { useState } from "react";
import { FiSearch, FiX, FiPlus, FiChevronDown, FiFilter, FiDownload } from "react-icons/fi";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { RequirePermission } from "@/features/auth/components/RequirePermission";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDef {
  /** Unique key, matches the query-param / filters-object key. */
  key: string;
  /** Short label shown on the chip and in the "Add filter" menu. */
  label: string;
  options: FilterOption[];
}

interface FilterChipProps {
  def: FilterDef;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  onRemove: () => void;
}

function FilterChip({ def, value, onChange, onRemove }: FilterChipProps) {
  const [open, setOpen] = useState(false);
  const selected = def.options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:border-brand-300 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
      >
        <span className="text-brand-500/70 dark:text-brand-400/70">{def.label}:</span>
        <span>{selected ? selected.label : "All"}</span>
        <FiChevronDown size={12} className={cn("transition-transform", open && "rotate-180")} />
        <span
          role="button"
          aria-label={`Remove ${def.label} filter`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-brand-200/60 dark:hover:bg-brand-500/20"
        >
          <FiX size={11} />
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1.5 max-h-60 w-48 overflow-auto rounded-xl border border-slate-100 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
              className="flex w-full items-center px-3.5 py-2 text-left text-sm text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              All
            </button>
            {def.options.map((o) => (
              <button
                type="button"
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-3.5 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700",
                  o.value === value ? "font-medium text-brand-600 dark:text-brand-400" : "text-slate-700 dark:text-slate-300"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** All possible filter dimensions for this page (label + options). Omit for pages with no filters. */
  filterDefs?: FilterDef[];
  /** Keys of filterDefs currently shown as chips. */
  activeFilterKeys?: string[];
  /** Current value of each active filter, keyed by filter key. */
  filterValues?: Record<string, string | undefined>;
  onFilterValueChange?: (key: string, value: string | undefined) => void;
  onAddFilter?: (key: string) => void;
  onRemoveFilter?: (key: string) => void;
  onResetAll?: () => void;
  /** Code de fonctionnalité (ex: "ADMIN_SITES") requis pour afficher le bouton d'export. */
  permissionCode?: string;
  /** Déclenche l'export Excel des résultats actuels (bouton vert à côté de la recherche). */
  onExport?: () => void;
  isExporting?: boolean;
}

/**
 * Unified search + filter bar used across list pages: a polished search
 * input with a clear button, plus optional filter chips (each opens a small
 * dropdown) and a dashed "Add filter" chip to reveal more dimensions.
 * Pass `filterDefs` only when the page actually has filterable dimensions;
 * omit it (or leave it empty) for simple pages — the search input alone
 * still renders with the same refreshed look.
 */
export function SearchFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterDefs = [],
  activeFilterKeys = [],
  filterValues = {},
  onFilterValueChange = () => {},
  onAddFilter = () => {},
  onRemoveFilter = () => {},
  onResetAll = () => {},
  permissionCode,
  onExport,
  isExporting,
}: SearchFilterBarProps) {
  const [addOpen, setAddOpen] = useState(false);
  const availableDefs = filterDefs.filter((d) => !activeFilterKeys.includes(d.key));
  const hasActive = search.length > 0 || activeFilterKeys.length > 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-stretch gap-3">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-10 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:focus:bg-slate-800"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        {onExport && (
          <RequirePermission code={permissionCode ?? ""} action="export">
            <Button
              type="button"
              variant="success"
              className="h-[42px] shrink-0"
              onClick={onExport}
              isLoading={isExporting}
              leftIcon={<FiDownload size={16} />}
            >
              Export Excel
            </Button>
          </RequirePermission>
        )}
      </div>

      {filterDefs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            <FiFilter size={12} /> Filters
          </span>

          {activeFilterKeys.map((key) => {
            const def = filterDefs.find((d) => d.key === key);
            if (!def) return null;
            return (
              <FilterChip
                key={key}
                def={def}
                value={filterValues[key]}
                onChange={(v) => onFilterValueChange(key, v)}
                onRemove={() => onRemoveFilter(key)}
              />
            );
          })}

          {availableDefs.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAddOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:text-brand-400"
              >
                <FiPlus size={13} /> Add filter
              </button>
              {addOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setAddOpen(false)} />
                  <div className="absolute left-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    {availableDefs.map((d) => (
                      <button
                        type="button"
                        key={d.key}
                        onClick={() => {
                          onAddFilter(d.key);
                          setAddOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <FiPlus size={13} className="text-brand-500" />
                        {d.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {hasActive && (
            <button
              type="button"
              onClick={onResetAll}
              className="ml-auto text-xs font-medium text-slate-400 transition hover:text-red-500"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
