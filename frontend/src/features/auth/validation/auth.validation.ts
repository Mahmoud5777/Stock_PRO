import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().min(1, "Username is required"),
  motPasse: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
