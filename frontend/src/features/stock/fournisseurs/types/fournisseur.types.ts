// Based on FournisseurDTO.java
export interface Fournisseur {
  idFournisseur: string;
  codeFournisseur: string;
  nomFournisseur: string;
  contact?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
}

export interface FournisseurInput {
  codeFournisseur: string;
  nomFournisseur: string;
  contact?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
}
