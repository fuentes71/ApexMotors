import React, { useState } from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { Pagination } from './Pagination';

export type ViewMode = 'table' | 'cards';

interface ViewLayoutProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  children: React.ReactNode | ((viewMode: ViewMode) => React.ReactNode);
  showViewToggle?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  floatingAction?: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    colorClass: string;
  };
}

export function ViewLayout({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  children,
  showViewToggle = false,
  pagination,
  floatingAction
}: ViewLayoutProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  return (
    <>
      <div className={`bg-white border border-stone-200 shadow-sm rounded-2xl overflow-visible flex flex-col ${viewMode === 'cards' ? 'bg-transparent border-none shadow-none' : ''}`}>
        <div className={`p-4 border-b border-stone-100 flex flex-col md:flex-row items-center gap-4 ${viewMode === 'cards' ? 'bg-white rounded-2xl shadow-sm border border-stone-200 mb-4' : 'bg-stone-50/50'}`}>
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              type="text"
              aria-label={searchPlaceholder || "Buscar"}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
          </div>
          
          {showViewToggle && (
            <div className="flex bg-stone-100 p-1 rounded-lg w-full md:w-auto">
              <button
                onClick={() => setViewMode('table')}
                aria-label="Ver em tabela"
                aria-pressed={viewMode === 'table'}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                <List size={16} /> <span className="md:hidden">Tabela</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                aria-label="Ver em cartões"
                aria-pressed={viewMode === 'cards'}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'cards' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                <LayoutGrid size={16} /> <span className="md:hidden">Cartões</span>
              </button>
            </div>
          )}
        </div>
        
        {typeof children === 'function' ? children(viewMode) : children}

        {pagination && pagination.totalPages > 0 && (
          <Pagination 
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        )}
      </div>

      {floatingAction && (
        <div className="fixed bottom-8 right-8 z-40 animate-in slide-in-from-bottom-4 fade-in print:hidden">
          <div className="relative group">
            <button 
              onClick={floatingAction.onClick}
              className={`flex items-center justify-center ${floatingAction.colorClass} text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95`}
            >
              {floatingAction.icon}
            </button>
            <div className="absolute bottom-full mb-3 right-0 bg-stone-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg lg:opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
              {floatingAction.label}
              <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-stone-900"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
