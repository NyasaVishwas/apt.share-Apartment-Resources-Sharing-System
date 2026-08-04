import axiosClient from '../../lib/axiosClient';

export const fetchBookings = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await axiosClient.get(`/bookings?${query}`);
  return res.data;
};

export const fetchBookingById = async (id) => {
  const res = await axiosClient.get(`/bookings/${id}`);
  return res.data;
};

export const createBooking = async (data) => {
  const res = await axiosClient.post('/bookings', data);
  return res.data;
};

export const approveBooking = async (id) => {
  const res = await axiosClient.patch(`/bookings/${id}/approve`);
  return res.data;
};

export const declineBooking = async (id, declineReason) => {
  const res = await axiosClient.patch(`/bookings/${id}/decline`, { declineReason });
  return res.data;
};

export const cancelBooking = async (id, cancellationReason) => {
  const res = await axiosClient.patch(`/bookings/${id}/cancel`, { cancellationReason });
  return res.data;
};

export const fetchPickupQr = async (id) => {
  const res = await axiosClient.get(`/bookings/${id}/qr/pickup`);
  return res.data;
};

export const fetchReturnQr = async (id) => {
  const res = await axiosClient.get(`/bookings/${id}/qr/return`);
  return res.data;
};

export const pickupScan = async (id, rawToken) => {
  const res = await axiosClient.post(`/bookings/${id}/pickup-scan`, { rawToken });
  return res.data;
};

export const returnScan = async (id, rawToken) => {
  const res = await axiosClient.post(`/bookings/${id}/return-scan`, { rawToken });
  return res.data;
};
