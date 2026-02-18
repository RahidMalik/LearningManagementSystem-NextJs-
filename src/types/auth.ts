// User Auth 
export interface User {
    _id: string;
    id?: string;
    name: string;
    email: string;
    password: string;
    role: "student" | "instructor" | "admin";
    avatar?: string;
    isGoogleAuth?: boolean;
};
// Api Response
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
};
// Auth Response (Login/Signup)
export interface AuthResponse {
    token: string;
    user: User;
};