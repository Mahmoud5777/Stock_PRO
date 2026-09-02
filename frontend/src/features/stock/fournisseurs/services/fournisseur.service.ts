import { apiClient } from "@/lib/axios";
import type { Page, PageRequest } from "@/types/common";
import type { CrudService } from "@/features/administration/shared/types/crud-service.types";
import type { Fournisseur, FournisseurInput } from "../types/fournisseur.types";

export const fournisseurService = {
  async list(params: PageRequest): Promise<Page<Fournisseur>> {
    const { filters, ...rest } = params;
    const { data } = await apiClient.get<Page<Fournisseur>>("/fournisseurs", { params: { ...rest, ...filters } });
    return data;
  },
  async create(input: FournisseurInput): Promise<Fournisseur> {
    const { data } = await apiClient.post<Fournisseur>("/fournisseurs", input);
    return data;
  },
  async update(id: string, input: FournisseurInput): Promise<Fournisseur> {
    const { data } = await apiClient.put<Fournisseur>(`/fournisseurs/${id}`, input);
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/fournisseurs/${id}`);
  },
  async listAll(): Promise<Fournisseur[]> {
    const { data } = await apiClient.get<Fournisseur[]>("/fournisseurs/all");
    return data;
  },
} satisfies CrudService<Fournisseur, FournisseurInput>;
