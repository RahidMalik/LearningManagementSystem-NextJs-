// Used for create course
export interface AdminICourse {
    _id: string;
    title: string;
    instructor: string;
    instructorImage: string;
    price: number;
    image: string;
    progress?: number;
    description?: string;
    thumbnail?: string;
    videoUrl?: string;
    lectures?: any[];
    category?: string;
    badge?: string;
    level?: string;
    rating?: string;
    hours?: string;
    language?: string;
}