"use client";

import { FiShield } from "react-icons/fi";
import { ChangeCredentialsForm } from "@/features/auth/components/ChangeCredentialsForm";
import { RequireTemporaryAccount } from "@/features/auth/components/RequireTemporaryAccount";

export default function ChangePasswordPage() {
  return (
    <RequireTemporaryAccount>
      <div className="flex min-h-screen">
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 p-12 text-white lg:flex">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <FiShield size={20} />
            </div>
            <span className="font-display text-xl font-semibold">StockPro</span>
          </div>
          <div>
            <h1 className="font-display text-4xl font-semibold leading-tight">
              Secure <br /> your account.
            </h1>
            <p className="mt-4 max-w-md text-brand-100/80">
              This account was created with a temporary password. Please choose your
              permanent credentials before continuing.
            </p>
          </div>
          <p className="text-sm text-brand-200/60">© {new Date().getFullYear()} StockPro</p>
        </div>

        <div className="flex w-full flex-col justify-center px-6 sm:px-16 lg:w-1/2">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
              Mandatory change
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              For security reasons, you must set a new password (and optionally a new
              login) before accessing the application.
            </p>
            <div className="mt-8">
              <ChangeCredentialsForm />
            </div>
          </div>
        </div>
      </div>
    </RequireTemporaryAccount>
  );
}
