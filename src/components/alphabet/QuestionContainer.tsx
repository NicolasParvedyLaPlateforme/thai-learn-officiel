import React, { ReactNode } from 'react';

interface QuestionContainerProps {
    title: string;
    prompt: ReactNode;
    promptClassName?: string;
    children: ReactNode;
}

export function QuestionContainer({ title, prompt, promptClassName = "p-8", children }: QuestionContainerProps) {
    return (
        <div className="flex-1 flex flex-col items-center w-full max-w-lg mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 text-center">
                {title}
            </h2>
            <div className={`flex items-center gap-4 bg-white rounded-3xl shadow-sm border-2 border-slate-100 mb-10 w-full justify-center text-center flex-col ${promptClassName}`}>
                {prompt}
            </div>
            {children}
        </div>
    );
}