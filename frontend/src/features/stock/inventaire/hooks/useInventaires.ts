"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventaireService } from "../services/inventaire.service";
import type { StatutInventaire } from "../types/inventaire.types";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { toast } from "@/store/toast.store";

export function useInventaires() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearchState] = useState("");
  const [idSite, setIdSiteState] = useState<string | undefined>(undefined);
  const [statut, setStatutState] = useState<StatutInventaire | undefined>(undefined);

  const listQuery = useQuery({
    queryKey: ["inventaires", "list", { page, search, idSite, statut }],
    queryFn: () => inventaireService.list({ page, size: DEFAULT_PAGE_SIZE, search, idSite, statut }),
    placeholderData: (prev) => prev,
  });

  const createMutation = useMutation({
    mutationFn: (site: string) => inventaireService.create(site),
    onSuccess: () => {
      toast({ title: "Inventory opened", description: "Counting can now begin.", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["inventaires", "list"] });
    },
    onError: () => toast({ title: "Error", description: "Unable to open the inventory.", variant: "error" }),
  });

  return {
    page,
    setPage: (value: number) => setPage(value),
    search,
    setSearch: (value: string) => { setSearchState(value); setPage(0); },
    idSite,
    setIdSite: (value: string | undefined) => { setIdSiteState(value); setPage(0); },
    statut,
    setStatut: (value: StatutInventaire | undefined) => { setStatutState(value); setPage(0); },
    listQuery,
    createMutation,
  };
}
