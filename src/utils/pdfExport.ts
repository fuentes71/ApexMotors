import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Vehicle, Expense } from "../types";
import { formatCurrency, formatMonth, calculateTotalFixedForPeriod } from "./index";

interface ExportData {
  startMonth: string;
  endMonth: string;
  vehicles: Vehicle[];
  fixedExpenses: Expense[];
  netBalance: number;
  totalVehicleProfit: number;
  totalFixed: number;
}

export const generateStructuredPDF = ({
  startMonth,
  endMonth,
  vehicles,
  fixedExpenses,
  netBalance,
  totalVehicleProfit,
  totalFixed
}: ExportData) => {
  const doc = new jsPDF();
  const periodText = startMonth === endMonth ? formatMonth(startMonth) : `${formatMonth(startMonth)} a ${formatMonth(endMonth)}`;

  // Cabeçalho / Título
  doc.setFontSize(22);
  doc.setTextColor(28, 25, 23); // stone-900
  doc.text("ApexMotors", 14, 22);

  doc.setFontSize(12);
  doc.setTextColor(120, 113, 108); // stone-500
  doc.text("Relatório Financeiro Estruturado", 14, 30);
  doc.text(`Período: ${periodText}`, 14, 36);

  // Resumo Financeiro
  doc.setFontSize(10);
  doc.setTextColor(28, 25, 23);
  doc.text(`Lucro Líquido: ${formatCurrency(netBalance)}`, 14, 50);
  doc.text(`Lucro dos Veículos: ${formatCurrency(totalVehicleProfit)}`, 14, 56);
  doc.text(`Custo Fixo do Período: ${formatCurrency(totalFixed)}`, 14, 62);

  let finalY = 72;

  // Tabela de Veículos Vendidos no Período
  const soldVehicles = vehicles.filter(v => v.status === "Vendido");
  
  if (soldVehicles.length > 0) {
    doc.setFontSize(14);
    doc.text("Veículos Vendidos", 14, finalY);
    finalY += 6;

    const vehicleRows = soldVehicles.map(v => {
      const expenses = v.despesas.reduce((acc, e) => acc + e.value, 0);
      const profit = v.valorVenda - v.valorCompra - expenses;
      return [
        v.name,
        v.dataVenda ? new Date(v.dataVenda).toLocaleDateString('pt-BR') : '-',
        formatCurrency(v.valorCompra),
        formatCurrency(expenses),
        formatCurrency(v.valorVenda),
        formatCurrency(profit)
      ];
    });

    autoTable(doc, {
      startY: finalY,
      head: [['Veículo', 'Data Venda', 'Custo Compra', 'Despesas', 'Valor Venda', 'Lucro']],
      body: vehicleRows,
      theme: 'grid',
      headStyles: { fillColor: [28, 25, 23] }, // stone-900
      styles: { fontSize: 9 },
      columnStyles: {
        5: { fontStyle: 'bold', textColor: [5, 150, 105] } // emerald-600
      }
    });

    finalY = (doc as any).lastAutoTable.finalY + 14;
  }

  // Tabela de Despesas Fixas do Período
  const activeFixedExpenses = fixedExpenses.filter(e => calculateTotalFixedForPeriod([e], startMonth, endMonth) > 0);

  if (activeFixedExpenses.length > 0) {
    if (finalY > 250) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(28, 25, 23);
    doc.text("Despesas Recorrentes (Custo Fixo)", 14, finalY);
    finalY += 6;

    const expenseRows = activeFixedExpenses.map(e => [
      e.name,
      e.recurrence || 'Mensal',
      formatCurrency(e.value),
      formatCurrency(calculateTotalFixedForPeriod([e], startMonth, endMonth))
    ]);

    autoTable(doc, {
      startY: finalY,
      head: [['Descrição', 'Recorrência', 'Valor Base', 'Total no Período']],
      body: expenseRows,
      theme: 'grid',
      headStyles: { fillColor: [28, 25, 23] },
      styles: { fontSize: 9 },
      columnStyles: {
        3: { fontStyle: 'bold', textColor: [225, 29, 72] } // rose-600
      }
    });
  }

  // Nome do arquivo
  const fileName = `Relatorio_ApexMotors_${startMonth === endMonth ? startMonth : `${startMonth}_a_${endMonth}`}.pdf`;
  doc.save(fileName);
};
