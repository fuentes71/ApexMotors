import React from "react";
import { PatternFormat } from "react-number-format";

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  value: string;
  onChangeDate: (isoString: string) => void;
}

export const DateInput: React.FC<DateInputProps> = ({ value, onChangeDate, className, ...props }) => {
  let displayValue = "";
  if (value && typeof value === 'string') {
    const ymd = value.split('T')[0]; // "2026-07-19"
    const [y, m, d] = ymd.split('-');
    if (y && m && d) {
      displayValue = `${d}${m}${y}`;
    }
  }

  return (
    <PatternFormat
      format="##/##/####"
      mask="_"
      value={displayValue}
      onValueChange={(values) => {
        if (values.value.length === 8) {
          const d = values.value.substring(0, 2);
          const m = values.value.substring(2, 4);
          const y = values.value.substring(4, 8);
          
          if (Number(d) > 31 || Number(m) > 12) return;
          
          try {
            // Force it to a valid UTC ISO string at noon to avoid timezone shift issues
            const isoDate = new Date(`${y}-${m}-${d}T12:00:00.000Z`).toISOString();
            onChangeDate(isoDate);
          } catch (e) {
            // Ignore if invalid
          }
        } else if (values.value.length === 0) {
          onChangeDate("");
        }
      }}
      placeholder="DD/MM/AAAA"
      className={className || "w-full p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"}
      {...props as any}
    />
  );
};
