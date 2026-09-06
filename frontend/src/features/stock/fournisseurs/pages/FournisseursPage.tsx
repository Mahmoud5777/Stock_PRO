"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useFournisseurs } from "../hooks/useFournisseurs";
import { FournisseurFormModal } from "../components/FournisseurFormModal";
import type { Fournisseur } from "../types/fournisseur.types";
import type { FournisseurFormValues } from "../validation/fournisseur.validation";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { SearchFilterBar } from "@/features/administration/shared/components/SearchFilterBar";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { downloadSpreadsheet } from "@/lib/download";
import { toast } from "@/store/toast.store";

const PERMISSION_CODE = "FOURNISSEURS";

export function FournisseursPage() {
  const {
    page, setPage, search, setSearch, sortKey, sortDirection, onSortChange,
    listQuery, createMutation, updateMutation, removeMutation,
  } = useFournisseurs();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Fournisseur | null>(null);
  const [deleting, setDeleting] = useState<Fournisseur | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadSpreadsheet("/fournisseurs/export", { search }, "suppliers.xlsx");
      toast({ title: "Export complete", description: "The Excel file has been downloaded.", variant: "success" });
    } catch {
      toast({ title: "Error", description: "Unable to export the data.", variant: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  function handleSubmit(values: FournisseurFormValues) {
    if (editing) updateMutation.mutate({ id: editing.idFournisseur, input: values }, { onSuccess: () => setFormOpen(false) });
    else createMutation.mutate(values, { onSuccess: () => setFormOpen(false) });
  }

  const columns: DataTableColumn<Fournisseur>[] = [
    { key: "codeFournisseur", label: "Code", sortable: true },
    { key: "nomFournisseur", label: "Name", sortable: true },
    { key: "contact", label: "Contact", render: (row) => row.contact || "-" },
    { key: "telephone", label: "Phone", render: (row) => row.telephone || "-" },
    { key: "email", label: "Email", render: (row) => row.email || "-" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Suppliers"
        description="Manage your supplier directory."
        breadcrumb={[{ label: "Stock" }, { label: "Suppliers" }]}
        actions={
          <RequirePermission code={PERMISSION_CODE} action="ajout">
            <Button leftIcon={<FiPlus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
              New supplier
            </Button>
          </RequirePermission>
        }
      />
      <SearchFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search for a supplier..."
        permissionCode="FOURNISSEURS"
        onExport={handleExport}
        isExporting={isExporting} />
      <PageCard>
        <DataTable
          columns={columns}
          data={listQuery.data?.content ?? []}
          rowKey={(row) => row.idFournisseur}
          isLoading={listQuery.isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          emptyTitle="No suppliers"
          actions={(row) => (
            <div className="flex justify-end gap-1">
              <RequirePermission code={PERMISSION_CODE} action="modification">
                <button onClick={() => { setEditing(row); setFormOpen(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800">
                  <FiEdit2 size={15} />
                </button>
              </RequirePermission>
              <RequirePermission code={PERMISSION_CODE} action="suppression">
                <button onClick={() => setDeleting(row)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40">
                  <FiTrash2 size={15} />
                </button>
              </RequirePermission>
            </div>
          )}
        />
        <Pagination page={page} totalPages={listQuery.data?.totalPages ?? 0} totalElements={listQuery.data?.totalElements ?? 0} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} />
      </PageCard>

      <FournisseurFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} initialData={editing} />
      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete supplier"
        description={`Are you sure you want to delete "${deleting?.nomFournisseur}"?`}
        isLoading={removeMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && removeMutation.mutate(deleting.idFournisseur, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
