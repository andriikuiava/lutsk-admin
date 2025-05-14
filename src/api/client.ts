import axios from 'axios';
import type { AuthResponse, User, Place, Event, Article, Tour, UploadResponse, IAPVerification, UserInfo, PromoCode } from '../types/api';

// Use environment variable or fallback to absolute URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api`
    : 'https://nataliakuiava.com/api';

// Token refresh threshold (5 minutes in milliseconds)
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies in cross-origin requests
});

// Check if token is expired or about to expire
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() + TOKEN_REFRESH_THRESHOLD >= expirationTime;
  } catch {
    return true;
  }
};

// Refresh token function
const refreshToken = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
  } catch (error) {
    // If refresh fails, clear tokens and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    throw error;
  }
};

// Add token to requests and handle refresh
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    // Check if token needs refresh
    if (isTokenExpired(token)) {
      await refreshToken();
      // Get the new token after refresh
      const newToken = localStorage.getItem('accessToken');
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Handle CORS errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 403 && error.config.method === 'options') {
        // Retry the request without the preflight
        return axios({
          ...error.config,
          headers: {
            ...error.config.headers,
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Handle 401 Unauthorized errors
      if (error.response?.status === 401 && !error.config._retry) {
        error.config._retry = true;
        try {
          await refreshToken();
          // Retry the original request with new token
          const newToken = localStorage.getItem('accessToken');
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axios(error.config);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
);

// Auth endpoints
export const auth = {
  register: (data: { email: string; password: string; fullName: string }) =>
      api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
      api.post<AuthResponse>('/auth/login', data),
  apple: (data: { identityToken: string }) =>
      api.post<AuthResponse>('/auth/apple', data),
  google: (data: { idToken: string }) =>
      api.post<AuthResponse>('/auth/google', data),
  refreshToken: (data: { refreshToken: string }) =>
      api.post<AuthResponse>('/auth/refresh-token', data),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
      api.post<AuthResponse>('/auth/change-password', data),
  deleteUser: (data: { password: string }) =>
      api.delete('/auth/user', { data }),
};

// User endpoints
export const users = {
  getMe: () => api.get<User>('/users/me'),
};

// Admin user endpoints
export const adminUsers = {
  getAll: () => api.get<UserInfo[]>('/admin/users'),
  grantTourAccess: (userId: number, tourId: string) =>
    api.post(`/admin/users/${userId}/tours/${tourId}`),
  revokeTourAccess: (userId: number, tourId: string) =>
    api.delete(`/admin/users/${userId}/tours/${tourId}`),
  deleteUser: (userId: number) =>
    api.delete(`/admin/users/${userId}`),
};

// Places endpoints
export const places = {
  getAll: () => api.get<Place[]>('/places'),
  getById: (id: string) => api.get<Place>(`/places/${id}`),
  create: (formData: FormData) => api.post<Place>('/places', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id: string, formData: FormData) => api.put<Place>(`/places/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  delete: (id: string) => api.delete(`/places/${id}`),
};

// Events endpoints
export const events = {
  getAll: () => api.get<Event[]>('/events'),
  getById: (id: string) => api.get<Event>(`/events/${id}`),
  create: (formData: FormData) => api.post<Event>('/events', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id: string, formData: FormData) => api.put<Event>(`/events/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  delete: (id: string) => api.delete(`/events/${id}`),
};

// Articles endpoints
export const articles = {
  getAll: () => api.get<Article[]>('/articles'),
  getById: (id: string) => api.get<Article>(`/articles/${id}`),
  create: (data: Omit<Article, 'id' | 'datePublished'>) => api.post<Article>('/articles', data),
  update: (id: string, data: Omit<Article, 'id' | 'datePublished'>) => api.put<Article>(`/articles/${id}`, data),
  delete: (id: string) => api.delete(`/articles/${id}`),
};

// Tours endpoints
export const tours = {
  getAll: () => api.get<Tour[]>('/tours'),
  getById: (id: string) => api.get<Tour>(`/tours/${id}`),
  create: (data: Omit<Tour, 'id' | 'datePublished'>) => api.post<Tour>('/tours', data),
  update: (id: string, data: Omit<Tour, 'id' | 'datePublished'>) => api.put<Tour>(`/tours/${id}`, data),
  delete: (id: string) => api.delete(`/tours/${id}`),
};

// Upload endpoints
export const uploads = {
  image: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<UploadResponse>('/uploads/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  },
  eventImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post<UploadResponse>('/uploads/event-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  },
  articleImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post<UploadResponse>('/uploads/article-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  },
  placeImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post<UploadResponse>('/uploads/place-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  },
  tourImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post<UploadResponse>('/uploads/tour-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  },
  tourAudio: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post<UploadResponse>('/uploads/tour-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  },
};

// IAP endpoints
export const iap = {
  verify: (data: IAPVerification) => api.post('/iap/verify', data),
};

// PromoCode endpoints
export const promos = {
  getAll: () => api.get<PromoCode[]>('/promo'),
  create: (data: Omit<PromoCode, 'id' | 'currentActivations'>) => api.post<PromoCode>('/promo/create', data),
  update: (id: string, data: Partial<PromoCode>) => api.put<PromoCode>(`/promo/${id}`, data),
  sendEmails: (data: { promoCodeId: string, emails: string[] }) => api.post('/promo/send', data),
};