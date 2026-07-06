import React, { InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

export interface IconInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  label: string;
}

export function IconInput({ icon: Icon, label, className = "", ...props }: IconInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          className={`w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
