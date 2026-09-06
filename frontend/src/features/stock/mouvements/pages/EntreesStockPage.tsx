"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { useMouvementsStock } from "../hooks/useMouvementsStock";
import { MouvementFormModal } from "../components/MouvementFormModal";
import type { MouvementFormValues } from "../validation/mouvement.validation";
import type { MouvementStock } from "../types/mouvement.types";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { SearchFilterBar, type FilterDef } from "@/features/administration/shared/components/SearchFilterBar";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { downloadSpreadsheet } from "@/lib/download";
import { toast } from "@/store/toast.store";
import { siteService } from "@/features/administration/sites/services/site.service";

const PERMISSION_CODE = "ENTREES_STOCK";

function formatDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

export function EntreesStockPage() {
  const { page, setPage, search, setSearch, idSite, setIdSite, listQuery, createMutation } = useMouvementsStock("entrees");
  const { data: sites } = useQuery({ queryKey: ["sites", "all"], queryFn: siteService.listAll });
  const [formOpen, setFormOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filterDefs: FilterDef[] = [
    { key: "idSite", label: "Site", options: (sites ?? []).map((s) => ({ value: s.idSite, label: s.nomSite })) },
  ];

  function handleResetAll() {
    setActiveFilters([]);
    setIdSite(undefined);
    setSearch("");
  }

  const [isExporting, setIsExporting] = useState(false);
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadSpreadsheet("/mouvements-stock/entrees/export", { search, filters: { idSite } }, "stock-in.xlsx");
      toast({ title: "Export complete", description: "The Excel file has been downloaded.", variant: "success" });
    } catch {
      toast({ title: "Error", description: "Unable to export the data.", variant: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  function handleSubmit(values: MouvementFormValues) {
    createMutation.mutate(values, { onSuccess: () => setFormOpen(false) });
  }

  const columns: DataTableColumn<MouvementStock>[] = [
    { key: "dateMouvement", label: "Date", render: (row) => formatDate(row.dateMouvement) },
    { key: "codeArticle", label: "Article", render: (row) => `${row.codeArticle} — ${row.nomArticle}` },
    { key: "nomSite", label: "Site" },
    { key: "quantite", label: "Quantity", render: (row) => `+${row.quantite}` },
    { key: "referenceDoc", label: "Reference", render: (row) => row.referenceDoc || "-" },
    { key: "motif", label: "Reason", render: (row) => row.motif || "-" },
    { key: "nomUtilisateur", label: "Recorded by", render: (row) => row.nomUtilisateur || "-" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Stock In"
        description="History of stock receptions and supplies."
        breadcrumb={[{ label: "Stock" }, { label: "Stock In" }]}
        actions={
          <RequirePermission code={PERMISSION_CODE} action="ajout">
            <Button leftIcon={<FiPlus size={16} />} onClick={() => setFormOpen(true)}>
              New stock in
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
        filterValues={{ idSite }}
        onFilterValueChange={(key, value) => { if (key === "idSite") setIdSite(value); }}
        onAddFilter={(key) => setActiveFilters((prev) => [...prev, key])}
        onRemoveFilter={(key) => { setActiveFilters((prev) => prev.filter((k) => k !== key)); setIdSite(undefined); }}
        onResetAll={handleResetAll}
        permissionCode={PERMISSION_CODE}
        onExport={handleExport}
        isExporting={isExporting}
      />
      <PageCard>
        <DataTable
          columns={columns}
          data={listQuery.data?.content ?? []}
          rowKey={(row) => row.idMouvement}
          isLoading={listQuery.isLoading}
          emptyTitle="No stock in records"
        />
        <Pagination page={page} totalPages={listQuery.data?.totalPages ?? 0} totalElements={listQuery.data?.totalElements ?? 0} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} />
      </PageCard>

      <MouvementFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} isSubmitting={createMutation.isPending} type="entrees" />
    </div>
  );
}
