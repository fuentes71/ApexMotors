import React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

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

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onClick?: () => void;
  title?: string;
}

export function TableHead({ children, className = "", sortable, sortDirection, onClick, title }: TableHeadProps) {
  return (
    <th 
      className={`px-4 py-4 md:px-4 font-semibold whitespace-nowrap ${sortable ? 'cursor-pointer hover:bg-stone-100 transition-colors select-none group' : ''} ${className}`}
      onClick={sortable ? onClick : undefined}
      title={title}
    >
      <div className={`flex items-center gap-1 ${className.includes('text-right') ? 'justify-end' : className.includes('text-center') ? 'justify-center' : ''}`}>
        {children}
        {sortable && (
          <span className={`flex text-stone-400 ${sortDirection ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
            {sortDirection === 'asc' ? <ArrowUp size={14} className="text-stone-800" /> : 
             sortDirection === 'desc' ? <ArrowDown size={14} className="text-stone-800" /> : 
             <ArrowUpDown size={14} />}
          </span>
        )}
      </div>
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

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  className?: string;
}

export function TableCell({ children, className = "", ...props }: TableCellProps) {
  return (
    <td className={`px-4 py-4 md:px-4 ${className}`} {...props}>
      {children}
    </td>
  );
}
