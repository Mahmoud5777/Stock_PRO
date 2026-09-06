"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiEdit2, FiTrash2, FiUserPlus } from "react-icons/fi";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { SearchFilterBar, type FilterDef } from "@/features/administration/shared/components/SearchFilterBar";
import { DataTable, Pagination, Button, ConfirmDialog } from "@/components/ui";
import { useEntityCrud } from "@/features/administration/shared/hooks/useEntityCrud";
import { userService } from "@/features/administration/utilisateurs/services/user.service";
import { siteService } from "@/features/administration/sites/services/site.service";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { downloadSpreadsheet } from "@/lib/download";
import { toast } from "@/store/toast.store";
import { UserFormModal } from "@/features/administration/utilisateurs/components/UserFormModal";
import type { Utilisateur, UtilisateurInput } from "@/features/administration/utilisateurs/types/user.types";

// ═══ NAMED EXPORT (pas default) — obligatoire car page.tsx fait : import { UsersPage } ═══
export function UsersPage() {
  const {
    page,
    setPage,
    search,
    setSearch,
    sortKey,
    sortDirection,
    onSortChange,
    filters,
    updateFilters,
    resetFilters,
    listQuery,
    createMutation,
    updateMutation,
    removeMutation,
  } = useEntityCrud(userService, { resourceKey: "users", entityLabel: "the user" });

  // ═══ Sites pour le dropdown : liste complète (non paginée) ═══
  const { data: allSites } = useQuery({
    queryKey: ["sites", "all"],
    queryFn: () => siteService.listAll(),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Utilisateur | null>(null);
  const [deleting, setDeleting] = useState<Utilisateur | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filterDefs: FilterDef[] = [
    { key: "etatCompte", label: "Status", options: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] },
    { key: "siteId", label: "Site", options: (allSites ?? []).map((s) => ({ value: s.idSite, label: s.nomSite })) },
  ];

  const filterValues: Record<string, string | undefined> = {
    etatCompte: filters.etatCompte === undefined ? undefined : String(filters.etatCompte),
    siteId: typeof filters.siteId === "string" ? filters.siteId : undefined,
  };

  function handleFilterValueChange(key: string, value: string | undefined) {
    if (key === "etatCompte") updateFilters({ etatCompte: value === undefined ? undefined : value === "true" });
    else updateFilters({ [key]: value });
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
      await downloadSpreadsheet("/users/export", { search, filters }, "users.xlsx");
      toast({ title: "Export complete", description: "The Excel file has been downloaded.", variant: "success" });
    } catch {
      toast({ title: "Error", description: "Unable to export the data.", variant: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmit = (data: UtilisateurInput) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.idUtil, input: data },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => setFormOpen(false) });
    }
  };

  const columns = [
    { key: "nomComplet", label: "Full name", sortable: true },
    { key: "login", label: "Login", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "etatCompte",
      label: "Status",
      render: (row: Utilisateur) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.etatCompte
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {row.etatCompte ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "sites",
      label: "Sites",
      render: (row: Utilisateur) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {row.sites.map((s) => s.nomSite).join(", ") || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Users"
        description="Manage user accounts and their assigned sites."
        breadcrumb={[{ label: "Administration" }, { label: "Users" }]}
        actions={
          <RequirePermission code="ADMIN_UTILISATEURS" action="ajout">
            <Button
              leftIcon={<FiUserPlus size={16} />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              New user
            </Button>
          </RequirePermission>
        }
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search for a user..."
        filterDefs={filterDefs}
        activeFilterKeys={activeFilters}
        filterValues={filterValues}
        onFilterValueChange={handleFilterValueChange}
        onAddFilter={(key) => setActiveFilters((prev) => [...prev, key])}
        onRemoveFilter={handleRemoveFilter}
        onResetAll={handleResetAll}
        permissionCode="ADMIN_UTILISATEURS"
        onExport={handleExport}
        isExporting={isExporting}
      />

      <PageCard>
        <DataTable
          columns={columns}
          data={listQuery.data?.content ?? []}
          rowKey={(row) => row.idUtil}
          isLoading={listQuery.isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          emptyTitle="No users"
          emptyDescription="Start by creating your first user."
          actions={(row) => (
            <div className="flex justify-end gap-1">
              <RequirePermission code="ADMIN_UTILISATEURS" action="modification">
                <button
                  onClick={() => {
                    setEditing(row);
                    setFormOpen(true);
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                  aria-label="Edit"
                >
                  <FiEdit2 size={15} />
                </button>
              </RequirePermission>
              <RequirePermission code="ADMIN_UTILISATEURS" action="suppression">
                <button
                  onClick={() => setDeleting(row)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                  aria-label="Delete"
                >
                  <FiTrash2 size={15} />
                </button>
              </RequirePermission>
            </div>
          )}
        />
        <Pagination
          page={page}
          totalPages={listQuery.data?.totalPages ?? 0}
          totalElements={listQuery.data?.totalElements ?? 0}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </PageCard>

      <UserFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        initialData={editing}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete user"
        description={`Are you sure you want to delete "${deleting?.nomComplet}"? This action cannot be undone.`}
        isLoading={removeMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          removeMutation.mutate(deleting.idUtil, {
            onSuccess: () => setDeleting(null),
          })
        }
      />
    </div>
  );
}