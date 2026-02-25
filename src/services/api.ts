import { apiClient } from "@/types/apiClient";
import type { ApiResponse, AuthResponse } from "@/types/auth";

export interface IMessage {
    _id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    text: string;
    seen: boolean;
    createdAt: string;
}
export interface IConversation {
    _id: string;
    participants: any[];
    lastMessage: string;
    updatedAt: string;
}
// --- COURSE TYPES ---
export interface ICourse {
    _id: string;
    title: string;
    instructor: string;
    price: number;
    image: string;
    progress?: number;
    description?: string;
}
// --- COURSE ADMINTYPES ---
export interface ICourseAdmin {
    _id: string;
    name: string;
    price: number;
    thumbnail: string;
    videoUrl?: string;
    videoName?: string;
    status?: string;
}
export const api = {
    // ==========================================
    //           Authentication Logic
    // ==========================================
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
    // ==========================================
    //           Profile Logic
    // ==========================================
    getProfile: async () => {
        return await apiClient.request('/me', {
            method: 'GET',
        });
    },
    updateProfile: async (data: { name: string, photoURL: string }) => {
        return await apiClient.request('/me/update-profile', {
            method: 'PUT',
            data
        });
    },

    UpdateProfilePhoto: async (file: File) => {
        const formData = new FormData();
        formData.append("avatar", file);
        return await apiClient.request("/me/update-photo", {
            method: "POST",
            data: formData,
        });

        // ==========================================
        //           Messages Logic
        // ==========================================
    }, getConversations: async (): Promise<ApiResponse<IConversation[]>> => {
        return await apiClient.request<IConversation[]>('/messages/conversation', {
            method: 'GET',
        });
    },

    // 2. Fetch messages for a specific chat
    getMessages: async (convId: string): Promise<ApiResponse<IMessage[]>> => {
        return await apiClient.request<IMessage[]>(`/messages?convId=${convId}`, {
            method: 'GET',
        });
    },

    // 3. Send a new message
    sendMessage: async (payload: {
        senderId: string;
        receiverId: string;
        text: string;
        conversationId?: string;
    }): Promise<ApiResponse<IMessage>> => {
        return await apiClient.request<IMessage>('/messages', {
            method: 'POST',
            data: payload,
        });
    },

    // 4. Mark message as seen
    markAsSeen: async (messageId: string): Promise<ApiResponse<{ success: boolean }>> => {
        return await apiClient.request<{ success: boolean }>('/messages/seen', {
            method: 'PUT',
            data: { messageId },
        });
    },


    // ==========================================
    //           COURSES API LOGIC
    // ==========================================
    getMyCourses: async (): Promise<ApiResponse<ICourse[]>> => {
        return await apiClient.request("/course/my-courses", {
            method: "GET",
        });
    },
    getAllCourses: async (): Promise<ApiResponse<{ courses: ICourse[] }>> => {
        return await apiClient.request("/courses/all-courses", {
            method: "GET",
        });
    },
    getCourseDetails: async (courseId: string): Promise<ApiResponse<ICourse>> => {
        return await apiClient.request(`/course/${courseId}`, {
            method: "GET"
        })
    },
    // ==========================================
    //           ADMIN CREATE COURSES
    // ==========================================
    createCourse: async (
        formData: FormData,
        onProgress?: (percent: number) => void // Callback add kiya
    ): Promise<ApiResponse<{ course: ICourseAdmin }>> => {
        return await apiClient.request("/admin/courses/create-courses", {
            method: "POST",
            data: formData,
            onUploadProgress: (progressEvent: any) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            }
        })
    },
    // ==========================================
    //           UPDATE COURSES
    // ==========================================
    updateCourse: async (
        formData: FormData,
        courseId: string,
        onProgress?: (percent: number) => void
    ): Promise<ApiResponse<{ course: ICourseAdmin }>> => {
        return await apiClient.request(`/admin/courses/${courseId}`, {
            method: "PUT",
            data: formData,
            onUploadProgress: (progressEvent: any) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            }
        })
    },
    // ==========================================
    //           DELETE COURSES
    // ==========================================
    deleteCourse: async (courseId: string): Promise<ApiResponse<ICourseAdmin>> => {
        return await apiClient.request(`/admin/courses/${courseId}`, {
            method: "DELETE",
        })
    },
    // ==========================================
    //           UPDATE COURSES
    // ==========================================

}