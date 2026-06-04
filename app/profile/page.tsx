"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Save, LogOut } from "lucide-react";

function ProfilePageContent() {
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
      setMessage("Les mots de passe ne correspondent pas.");
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
        setMessage("Mot de passe mis à jour avec succès.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setPasswordStatus("error");
        setMessage(data.message || "Erreur lors de la mise à jour.");
      }
    } catch (err) {
      setPasswordStatus("error");
      setMessage("Erreur réseau.");
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour à l'accueil
        </Link>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Mon Profil</h1>
        
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
            <LogOut size={18} /> Déconnexion
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
            <h3 className="text-lg font-bold text-slate-800">Changer de mot de passe</h3>
            <p className="text-sm text-slate-500 mt-1">Mets à jour ton mot de passe pour sécuriser ton compte.</p>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer</label>
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
                {passwordStatus === "loading" ? "Chargement..." : <><Save size={18} /> Mettre à jour</>}
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
