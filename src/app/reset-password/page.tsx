"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

function ResetPasswordForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Jeton de réinitialisation manquant ou invalide.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage(t('auth.password_mismatch'));
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(t('auth.password_updated'));
      } else {
        setStatus("error");
        setMessage(data.message || t('auth.error_network'));
      }
    } catch (err) {
      setStatus("error");
      setMessage(t('auth.error_network'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      <Link href="/learn" className="absolute top-6 left-6 p-2 text-slate-500 hover:text-slate-800 transition-colors bg-white rounded-full shadow-sm hover:shadow border border-slate-100 flex items-center gap-2 text-sm font-medium">
        <ChevronLeft size={20} />
        {t('auth.back')}
      </Link>

      <Link href="/" className="mb-8 font-thai font-bold text-3xl text-indigo-600">
        ThaiLearn
      </Link>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          {t('auth.reset_title')}
        </h1>
        <p className="text-slate-600 text-sm mb-6">
        </p>

        {status === "success" ? (
          <div className="text-center">
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 text-sm font-medium border border-emerald-100">
              {message}
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
            >
              {t('auth.login')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {status === "error" && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.new_password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="password"
                    required
                    disabled={!token}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.confirm_password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="password"
                    required
                    disabled={!token}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "loading" || !token || !password || !confirmPassword}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  t('auth.update_password')
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
