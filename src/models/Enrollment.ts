import mongoose, { Schema, Document } from "mongoose";

export interface IEnrollment extends Document {
    user: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    progress: number; // 0 to 100
    enrolledAt: Date;
    status: "active" | "completed";
}

const EnrollmentSchema = new Schema<IEnrollment>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    progress: { type: Number, default: 0 },
    enrolledAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "completed"], default: "active" },
});

EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export const Enrollment = mongoose.models.Enrollment || mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);