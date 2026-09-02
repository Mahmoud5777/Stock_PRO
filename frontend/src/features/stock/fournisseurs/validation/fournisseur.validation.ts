import { z } from "zod";

export const fournisseurSchema = z.object({
  codeFournisseur: z.string().min(1, "Le code fournisseur est requis"),
  nomFournisseur: z.string().min(2, "Le nom du fournisseur est requis"),
  contact: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email("Format d'email invalide").optional().or(z.literal("")),
  adresse: z.string().optional(),
});

export type FournisseurFormValues = z.infer<typeof fournisseurSchema>;
