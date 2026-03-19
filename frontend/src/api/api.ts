import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

const handleApiError = (error: any, url: string) => {
  console.error(`API error for ${url}:`, error);
};

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const getRequest = async <T>(url: string, params?: object): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await api.get(url, { params });
    console.log('GET response:', response);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    handleApiError(error, url);

    return {
      data: {} as T,
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
    };
  }
};