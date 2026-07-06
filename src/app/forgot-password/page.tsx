"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ChevronLeft } from "lucide-react";
import { IconInput } from "@/components/ui/IconInput";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const { t, language } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, language }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(t('auth.check_email'));
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
        <Link href="/login" className="flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> {t('auth.back_login')}
        </Link>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          {t('auth.forgot_title')}
        </h1>
        <p className="text-slate-600 text-sm mb-6">
          {t('auth.forgot_desc')}
        </p>

        {status === "success" && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 text-sm font-medium border border-emerald-100">
            {message}
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {message}
          </div>
        )}

        {status !== "success" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <IconInput
              icon={Mail}
              label={t('auth.email_label')}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.email_placeholder')}
            />

            <Button
              type="submit"
              disabled={status === "loading" || !email}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed border-none"
            >
              {status === "loading" ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                t('auth.send_link')
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
