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
    instructorImage: string;
    price: number;
    image?: string;
    thumbnail?: string;
    progress?: number;
    description?: string;
    videoUrl?: string;
    lectures?: {
        title: string;
        videoUrl: string
    }[];
    category?: string;
    badge?: string;
    level?: string;
    rating?: string;
    hours?: string;
    language?: string;
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
    },
    getConversations: async (): Promise<ApiResponse<IConversation[]>> => {
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
    // 5. Get Admin Info
    getAdminInfo: async (): Promise<ApiResponse<any>> => {
        return await apiClient.request<any>('/messages/admin-info', {
            method: 'GET',
        });
    },
    // ==========================================
    //           Notifications
    // ==========================================
    getNotifications: async (): Promise<ApiResponse<any>> => {
        return await apiClient.request("/notifications", { method: "GET" });
    },

    markAllNotificationsRead: async (): Promise<ApiResponse<any>> => {
        return await apiClient.request("/notifications/read", { method: "PUT" });
    },

    deleteNotification: async (id: string): Promise<ApiResponse<any>> => {
        return await apiClient.request(`/notifications?id=${id}`, { method: "DELETE" });
    },
    // ==========================================
    //           COURSES API LOGIC
    // ==========================================
    getAllCourses: async (): Promise<ApiResponse<{ courses: ICourse[] }>> => {
        return await apiClient.request("/courses/all-courses", {
            method: "GET",
        });
    },
    getMyCourses: async (): Promise<ApiResponse<ICourse[]>> => {
        try {
            const response = await apiClient.request("/courses/my-courses", {
                method: "GET",
            });
            if (!response.success || !response.data) {
                return { success: true, data: [], message: "" };
            }
            return response;
        } catch (error: any) {
            console.warn("getMyCourses:", error?.message || "No courses found");
            return { success: true, data: [], message: "" };
        }
    },
    getCourseDetails: async (courseId: string): Promise<ApiResponse<ICourse>> => {
        return await apiClient.request(`/courses/${courseId}`, {
            method: "GET"
        })
    },
    toggleStudentAccess: async (userId: string, status: "active" | "revoked"): Promise<ApiResponse<any>> => {
        return await apiClient.request("/admin/students/toggle-access", {
            method: "POST",
            data: { userId, status },
        });
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
    getAllStudents: async (page = 1, limit = 100): Promise<ApiResponse<any>> => {
        return await apiClient.request(`/admin/students?page=${page}&limit=${limit}`)
    },
    // ==========================================
    //           Payment Method
    // ==========================================
    enrollInCourse: async (courseId: string, accessType: "half" | "full" = "full") => {
        return await apiClient.request("/courses/enroll", {
            method: "POST",
            data: { courseId, accessType },
        });
    },
    updateProgress: async (courseId: string, progress: number) => {
        return await apiClient.request("/courses/update-progress", {
            method: "POST",
            data: { courseId, progress },
        });
    },
    checkEnrollment: async (courseId: string): Promise<{
        success: boolean;
        isEnrolled: boolean;
        accessType: "half" | "full" | null;
        paymentMethod: "card" | "wallet" | null;
    }> => {
        try {
            const res = await apiClient.request(`/courses/check-enrollment?courseId=${courseId}`);
            const inner: any = res?.data ?? res;

            const isEnrolled = inner?.isEnrolled === true;
            const accessType: "half" | "full" | null =
                inner?.accessType === "half" ? "half" :
                    inner?.accessType === "full" ? "full" :
                        isEnrolled ? "full" : null;

            const paymentMethod: "card" | "wallet" | null =
                inner?.paymentMethod === "wallet" ? "wallet" :
                    inner?.paymentMethod === "card" ? "card" :
                        isEnrolled ? "card" : null;

            return { success: true, isEnrolled, accessType, paymentMethod };
        } catch {
            return { success: false, isEnrolled: false, accessType: null, paymentMethod: null };
        }
    },
    toggleCourseAccess: async (enrollmentId: string, status: "active" | "revoked"): Promise<ApiResponse<any>> => {
        return await apiClient.request("/admin/students/toggle-course", {
            method: "POST",
            data: { enrollmentId, status },
        });
    },
    // ==========================================
    //           Payment Logic
    // ==========================================
    createPaymentIntent: async (
        courseId: string,
        accessType: string = "full"
    ): Promise<ApiResponse<{ clientSecret: string; amount: number }>> => {
        return await apiClient.request("/payments/create-intent", {
            method: "POST",
            data: { courseId, accessType },
        });
    },

    uploadToCloudinary: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.request<{ success: boolean; url: string }>(
            "/payments/upload-receipt",
            {
                method: "POST",
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        if (response?.url) {
            return response.url;
        } else if (response?.data?.url) {
            return response.data.url;
        } else {
            throw new Error(response?.error || "Failed to get image URL");
        }
    },

    // Updated WalletVerify
    WalletVerify: async (data: {
        courseId: string;
        method: string;
        phone: string;
        amount: number;
        userId: string;
        receiptUrl: string;
        accessType?: string;
    }): Promise<ApiResponse<{ success: boolean; message: string }>> => {
        return await apiClient.request("/payments/wallet-verify", {
            method: "POST",
            data: data,
        });
    },
    getAdminRevenue: async (): Promise<ApiResponse<any>> => {
        return await apiClient.request("/admin/revenue", {
            method: "GET",
        });
    },
    getCourseStats: async (): Promise<ApiResponse<any>> => {
        return await apiClient.request("/admin/course-stats")
    },
    getAdminWalletPayments: async (): Promise<ApiResponse<any>> => {
        return await apiClient.request("/admin/payments", {
            method: "GET",
        });
    },
    // ==========================================
    //           Send email
    // ==========================================

    approveWalletPayment: async (paymentId: string): Promise<ApiResponse<any>> => {
        return await apiClient.request("/admin/payments/approve", {
            method: "POST",
            data: { paymentId },
        });
    },

    rejectWalletPayment: async (paymentId: string): Promise<ApiResponse<any>> => {
        return await apiClient.request("/admin/payments/reject", {
            method: "POST",
            data: { paymentId },
        });
    },
    sendWalletInstructions: async (data: {
        email: string;
        method: string;
        amount: number;
        phone: string;
    }) => {
        return await apiClient.request("/mail/payments/send-instructions", {
            method: "POST",
            data,
        });
    },
    // ==========================================
    //           Reviews
    // ==========================================
    //for user
    getReviews: async (courseId: string): Promise<ApiResponse<{
        reviews: any[];
        avgRating: number;
        totalReviews: number;
    }>> => {
        return await apiClient.request(`/courses/${courseId}/reviews`, {
            method: "GET",
        });
    },

    submitReview: async (courseId: string, data: {
        rating: number;
        comment: string;
    }): Promise<ApiResponse<{ review: any }>> => {
        return await apiClient.request(`/courses/${courseId}/reviews`, {
            method: "POST",
            data,
        });
    },
    deleteOwnReview: async (courseId: string, reviewId: string): Promise<ApiResponse<any>> => {
        return await apiClient.request(`/courses/${courseId}/reviews?reviewId=${reviewId}`, {
            method: "DELETE",
        });
    },
    // for admin
    getAllReviews: async (page = 1, limit = 8, search = ""): Promise<ApiResponse<any>> => {
        return await apiClient.request(`/admin/reviews?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    },

    deleteReview: async (reviewId: string): Promise<ApiResponse<any>> => {
        return await apiClient.request(`/admin/reviews?reviewId=${reviewId}`, {
            method: "DELETE",
        });
    },
};

