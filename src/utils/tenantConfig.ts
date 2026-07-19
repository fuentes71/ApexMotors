export interface TenantConfig {
  id: string;
  name: string;
  primaryColor: string;
  logoUrl?: string;
}

export const tenants: Record<string, TenantConfig> = {
  apex: {
    id: 'apex',
    name: 'ApexMotors',
    primaryColor: 'blue',
    logoUrl: '/logo.jpg',
  },
  premium: {
    id: 'premium',
    name: 'Premium Auto',
    primaryColor: 'emerald',
  }
};

export const defaultTenant = 'apex';

export function getTenantConfig(id: string): TenantConfig {
  return tenants[id] || tenants[defaultTenant];
}
