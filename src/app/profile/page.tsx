"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { useProgressStore } from "@/lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Save, LogOut, ChevronLeft } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useTranslation } from "@/hooks/useTranslation";

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

  const [pseudo, setPseudo] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(true);
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [resendMessage, setResendMessage] = useState("");

  const [pseudoStatus, setPseudoStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pseudoMessage, setPseudoMessage] = useState("");

  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [showFinalWarning, setShowFinalWarning] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/get-profile")
        .then(res => res.json())
        .then(data => {
          if (data.pseudo) setPseudo(data.pseudo);
          if (data.isEmailVerified !== undefined) setIsEmailVerified(data.isEmailVerified);
        })
        .catch(console.error);
    }
  }, [status]);

  const handleResendVerification = async () => {
    setResendStatus("loading");
    setResendMessage("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), 
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus("success");
        setResendMessage(data.message);
      } else {
        setResendStatus("error");
        setResendMessage(data.message || t('auth.error_network'));
      }
    } catch (err) {
      setResendStatus("error");
      setResendMessage(t('auth.error_network'));
    }
  };

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

  const handleInitialDeleteClick = () => {
    if (deleteEmail === session?.user?.email) {
      setShowFinalWarning(true);
    }
  };

  const confirmDeleteAccount = async () => {
    setDeleteStatus("loading");
    setDeleteMessage("");
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: deleteEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteStatus("success");
        // Deletion success, logout
        useProgressStore.getState().resetProgress();
        signOut();
      } else {
        setDeleteStatus("error");
        setDeleteMessage(data.message || t('auth.error_network'));
      }
    } catch (error) {
      setDeleteStatus("error");
      setDeleteMessage(t('auth.error_network'));
    }
  };

  const handlePseudoUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPseudoStatus("loading");
    setPseudoMessage("");

    try {
      const res = await fetch("/api/user/update-pseudo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudo }),
      });

      const data = await res.json();

      if (res.ok) {
        setPseudoStatus("success");
        setPseudoMessage(t('auth.pseudo_updated_success'));
      } else {
        setPseudoStatus("error");
        setPseudoMessage(data.message || t('auth.error_network'));
      }
    } catch (err) {
      setPseudoStatus("error");
      setPseudoMessage(t('auth.error_network'));
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl relative">
        <Link href="/learn" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
          <ChevronLeft className="w-4 h-4 mr-1" /> {t('auth.back')}
        </Link>

        <h1 className="text-3xl font-bold text-slate-800 mb-8">{t('auth.profile_title')}</h1>

        {/* En-tête profil */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-6 w-full">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-3xl rounded-full shrink-0">
              {session.user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <h2 className="text-xl font-bold text-slate-800 truncate">{session.user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-500 truncate">{session.user.email}</span>
                {/* Note: NextAuth ne remonte pas emailVerified par défaut dans la session,
                    donc on affiche juste un avertissement si on vient d'arriver */}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              useProgressStore.getState().resetProgress();
              signOut();
            }}
            className="flex w-full md:w-auto justify-center items-center gap-2 bg-rose-50 border-rose-100 text-rose-600 px-4 py-2 hover:bg-rose-100"
          >
            <LogOut size={18} /> {t('auth.logout')}
          </Button>
        </div>

        {searchParams?.get("verified") === "true" ? (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-8 font-medium border border-emerald-100 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            {t('auth.email_verified_success')}
          </div>
        ) : !isEmailVerified ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-amber-800 font-semibold mb-1">{t('auth.email_not_verified')}</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-3">
                  <Button
                    variant="outline"
                    onClick={handleResendVerification}
                    disabled={resendStatus === "loading" || resendStatus === "success"}
                    className="bg-amber-100 hover:bg-amber-200 border-amber-200 text-amber-800 text-sm font-semibold py-2 px-4 flex items-center gap-2 disabled:opacity-50"
                  >
                    {resendStatus === "loading" ? (
                      <div className="w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
                    ) : null}
                    {t('auth.resend_verification')}
                  </Button>
                  {resendMessage && (
                    <span className={`text-sm font-medium ${resendStatus === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                      {resendMessage}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Changer le pseudo */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">{t('auth.my_pseudo')}</h3>
          </div>

          <form onSubmit={handlePseudoUpdate} className="p-6 space-y-4">
            {pseudoStatus === "success" && (
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm font-medium">
                {pseudoMessage}
              </div>
            )}
            {pseudoStatus === "error" && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                {pseudoMessage}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.pseudo_label')}</label>
              <input
                type="text"
                required
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder={t('auth.pseudo_placeholder')}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <SubmitButton isLoading={pseudoStatus === "loading"} className="py-2 px-6">
                <Save size={18} /> {t('auth.save_changes')}
              </SubmitButton>
            </div>
          </form>
        </div>

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
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('auth.current_password')}</label>
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
              <SubmitButton isLoading={passwordStatus === "loading"} className="py-2 px-6">
                <Save size={18} /> {t('auth.save_changes')}
              </SubmitButton>
            </div>
          </form>
        </div>

        {/* Delete Account */}
        <div className="mt-12 mb-8 flex justify-center">
          <Button
            variant="ghost"
            onClick={() => setShowDeleteModal(true)}
            className="text-rose-500 hover:text-rose-700 font-semibold underline text-sm"
          >
            {t('auth.delete_account')}
          </Button>
        </div>

        {/* Modals de suppression de compte */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
              {!showFinalWarning ? (
                <>
                  <div className="flex items-center gap-3 mb-4 text-rose-600">
                    <AlertCircle className="w-6 h-6" />
                    <h3 className="text-xl font-bold">{t('auth.delete_account_confirm_title')}</h3>
                  </div>
                  <p className="text-slate-600 mb-6">{t('auth.delete_account_confirm_desc')}</p>
                  <input
                    type="email"
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    placeholder={t('auth.delete_account_email_placeholder')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all mb-6"
                  />
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => setShowDeleteModal(false)}
                      className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100"
                    >
                      {t('auto.cancel')}
                    </Button>
                    <Button
                      onClick={handleInitialDeleteClick}
                      disabled={deleteEmail !== session?.user?.email}
                      className="px-4 py-2 bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-50"
                    >
                      {t('auto.continue')}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4 text-rose-600">
                    <AlertCircle className="w-8 h-8" />
                    <h3 className="text-xl font-bold">{t('auth.delete_account_final_warning_title')}</h3>
                  </div>
                  <p className="text-slate-600 mb-6 font-medium bg-rose-50 p-4 rounded-xl border border-rose-100">
                    {t('auth.delete_account_final_warning_desc')}
                  </p>
                  
                  {deleteStatus === "error" && (
                    <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm font-medium mb-4">
                      {deleteMessage}
                    </div>
                  )}

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setShowFinalWarning(false);
                        setDeleteEmail("");
                      }}
                      className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100"
                    >
                      {t('auto.cancel')}
                    </Button>
                    <Button
                      onClick={confirmDeleteAccount}
                      disabled={deleteStatus === "loading"}
                      className="px-4 py-2 bg-rose-600 text-white font-semibold hover:bg-rose-700 flex items-center gap-2"
                    >
                      {deleteStatus === "loading" ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : null}
                      {t('auth.delete_account_confirm_btn')}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
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
