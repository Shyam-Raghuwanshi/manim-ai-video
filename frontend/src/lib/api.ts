import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add authorization header when token is available
api.interceptors.request.use(
  (config) => {
    // Check if running on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication APIs
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
  updateProfile: async (data: { name?: string }) => {
    const response = await api.put('/api/auth/me', data);
    return response.data;
  },
};

// Video APIs
export const videoAPI = {
  getVideos: async (page = 1, perPage = 10) => {
    const response = await api.get(`/api/videos?page=${page}&per_page=${perPage}`);
    return response.data;
  },
  getVideo: async (videoId: string) => {
    const response = await api.get(`/api/videos/${videoId}`);
    return response.data;
  },
  generateVideo: async (prompt: string) => {
    const response = await api.post('/api/videos/generate', { prompt });
    return response.data;
  },
  getVideoCode: async (videoId: string) => {
    const response = await api.get(`/api/videos/${videoId}/code`);
    return response.data;
  },
  // Get the appropriate video URL - use S3 URL if available
  getVideoUrl: (video: any): string => {
    if (video.s3_video_url) {
      return video.s3_video_url;
    } else {
      return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/videos/${video.id}/file`;
    }
  }
};

export default api;