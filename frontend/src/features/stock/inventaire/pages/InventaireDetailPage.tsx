"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck, FiLock } from "react-icons/fi";
import { useInventaireDetail } from "../hooks/useInventaireDetail";
import type { InventaireLigne } from "../types/inventaire.types";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Loader } from "@/components/ui/Loader";
import { RequirePermission } from "@/features/auth/components/RequirePermission";

const PERMISSION_CODE = "INVENTAIRE";

function LigneRow({
  ligne,
  disabled,
  onSave,
}: {
  ligne: InventaireLigne;
  disabled: boolean;
  onSave: (quantitePhysique: number) => void;
}) {
  const [value, setValue] = useState(ligne.quantitePhysique?.toString() ?? "");

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        step="0.01"
        className="w-28"
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
      />
      <RequirePermission code={PERMISSION_CODE} action="modification">
        <Button
          variant="outline"
          disabled={disabled || value === ""}
          onClick={() => onSave(Number(value))}
          leftIcon={<FiCheck size={14} />}
        >
          Confirm
        </Button>
      </RequirePermission>
    </div>
  );
}

export function InventaireDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { detailQuery, saisirLigneMutation, cloturerMutation } = useInventaireDetail(id);
  const [confirmCloture, setConfirmCloture] = useState(false);

  if (detailQuery.isLoading || !detailQuery.data) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  const inventaire = detailQuery.data;
  const isCloture = inventaire.statut === "CLOTURE";

  const columns: DataTableColumn<InventaireLigne>[] = [
    { key: "codeArticle", label: "Article", render: (row) => `${row.codeArticle} — ${row.nomArticle}` },
    { key: "quantiteTheorique", label: "Theoretical stock", render: (row) => `${row.quantiteTheorique} ${row.unite ?? ""}` },
    {
      key: "quantitePhysique",
      label: "Counted quantity",
      render: (row) => (
        <LigneRow
          ligne={row}
          disabled={isCloture}
          onSave={(quantitePhysique) => saisirLigneMutation.mutate({ idLigne: row.idLigne, quantitePhysique })}
        />
      ),
    },
    {
      key: "ecart",
      label: "Discrepancy",
      render: (row) =>
        row.ecart == null ? (
          "-"
        ) : (
          <Badge variant={row.ecart === 0 ? "neutral" : row.ecart > 0 ? "success" : "danger"}>
            {row.ecart > 0 ? `+${row.ecart}` : row.ecart}
          </Badge>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Breadcrumb items={[{ label: "Stock" }, { label: "Inventaire", href: "/inventaire" }, { label: inventaire.codeInventaire }]} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventaire {inventaire.codeInventaire}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Site: {inventaire.nomSite} · Manager: {inventaire.nomResponsable ?? "-"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isCloture ? "neutral" : "warning"}>{isCloture ? "Closed" : "In progress"}</Badge>
            {!isCloture && (
              <RequirePermission code={PERMISSION_CODE} action="modification">
                <Button leftIcon={<FiLock size={14} />} onClick={() => setConfirmCloture(true)}>
                  Close inventory
                </Button>
              </RequirePermission>
            )}
          </div>
        </div>
      </div>

      <Button variant="ghost" leftIcon={<FiArrowLeft size={14} />} onClick={() => router.push("/inventaire")} className="w-fit">
        Back to list
      </Button>

      <PageCard>
        <DataTable
          columns={columns}
          data={inventaire.lignes ?? []}
          rowKey={(row) => row.idLigne}
          emptyTitle="No articles to inventory"
        />
      </PageCard>

      <ConfirmDialog
        isOpen={confirmCloture}
        title="Close inventory"
        description="Observed discrepancies will be applied to theoretical stock and adjustment movements will be generated. This action cannot be undone."
        isLoading={cloturerMutation.isPending}
        onCancel={() => setConfirmCloture(false)}
        onConfirm={() => cloturerMutation.mutate(undefined, { onSuccess: () => setConfirmCloture(false) })}
      />
    </div>
  );
}
