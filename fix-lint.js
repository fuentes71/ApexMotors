const fs = require('fs');

// src/app/[tenant]/forgot-password/page.tsx
let forgotPwd = fs.readFileSync('src/app/[tenant]/forgot-password/page.tsx', 'utf-8');
forgotPwd = forgotPwd.replace('catch (err: any)', 'catch (err)');
forgotPwd = forgotPwd.replace('catch (err: any)', 'catch (err)');
forgotPwd = forgotPwd.replace('err.response?.data?.message', '(err as any).response?.data?.message');
fs.writeFileSync('src/app/[tenant]/forgot-password/page.tsx', forgotPwd);

// src/app/[tenant]/login/page.tsx
let login = fs.readFileSync('src/app/[tenant]/login/page.tsx', 'utf-8');
login = login.replace('CarFront, Mail, Lock, Loader2, ArrowRight, Shield, User, Eye, EyeOff', 'Mail, Lock, Loader2, ArrowRight, User, Eye, EyeOff');
login = login.replace('const decoded: any = jwtDecode(token);', 'const decoded = jwtDecode<any>(token);');
fs.writeFileSync('src/app/[tenant]/login/page.tsx', login);

// src/app/[tenant]/page.tsx
let tenantPage = fs.readFileSync('src/app/[tenant]/page.tsx', 'utf-8');
tenantPage = tenantPage.replace('const _ = ', ''); // simplified fix
fs.writeFileSync('src/app/[tenant]/page.tsx', tenantPage);

// src/app/[tenant]/reset-password/page.tsx
let resetPwd = fs.readFileSync('src/app/[tenant]/reset-password/page.tsx', 'utf-8');
resetPwd = resetPwd.replace('const { tenantId, tenantConfig } = useData();', 'const { tenantId } = useData();');
fs.writeFileSync('src/app/[tenant]/reset-password/page.tsx', resetPwd);

// src/app/[tenant]/settings/page.tsx
let settingsPage = fs.readFileSync('src/app/[tenant]/settings/page.tsx', 'utf-8');
settingsPage = settingsPage.replace('import { useState, useEffect } from "react";', 'import { useState } from "react";');
fs.writeFileSync('src/app/[tenant]/settings/page.tsx', settingsPage);

// src/app/[tenant]/vehicles/page.tsx
let vehiclesPage = fs.readFileSync('src/app/[tenant]/vehicles/page.tsx', 'utf-8');
vehiclesPage = vehiclesPage.replace('import api from "@/services/api";\n', '');
fs.writeFileSync('src/app/[tenant]/vehicles/page.tsx', vehiclesPage);

// src/app/layout.tsx
let layout = fs.readFileSync('src/app/layout.tsx', 'utf-8');
layout = layout.replace('import GlobalLoader from "@/components/GlobalLoader";\n', '');
fs.writeFileSync('src/app/layout.tsx', layout);

// src/components/ClientModal.tsx
let clientModal = fs.readFileSync('src/components/ClientModal.tsx', 'utf-8');
clientModal = clientModal.replace(', toISODate', '');
fs.writeFileSync('src/components/ClientModal.tsx', clientModal);

// src/components/ClientsView.tsx
let clientsView = fs.readFileSync('src/components/ClientsView.tsx', 'utf-8');
clientsView = clientsView.replace('Search, ', '');
clientsView = clientsView.replace(', Edit2', '');
clientsView = clientsView.replace('const [draftClient, setDraftClient] = useState<Client | null>(null);\n', '');
clientsView = clientsView.replace('const getStatusColor = (status: string) => {\n    switch (status) {\n      case "Active": return "bg-emerald-50 text-emerald-700 border-emerald-200";\n      case "Inactive": return "bg-stone-100 text-stone-600 border-stone-200";\n      case "Lead": return "bg-blue-50 text-blue-700 border-blue-200";\n      default: return "bg-stone-50 text-stone-600 border-stone-200";\n    }\n  };\n', '');
fs.writeFileSync('src/components/ClientsView.tsx', clientsView);

// src/components/EmployeeModal.tsx
let employeeModal = fs.readFileSync('src/components/EmployeeModal.tsx', 'utf-8');
employeeModal = employeeModal.replace('let res: any;', 'let res;');
fs.writeFileSync('src/components/EmployeeModal.tsx', employeeModal);

// src/components/EmployeesView.tsx
let employeesView = fs.readFileSync('src/components/EmployeesView.tsx', 'utf-8');
employeesView = employeesView.replace('import { Employee } from "../types";\n', '');
employeesView = employeesView.replace('const { currentUser } = useData();\n', '');
fs.writeFileSync('src/components/EmployeesView.tsx', employeesView);

// src/components/ExpenseModal.tsx
let expenseModal = fs.readFileSync('src/components/ExpenseModal.tsx', 'utf-8');
expenseModal = expenseModal.replace('Upload, ', '');
expenseModal = expenseModal.replace(', Calendar', '');
expenseModal = expenseModal.replace('CategoryEnum, RecurrenceEnum', '');
expenseModal = expenseModal.replace(', CategoryEnum', '');
expenseModal = expenseModal.replace('const payload: any = { ...draftExpense };', 'const payload = { ...draftExpense } as any;');
expenseModal = expenseModal.replace('setDraftExpense({...draftExpense, value: undefined as any});', 'setDraftExpense({...draftExpense, value: undefined as unknown as number});');
fs.writeFileSync('src/components/ExpenseModal.tsx', expenseModal);

// src/components/FinanceView.tsx
let financeView = fs.readFileSync('src/components/FinanceView.tsx', 'utf-8');
financeView = financeView.replace('Check, ', '');
financeView = financeView.replace('Paperclip, ', '');
financeView = financeView.replace('ChevronDown, ', '');
financeView = financeView.replace('Pencil, ', '');
financeView = financeView.replace('TrendingDown, ', '');
financeView = financeView.replace(', Search', '');
financeView = financeView.replace(', Category', '');
financeView = financeView.replace('const totalFixed = fixedExpenses.reduce((acc, curr) => acc + curr.value, 0);\n', '');
fs.writeFileSync('src/components/FinanceView.tsx', financeView);

// src/components/InventoryView.tsx
let inventoryView = fs.readFileSync('src/components/InventoryView.tsx', 'utf-8');
inventoryView = inventoryView.replace('Search, ', '');
inventoryView = inventoryView.replace('Download, ', '');
inventoryView = inventoryView.replace('Calendar, ', '');
inventoryView = inventoryView.replace('Tag, ', '');
inventoryView = inventoryView.replace('X, ', '');
inventoryView = inventoryView.replace(', AlertCircle', '');
inventoryView = inventoryView.replace('DEFAULT_CAR_IMAGE, ', '');
inventoryView = inventoryView.replace('catch(err: any)', 'catch(err)');
inventoryView = inventoryView.replace('err.response?.data?.message', '(err as any).response?.data?.message');
fs.writeFileSync('src/components/InventoryView.tsx', inventoryView);

// src/components/VehicleModal.tsx
let vehicleModal = fs.readFileSync('src/components/VehicleModal.tsx', 'utf-8');
vehicleModal = vehicleModal.replace('Search, ', '');
vehicleModal = vehicleModal.replace('FileWarning, ', '');
vehicleModal = vehicleModal.replace('Calendar, ', '');
vehicleModal = vehicleModal.replace('Link as LinkIcon, ', '');
vehicleModal = vehicleModal.replace('DollarSign, ', '');
vehicleModal = vehicleModal.replace('Wrench, ', '');
vehicleModal = vehicleModal.replace(', Info', '');
vehicleModal = vehicleModal.replace('useState, useRef, useEffect', 'useState, useRef');
vehicleModal = vehicleModal.replace('fixedExpenses, setFixedExpenses,\n', '');
vehicleModal = vehicleModal.replace('const fileInputRef = useRef<HTMLInputElement>(null);\n', '');
vehicleModal = vehicleModal.replace('payload.expenses.map((exp: any)', 'payload.expenses.map((exp: Expense)');
vehicleModal = vehicleModal.replace('catch (e: any)', 'catch (e)');
vehicleModal = vehicleModal.replace('e.response?.data?.message', '(e as any).response?.data?.message');
fs.writeFileSync('src/components/VehicleModal.tsx', vehicleModal);

// src/context/DataContext.tsx
let dataContext = fs.readFileSync('src/context/DataContext.tsx', 'utf-8');
dataContext = dataContext.replace(', Role', '');
dataContext = dataContext.replace('getTenantConfig, ', '');
dataContext = dataContext.replace('const decoded: any = jwtDecode(token);', 'const decoded = jwtDecode<any>(token);');
fs.writeFileSync('src/context/DataContext.tsx', dataContext);

console.log("Fixes applied!");
