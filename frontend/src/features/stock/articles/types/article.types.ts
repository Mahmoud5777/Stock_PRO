// Basé sur ArticleDTO.java
export interface Article {
  idArticle: string;
  codeArticle: string;
  nomArticle: string;
  description?: string;
  unite?: string;
  prixAchat: number;
  prixVente: number;
  seuilAlerte: number;
  actif: boolean;
  idCategorie?: string | null;
  nomCategorie?: string | null;
  idFournisseur?: string | null;
  nomFournisseur?: string | null;
  /** Quantité totale en stock tous sites confondus, calculée côté backend. */
  quantiteStock?: number;
  /** Vrai si quantiteStock <= seuilAlerte, calculé côté backend. */
  enAlerte?: boolean;
}

export interface ArticleInput {
  codeArticle: string;
  nomArticle: string;
  description?: string;
  unite?: string;
  prixAchat: number;
  prixVente: number;
  seuilAlerte: number;
  actif: boolean;
  idCategorie?: string | null;
  idFournisseur?: string | null;
}

export interface StockParSite {
  idArticle: string;
  nomArticle: string;
  idSite: string;
  nomSite: string;
  quantite: number;
}
