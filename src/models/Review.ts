import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
    course: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
}, { timestamps: true });

ReviewSchema.index({ course: 1, user: 1 }, { unique: true });

if (mongoose.models.Review) delete mongoose.models.Review;
export const Review = mongoose.model<IReview>("Review", ReviewSchema);