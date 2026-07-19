import React from "react";

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChangeDate: (isoString: string) => void;
}

export const DateInput: React.FC<DateInputProps> = ({ value, onChangeDate, className, ...props }) => {
  // Extract just the YYYY-MM-DD part from the ISO string to pass to the native date picker
  const displayValue = value && typeof value === 'string' ? value.split('T')[0] : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDate = e.target.value; // YYYY-MM-DD
    if (!rawDate) {
      onChangeDate("");
      return;
    }
    // Convert back to full ISO format for the backend
    const isoDate = `${rawDate}T12:00:00.000Z`;
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

