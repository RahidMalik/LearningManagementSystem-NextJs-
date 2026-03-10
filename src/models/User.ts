import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: "student" | "admin";
    photoURL?: string;
    phone?: string;
    googleId?: string;
    isVerified?: boolean;
    _doc: any;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    photoURL: { type: String },
    phone: { type: String },
    googleId: { type: String },
    isVerified: { type: Boolean, default: false },
}, { timestamps: true });

if (mongoose.models.User) delete mongoose.models.User;
export const User = mongoose.model<IUser>("User", UserSchema);