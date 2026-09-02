"use client";

import { useQuery } from "@tanstack/react-query";
import { FiBox, FiTag, FiTruck, FiAlertTriangle, FiDollarSign } from "react-icons/fi";
import { rapportService } from "../services/rapport.service";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import type { RepartitionCategorie } from "../types/rapport.types";
import type { MouvementStock } from "@/features/stock/mouvements/types/mouvement.types";
import type { Article } from "@/features/stock/articles/types/article.types";

function formatMontant(value: number) {
  return `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

export function RapportsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["rapports", "synthese"], queryFn: rapportService.synthese });

  const repartitionColumns: DataTableColumn<RepartitionCategorie>[] = [
    { key: "nomCategorie", label: "Category" },
    { key: "nombreArticles", label: "Articles" },
    { key: "valeurStock", label: "Stock value", render: (row) => formatMontant(row.valeurStock) },
  ];

  const mouvementsColumns: DataTableColumn<MouvementStock>[] = [
    { key: "dateMouvement", label: "Date", render: (row) => formatDate(row.dateMouvement) },
    { key: "typeMouvement", label: "Type", render: (row) => (
      <Badge variant={row.typeMouvement === "ENTREE" ? "success" : row.typeMouvement === "SORTIE" ? "danger" : "warning"}>
        {row.typeMouvement === "ENTREE" ? "Stock in" : row.typeMouvement === "SORTIE" ? "Stock out" : "Adjustment"}
      </Badge>
    ) },
    { key: "nomArticle", label: "Article", render: (row) => `${row.codeArticle} — ${row.nomArticle}` },
    { key: "nomSite", label: "Site" },
    { key: "quantite", label: "Quantity" },
  ];

  const alertesColumns: DataTableColumn<Article>[] = [
    { key: "codeArticle", label: "Code" },
    { key: "nomArticle", label: "Article" },
    { key: "quantiteStock", label: "Current stock", render: (row) => `${row.quantiteStock ?? 0} ${row.unite ?? ""}` },
    { key: "seuilAlerte", label: "Alert threshold", render: (row) => `${row.seuilAlerte} ${row.unite ?? ""}` },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Reports"
        description="Overview of your stock: valuation, alerts, and recent movements."
        breadcrumb={[{ label: "Stock" }, { label: "Reports" }]}
      />

      {isLoading || !data ? (
        <div className="flex justify-center py-20"><Loader /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Articles" value={data.nombreArticles} icon={FiBox} accent="brand" />
            <StatCard label="Categories" value={data.nombreCategories} icon={FiTag} accent="brand" />
            <StatCard label="Suppliers" value={data.nombreFournisseurs} icon={FiTruck} accent="brand" />
            <StatCard label="Articles on alert" value={data.nombreArticlesEnAlerte} icon={FiAlertTriangle} accent="rose" />
            <StatCard label="Stock value" value={formatMontant(data.valeurStockTotal)} icon={FiDollarSign} accent="emerald" />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <PageCard>
              <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Breakdown by category</h2>
              <DataTable columns={repartitionColumns} data={data.repartitionParCategorie} rowKey={(row) => row.nomCategorie} emptyTitle="No data" />
            </PageCard>
            <PageCard>
              <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Low-stock alerts</h2>
              <DataTable columns={alertesColumns} data={data.articlesEnAlerte} rowKey={(row) => row.idArticle} emptyTitle="No alerts, everything is under control" />
            </PageCard>
          </div>

          <PageCard>
            <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Recent stock movements</h2>
            <DataTable columns={mouvementsColumns} data={data.derniersMouvements} rowKey={(row) => row.idMouvement} emptyTitle="No recent movements" />
          </PageCard>
        </>
      )}
    </div>
  );
}
