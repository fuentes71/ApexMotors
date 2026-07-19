import { redirect } from 'next/navigation';
import { defaultTenant } from '../utils/tenantConfig';

export default function RootPage() {
  redirect(`/${defaultTenant}`);
}
