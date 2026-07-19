import axios from 'axios';

// coreApi is the default api used by most components
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CORE_API_URL || 'https://apexmotors-core-service.onrender.com/core',
});

// authApi for login
export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://apexmotors-auth-service.onrender.com/auth',
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('@apexMotors:token', token);
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
    delete authApi.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('@apexMotors:token');
    }
  }
};

export const setTenantSlug = (slug: string) => {
  api.defaults.headers.common['x-tenant-slug'] = slug;
  authApi.defaults.headers.common['x-tenant-slug'] = slug;
  if (typeof window !== 'undefined') {
    localStorage.setItem('@apexMotors:tenant', slug);
  }
};

if (typeof window !== 'undefined') {
  const storedTenant = localStorage.getItem('@apexMotors:tenant');
  if (storedTenant) {
    api.defaults.headers.common['x-tenant-slug'] = storedTenant;
    authApi.defaults.headers.common['x-tenant-slug'] = storedTenant;
  }
}

let activeRequests = 0;

const handleRequestStart = (config: any) => {
  activeRequests++;
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('@apexMotors:token');
    const tenant = localStorage.getItem('@apexMotors:tenant');
    if (token) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
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

const handleResponse = (response: any) => {
  activeRequests--;
  if (activeRequests === 0 && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('api-load-end'));
  }
  return response;
};

const handleError = (error: any) => {
  activeRequests--;
  if (activeRequests === 0 && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('api-load-end'));
  }
  if (error.response?.status === 401) {
    // Optionally handle unauthorized (e.g., redirect to login)
    if (typeof window !== 'undefined') {
      setAuthToken(null);
      const tenant = localStorage.getItem('@apexMotors:tenant');
      if (tenant && !window.location.pathname.includes('/login')) {
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
