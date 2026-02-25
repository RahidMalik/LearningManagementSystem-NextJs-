import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        default: "General"
    },
    thumbnail: {
        type: String
    },
    videoUrl: {
        type: String
    },
    instructor: {
        type: String,
        default: "admin"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);