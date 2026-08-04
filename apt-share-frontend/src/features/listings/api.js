import axiosClient from '../../lib/axiosClient';

export const fetchListings = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await axiosClient.get(`/listings?${query}`);
  return res;
};

export const fetchListingById = async (id) => {
  const res = await axiosClient.get(`/listings/${id}`);
  return res.data;
};

export const fetchMyListings = async () => {
  const res = await axiosClient.get('/listings/mine');
  return res.data;
};

export const createListing = async (data) => {
  const res = await axiosClient.post('/listings', data);
  return res.data;
};

export const updateListing = async (id, data) => {
  const res = await axiosClient.patch(`/listings/${id}`, data);
  return res.data;
};

export const updateListingStatus = async (id, status) => {
  const res = await axiosClient.patch(`/listings/${id}/status`, { status });
  return res.data;
};

export const fetchWishlist = async () => {
  const res = await axiosClient.get('/wishlist');
  return res.data;
};

export const toggleWishlist = async (payload) => {
  const res = await axiosClient.post('/wishlist', payload);
  return res.data;
};

export const removeFromWishlist = async (id) => {
  const res = await axiosClient.delete(`/wishlist/${id}`);
  return res.data;
};
