"use client";

import { useData } from "../../context/DataContext";
import { Header } from "../../components/Header";
import { FinanceView } from "../../components/FinanceView";

import { calculateTotalFixedForPeriod } from "../../utils";

export default function FinanceiroPage() {
  const { fixedExpenses, setFixedExpenses, startMonth, endMonth } = useData();

  const totalFixed = calculateTotalFixedForPeriod(fixedExpenses, startMonth, endMonth);

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-20 print:pb-0 h-screen overflow-y-auto">
      <Header />
      <div className="px-6 lg:px-10 max-w-5xl mx-auto w-full pb-10">
        <FinanceView
          fixedExpenses={fixedExpenses}
          setFixedExpenses={setFixedExpenses}
          totalFixed={totalFixed}
        />
      </div>
    </div>
  );
}
