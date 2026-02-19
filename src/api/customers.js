import api from './client';

export const getCustomers = (params) => api.get('/customers', { params });
export const getCustomer = (id) => api.get(`/customers/${id}`);
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);
export const addPoints = (id, data) => api.post(`/customers/${id}/add-points`, data);
export const deductPoints = (id, data) => api.post(`/customers/${id}/deduct-points`, data);
export const getTransactions = (id) => api.get(`/customers/${id}/transactions`);
