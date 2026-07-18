import apiClient from './client';

export const getBilling = (clientId) =>
  apiClient.get(`/api/clients/${clientId}/billing`).then((r) => r.data);

export const getPayments = (clientId) =>
  apiClient.get(`/api/clients/${clientId}/payments`).then((r) => r.data);

export const registerPayment = (clientId, data) =>
  apiClient.post(`/api/clients/${clientId}/payments`, data).then((r) => r.data);

export const deletePayment = (clientId, paymentId) =>
  apiClient.delete(`/api/clients/${clientId}/payments/${paymentId}`).then((r) => r.data);

export const exportBillingCsv = (clientId) =>
  apiClient.get(`/api/clients/${clientId}/billing/export`, { responseType: 'blob' }).then((r) => r.data);
