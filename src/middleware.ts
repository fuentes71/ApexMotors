import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { tenants } from './utils/tenantConfig';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request
  let hostname = req.headers.get('host') || '';

  // Remove port if present
  hostname = hostname.split(':')[0];

  // Define allowed domains
  const allowedDomains = ['localhost', 'apexmotors.com', 'apexmotors.com.br'];

  // Check if it's a subdomain
  const isSubdomain = allowedDomains.some(domain => 
    hostname.endsWith(`.${domain}`) && hostname !== `www.${domain}`
  );

  if (isSubdomain) {
    const subdomain = hostname.split('.')[0];
    
    // Check if subdomain is a valid tenant
    if (Object.keys(tenants).includes(subdomain)) {
      // If path doesn't already start with the tenant slug, rewrite it
      if (!url.pathname.startsWith(`/${subdomain}`)) {
        return NextResponse.rewrite(
          new URL(`/${subdomain}${url.pathname === '/' ? '' : url.pathname}${url.search}`, req.url)
        );
      }
    }
  }

  return NextResponse.next();
}
