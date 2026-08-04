import axiosClient from '../../lib/axiosClient';

export const fetchThreads = async () => {
  const res = await axiosClient.get('/chat/threads');
  return res.data;
};

export const getOrCreateThread = async (payload) => {
  const res = await axiosClient.post('/chat/threads', payload);
  return res.data;
};

export const fetchMessages = async (threadId) => {
  const res = await axiosClient.get(`/chat/threads/${threadId}/messages`);
  return res.data;
};

export const sendMessage = async (threadId, body, imageUrl = '') => {
  const res = await axiosClient.post(`/chat/threads/${threadId}/messages`, { body, imageUrl });
  return res.data;
};

export const fetchNotifications = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await axiosClient.get(`/notifications?${query}`);
  return res.data;
};

export const fetchUnreadCount = async () => {
  const res = await axiosClient.get('/notifications/unread-count');
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await axiosClient.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await axiosClient.patch('/notifications/read-all');
  return res.data;
};
