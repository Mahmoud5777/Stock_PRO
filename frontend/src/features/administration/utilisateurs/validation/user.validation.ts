import { z } from "zod";

export const userSchema = z.object({
  nomComplet: z.string().min(2, "Le nom complet est requis"),
  login: z.string().min(3, "Login must be at least 3 characters"),
  email: z.string().email("Adresse email invalide"),
  telephone: z.string().optional(),
  etatCompte: z.boolean(),
  motPasse: z.string().min(8, "Minimum 8 characters").optional().or(z.literal("")),
  siteIds: z.array(z.string()).min(1, "Select at least one site"),
});

export type UserFormValues = z.infer<typeof userSchema>;
