import axiosClient from '../../lib/axiosClient';

export const fetchCommunityFeed = async () => {
  const res = await axiosClient.get('/feed');
  return res.data;
};

export const fetchUserAnalytics = async () => {
  const res = await axiosClient.get('/analytics/me');
  return res.data;
};

export const fetchCommunityAnalytics = async (communityId) => {
  const res = await axiosClient.get(`/analytics/community/${communityId}`);
  return res.data;
};

export const fetchAdminOverview = async () => {
  const res = await axiosClient.get('/admin/overview');
  return res.data;
};

export const fetchAdminMembers = async () => {
  const res = await axiosClient.get('/admin/members');
  return res.data;
};

export const postAnnouncement = async (data) => {
  const res = await axiosClient.post('/admin/announcements', data);
  return res.data;
};

export const fetchPendingCommunities = async () => {
  const res = await axiosClient.get('/platform/communities?status=pending');
  return res.data;
};

export const approveCommunity = async (id) => {
  const res = await axiosClient.patch(`/platform/communities/${id}/approve`);
  return res.data;
};

export const fetchAuditLogs = async () => {
  const res = await axiosClient.get('/platform/audit-log');
  return res.data;
};
