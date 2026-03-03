// src/models/Course.ts
import mongoose from "mongoose";

const LectureSchema = new mongoose.Schema({
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    duration: { type: String },
}, { _id: true });

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true, default: "General" },
    thumbnail: { type: String },
    videoUrl: { type: String },   // single intro video (optional)
    lectures: { type: [LectureSchema], default: [] },

    // Instructor
    instructor: { type: String },
    instructorImage: { type: String },

    // Meta
    level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
        default: "Beginner"
    },
    language: {
        type: String,
        default: "Urdu"
    },
    hours: {
        type: String
    },
    rating: {
        type: String, default: "0"
    },
    badge: {
        type: String,
        enum: ["Best Seller", "New Release", "Top Rated", "Featured"],
        default: "New Release"
    },

    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema); 