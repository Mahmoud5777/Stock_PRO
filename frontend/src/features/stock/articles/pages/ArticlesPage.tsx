"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useArticles } from "../hooks/useArticles";
import { ArticleFormModal } from "../components/ArticleFormModal";
import type { Article } from "../types/article.types";
import type { ArticleFormValues } from "../validation/article.validation";
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
import { categorieService } from "@/features/stock/categories/services/categorie.service";
import { fournisseurService } from "@/features/stock/fournisseurs/services/fournisseur.service";

const PERMISSION_CODE = "ARTICLES";

function formatMontant(value?: number) {
  return (value ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ArticlesPage() {
  const {
    page, setPage, search, setSearch, sortKey, sortDirection, onSortChange,
    filters, updateFilters, resetFilters,
    listQuery, createMutation, updateMutation, removeMutation,
  } = useArticles();

  const { data: categories } = useQuery({ queryKey: ["categories", "all"], queryFn: categorieService.listAll });
  const { data: fournisseurs } = useQuery({ queryKey: ["fournisseurs", "all"], queryFn: fournisseurService.listAll });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState<Article | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filterDefs: FilterDef[] = [
    { key: "idCategorie", label: "Category", options: (categories ?? []).map((c) => ({ value: c.idCategorie, label: c.nomCategorie })) },
    { key: "idFournisseur", label: "Supplier", options: (fournisseurs ?? []).map((f) => ({ value: f.idFournisseur, label: f.nomFournisseur })) },
    { key: "actif", label: "Status", options: [{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }] },
  ];

  const filterValues: Record<string, string | undefined> = {
    idCategorie: typeof filters.idCategorie === "string" ? filters.idCategorie : undefined,
    idFournisseur: typeof filters.idFournisseur === "string" ? filters.idFournisseur : undefined,
    actif: filters.actif === undefined ? undefined : String(filters.actif),
  };

  function handleFilterValueChange(key: string, value: string | undefined) {
    if (key === "actif") {
      updateFilters({ actif: value === undefined ? undefined : value === "true" });
    } else {
      updateFilters({ [key]: value });
    }
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
      await downloadSpreadsheet("/articles/export", { search, filters }, "articles.xlsx");
      toast({ title: "Export complete", description: "The Excel file has been downloaded.", variant: "success" });
    } catch {
      toast({ title: "Error", description: "Unable to export the data.", variant: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  function handleSubmit(values: ArticleFormValues) {
    const input = {
      ...values,
      idCategorie: values.idCategorie || null,
      idFournisseur: values.idFournisseur || null,
    };
    if (editing) updateMutation.mutate({ id: editing.idArticle, input }, { onSuccess: () => setFormOpen(false) });
    else createMutation.mutate(input, { onSuccess: () => setFormOpen(false) });
  }

  const columns: DataTableColumn<Article>[] = [
    { key: "codeArticle", label: "Code", sortable: true },
    { key: "nomArticle", label: "Name", sortable: true },
    { key: "nomCategorie", label: "Category", render: (row) => row.nomCategorie ?? "-" },
    { key: "nomFournisseur", label: "Supplier", render: (row) => row.nomFournisseur ?? "-" },
    {
      key: "quantiteStock",
      label: "Stock",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span>{row.quantiteStock ?? 0} {row.unite ?? ""}</span>
          {row.enAlerte && <Badge variant="danger">Low stock</Badge>}
        </div>
      ),
    },
    { key: "prixVente", label: "Sale price", render: (row) => `${formatMontant(row.prixVente)} DT` },
    {
      key: "actif",
      label: "Status",
      render: (row) => <Badge variant={row.actif ? "success" : "neutral"}>{row.actif ? "Active" : "Inactive"}</Badge>,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Articles"
        description="Manage your article catalog and track stock levels."
        breadcrumb={[{ label: "Stock" }, { label: "Articles" }]}
        actions={
          <RequirePermission code={PERMISSION_CODE} action="ajout">
            <Button leftIcon={<FiPlus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
              New article
            </Button>
          </RequirePermission>
        }
      />

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search for an article..."
        filterDefs={filterDefs}
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
          rowKey={(row) => row.idArticle}
          isLoading={listQuery.isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          emptyTitle="No articles"
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

      <ArticleFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} initialData={editing} />
      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete article"
        description={`Are you sure you want to delete "${deleting?.nomArticle}"?`}
        isLoading={removeMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && removeMutation.mutate(deleting.idArticle, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
