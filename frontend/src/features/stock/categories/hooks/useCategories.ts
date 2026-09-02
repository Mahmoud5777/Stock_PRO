"use client";

import { useEntityCrud } from "@/features/administration/shared/hooks/useEntityCrud";
import { categorieService } from "../services/categorie.service";

export function useCategories() {
  return useEntityCrud(categorieService, { resourceKey: "categories", entityLabel: "the category" });
}
