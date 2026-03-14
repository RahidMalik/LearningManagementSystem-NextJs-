import dbconnect from "@/configs/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/jwt";
import validateRequest from "@/middleware/authMiddleware";
import cloudinary from "@/configs/cloudinary";
import { sendLoginEmail, sendWelcomeEmail } from "@/lib/emailService";

import dns from "dns/promises";

// --- Validation Helpers ---
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// ─────────────────────────────────────────────
// HELPER: Domain check for email
// ─────────────────────────────────────────────
async function isEmailDomainValid(email: string): Promise<boolean> {
    try {
        const domain = email.split("@")[1];
        if (!domain) return false;
        const records = await dns.resolveMx(domain);
        return records && records.length > 0;
    } catch {
        // DNS lookup failed = domain doesn't exist or no mail server
        return false;
    }
}

// ==========================================
//  1. Register Controller
// ==========================================
export const registerUser = async (req: Request) => {
    try {
        await dbconnect();
        const { name, email, password } = await req.json();

        // 1. Basic Empty Check
        if (!name || !email || !password)
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });

        // 2. Name Length Check
        if (name.length < 3)
            return NextResponse.json({ error: "Name must be at least 3 characters long" }, { status: 400 });

        // 3. Email Format Check
        if (!emailRegex.test(email))
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });

        // 4. Real Email Domain Check — DNS MX record verify
        const domainValid = await isEmailDomainValid(email);
        if (!domainValid)
            return NextResponse.json({ error: "This email domain does not exist. Please use a real email address (e.g. Gmail, Yahoo, Outlook)." }, { status: 400 });

        // 5. Password Strength Check
        if (!passwordRegex.test(password))
            return NextResponse.json({
                error: "Password must be at least 8 characters, include uppercase, lowercase, and a number"
            }, { status: 400 });

        // 6. Admin Registration Check
        let assignedRole = "student";
        if (email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()) {
            if (password !== process.env.ADMIN_PASSWORD)
                return NextResponse.json({ error: "Invalid Admin Password! Registration denied." }, { status: 403 });
            assignedRole = "admin";
        }

        // 7. Existing User Check
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });

        // 8. Password Hashing
        const hashPassword = await bcrypt.hash(password, 10);

        // 9. Create User
        const newUser = await User.create({
            name, email,
            password: hashPassword,
            role: assignedRole,
        });

        const { password: _, ...userWithoutPassword } = newUser._doc;
        const token = signToken({ userId: newUser._id, email: newUser.email, role: newUser.role });

        sendWelcomeEmail({
            toEmail: newUser.email,
            userName: newUser.name,
        }).catch(e => console.error("Welcome email failed:", e));

        return NextResponse.json({ success: true, user: userWithoutPassword, token });

    } catch (error: any) {
        console.error("REGISTER ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ==========================================
//  2. Login Controller
// ==========================================
export const Login = async (req: Request) => {
    try {
        await dbconnect();
        const { email, password } = await req.json();

        // 1. Validation
        if (!email || !password)
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

        if (!emailRegex.test(email))
            return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });

        // 2. Find User
        const user = await User.findOne({ email });
        if (!user)
            return NextResponse.json({ error: "Invalid credentials (User not found)" }, { status: 401 });

        // 3. Compare Password
        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch)
            return NextResponse.json({ error: "Invalid credentials (Wrong password)" }, { status: 401 });

        // 4. Token
        const token = signToken({ userId: user._id, email: user.email, role: user.role });

        // 5. Login notification email — silently, don't block login
        sendLoginEmail({
            toEmail: user.email,
            userName: user.name,
        }).catch(e => console.error("Login email failed:", e));

        const { password: _, ...userData } = user._doc;
        return NextResponse.json({
            success: true,
            message: `Welcome back ${user.name}`,
            user: userData,
            token,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ==========================================
// 3. Firebase Sync (Google Auth)
// ==========================================
export const syncFirebaseUser = async (req: Request) => {
    try {
        await dbconnect();
        const { name, email, photoURL, uid } = await req.json();

        const isAdmin = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
        const assignedRole = isAdmin ? "admin" : "student";

        let user = await User.findOne({ email });

        if (user) {
            let isUpdated = false;
            if (!user.name) { user.name = name; isUpdated = true; }
            if (!user.photoURL) { user.photoURL = photoURL; isUpdated = true; }
            if (!user.googleId) { user.googleId = uid; isUpdated = true; }
            if (isAdmin && user.role !== "admin") { user.role = "admin"; isUpdated = true; }
            if (isUpdated) await user.save();
        } else {
            user = await User.create({
                name, email, photoURL, googleId: uid,
                isVerified: true, role: assignedRole,
            });
        }

        // Login email for Google Auth too
        sendLoginEmail({
            toEmail: user.email,
            userName: user.name,
        }).catch(e => console.error("Google login email failed:", e));

        const token = signToken({ userId: user._id, email: user.email, role: user.role });
        const { password: _, ...userData } = user._doc;

        return NextResponse.json({ success: true, user: userData, token });
    } catch (error: any) {
        console.error("GOOGLE SYNC ERROR:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ==========================================
//  4. Update Profile Controller
// ==========================================
export const updateProfile = async (req: Request) => {
    try {
        await dbconnect();
        const authResult = await validateRequest(req);
        if (authResult.error || !authResult.user)
            return NextResponse.json({ error: authResult.error || "Authentication failed" }, { status: authResult.status || 401 });

        const { name, photoURL } = await req.json();
        const updatedUser = await User.findByIdAndUpdate(
            authResult.user.userId,
            { name, photoURL },
            { new: true }
        ).select("-password");

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ==========================================
//  5. Get Me Controller
// ==========================================
export const getMe = async (req: Request) => {
    try {
        await dbconnect();
        const authResult = await validateRequest(req);
        if (authResult.error || !authResult.user)
            return NextResponse.json({ error: authResult.error || "Authentication failed" }, { status: authResult.status || 401 });

        const user = await User.findById(authResult.user.userId).select("-password");
        if (!user)
            return NextResponse.json({ error: "User not found in database" }, { status: 404 });

        return NextResponse.json({ success: true, user }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

// ==========================================
//  6. Update Profile Photo Controller
// ==========================================
export const UpdateProfilePhoto = async (req: Request) => {
    try {
        await dbconnect();
        const authResult = await validateRequest(req);
        if (authResult.error || !authResult.user)
            return NextResponse.json({ error: authResult.error || "Authentication failed" }, { status: authResult.status || 401 });

        const formData = await req.formData();
        const file = formData.get("avatar") as File;
        if (!file)
            return NextResponse.json({ error: "No file uploaded" });

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResponse: any = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "LMS_PORTAL",
                    public_id: `user-${authResult.user.userId}`,
                    transformation: [{ width: 200, height: 200, crop: "fill" }],
                },
                (err, result) => { if (err) reject(err); else resolve(result); }
            ).end(buffer);
        });

        const updatedUser = await User.findByIdAndUpdate(
            authResult.user.userId,
            { photoURL: uploadResponse.secure_url },
            { new: true }
        ).select("-password");

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        console.error("PROFILE PHOTO UPDATE ERROR:", error.message);
        return NextResponse.json({ error: "Failed to update profile photo" }, { status: 500 });
    }
};