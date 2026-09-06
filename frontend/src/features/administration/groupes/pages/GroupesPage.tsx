"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useGroupes } from "../hooks/useGroupes";
import { GroupeFormModal } from "../components/GroupeFormModal";
import type { Groupe } from "../types/groupe.types";
import type { GroupeFormValues } from "../validation/groupe.validation";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { SearchFilterBar } from "@/features/administration/shared/components/SearchFilterBar";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { downloadSpreadsheet } from "@/lib/download";
import { toast } from "@/store/toast.store";

const PERMISSION_CODE = "ADMIN_GROUPES";

export function GroupesPage() {
  const { page, setPage, search, setSearch, sortKey, sortDirection, onSortChange, listQuery, createMutation, updateMutation, removeMutation } = useGroupes();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Groupe | null>(null);
  const [deleting, setDeleting] = useState<Groupe | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadSpreadsheet("/groupes/export", { search }, "groups.xlsx");
      toast({ title: "Export complete", description: "The Excel file has been downloaded.", variant: "success" });
    } catch {
      toast({ title: "Error", description: "Unable to export the data.", variant: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  function handleSubmit(values: GroupeFormValues) {
    if (editing) updateMutation.mutate({ id: editing.idGr, input: values }, { onSuccess: () => setFormOpen(false) });
    else createMutation.mutate(values, { onSuccess: () => setFormOpen(false) });
  }

  const columns: DataTableColumn<Groupe>[] = [
    { key: "codeGroupe", label: "Code", sortable: true },
    { key: "libelle", label: "Name", sortable: true },
    { key: "profils", label: "Profiles", render: (row) => row.profils.map((p) => p.libelle).join(", ") || "-" },
    { key: "roles", label: "Roles", render: (row) => <div className="flex flex-wrap gap-1">{row.roles.map((r) => <Badge key={r.idRl} variant="neutral">{r.libelle}</Badge>)}</div> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Groups"
        description="Combine profiles and roles into groups that can be assigned to users per site."
        breadcrumb={[{ label: "Administration" }, { label: "Groups" }]}
        actions={
          <RequirePermission code={PERMISSION_CODE} action="ajout">
            <Button leftIcon={<FiPlus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>New group</Button>
          </RequirePermission>
        }
      />
      <SearchFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search for a group..."
        permissionCode="ADMIN_GROUPES"
        onExport={handleExport}
        isExporting={isExporting} />
      <PageCard>
        <DataTable
          columns={columns}
          data={listQuery.data?.content ?? []}
          rowKey={(row) => row.idGr}
          isLoading={listQuery.isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          emptyTitle="No groups"
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
      <GroupeFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} initialData={editing} />
      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete group"
        description={`Are you sure you want to delete "${deleting?.libelle}"?`}
        isLoading={removeMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && removeMutation.mutate(deleting.idGr, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
