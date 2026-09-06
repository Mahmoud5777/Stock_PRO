"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useSites } from "../hooks/useSites";
import { SiteFormModal } from "../components/SiteFormModal";
import type { Site } from "../types/site.types";
import type { SiteFormValues } from "../validation/site.validation";
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

const PERMISSION_CODE = "ADMIN_SITES";

export function SitesPage() {
  const {
    page, setPage, search, setSearch, sortKey, sortDirection, onSortChange,
    listQuery, createMutation, updateMutation, removeMutation,
  } = useSites();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Site | null>(null);
  const [deleting, setDeleting] = useState<Site | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadSpreadsheet("/sites/export", { search }, "sites.xlsx");
      toast({ title: "Export complete", description: "The Excel file has been downloaded.", variant: "success" });
    } catch {
      toast({ title: "Error", description: "Unable to export the data.", variant: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  function handleSubmit(values: SiteFormValues) {
    const input = { ...values, idSiteParent: values.idSiteParent || null };
    if (editing) updateMutation.mutate({ id: editing.idSite, input }, { onSuccess: () => setFormOpen(false) });
    else createMutation.mutate(input, { onSuccess: () => setFormOpen(false) });
  }

  const columns: DataTableColumn<Site>[] = [
    { key: "codeSite", label: "Code", sortable: true },
    { key: "nomSite", label: "Name", sortable: true },
    { key: "parentNomSite", label: "Parent site", render: (row) => row.parentNomSite ?? "-" },
    { key: "address", label: "Address", render: (row) => row.address ?? "-" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Sites"
        description="Manage sites, warehouses, and their hierarchy."
        breadcrumb={[{ label: "Administration" }, { label: "Sites" }]}
        actions={
          <RequirePermission code={PERMISSION_CODE} action="ajout">
            <Button leftIcon={<FiPlus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
              New site
            </Button>
          </RequirePermission>
        }
      />
      <SearchFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search for a site..."
        permissionCode="ADMIN_SITES"
        onExport={handleExport}
        isExporting={isExporting} />
      <PageCard>
        <DataTable
          columns={columns}
          data={listQuery.data?.content ?? []}
          rowKey={(row) => row.idSite}
          isLoading={listQuery.isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          emptyTitle="No sites"
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

      <SiteFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} initialData={editing} />
      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete site"
        description={`Are you sure you want to delete "${deleting?.nomSite}" ?`}
        isLoading={removeMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && removeMutation.mutate(deleting.idSite, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
