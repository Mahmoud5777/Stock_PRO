import { z } from "zod";

export const categorieSchema = z.object({
  codeCategorie: z.string().min(1, "Category code is required"),
  nomCategorie: z.string().min(2, "Category name is required"),
  description: z.string().optional(),
});

export type CategorieFormValues = z.infer<typeof categorieSchema>;
