// API utility for making HTTP requests
// Use empty string to leverage Vite's proxy configuration
const API_URL = import.meta.env.VITE_API_URL || '';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};

const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  return handleResponse(response);
};

// Services API
export const servicesAPI = {
  getAll: async () => {
    const response = await apiRequest('/api/services');
    return response.services || response; // Handle both {services: []} and [] responses
  },
  getById: async (id) => {
    const response = await apiRequest(`/api/services/${id}`);
    return response.service || response;
  },
  create: async (data) => {
    const response = await apiRequest('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.service || response;
  },
  update: async (id, data) => {
    const response = await apiRequest(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.service || response;
  },
  delete: (id) => apiRequest(`/api/services/${id}`, {
    method: 'DELETE',
  }),
};

// Orders API
export const ordersAPI = {
  getAll: async () => {
    const response = await apiRequest('/api/orders');
    return response.orders || response;
  },
  getById: async (id) => {
    const response = await apiRequest(`/api/orders/${id}`);
    return response.order || response;
  },
  create: (data) => apiRequest('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStatus: (id, data) => apiRequest(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  uploadPayment: (id, data) => apiRequest(`/api/orders/${id}/payment`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  verifyPayment: (id, paymentIndex, action) => apiRequest(`/api/orders/${id}/payment/${paymentIndex}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  }),
  uploadFiles: (id, data) => apiRequest(`/api/orders/${id}/files`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  addNote: (id, message) => apiRequest(`/api/orders/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  }),
  requestRevision: (id, reason) => apiRequest(`/api/orders/${id}/revision`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
  approveWork: (id) => apiRequest(`/api/orders/${id}/approve`, {
    method: 'POST',
  }),
  walletPay: (id, type) => apiRequest(`/api/orders/${id}/wallet-pay`, {
    method: 'POST',
    body: JSON.stringify({ type }),
  }),
};

// Tasks API
export const tasksAPI = {
  getAll: async () => {
    const response = await apiRequest('/api/tasks');
    return response.tasks || response;
  },
  getById: async (id) => {
    const response = await apiRequest(`/api/tasks/${id}`);
    return response.task || response;
  },
  create: (data) => apiRequest('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiRequest(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/api/tasks/${id}`, {
    method: 'DELETE',
  }),
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await apiRequest('/api/users');
    return response.users || response;
  },
  getTeam: async () => {
    const response = await apiRequest('/api/users/team');
    return response.teamMembers || response;
  },
  getById: async (id) => {
    const response = await apiRequest(`/api/users/${id}`);
    return response.user || response;
  },
  update: (id, data) => apiRequest(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  changePassword: (id, data) => apiRequest(`/api/users/${id}/change-password`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiRequest(`/api/users/${id}`, {
    method: 'DELETE',
  }),
};

// Wallet API
export const walletAPI = {
  getBalance: () => apiRequest('/api/wallet/balance'),
  getTransactions: () => apiRequest('/api/wallet/transactions'),
  topup: (data) => apiRequest('/api/wallet/topup', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  pay: (amount, orderId) => apiRequest('/api/wallet/pay', {
    method: 'POST',
    body: JSON.stringify({ amount, orderId }),
  }),
  // Admin endpoints
  getPendingTopups: () => apiRequest('/api/wallet/pending-topups'),
  getAllTransactions: () => apiRequest('/api/wallet/all-transactions'),
  reviewTopup: (id, action) => apiRequest(`/api/wallet/topup/${id}/review`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  }),
};

// Upload API
export const uploadAPI = {
  single: (formData) => apiRequest('/api/upload/single', {
    method: 'POST',
    body: formData,
  }),
  multiple: (formData) => apiRequest('/api/upload/multiple', {
    method: 'POST',
    body: formData,
  }),
};

// Packages API
export const packagesAPI = {
  getAll: async () => {
    const response = await apiRequest('/api/packages');
    return response.packages || response;
  },
  getById: async (id) => {
    const response = await apiRequest(`/api/packages/${id}`);
    return response.package || response;
  },
  create: async (data) => {
    const response = await apiRequest('/api/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.package || response;
  },
  update: async (id, data) => {
    const response = await apiRequest(`/api/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.package || response;
  },
  delete: (id) => apiRequest(`/api/packages/${id}`, {
    method: 'DELETE',
  }),
};

// Subscriptions API
export const subscriptionsAPI = {
  getAll: async () => {
    const response = await apiRequest('/api/subscriptions');
    return response.subscriptions || response;
  },
  getById: async (id) => {
    const response = await apiRequest(`/api/subscriptions/${id}`);
    return response.subscription || response;
  },
  subscribe: async (packageId) => {
    const response = await apiRequest('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ packageId }),
    });
    return response;
  },
  approve: async (id) => {
    const response = await apiRequest(`/api/subscriptions/${id}/approve`, {
      method: 'PATCH',
    });
    return response;
  },
  cancel: async (id, reason) => {
    const response = await apiRequest(`/api/subscriptions/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
    return response;
  },
  assignTask: async (subId, taskId, assignedTo) => {
    const response = await apiRequest(`/api/subscriptions/${subId}/tasks/${taskId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo }),
    });
    return response;
  },
  uploadRaw: async (subId, taskId, data) => {
    const response = await apiRequest(`/api/subscriptions/${subId}/tasks/${taskId}/raw`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },
  uploadDeliverables: async (subId, taskId, data) => {
    const response = await apiRequest(`/api/subscriptions/${subId}/tasks/${taskId}/deliverables`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },
  completeTask: async (subId, taskId) => {
    const response = await apiRequest(`/api/subscriptions/${subId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
    });
    return response;
  },
  // Payment endpoints
  payDirect: async (subId, slip) => {
    const response = await apiRequest(`/api/subscriptions/${subId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ slip }),
    });
    return response;
  },
  walletPay: async (subId) => {
    const response = await apiRequest(`/api/subscriptions/${subId}/wallet-pay`, {
      method: 'POST',
    });
    return response;
  },
  verifyPayment: async (subId, action) => {
    const response = await apiRequest(`/api/subscriptions/${subId}/verify-payment`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });
    return response;
  },
  // Cycle management endpoints (admin only)
  updateCycleSettings: async (subId, cycleDays, cycleStartDate) => {
    const response = await apiRequest(`/api/subscriptions/${subId}/cycle-settings`, {
      method: 'PATCH',
      body: JSON.stringify({ cycleDays, cycleStartDate }),
    });
    return response;
  },
  updateTaskDeadline: async (subId, taskId, deadline) => {
    const response = await apiRequest(`/api/subscriptions/${subId}/tasks/${taskId}/deadline`, {
      method: 'PATCH',
      body: JSON.stringify({ deadline }),
    });
    return response;
  },
  resetCycle: async (subId) => {
    const response = await apiRequest(`/api/subscriptions/${subId}/cycle-reset`, {
      method: 'POST',
    });
    return response;
  },
  // Final payment endpoints
  payFinalDirect: async (subId, slip) => {
    const response = await apiRequest(`/api/subscriptions/${subId}/final-pay`, {
      method: 'POST',
      body: JSON.stringify({ slip }),
    });
    return response;
  },
  walletPayFinal: async (subId) => {
    const response = await apiRequest(`/api/subscriptions/${subId}/final-wallet-pay`, {
      method: 'POST',
    });
    return response;
  },
  verifyFinalPayment: async (subId, action) => {
    const response = await apiRequest(`/api/subscriptions/${subId}/verify-final-payment`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });
    return response;
  },
  renewSubscription: async (subId) => {
    const response = await apiRequest(`/api/subscriptions/${subId}/renew`, {
      method: 'POST',
    });
    return response;
  },
};

// Auth API
export const authAPI = {
  login: (email, password) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (data) => apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  createUser: (data) => apiRequest('/api/auth/create-user', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMe: () => apiRequest('/api/auth/me'),
  forgotPassword: (email) => apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  resetPassword: (token, password) => apiRequest(`/api/auth/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  }),
};

// Notifications API
export const notificationsAPI = {
  getAll: async () => {
    const response = await apiRequest('/api/notifications');
    return response;
  },
  markAsRead: (id) => apiRequest(`/api/notifications/${id}/read`, {
    method: 'PATCH',
  }),
  markAllAsRead: () => apiRequest('/api/notifications/mark-all-read', {
    method: 'PATCH',
  }),
  delete: (id) => apiRequest(`/api/notifications/${id}`, {
    method: 'DELETE',
  }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => apiRequest('/api/analytics'),
};

// Banners API
export const bannersAPI = {
  getActive: async () => {
    const response = await apiRequest('/api/banners');
    return response.banners || response;
  },
  getAll: async () => {
    const response = await apiRequest('/api/banners/all');
    return response.banners || response;
  },
  create: async (data) => {
    const response = await apiRequest('/api/banners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  },
  update: async (id, data) => {
    const response = await apiRequest(`/api/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  },
  toggle: async (id) => {
    const response = await apiRequest(`/api/banners/${id}/toggle`, {
      method: 'PATCH',
    });
    return response;
  },
  delete: (id) => apiRequest(`/api/banners/${id}`, {
    method: 'DELETE',
  }),
};

// Settings API
export const settingsAPI = {
  get: async (key) => {
    const response = await apiRequest(`/api/settings/${key}`);
    return response;
  },
  update: async (key, value) => {
    const response = await apiRequest(`/api/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
    return response;
  },
};

export default apiRequest;
