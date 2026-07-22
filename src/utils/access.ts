import { Role } from "../types";

// Sellers have no access to the dashboard or the finance/expenses screens, so
// their landing route is the inventory instead of the dashboard.
export function getHomeRoute(role: Role | undefined, tenantId: string): string {
  return role === "Seller" ? `/${tenantId}/vehicles` : `/${tenantId}`;
}
