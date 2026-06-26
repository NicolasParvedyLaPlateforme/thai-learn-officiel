import React, { PropsWithChildren } from "react";

interface ButtonProps {
    className?: string;
}

export const ButtonConfetti = ({ children, className }: PropsWithChildren<ButtonProps>) => {
    return (
        <button className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${className}`}>
            {/* Une simple string suffit ici car on est déjà dans l'expression JS du ternaire */}
            {children ? children : "Lancer l'animation"}
        </button>
    );
};