import { apiClient } from "@/lib/axios";
import type { Page, PageRequest } from "@/types/common";
import type { CrudService } from "@/features/administration/shared/types/crud-service.types";
import type { Article, ArticleInput, StockParSite } from "../types/article.types";

export const articleService: CrudService<Article, ArticleInput> & {
  listAlertes: () => Promise<Article[]>;
  stockParSite: (idArticle: string) => Promise<StockParSite[]>;
} = {
  async list(params: PageRequest): Promise<Page<Article>> {
    const { filters, ...rest } = params;
    const { data } = await apiClient.get<Page<Article>>("/articles", { params: { ...rest, ...filters } });
    return data;
  },
  async create(input: ArticleInput): Promise<Article> {
    const { data } = await apiClient.post<Article>("/articles", input);
    return data;
  },
  async update(id: string, input: ArticleInput): Promise<Article> {
    const { data } = await apiClient.put<Article>(`/articles/${id}`, input);
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/articles/${id}`);
  },
  async listAll(): Promise<Article[]> {
    const { data } = await apiClient.get<Article[]>("/articles/all");
    return data;
  },
  async listAlertes(): Promise<Article[]> {
    const { data } = await apiClient.get<Article[]>("/articles/alertes");
    return data;
  },
  async stockParSite(idArticle: string): Promise<StockParSite[]> {
    const { data } = await apiClient.get<StockParSite[]>(`/articles/${idArticle}/stock-par-site`);
    return data;
  },
};
