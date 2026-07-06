'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';

interface ResponsiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function ResponsiveModal({ isOpen, onClose, title, children, footer }: ResponsiveModalProps) {
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!isOpen || !mounted) return null;

    const header = title ? (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h2 className="text-xl font-extrabold text-slate-800">
                {title}
            </h2>
            <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            >
                <X size={20} />
            </button>
        </div>
    ) : null;

    if (isMobile) {
        return (
            <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm" />
                    <Drawer.Content className="bg-white flex flex-col rounded-t-[24px] fixed bottom-0 left-0 right-0 z-[200] max-h-[95vh] outline-none">
                        <Drawer.Title className="sr-only">{title || 'Modal'}</Drawer.Title>
                        <Drawer.Description className="sr-only">Configuration</Drawer.Description>
                        <div className="w-full flex justify-center py-3 shrink-0 bg-transparent z-10 absolute top-0 left-0 right-0">
                            <div className="w-12 h-1.5 bg-slate-300/50 rounded-full" />
                        </div>
                        <div className="pt-4 flex-1 overflow-y-auto hide-scrollbar flex flex-col">
                            {header}
                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 hide-scrollbar">
                                {children}
                            </div>
                            {footer && (
                                <div className="p-6 border-t border-slate-100 bg-slate-50">
                                    {footer}
                                </div>
                            )}
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        );
    }

    return createPortal(
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[200] backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {header}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 hide-scrollbar">
                    {children}
                </div>
                {footer && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}