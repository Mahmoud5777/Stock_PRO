"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FiPlus, FiEye } from "react-icons/fi";
import { useInventaires } from "../hooks/useInventaires";
import { NouvelInventaireModal } from "../components/NouvelInventaireModal";
import type { Inventaire, StatutInventaire } from "../types/inventaire.types";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { SearchFilterBar, type FilterDef } from "@/features/administration/shared/components/SearchFilterBar";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { downloadSpreadsheet } from "@/lib/download";
import { toast } from "@/store/toast.store";
import { siteService } from "@/features/administration/sites/services/site.service";

const PERMISSION_CODE = "INVENTAIRE";

function formatDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

export function InventairesPage() {
  const router = useRouter();
  const { page, setPage, search, setSearch, idSite, setIdSite, statut, setStatut, listQuery, createMutation } = useInventaires();
  const { data: sites } = useQuery({ queryKey: ["sites", "all"], queryFn: siteService.listAll });
  const [formOpen, setFormOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filterDefs: FilterDef[] = [
    { key: "idSite", label: "Site", options: (sites ?? []).map((s) => ({ value: s.idSite, label: s.nomSite })) },
    { key: "statut", label: "Status", options: [{ value: "EN_COURS", label: "In progress" }, { value: "CLOTURE", label: "Closed" }] },
  ];

  function handleFilterValueChange(key: string, value: string | undefined) {
    if (key === "idSite") setIdSite(value);
    else if (key === "statut") setStatut(value as StatutInventaire | undefined);
  }
  function handleRemoveFilter(key: string) {
    setActiveFilters((prev) => prev.filter((k) => k !== key));
    handleFilterValueChange(key, undefined);
  }
  function handleResetAll() {
    setActiveFilters([]);
    setIdSite(undefined);
    setStatut(undefined);
    setSearch("");
  }

  function handleConfirm(site: string) {
    createMutation.mutate(site, {
      onSuccess: (inventaire) => {
        setFormOpen(false);
        router.push(`/inventaire/${inventaire.idInventaire}`);
      },
    });
  }

  const [isExporting, setIsExporting] = useState(false);
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadSpreadsheet("/inventaires/export", { search, filters: { idSite, statut } }, "inventory.xlsx");
      toast({ title: "Export complete", description: "The Excel file has been downloaded.", variant: "success" });
    } catch {
      toast({ title: "Error", description: "Unable to export the data.", variant: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  const columns: DataTableColumn<Inventaire>[] = [
    { key: "codeInventaire", label: "Code" },
    { key: "nomSite", label: "Site" },
    { key: "dateInventaire", label: "Opening date", render: (row) => formatDate(row.dateInventaire) },
    { key: "nomResponsable", label: "Manager", render: (row) => row.nomResponsable || "-" },
    {
      key: "statut",
      label: "Status",
      render: (row) => (
        <Badge variant={row.statut === "CLOTURE" ? "neutral" : "warning"}>
          {row.statut === "CLOTURE" ? "Closed" : "In progress"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Inventory"
        description="Launch physical count campaigns and adjust theoretical stock."
        breadcrumb={[{ label: "Stock" }, { label: "Inventory" }]}
        actions={
          <RequirePermission code={PERMISSION_CODE} action="ajout">
            <Button leftIcon={<FiPlus size={16} />} onClick={() => setFormOpen(true)}>
              New inventory
            </Button>
          </RequirePermission>
        }
      />
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by inventory code..."
        filterDefs={filterDefs}
        activeFilterKeys={activeFilters}
        filterValues={{ idSite, statut }}
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
          rowKey={(row) => row.idInventaire}
          isLoading={listQuery.isLoading}
          emptyTitle="No inventories"
          actions={(row) => (
            <button
              onClick={() => router.push(`/inventaire/${row.idInventaire}`)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
              title="View"
            >
              <FiEye size={15} />
            </button>
          )}
        />
        <Pagination page={page} totalPages={listQuery.data?.totalPages ?? 0} totalElements={listQuery.data?.totalElements ?? 0} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} />
      </PageCard>

      <NouvelInventaireModal isOpen={formOpen} onClose={() => setFormOpen(false)} onConfirm={handleConfirm} isSubmitting={createMutation.isPending} />
    </div>
  );
}
