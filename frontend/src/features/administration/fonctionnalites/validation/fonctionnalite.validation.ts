import { z } from "zod";

export const fonctionnaliteSchema = z.object({
  codeFonc: z.string().min(1, "Code is required").max(30, "Maximum 30 characters"),
  libelle: z.string().min(2, "Name is required").max(100, "Maximum 100 characters"),
  description: z.string().optional(),
  url: z.string().optional(),
  icone: z.string().optional(),
  orderAffichage: z.coerce.number().optional(),
  actif: z.boolean(),
  idApp: z.string().min(1, "L'application est requise"),
  idFoncMere: z.string().optional().nullable(),
});

export type FonctionnaliteFormValues = z.infer<typeof fonctionnaliteSchema>;
