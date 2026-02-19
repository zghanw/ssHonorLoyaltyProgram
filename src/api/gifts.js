import api from './client';

export const getGifts = () => api.get('/gifts');
export const createGift = (data) => api.post('/gifts', data);
export const updateGift = (id, data) => api.put(`/gifts/${id}`, data);
export const deleteGift = (id) => api.delete(`/gifts/${id}`);
