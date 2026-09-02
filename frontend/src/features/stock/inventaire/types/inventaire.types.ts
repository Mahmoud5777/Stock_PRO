// Basé sur InventaireDTO.java / InventaireLigneDTO.java
export type StatutInventaire = "EN_COURS" | "CLOTURE";

export interface InventaireLigne {
  idLigne: string;
  idArticle: string;
  codeArticle: string;
  nomArticle: string;
  unite?: string;
  quantiteTheorique: number;
  quantitePhysique?: number | null;
  ecart?: number | null;
}

export interface Inventaire {
  idInventaire: string;
  codeInventaire: string;
  idSite: string;
  nomSite: string;
  nomResponsable?: string | null;
  statut: StatutInventaire;
  dateInventaire: string;
  dateCloture?: string | null;
  nombreEcarts?: number;
  lignes?: InventaireLigne[];
}
