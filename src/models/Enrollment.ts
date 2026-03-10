import mongoose, { Schema, Document } from "mongoose";

export interface IEnrollment extends Document {
    user: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    progress: number;
    enrolledAt: Date;
    accessType: "half" | "full";
    status: "active" | "completed" | "revoked";
}

const EnrollmentSchema = new Schema<IEnrollment>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    progress: { type: Number, default: 0 },
    enrolledAt: { type: Date, default: Date.now },
    accessType: { type: String, enum: ["half", "full"], default: "full" },
    status: { type: String, enum: ["active", "completed", "revoked"], default: "active" },
});

EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

if (mongoose.models.Enrollment) {
    delete mongoose.models.Enrollment;
}

export const Enrollment = mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);