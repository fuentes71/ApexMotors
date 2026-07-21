// Lazy wrappers so jsPDF (heavy) is only loaded when a PDF is actually
// generated, instead of shipping in the initial bundle. import type is erased
// at build time, so it does not pull the library in.
import type {
  generateContractPDF as ContractFn,
  generateStructuredPDF as StructuredFn,
} from "./pdfExport";

export const generateContractPDF = async (
  ...args: Parameters<typeof ContractFn>
) => {
  const mod = await import("./pdfExport");
  return mod.generateContractPDF(...args);
};

export const generateStructuredPDF = async (
  ...args: Parameters<typeof StructuredFn>
) => {
  const mod = await import("./pdfExport");
  return mod.generateStructuredPDF(...args);
};
