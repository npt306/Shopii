import axios, { AxiosError } from "axios";
import { UserDto, LoginResponse, RefreshTokenResponse, RegisterResponse } from "../interfaces/user";

// API service to connect with the NestJS backend
export const userService = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        try {
            axios.defaults.withCredentials = true;
            // localhost:3003 for testing
            // console.log(`http://34.58.241.34:3003/Users/login`);
            const response = await axios.post<LoginResponse>(`http://34.58.241.34:3003/Users/login`, { username, password });
            // const response = await axios.post<LoginResponse>(`http://localhost:3003/Users/login`, { username, password });
            return response.data;
        } catch (error) {
            console.log(error);
            const axiosError = error as AxiosError<{ message: string }>;
            throw new Error(axiosError.response?.data?.message || 'Login failed');
        }
    },

    register: async (userData: any): Promise<RegisterResponse> => {
        try {
            axios.defaults.withCredentials = true;
            const response = await axios.post<RegisterResponse>(`http://34.58.241.34:3003/Users/register`, userData);
            // const response = await axios.post<RegisterResponse>(`http://localhost:3003/Users/register`, userData);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            throw new Error(axiosError.response?.data?.message || 'Registration failed');
        }
    },

    verifyEmail: async (email: string): Promise<{ success: boolean; message: string }> => {
        try {
          axios.defaults.withCredentials = true;
          const response = await axios.post<{ success: boolean; message: string }>(
            `http://34.58.241.34:3003/Users/send-verification-email`,
            { email }
          );
          return response.data;
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          throw new Error(axiosError.response?.data?.message || 'Email verification failed');
        }
      },

    refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
        try {
            axios.defaults.withCredentials = true;
            const response = await axios.post<RefreshTokenResponse>('/Users/refresh_token', { refresh_token: refreshToken });
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            throw new Error(axiosError.response?.data?.message || 'Token refresh failed');
        }
    },

    checkEmailExistOrVerfied: async (email: string): Promise<{ success: boolean; message: string }> => {
        try {
            axios.defaults.withCredentials = true;
            const response = await axios.post<{ success: boolean; message: string }>(`http://34.58.241.34:3003/Users/check-email-verification`, { email });
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            throw new Error(axiosError.response?.data?.message || 'Email verification failed');
        }
    },
};