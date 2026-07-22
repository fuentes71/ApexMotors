import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Same-origin paths on Vercel; next.config rewrites() proxies these to Render.
// Because the requests are first-party, the httpOnly auth cookie rides along
// automatically (withCredentials) and there is no token in JS anymore.
const api = axios.create({
  baseURL: '/api/core',
  withCredentials: true,
});

// authApi for login / logout / me
export const authApi = axios.create({
  baseURL: '/api/auth',
  withCredentials: true,
});

// The tenant slug is not secret and is still needed for tenant resolution when
// no token is present, so we keep tracking it and injecting the x-tenant-slug
// header. (The JWT/tenantId now lives in the httpOnly cookie, not here.)
export const setTenantSlug = (slug: string) => {
  api.defaults.headers.common['x-tenant-slug'] = slug;
  authApi.defaults.headers.common['x-tenant-slug'] = slug;
  if (typeof window !== 'undefined') {
    // sessionStorage, not localStorage: the tenant slug must be scoped to the
    // tab. localStorage is shared across every tab of this origin, so two tabs
    // on different tenants would clobber each other's slug and send the wrong
    // x-tenant-slug on pre-cookie requests. The authenticated source of truth
    // is the httpOnly cookie/token anyway; this is only a fallback header.
    sessionStorage.setItem('@apexMotors:tenant', slug);
  }
};

if (typeof window !== 'undefined') {
  const storedTenant = sessionStorage.getItem('@apexMotors:tenant');
  if (storedTenant) {
    api.defaults.headers.common['x-tenant-slug'] = storedTenant;
    authApi.defaults.headers.common['x-tenant-slug'] = storedTenant;
  }
}

// Clears the httpOnly cookie server-side. Best-effort: a failed request must
// not block the local sign-out flow that follows it.
export const logout = async (): Promise<void> => {
  try {
    await authApi.post('/auth/logout');
  } catch {
    // ignore — the caller still clears client state and redirects.
  }
};

let activeRequests = 0;

const handleRequestStart = (config: InternalAxiosRequestConfig) => {
  activeRequests++;
  if (typeof window !== 'undefined') {
    const tenant = sessionStorage.getItem('@apexMotors:tenant');
    if (tenant) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('x-tenant-slug', tenant);
      } else {
        config.headers['x-tenant-slug'] = tenant;
      }
    }
    window.dispatchEvent(new Event('api-load-start'));
  }
  return config;
};

const handleResponse = (response: AxiosResponse) => {
  activeRequests--;
  if (activeRequests === 0 && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('api-load-end'));
  }
  return response;
};

const handleError = (error: AxiosError) => {
  activeRequests--;
  if (activeRequests === 0 && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('api-load-end'));
  }
  if (error.response?.status === 401) {
    // The cookie is invalid/expired/absent; send the user back to login.
    if (typeof window !== 'undefined') {
      const tenant = sessionStorage.getItem('@apexMotors:tenant');
      // Do NOT bounce on the public auth pages. DataContext calls /auth/me on
      // every page mount; on forgot-password / reset-password the visitor is
      // legitimately unauthenticated, so that 401 must not hijack them back to
      // login (it was breaking first-access and password-reset links). Keep
      // this list in sync with PUBLIC_ROUTES in app/providers.tsx.
      const path = window.location.pathname;
      const onPublicAuthPage =
        path.includes('/login') ||
        path.includes('/forgot-password') ||
        path.includes('/reset-password');
      if (tenant && !onPublicAuthPage) {
        window.location.href = `/${tenant}/login`;
      }
    }
  }
  return Promise.reject(error);
};

api.interceptors.request.use(handleRequestStart);
api.interceptors.response.use(handleResponse, handleError);

authApi.interceptors.request.use(handleRequestStart);
authApi.interceptors.response.use(handleResponse, handleError);

export default api;
