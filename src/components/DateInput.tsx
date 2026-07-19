import React from "react";

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChangeDate: (isoString: string) => void;
}

export const DateInput: React.FC<DateInputProps> = ({ value, onChangeDate, className, ...props }) => {
  // Extract just the YYYY-MM-DD part to safely pass to <input type="date" />
  const displayValue = value && typeof value === 'string' ? value.split('T')[0] : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDate = e.target.value; // YYYY-MM-DD
    if (!rawDate) {
      onChangeDate("");
      return;
    }
    // Convert directly to ISO string representing midnight UTC
    // new Date("YYYY-MM-DD") naturally parses as UTC midnight
    const isoDate = new Date(rawDate).toISOString();
    onChangeDate(isoDate);
  };

  return (
    <input
      type="date"
      value={displayValue}
      onChange={handleChange}
      className={className || "w-full p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"}
      {...props}
    />
  );
};
