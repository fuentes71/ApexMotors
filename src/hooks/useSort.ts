import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface UseSortResult<T> {
  sortColumn: string | null;
  sortDirection: SortDirection;
  handleSort: (column: string) => void;
  sortedData: T[];
}

export function useSort<T>(
  data: T[],
  customSortFunctions?: Record<string, (a: T, b: T) => number>
): UseSortResult<T> {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a: any, b: any) => {
      // Usa função customizada caso exista para a coluna atual
      if (customSortFunctions && customSortFunctions[sortColumn]) {
        const customCmp = customSortFunctions[sortColumn](a, b);
        return sortDirection === 'asc' ? customCmp : -customCmp;
      }

      // Fallback genérico para as demais colunas
      const valA = a[sortColumn] ?? '';
      const valB = b[sortColumn] ?? '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        const cmp = valA.localeCompare(valB);
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection, customSortFunctions]);

  return { sortColumn, sortDirection, handleSort, sortedData };
}
