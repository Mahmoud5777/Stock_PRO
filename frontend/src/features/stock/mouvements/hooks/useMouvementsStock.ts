"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mouvementService } from "../services/mouvement.service";
import type { MouvementCreateInput } from "../types/mouvement.types";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { toast } from "@/store/toast.store";

type Type = "entrees" | "sorties";

const LABELS: Record<Type, { entite: string; verbe: string }> = {
  entrees: { entite: "the stock in", verbe: "recorded" },
  sorties: { entite: "the stock out", verbe: "recorded" },
};

export function useMouvementsStock(type: Type) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [idSite, setIdSite] = useState<string | undefined>(undefined);

  const resourceKey = `mouvements-${type}`;

  const listQuery = useQuery({
    queryKey: [resourceKey, "list", { page, search, idSite }],
    queryFn: () =>
      type === "entrees"
        ? mouvementService.listEntrees({ page, size: DEFAULT_PAGE_SIZE, search, idSite })
        : mouvementService.listSorties({ page, size: DEFAULT_PAGE_SIZE, search, idSite }),
    placeholderData: (prev) => prev,
  });

  const createMutation = useMutation({
    mutationFn: (input: MouvementCreateInput) =>
      type === "entrees" ? mouvementService.creerEntree(input) : mouvementService.creerSortie(input),
    onSuccess: () => {
      toast({ title: "Saved", description: `${LABELS[type].entite} has been ${LABELS[type].verbe}.`, variant: "success" });
      queryClient.invalidateQueries({ queryKey: [resourceKey, "list"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? `Impossible d'enregistrer ${LABELS[type].entite}.`;
      toast({ title: "Erreur", description: message, variant: "error" });
    },
  });

  return {
    page,
    setPage: (value: number) => setPage(value),
    search,
    setSearch: (value: string) => { setSearch(value); setPage(0); },
    idSite,
    setIdSite: (value: string | undefined) => { setIdSite(value); setPage(0); },
    listQuery,
    createMutation,
  };
}
