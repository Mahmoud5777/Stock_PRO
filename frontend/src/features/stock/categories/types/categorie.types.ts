// Based on CategorieDTO.java
export interface Categorie {
  idCategorie: string;
  codeCategorie: string;
  nomCategorie: string;
  description?: string;
  nombreArticles?: number;
}

export interface CategorieInput {
  codeCategorie: string;
  nomCategorie: string;
  description?: string;
}
