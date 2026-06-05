"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Save, LogOut, ChevronLeft } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

function ProfilePageContent() {
  const { t } = useTranslation();
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // On attend que la session se charge
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setPasswordStatus("error");
      setMessage(t('auth.password_mismatch'));
      return;
    }
    
    setPasswordStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/user/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setPasswordStatus("success");
        setMessage(t('auth.password_updated'));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setPasswordStatus("error");
        setMessage(data.message || t('auth.error_network'));
      }
    } catch (err) {
      setPasswordStatus("error");
      setMessage(t('auth.error_network'));
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl relative">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
          <ChevronLeft className="w-4 h-4 mr-1" /> {t('auth.back')}
        </Link>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-8">{t('auth.profile_title')}</h1>
        
        {/* En-tête profil */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-3xl rounded-full shrink-0">
            {session.user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800">{session.user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-500">{session.user.email}</span>
              {/* Note: NextAuth ne remonte pas emailVerified par défaut dans la session,
                  donc on affiche juste un avertissement si on vient d'arriver */}
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="hidden md:flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-semibold hover:bg-rose-100 transition-colors"
          >
            <LogOut size={18} /> {t('auth.logout')}
          </button>
        </div>

        {searchParams?.get("verified") === "true" && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-8 font-medium border border-emerald-100 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            Super ! Ton adresse email a été vérifiée avec succès.
          </div>
        )}

        {/* Changer le mot de passe */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">{t('auth.reset_title')}</h3>
          </div>
          
          <form onSubmit={handlePasswordUpdate} className="p-6 space-y-4">
            {passwordStatus === "success" && (
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm font-medium">
                {message}
              </div>
            )}
            {passwordStatus === "error" && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe actuel</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.new_password')}</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.confirm_password')}</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={passwordStatus === "loading"}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-xl transition-all flex items-center gap-2"
              >
                {passwordStatus === "loading" ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <><Save size={18} /> {t('auth.save_changes')}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
