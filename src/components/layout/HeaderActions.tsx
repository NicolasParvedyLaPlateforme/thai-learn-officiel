"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Menu } from "lucide-react";
import { useProgressStore } from "@/lib/store";
import PWAInstallButton from "@/components/ui/PWAInstallButton";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";

interface HeaderActionsProps {
    language: string;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    // Permet de conditionner l'affichage du bouton PWA depuis la page parente
    showPWAButton?: boolean;
    // Permet de choisir si on cache le bouton de langue sur desktop (true par défaut)
    hideLanguageOnDesktop?: boolean;
}

export function HeaderActions({
    language,
    setIsMobileMenuOpen,
    showPWAButton = true, // Affiché par défaut
    hideLanguageOnDesktop = true, // Caché sur md par défaut (comme dans la majorité de tes blocs)
}: HeaderActionsProps) {
    const [mounted, setMounted] = useState(false);

    // Gestion de l'hydratation directement dans le composant
    // Plus besoin de le déclarer sur chaque page !
    useEffect(() => {
        setMounted(true);
    }, []);

    // Rend un conteneur vide de la même taille pour éviter le Layout Shift pendant l'hydratation
    if (!mounted) {
        return <div className="flex items-center gap-2 h-10"></div>;
    }

    return (
        <div className="flex items-center gap-2">
            {showPWAButton && <PWAInstallButton />}

            <Button
                variant="outline"
                onClick={() => useProgressStore.getState().setShowLanguageModal(true)}
                className={`px-4 py-2 rounded-full bg-slate-100 text-slate-500 font-extrabold text-sm hover:bg-slate-200 uppercase border-none ${hideLanguageOnDesktop ? "md:hidden" : ""
                    }`}
            >
                {language}
            </Button>

            <div className="flex items-center gap-2 relative">
                <Link
                    href="/profile"
                    className="flex items-center justify-center p-2 bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                    <User size={18} />
                </Link>

                <IconButton
                    size="md"
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"
                >
                    <Menu size={20} />
                </IconButton>
            </div>
        </div>
    );
}