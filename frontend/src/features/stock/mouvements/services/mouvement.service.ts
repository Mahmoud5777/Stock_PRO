import { apiClient } from "@/lib/axios";
import type { Page, PageRequest } from "@/types/common";
import type { MouvementCreateInput, MouvementStock } from "../types/mouvement.types";

async function listByType(
  endpoint: "entrees" | "sorties",
  params: PageRequest & { idSite?: string }
): Promise<Page<MouvementStock>> {
  const { filters, idSite, ...rest } = params;
  const { data } = await apiClient.get<Page<MouvementStock>>(`/mouvements-stock/${endpoint}`, {
    params: { ...rest, idSite, ...filters },
  });
  return data;
}

export const mouvementService = {
  listEntrees: (params: PageRequest & { idSite?: string }) => listByType("entrees", params),
  listSorties: (params: PageRequest & { idSite?: string }) => listByType("sorties", params),
  async creerEntree(input: MouvementCreateInput): Promise<MouvementStock> {
    const { data } = await apiClient.post<MouvementStock>("/mouvements-stock/entrees", input);
    return data;
  },
  async creerSortie(input: MouvementCreateInput): Promise<MouvementStock> {
    const { data } = await apiClient.post<MouvementStock>("/mouvements-stock/sorties", input);
    return data;
  },
  async derniersMouvements(): Promise<MouvementStock[]> {
    const { data } = await apiClient.get<MouvementStock[]>("/mouvements-stock/recents");
    return data;
  },
};
