"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import { Loader2 } from "lucide-react";
import { Role } from "@/types";
import { getHomeRoute } from "@/utils/access";

// Renders children only for the allowed roles; anyone else is bounced to their
// home route. Generalizes AdminGuard for pages that several roles can share.
export function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const { currentUser, isLoadingAuth, tenantId } = useData();
  const router = useRouter();

  const permitted = !!currentUser && allow.includes(currentUser.role);

  useEffect(() => {
    if (!isLoadingAuth && currentUser && !allow.includes(currentUser.role)) {
      router.push(getHomeRoute(currentUser.role, tenantId));
    }
  }, [isLoadingAuth, currentUser, allow, router, tenantId]);

  if (isLoadingAuth || !currentUser) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-stone-50">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!permitted) {
    return null; // redirecting in the effect
  }

  return <>{children}</>;
}
