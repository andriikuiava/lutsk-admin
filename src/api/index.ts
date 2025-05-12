import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nataliakuiava.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const uploads = {
  uploadFiles: async (endpoint: string, formData: FormData) => {
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};