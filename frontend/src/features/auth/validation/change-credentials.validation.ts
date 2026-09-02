import { z } from "zod";

export const changeCredentialsSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newLogin: z
      .string()
      .trim()
      .refine((val) => val === "" || val.length >= 3, {
        message: "Login must be at least 3 characters",
      })
      .optional(),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "The new password must be different from the current one",
    path: ["newPassword"],
  });

export type ChangeCredentialsFormValues = z.infer<typeof changeCredentialsSchema>;
