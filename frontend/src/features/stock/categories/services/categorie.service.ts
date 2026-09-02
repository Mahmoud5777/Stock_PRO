import { apiClient } from "@/lib/axios";
import type { Page, PageRequest } from "@/types/common";
import type { CrudService } from "@/features/administration/shared/types/crud-service.types";
import type { Categorie, CategorieInput } from "../types/categorie.types";

export const categorieService = {
  async list(params: PageRequest): Promise<Page<Categorie>> {
    const { filters, ...rest } = params;
    const { data } = await apiClient.get<Page<Categorie>>("/categories", { params: { ...rest, ...filters } });
    return data;
  },
  async create(input: CategorieInput): Promise<Categorie> {
    const { data } = await apiClient.post<Categorie>("/categories", input);
    return data;
  },
  async update(id: string, input: CategorieInput): Promise<Categorie> {
    const { data } = await apiClient.put<Categorie>(`/categories/${id}`, input);
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },
  async listAll(): Promise<Categorie[]> {
    const { data } = await apiClient.get<Categorie[]>("/categories/all");
    return data;
  },
} satisfies CrudService<Categorie, CategorieInput>;
