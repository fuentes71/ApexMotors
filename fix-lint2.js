const fs = require('fs');

// src/app/[tenant]/forgot-password/page.tsx
let f1 = fs.readFileSync('src/app/[tenant]/forgot-password/page.tsx', 'utf-8');
f1 = f1.replace('(err as any).response', '(err as { response?: { data?: { message?: string } } }).response');
f1 = f1.replace('catch (err) {\n      setErrorMsg("Código inválido', 'catch (_err) {\n      setErrorMsg("Código inválido');
fs.writeFileSync('src/app/[tenant]/forgot-password/page.tsx', f1);

// src/app/[tenant]/login/page.tsx
let f2 = fs.readFileSync('src/app/[tenant]/login/page.tsx', 'utf-8');
f2 = f2.replace('const decoded = jwtDecode<any>(token);', 'const decoded = jwtDecode<{ sub: string; name?: string; email: string; role?: string }>(token);');
fs.writeFileSync('src/app/[tenant]/login/page.tsx', f2);

// src/app/[tenant]/page.tsx
let f3 = fs.readFileSync('src/app/[tenant]/page.tsx', 'utf-8');
f3 = f3.replace('const _ = ', ''); // try again if missed
f3 = f3.replace('const { tenantConfig, _ } = useData();', 'const { tenantConfig } = useData();');
f3 = f3.replace('const {  } = useData();', ''); // cleanup
fs.writeFileSync('src/app/[tenant]/page.tsx', f3);

// src/app/[tenant]/reset-password/page.tsx
let f4 = fs.readFileSync('src/app/[tenant]/reset-password/page.tsx', 'utf-8');
f4 = f4.replace('const error = err as any;', 'const error = err as { response?: { data?: { message?: string } } };');
fs.writeFileSync('src/app/[tenant]/reset-password/page.tsx', f4);

// src/app/[tenant]/vehicles/page.tsx
let f5 = fs.readFileSync('src/app/[tenant]/vehicles/page.tsx', 'utf-8');
f5 = f5.replace('import api from "@/services/api";\n', '');
fs.writeFileSync('src/app/[tenant]/vehicles/page.tsx', f5);

// src/app/layout.tsx
let f6 = fs.readFileSync('src/app/layout.tsx', 'utf-8');
f6 = f6.replace('import GlobalLoader from "@/components/GlobalLoader";\n', '');
fs.writeFileSync('src/app/layout.tsx', f6);

// src/components/ClientsView.tsx
let f7 = fs.readFileSync('src/components/ClientsView.tsx', 'utf-8');
f7 = f7.replace('const [draftClient, setDraftClient] = useState<Client | null>(null);\n', '');
f7 = f7.replace('const getStatusColor = (status: string) => {\n    switch (status) {\n      case "Active": return "bg-emerald-50 text-emerald-700 border-emerald-200";\n      case "Inactive": return "bg-stone-100 text-stone-600 border-stone-200";\n      case "Lead": return "bg-blue-50 text-blue-700 border-blue-200";\n      default: return "bg-stone-50 text-stone-600 border-stone-200";\n    }\n  };\n', '');
fs.writeFileSync('src/components/ClientsView.tsx', f7);

// src/components/EmployeesView.tsx
let f8 = fs.readFileSync('src/components/EmployeesView.tsx', 'utf-8');
f8 = f8.replace('import { Employee } from "../types";\n', '');
f8 = f8.replace('const { currentUser } = useData();\n', '');
fs.writeFileSync('src/components/EmployeesView.tsx', f8);

// src/components/ExpenseModal.tsx
let f9 = fs.readFileSync('src/components/ExpenseModal.tsx', 'utf-8');
f9 = f9.replace('const payload = { ...draftExpense } as any;', 'const payload = { ...draftExpense } as Record<string, unknown>;');
fs.writeFileSync('src/components/ExpenseModal.tsx', f9);

// src/components/FinanceView.tsx
let f10 = fs.readFileSync('src/components/FinanceView.tsx', 'utf-8');
f10 = f10.replace('const totalFixed = fixedExpenses.reduce((acc, curr) => acc + curr.value, 0);\n', '');
fs.writeFileSync('src/components/FinanceView.tsx', f10);

// src/components/InventoryView.tsx
let f11 = fs.readFileSync('src/components/InventoryView.tsx', 'utf-8');
f11 = f11.replace('(err as any).response', '(err as { response?: { data?: { message?: string } } }).response');
fs.writeFileSync('src/components/InventoryView.tsx', f11);

// src/components/VehicleModal.tsx
let f12 = fs.readFileSync('src/components/VehicleModal.tsx', 'utf-8');
f12 = f12.replace('const { fixedExpenses, setFixedExpenses } = useData();\n', '');
f12 = f12.replace('const fileInputRef = useRef<HTMLInputElement>(null);\n', '');
f12 = f12.replace('(e as any).response', '(e as { response?: { data?: { message?: string } } }).response');
fs.writeFileSync('src/components/VehicleModal.tsx', f12);

// src/context/DataContext.tsx
let f13 = fs.readFileSync('src/context/DataContext.tsx', 'utf-8');
f13 = f13.replace('const decoded = jwtDecode<any>(token);', 'const decoded = jwtDecode<{ sub: string; name?: string; email: string; role?: string }>(token);');
fs.writeFileSync('src/context/DataContext.tsx', f13);

console.log("Fixes phase 2 applied");
