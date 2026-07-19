"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import { Loader2 } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoadingAuth, tenantId } = useData();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && currentUser && currentUser.role !== 'Admin') {
      router.push(`/${tenantId}`);
    }
  }, [isLoadingAuth, currentUser, router, tenantId]);

  if (isLoadingAuth || !currentUser) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-stone-50">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (currentUser.role !== 'Admin') {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
