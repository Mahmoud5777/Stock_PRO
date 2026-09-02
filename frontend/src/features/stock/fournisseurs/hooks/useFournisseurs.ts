"use client";

import { useEntityCrud } from "@/features/administration/shared/hooks/useEntityCrud";
import { fournisseurService } from "../services/fournisseur.service";

export function useFournisseurs() {
  return useEntityCrud(fournisseurService, { resourceKey: "fournisseurs", entityLabel: "the supplier" });
}
