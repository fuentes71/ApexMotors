import { Header } from "@/components/Header";
import { EmployeesView } from "@/components/EmployeesView";
import { AdminGuard } from "@/components/AdminGuard";

export default function EmployeesPage() {
  return (
    <AdminGuard>
      <div className="flex-1 flex flex-col min-w-0 pb-20 print:pb-0 h-screen overflow-y-auto">
        <Header />
        <div className="px-6 lg:px-10 max-w-5xl mx-auto w-full pb-10">
          <EmployeesView />
        </div>
      </div>
    </AdminGuard>
  );
}
