"use client";

import { Check, X } from "lucide-react";
import { PASSWORD_RULES, passwordStrength } from "@/utils/passwordRules";

const BAR_COLOURS = [
  "bg-stone-200",
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-lime-500",
  "bg-emerald-500",
];

export function PasswordChecklist({ password }: { password: string }) {
  const met = passwordStrength(password);
  const total = PASSWORD_RULES.length;

  return (
    <div className="space-y-3 rounded-2xl bg-stone-50 border border-stone-200 p-4">
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < met ? BAR_COLOURS[met] : "bg-stone-200"
            }`}
          />
        ))}
      </div>

      <ul className="space-y-1.5" aria-label="Requisitos da senha">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li
              key={rule.label}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                ok ? "text-emerald-600" : "text-stone-500"
              }`}
            >
              {ok ? (
                <Check size={15} className="shrink-0" aria-hidden="true" />
              ) : (
                <X size={15} className="shrink-0 text-stone-300" aria-hidden="true" />
              )}
              <span>{rule.label}</span>
              <span className="sr-only">{ok ? " (atendido)" : " (pendente)"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
