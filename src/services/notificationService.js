import api from '../api/axios';

export const fetchNotifications = async (page = 1, perPage = 15) => {
  const response = await api.get('/notifications', {
    params: { page, per_page: perPage },
  });
  return response.data;
};

export const fetchUnreadNotificationCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return Number(response.data?.meta?.unread_count ?? response.data?.data?.unread_count ?? 0);
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

