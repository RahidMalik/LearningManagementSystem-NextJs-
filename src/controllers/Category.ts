import mongoose, { Schema, model, models } from "mongoose";

const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    courseCount: { type: Number, default: 0 }
}, { timestamps: true });

export const Category = models.Category || model("Category", CategorySchema);