import { Header } from "../../components/Header";
import { ClientsView } from "../../components/ClientsView";

export default function ClientsPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 pb-20 print:pb-0 h-screen overflow-y-auto">
      <Header />
      <ClientsView />
    </div>
  );
}
