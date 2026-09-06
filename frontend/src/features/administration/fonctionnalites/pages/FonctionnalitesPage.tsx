"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useFonctionnalites } from "../hooks/useFonctionnalites";
import { FonctionnaliteFormModal } from "../components/FonctionnaliteFormModal";
import type { Fonctionnalite } from "../types/fonctionnalite.types";
import type { FonctionnaliteFormValues } from "../validation/fonctionnalite.validation";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { SearchFilterBar, type FilterDef } from "@/features/administration/shared/components/SearchFilterBar";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { downloadSpreadsheet } from "@/lib/download";
import { toast } from "@/store/toast.store";
import { translateFoncLabel } from "../utils/fonctionnalite-labels";

const PERMISSION_CODE = "ADMIN_FONCTIONNALITES";

const FILTER_DEFS: FilterDef[] = [
  { key: "actif", label: "Status", options: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] },
];

export function FonctionnalitesPage() {
  const { page, setPage, search, setSearch, sortKey, sortDirection, onSortChange, filters, updateFilters, resetFilters, listQuery, createMutation, updateMutation, removeMutation } = useFonctionnalites();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Fonctionnalite | null>(null);
  const [deleting, setDeleting] = useState<Fonctionnalite | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filterValues = { actif: filters.actif === undefined ? undefined : String(filters.actif) };

  function handleFilterValueChange(key: string, value: string | undefined) {
    updateFilters({ [key]: value === undefined ? undefined : value === "true" });
  }
  function handleRemoveFilter(key: string) {
    setActiveFilters((prev) => prev.filter((k) => k !== key));
    updateFilters({ [key]: undefined });
  }
  function handleResetAll() {
    setActiveFilters([]);
    resetFilters();
    setSearch("");
  }

  const [isExporting, setIsExporting] = useState(false);
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadSpreadsheet("/fonctionnalites/export", { search, filters }, "features.xlsx");
      toast({ title: "Export complete", description: "The Excel file has been downloaded.", variant: "success" });
    } catch {
      toast({ title: "Error", description: "Unable to export the data.", variant: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  function handleSubmit(values: FonctionnaliteFormValues) {
    const input = { ...values, idFoncMere: values.idFoncMere || null };
    if (editing) updateMutation.mutate({ id: editing.idFonc, input }, { onSuccess: () => setFormOpen(false) });
    else createMutation.mutate(input, { onSuccess: () => setFormOpen(false) });
  }

  const columns: DataTableColumn<Fonctionnalite>[] = [
    { key: "codeFonc", label: "Code", sortable: true },
    { key: "libelle", label: "Name", sortable: true, render: (row) => translateFoncLabel(row.codeFonc, row.libelle) },
    { key: "url", label: "URL", render: (row) => row.url ?? "-" },
    { key: "orderAffichage", label: "Order", align: "center", render: (row) => row.orderAffichage ?? "-" },
    { key: "actif", label: "Status", render: (row) => <Badge variant={row.actif ? "success" : "neutral"}>{row.actif ? "Active" : "Inactive"}</Badge> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Features"
        description="Define the application's features and their associated menu entries."
        breadcrumb={[{ label: "Administration" }, { label: "Features" }]}
        actions={
          <RequirePermission code={PERMISSION_CODE} action="ajout">
            <Button leftIcon={<FiPlus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>New feature</Button>
          </RequirePermission>
        }
      />
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search for a feature..."
        filterDefs={FILTER_DEFS}
        activeFilterKeys={activeFilters}
        filterValues={filterValues}
        onFilterValueChange={handleFilterValueChange}
        onAddFilter={(key) => setActiveFilters((prev) => [...prev, key])}
        onRemoveFilter={handleRemoveFilter}
        onResetAll={handleResetAll}
        permissionCode={PERMISSION_CODE}
        onExport={handleExport}
        isExporting={isExporting}
      />
      <PageCard>
        <DataTable
          columns={columns}
          data={listQuery.data?.content ?? []}
          rowKey={(row) => row.idFonc}
          isLoading={listQuery.isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          emptyTitle="No features"
          actions={(row) => (
            <div className="flex justify-end gap-1">
              <RequirePermission code={PERMISSION_CODE} action="modification">
                <button onClick={() => { setEditing(row); setFormOpen(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"><FiEdit2 size={15} /></button>
              </RequirePermission>
              <RequirePermission code={PERMISSION_CODE} action="suppression">
                <button onClick={() => setDeleting(row)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"><FiTrash2 size={15} /></button>
              </RequirePermission>
            </div>
          )}
        />
        <Pagination page={page} totalPages={listQuery.data?.totalPages ?? 0} totalElements={listQuery.data?.totalElements ?? 0} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} />
      </PageCard>
      <FonctionnaliteFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} initialData={editing} />
      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete feature"
        description={`Are you sure you want to delete "${deleting?.libelle}"?`}
        isLoading={removeMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && removeMutation.mutate(deleting.idFonc, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
