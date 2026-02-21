import mongoose, { model } from "mongoose";
import { Schema } from "mongoose";

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    photoURL: {
        type: String
    },
    role: {
        type: String,
        enum: ["admin", "student", "instructor"],
        default: "student"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const User = mongoose.models.User || model("User", UserSchema);