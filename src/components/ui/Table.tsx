import React from "react";

export function Table({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`w-full overflow-visible ${className}`}>
      <table className="w-full text-left border-collapse whitespace-nowrap md:whitespace-normal">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <thead>
      <tr className={`bg-stone-50/80 border-b border-stone-200 text-stone-500 text-[11px] md:text-xs uppercase tracking-wider ${className} [&>*:first-child]:rounded-tl-2xl [&>*:last-child]:rounded-tr-2xl`}>
        {children}
      </tr>
    </thead>
  );
}

export function TableHead({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <th className={`px-4 py-4 md:px-6 font-semibold whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

export function TableBody({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <tbody className={`divide-y divide-stone-100 text-sm ${className}`}>
      {children}
    </tbody>
  );
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  interactive?: boolean;
}

export function TableRow({ children, className = "", interactive = false, ...props }: TableRowProps) {
  return (
    <tr 
      className={`group ${interactive ? 'hover:bg-stone-50/50 transition-colors cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <td className={`px-4 py-4 md:px-6 ${className}`}>
      {children}
    </td>
  );
}
