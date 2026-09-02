// Basé sur MouvementStockDTO.java
export type TypeMouvement = "ENTREE" | "SORTIE" | "AJUSTEMENT";

export interface MouvementStock {
  idMouvement: string;
  idArticle: string;
  codeArticle: string;
  nomArticle: string;
  idSite: string;
  nomSite: string;
  nomUtilisateur?: string | null;
  typeMouvement: TypeMouvement;
  quantite: number;
  quantiteAvant?: number;
  quantiteApres?: number;
  motif?: string;
  referenceDoc?: string;
  dateMouvement: string;
}

export interface MouvementCreateInput {
  idArticle: string;
  idSite: string;
  quantite: number;
  motif?: string;
  referenceDoc?: string;
}
