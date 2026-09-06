"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useCategories } from "../hooks/useCategories";
import { CategorieFormModal } from "../components/CategorieFormModal";
import type { Categorie } from "../types/categorie.types";
import type { CategorieFormValues } from "../validation/categorie.validation";
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

const PERMISSION_CODE = "CATEGORIES";

export function CategoriesPage() {
  const {
    page, setPage, search, setSearch, sortKey, sortDirection, onSortChange,
    listQuery, createMutation, updateMutation, removeMutation,
  } = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Categorie | null>(null);
  const [deleting, setDeleting] = useState<Categorie | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadSpreadsheet("/categories/export", { search }, "categories.xlsx");
      toast({ title: "Export complete", description: "The Excel file has been downloaded.", variant: "success" });
    } catch {
      toast({ title: "Error", description: "Unable to export the data.", variant: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  function handleSubmit(values: CategorieFormValues) {
    if (editing) updateMutation.mutate({ id: editing.idCategorie, input: values }, { onSuccess: () => setFormOpen(false) });
    else createMutation.mutate(values, { onSuccess: () => setFormOpen(false) });
  }

  const columns: DataTableColumn<Categorie>[] = [
    { key: "codeCategorie", label: "Code", sortable: true },
    { key: "nomCategorie", label: "Name", sortable: true },
    { key: "description", label: "Description", render: (row) => row.description || "-" },
    { key: "nombreArticles", label: "Articles", render: (row) => row.nombreArticles ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Categories"
        description="Organize your articles by category."
        breadcrumb={[{ label: "Stock" }, { label: "Categories" }]}
        actions={
          <RequirePermission code={PERMISSION_CODE} action="ajout">
            <Button leftIcon={<FiPlus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
              New category
            </Button>
          </RequirePermission>
        }
      />
      <SearchFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search for a category..."
        permissionCode="CATEGORIES"
        onExport={handleExport}
        isExporting={isExporting} />
      <PageCard>
        <DataTable
          columns={columns}
          data={listQuery.data?.content ?? []}
          rowKey={(row) => row.idCategorie}
          isLoading={listQuery.isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          emptyTitle="No categories"
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

      <CategorieFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} initialData={editing} />
      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete category"
        description={`Are you sure you want to delete "${deleting?.nomCategorie}"?`}
        isLoading={removeMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && removeMutation.mutate(deleting.idCategorie, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
