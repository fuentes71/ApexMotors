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

    finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;
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
      e.category || 'Mensal',
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

export const generateContractPDF = (vehicle: Vehicle, template: string) => {
  const doc = new jsPDF();
  
  // Título e Estilo
  doc.setFontSize(22);
  doc.setTextColor(28, 25, 23);
  doc.text("ApexMotors", 105, 25, { align: "center" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("RECIBO DE COMPRA E VENDA DE VEÍCULO", 105, 38, { align: "center" });

  // Corpo do Texto
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  const dateStr = vehicle.dataVenda 
    ? new Date(vehicle.dataVenda).toLocaleDateString('pt-BR') 
    : new Date().toLocaleDateString('pt-BR');

  const buyerName = vehicle.buyerName || "_________________________________";
  const buyerDoc = vehicle.buyerDoc || "___________________";
  const sellerName = "ApexMotors Comércio de Veículos LTDA";
  const sellerDoc = "00.000.000/0001-00";

  const content = template
    .replace(/\{\{buyerName\}\}/g, buyerName)
    .replace(/\{\{buyerDoc\}\}/g, buyerDoc)
    .replace(/\{\{sellerName\}\}/g, sellerName)
    .replace(/\{\{sellerDoc\}\}/g, sellerDoc)
    .replace(/\{\{vehicleName\}\}/g, vehicle.name)
    .replace(/\{\{vehiclePlaca\}\}/g, vehicle.placa || 'N/A')
    .replace(/\{\{vehicleRenavam\}\}/g, vehicle.renavam || 'N/A')
    .replace(/\{\{vehiclePrice\}\}/g, formatCurrency(vehicle.valorVenda));

  const textLines = doc.splitTextToSize(content, 180);
  doc.text(textLines, 14, 60);

  // Assinaturas
  doc.setLineWidth(0.5);
  doc.line(30, 150, 90, 150);
  doc.line(120, 150, 180, 150);

  doc.setFontSize(10);
  doc.text("Assinatura do Comprador", 60, 156, { align: "center" });
  doc.text("Assinatura do Vendedor", 150, 156, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Local e Data: _______________________, ${dateStr}`, 14, 180);

  doc.save(`Recibo_${vehicle.name.replace(/\s+/g, '_')}_${dateStr.replace(/\//g, '-')}.pdf`);
};
