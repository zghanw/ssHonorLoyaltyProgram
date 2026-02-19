import api from './client';

export const redeemGift = (data) => api.post('/redeem', data);
export const getRedemptions = () => api.get('/redemptions');
