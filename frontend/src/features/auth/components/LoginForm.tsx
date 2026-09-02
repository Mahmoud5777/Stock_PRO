"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FiLock, FiUser } from "react-icons/fi";
import { loginSchema, type LoginFormValues } from "../validation/auth.validation";
import { useLogin } from "../hooks/useLogin";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const { mutate, isPending, errorMessage } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  return (
    <form onSubmit={handleSubmit((values) => mutate(values))} className="flex flex-col gap-4">
      <Input
        label="Username"
        placeholder="e.g. admin"
        leftIcon={<FiUser size={16} />}
        error={errors.login?.message}
        {...register("login")}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        leftIcon={<FiLock size={16} />}
        error={errors.motPasse?.message}
        {...register("motPasse")}
      />

      {errorMessage && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        isLoading={isPending}
        className="mt-2 w-full bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-700 hover:to-emerald-600"
      >
        Log in
      </Button>
    </form>
  );
}
