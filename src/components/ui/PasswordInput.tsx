"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  id?: string;
}

export function PasswordInput({
  label,
  value,
  onChange,
  placeholder = "••••••••",
  required = true,
  autoComplete = "new-password",
  id,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="text-sm font-bold text-stone-700 block ml-1"
      >
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 group-focus-within:text-indigo-600 transition-colors">
          <Lock size={18} />
        </div>
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="w-full pl-11 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all placeholder:text-stone-400 font-medium text-stone-800 shadow-sm"
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          // Icon-only control, so it needs a real accessible name: title alone
          // is not announced reliably and never shows on touch.
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-indigo-600 transition-colors rounded-2xl focus:outline-none focus:text-indigo-600"
          tabIndex={0}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
