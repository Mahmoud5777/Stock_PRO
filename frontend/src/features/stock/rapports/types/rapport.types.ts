import type { Article } from "@/features/stock/articles/types/article.types";
import type { MouvementStock } from "@/features/stock/mouvements/types/mouvement.types";

export interface RepartitionCategorie {
  nomCategorie: string;
  nombreArticles: number;
  valeurStock: number;
}

export interface RapportSynthese {
  nombreArticles: number;
  nombreCategories: number;
  nombreFournisseurs: number;
  nombreArticlesEnAlerte: number;
  valeurStockTotal: number;
  repartitionParCategorie: RepartitionCategorie[];
  derniersMouvements: MouvementStock[];
  articlesEnAlerte: Article[];
}
