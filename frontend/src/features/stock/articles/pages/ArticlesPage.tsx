"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useArticles } from "../hooks/useArticles";
import { ArticleFormModal } from "../components/ArticleFormModal";
import type { Article } from "../types/article.types";
import type { ArticleFormValues } from "../validation/article.validation";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

const PERMISSION_CODE = "ARTICLES";

function formatMontant(value?: number) {
  return (value ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ArticlesPage() {
  const {
    page, setPage, search, setSearch, sortKey, sortDirection, onSortChange,
    listQuery, createMutation, updateMutation, removeMutation,
  } = useArticles();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState<Article | null>(null);

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
    { key: "nomArticle", label: "Nom", sortable: true },
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
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search for an article..."
        actions={
          <RequirePermission code={PERMISSION_CODE} action="ajout">
            <Button leftIcon={<FiPlus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
              New article
            </Button>
          </RequirePermission>
        }
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
