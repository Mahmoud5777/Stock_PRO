import { apiClient } from "@/lib/axios";
import type { Page, PageRequest } from "@/types/common";
import type { Inventaire, StatutInventaire } from "../types/inventaire.types";

export const inventaireService = {
  async list(params: PageRequest & { idSite?: string; statut?: StatutInventaire }): Promise<Page<Inventaire>> {
    const { filters, idSite, statut, ...rest } = params;
    const { data } = await apiClient.get<Page<Inventaire>>("/inventaires", { params: { ...rest, idSite, statut, ...filters } });
    return data;
  },
  async findById(id: string): Promise<Inventaire> {
    const { data } = await apiClient.get<Inventaire>(`/inventaires/${id}`);
    return data;
  },
  async create(idSite: string): Promise<Inventaire> {
    const { data } = await apiClient.post<Inventaire>("/inventaires", { idSite });
    return data;
  },
  async saisirLigne(idInventaire: string, idLigne: string, quantitePhysique: number): Promise<Inventaire> {
    const { data } = await apiClient.put<Inventaire>(`/inventaires/${idInventaire}/lignes/${idLigne}`, { quantitePhysique });
    return data;
  },
  async cloturer(id: string): Promise<Inventaire> {
    const { data } = await apiClient.post<Inventaire>(`/inventaires/${id}/cloturer`);
    return data;
  },
};
