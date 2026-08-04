import axiosClient from '../../lib/axiosClient';

export const submitRating = async (data) => {
  const res = await axiosClient.post('/ratings', data);
  return res.data;
};

export const fetchUserRatings = async (userId) => {
  const res = await axiosClient.get(`/ratings/user/${userId}`);
  return res.data;
};

export const fetchListingRatings = async (listingId) => {
  const res = await axiosClient.get(`/ratings/listing/${listingId}`);
  return res.data;
};

export const fileDamageReport = async (data) => {
  const res = await axiosClient.post('/damage-reports', data);
  return res.data;
};

export const fetchCommunityDisputes = async (communityId) => {
  const res = await axiosClient.get(`/damage-reports/community/${communityId}`);
  return res.data;
};

export const resolveDispute = async (reportId, data) => {
  const res = await axiosClient.patch(`/damage-reports/${reportId}/resolve`, data);
  return res.data;
};
