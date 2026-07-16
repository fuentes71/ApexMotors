import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { initialVehicles, initialFixedExpenses } from './mockData';
import { Vehicle, Expense } from '../types';

// Create an Axios instance
const api = axios.create({
  baseURL: '/api',
});

let activeRequests = 0;

api.interceptors.request.use(config => {
  activeRequests++;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('api-load-start'));
  }
  return config;
});

api.interceptors.response.use(
  response => {
    activeRequests--;
    if (activeRequests === 0 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('api-load-end'));
    }
    return response;
  },
  error => {
    activeRequests--;
    if (activeRequests === 0 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('api-load-end'));
    }
    return Promise.reject(error);
  }
);

// Configure the mock adapter
const mock = new MockAdapter(api, { delayResponse: 500 }); // simulate 500ms network delay

// Memory storage for our mock data
let vehicles = [...initialVehicles];
let fixedExpenses = [...initialFixedExpenses];

// --- Routes for Vehicles ---

// GET /vehicles
mock.onGet('/vehicles').reply(() => {
  return [200, vehicles];
});

// POST /vehicles
mock.onPost('/vehicles').reply((config) => {
  const newVehicle: Vehicle = JSON.parse(config.data);
  vehicles.push(newVehicle);
  return [201, newVehicle];
});

// PUT /vehicles/:id
mock.onPut(/\/vehicles\/.+/).reply((config) => {
  const urlParts = config.url?.split('/');
  const id = urlParts ? urlParts[urlParts.length - 1] : null;
  const updatedVehicle: Vehicle = JSON.parse(config.data);
  
  vehicles = vehicles.map(v => v.id === id ? updatedVehicle : v);
  return [200, updatedVehicle];
});

// DELETE /vehicles/:id
mock.onDelete(/\/vehicles\/.+/).reply((config) => {
  const urlParts = config.url?.split('/');
  const id = urlParts ? urlParts[urlParts.length - 1] : null;
  
  vehicles = vehicles.filter(v => v.id !== id);
  return [204];
});

// --- Routes for Expenses ---

// GET /expenses
mock.onGet('/expenses').reply(() => {
  return [200, fixedExpenses];
});

// POST /expenses
mock.onPost('/expenses').reply((config) => {
  const newExpense: Expense = JSON.parse(config.data);
  fixedExpenses.push(newExpense);
  return [201, newExpense];
});

// PUT /expenses/:id
mock.onPut(/\/expenses\/.+/).reply((config) => {
  const urlParts = config.url?.split('/');
  const id = urlParts ? urlParts[urlParts.length - 1] : null;
  const updatedExpense: Expense = JSON.parse(config.data);
  
  fixedExpenses = fixedExpenses.map(e => e.id === id ? updatedExpense : e);
  return [200, updatedExpense];
});

// DELETE /expenses/:id
mock.onDelete(/\/expenses\/.+/).reply((config) => {
  const urlParts = config.url?.split('/');
  const id = urlParts ? urlParts[urlParts.length - 1] : null;
  
  fixedExpenses = fixedExpenses.filter(e => e.id !== id);
  return [204];
});

// Export the axios instance to be used by the app
export default api;
