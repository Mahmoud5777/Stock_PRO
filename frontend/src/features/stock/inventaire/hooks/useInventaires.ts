"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventaireService } from "../services/inventaire.service";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { toast } from "@/store/toast.store";

export function useInventaires() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [idSite, setIdSite] = useState<string | undefined>(undefined);

  const listQuery = useQuery({
    queryKey: ["inventaires", "list", { page, idSite }],
    queryFn: () => inventaireService.list({ page, size: DEFAULT_PAGE_SIZE, idSite }),
    placeholderData: (prev) => prev,
  });

  const createMutation = useMutation({
    mutationFn: (site: string) => inventaireService.create(site),
    onSuccess: () => {
      toast({ title: "Inventaire ouvert", description: "Le comptage peut commencer.", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["inventaires", "list"] });
    },
    onError: () => toast({ title: "Erreur", description: "Impossible d'ouvrir l'inventaire.", variant: "error" }),
  });

  return {
    page,
    setPage: (value: number) => setPage(value),
    idSite,
    setIdSite: (value: string | undefined) => { setIdSite(value); setPage(0); },
    listQuery,
    createMutation,
  };
}
