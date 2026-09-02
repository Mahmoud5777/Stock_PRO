import { z } from "zod";

export const siteSchema = z.object({
  codeSite: z.string().min(1, "Site code is required"),
  nomSite: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  idSiteParent: z.string().optional().nullable(),
});

export type SiteFormValues = z.infer<typeof siteSchema>;
