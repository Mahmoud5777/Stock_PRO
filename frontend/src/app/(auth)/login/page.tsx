import { FiBarChart2 } from "react-icons/fi";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = { title: "Log in — StockPro" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-600 to-emerald-500 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 text-white shadow-lg">
            <FiBarChart2 size={28} />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold text-slate-900 dark:text-white">
            StockPro
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Log in to manage your inventory
          </p>
        </div>

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
