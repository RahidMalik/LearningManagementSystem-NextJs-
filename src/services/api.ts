import { apiClient } from "@/types/apiClient";
import type { ApiResponse, AuthResponse } from "@/types/auth";

export const api = {
    // 1. Manual register logic {name,email,password}
    register: async (name: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
        const response = await apiClient.request<AuthResponse>('/auth/register', {
            method: "POST",
            data: { name, email, password }
        })
        if (response.success && response.data?.token) {
            apiClient.setToken(response.data?.token)
        }
        return response;
    },
    // Native login with only email and password
    login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
        const response = await apiClient.request<AuthResponse>('/auth/login', {
            method: 'POST',
            data: { email, password },
        });
        if (response.success && response.data?.token) {
            apiClient.setToken(response.data.token);
        };
        return response;
    },
    // Google Auth
    googleLogin: async (googleData: {
        email: string | null; name: string | null; uid: string | null; photoURL: string | null;
    }): Promise<ApiResponse<AuthResponse>> => {
        const response = await apiClient.request<AuthResponse>('/auth/google-login', {
            method: "POST",
            data: googleData,
        }
        )
        if (response.success && response.data?.token) {
            apiClient.setToken(response.data.token);
        }
        return response;
    },
    // Reset Password API Call
    resetPassword: async (newPassword: string): Promise<ApiResponse<{ message: string }>> => {
        const response = await apiClient.request<{ message: string }>('/api/auth/reset-password', {
            method: "POST",
            data: { newPassword },
        })
        return response;
    },
    // Remove token from localStorage
    logout: async () => {
        apiClient.setToken(null)
    },
    getProfile: async () => {
        return await apiClient.request('/me', {
            method: 'GET',
        });
    },
    updateProfile: async (data: { name: string }) => {
        return await apiClient.request('/me/update-profile', {
            method: 'PUT',
            data
        });
    }
}