import api from './client';

/* ------------------------------------------------------------------ */
/*  Auth                                                               */
/* ------------------------------------------------------------------ */
export const authAPI = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  updateProfile: (formData) => api.put('/auth/profile', formData).then((r) => r.data),
  changePassword: (data) => api.put('/auth/change-password', data).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
};

/* ------------------------------------------------------------------ */
/*  Items                                                              */
/* ------------------------------------------------------------------ */
export const itemsAPI = {
  list: (type, params) => api.get(`/items/${type}`, { params }).then((r) => r.data),
  search: (params) => api.get('/items/search', { params }).then((r) => r.data),
  get: (id) => api.get(`/items/${id}`).then((r) => r.data),
  create: (type, formData) => api.post(`/items/${type}`, formData).then((r) => r.data),
  update: (id, formData) => api.put(`/items/${id}`, formData).then((r) => r.data),
  remove: (id) => api.delete(`/items/${id}`).then((r) => r.data),
  markReturned: (id) => api.put(`/items/${id}/returned`).then((r) => r.data),
  myPosts: () => api.get('/items/my-posts').then((r) => r.data),
};

/* ------------------------------------------------------------------ */
/*  Chat                                                               */
/* ------------------------------------------------------------------ */
export const chatAPI = {
  startConversation: (itemId) => api.post('/messages/conversations', { itemId }).then((r) => r.data),
  conversations: () => api.get('/messages/conversations').then((r) => r.data),
  messages: (conversationId) =>
    api.get(`/messages/conversations/${conversationId}/messages?markRead=true`).then((r) => r.data),
  send: (data) => api.post('/messages', data).then((r) => r.data),
  uploadAttachment: (formData) => api.post('/messages/attachment', formData).then((r) => r.data),
  unreadCount: () => api.get('/messages/unread-count').then((r) => r.data),
};

/* ------------------------------------------------------------------ */
/*  Notifications                                                      */
/* ------------------------------------------------------------------ */
export const notificationsAPI = {
  list: (params) => api.get('/notifications', { params }).then((r) => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then((r) => r.data),
  markRead: (id) => api.put(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.put('/notifications/read-all').then((r) => r.data),
};

/* ------------------------------------------------------------------ */
/*  Reports                                                            */
/* ------------------------------------------------------------------ */
export const reportsAPI = {
  create: (data) => api.post('/reports', data).then((r) => r.data),
  mine: () => api.get('/reports/mine').then((r) => r.data),
};

/* ------------------------------------------------------------------ */
/*  Admin                                                              */
/* ------------------------------------------------------------------ */
export const adminAPI = {
  users: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  items: (params) => api.get('/admin/items', { params }).then((r) => r.data),
  reports: (params) => api.get('/admin/reports', { params }).then((r) => r.data),
  statistics: () => api.get('/admin/statistics').then((r) => r.data),
  overview: () => api.get('/admin/overview').then((r) => r.data),
  suspendUser: (id, suspended) =>
    api.put(`/admin/users/${id}/suspend`, { suspended }).then((r) => r.data),
  updateReport: (id, status) => api.put(`/admin/reports/${id}`, { status }).then((r) => r.data),
  deleteItem: (id) => api.delete(`/admin/items/${id}`).then((r) => r.data),
};
