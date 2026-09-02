"use client";

import { FiLogIn, FiLogOut, FiRefreshCw, FiActivity, FiXCircle } from "react-icons/fi";
import { useAuditLogs } from "../hooks/useAuditLogs";
import type { AuditLog, AuditActionType } from "../types/audit.types";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/utils/date";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

// Valeurs alignées sur l'enum backend AuditAction.java (voir audit.types.ts).
const ACTION_CONFIG: Record<AuditActionType, { label: string; variant: "success" | "danger" | "neutral" | "brand" | "warning"; icon: typeof FiLogIn }> = {
  LOGIN_SUCCESS: { label: "Successful login", variant: "success", icon: FiLogIn },
  LOGIN_FAILURE: { label: "Failed login", variant: "danger", icon: FiXCircle },
  LOGOUT: { label: "Logout", variant: "neutral", icon: FiLogOut },
  REFRESH_TOKEN: { label: "Token refresh", variant: "brand", icon: FiRefreshCw },
  ACCES_API: { label: "API call", variant: "warning", icon: FiActivity },
};

const ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  ...Object.entries(ACTION_CONFIG).map(([value, cfg]) => ({ value, label: cfg.label })),
];

/**
 * Page 100% lecture seule : consultation du journal des accès
 * (connexions, échecs, déconnexions, refresh de token, appels API authentifiés).
 * Aucune action de création/modification/suppression n'est proposée ici.
 */
export function AuditPage() {
  const { page, setPage, search, setSearch, action, setAction, sortKey, sortDirection, onSortChange, listQuery } = useAuditLogs();

  const columns: DataTableColumn<AuditLog>[] = [
    { key: "dateAcces", label: "Date & time", sortable: true, render: (row) => formatDate(row.dateAcces, true) },
    { key: "login", label: "User", render: (row) => row.login },
    {
      key: "action",
      label: "Event",
      render: (row) => {
        const cfg = ACTION_CONFIG[row.action];
        if (!cfg) return row.action;
        const Icon = cfg.icon;
        return (
          <Badge variant={cfg.variant}>
            <span className="flex items-center gap-1"><Icon size={12} /> {cfg.label}</span>
          </Badge>
        );
      },
    },
    {
      key: "endpoint",
      label: "Endpoint",
      render: (row) => (
        <span className="text-xs">
          {row.methodeHttp && <span className="font-mono font-medium text-slate-500 dark:text-slate-400">{row.methodeHttp}</span>}{" "}
          {row.endpoint ?? "-"}
          {row.statutHttp != null && (
            <span className={row.statutHttp >= 400 ? "ml-1 text-red-500" : "ml-1 text-slate-400"}>
              ({row.statutHttp})
            </span>
          )}
        </span>
      ),
    },
    { key: "adresseIp", label: "IP Address", render: (row) => row.adresseIp ?? "-" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Access Audit"
        description="View the history of logins, logouts, and API calls (read-only)."
        breadcrumb={[{ label: "Administration" }, { label: "Access Audit" }]}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by login..."
        actions={
          <Select
            options={ACTION_OPTIONS}
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-56"
          />
        }
      />
      <PageCard>
        <DataTable
          columns={columns}
          data={listQuery.data?.content ?? []}
          rowKey={(row) => row.idLog}
          isLoading={listQuery.isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          emptyTitle="No access events"
          emptyDescription="No login or access attempt recorded for these criteria."
        />
        <Pagination
          page={page}
          totalPages={listQuery.data?.totalPages ?? 0}
          totalElements={listQuery.data?.totalElements ?? 0}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </PageCard>
    </div>
  );
}
