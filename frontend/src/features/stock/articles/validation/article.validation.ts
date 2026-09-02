import { z } from "zod";

export const articleSchema = z.object({
  codeArticle: z.string().min(1, "Article code is required"),
  nomArticle: z.string().min(2, "Article name is required"),
  description: z.string().optional(),
  unite: z.string().optional(),
  prixAchat: z.coerce.number().min(0, "Purchase price must be positive"),
  prixVente: z.coerce.number().min(0, "Selling price must be positive"),
  seuilAlerte: z.coerce.number().min(0, "Alert threshold must be positive"),
  actif: z.boolean(),
  idCategorie: z.string().optional().nullable(),
  idFournisseur: z.string().optional().nullable(),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;
