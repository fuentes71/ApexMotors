import { Header } from "../../components/Header";
import { ClientsView } from "../../components/ClientsView";

export default function ClientsPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 pb-20 print:pb-0 h-screen overflow-y-auto">
      <Header />
      <div className="px-6 lg:px-10 max-w-5xl mx-auto w-full pb-10">
        <ClientsView />
      </div>
    </div>
  );
}
