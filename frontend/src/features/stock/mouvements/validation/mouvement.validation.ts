import { z } from "zod";

export const mouvementSchema = z.object({
  idArticle: z.string().min(1, "L'article est requis"),
  idSite: z.string().min(1, "Le site est requis"),
  quantite: z.coerce.number().positive("Quantity must be strictly positive"),
  motif: z.string().optional(),
  referenceDoc: z.string().optional(),
});

export type MouvementFormValues = z.infer<typeof mouvementSchema>;
