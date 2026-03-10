import dbconnect from "@/configs/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/jwt";
import validateRequest from "@/middleware/authMiddleware";
import cloudinary from "@/configs/cloudinary";

// --- Validations Helpers ---
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// ==========================================
//  1. Register Controller
// ==========================================
export const registerUser = async (req: Request) => {
    try {
        await dbconnect();
        const { name, email, password } = await req.json();

        // 1. Basic Empty Check
        if (!name || !email || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // 2. Name Length Check
        if (name.length < 3) {
            return NextResponse.json({ error: "Name must be at least 3 characters long" }, { status: 400 });
        }

        // 3. Email Regex Validation
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // 4. Password Strength Check
        if (!passwordRegex.test(password)) {
            return NextResponse.json({
                error: "Password must be at least 8 characters, include uppercase, lowercase, and a number"
            }, { status: 400 });
        }

        //  ADMIN REGISTRATION CHECK
        let assignedRole = "student"; // Default role
        if (email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()) {
            // Agar admin email hai, to password .env wale password se match hona chahiye
            if (password !== process.env.ADMIN_PASSWORD) {
                return NextResponse.json({ error: "Invalid Admin Password! Registration denied." }, { status: 403 });
            }
            assignedRole = "admin"; // Password theek hai, to isay Admin bana do
        }

        // 5. Existing User Check
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        // 6. Password Hashing
        const hashPassword = await bcrypt.hash(password, 10);

        // 7. Create User with Dynamic Role
        const newUser = await User.create({
            name,
            email,
            password: hashPassword,
            role: assignedRole
        });

        const { password: _, ...userWithoutPassword } = newUser._doc;

        // 8. Generate Token immediately after successful registration
        const token = signToken({ userId: newUser._id, email: newUser.email, role: newUser.role });

        return NextResponse.json({ success: true, user: userWithoutPassword, token });

    } catch (error: any) {
        console.error("DEBUG ERROR:", error)
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
        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
        }

        // 2. Find User
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "Invalid credentials (User not found)" }, { status: 401 });
        }

        // 3. Compare Password
        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials (Wrong password)" }, { status: 401 });
        }

        // 4. Success Response
        const token = signToken({ userId: user._id, email: user.email, role: user.role });

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

        // GOOGLE AUTH ADMIN CHECK
        const isAdmin = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
        const assignedRole = isAdmin ? "admin" : "student";

        let user = await User.findOne({ email });

        if (user) {
            // Update fields if they are missing
            let isUpdated = false;
            if (!user.name) { user.name = name; isUpdated = true; }
            if (!user.photoURL) { user.photoURL = photoURL; isUpdated = true; }
            if (!user.googleId) { user.googleId = uid; isUpdated = true; }

            // Ensure Admin role is enforced if they used Google Auth
            if (isAdmin && user.role !== "admin") {
                user.role = "admin";
                isUpdated = true;
            }

            if (isUpdated) await user.save();
        } else {
            // Create new Google User
            user = await User.create({
                name,
                email,
                photoURL,
                googleId: uid,
                isVerified: true,
                role: assignedRole
            });
        }

        const token = signToken({ userId: user._id, email: user.email, role: user.role });

        const { password: _, ...userData } = user._doc;

        return NextResponse.json({
            success: true,
            user: userData,
            token,
        });
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

        // 1. Middleware Auth Check
        const authResult = await validateRequest(req);
        if (authResult.error || !authResult.user) {
            return NextResponse.json({ error: authResult.error || "Authentication failed" }, { status: authResult.status || 401 });
        }

        const { name, photoURL } = await req.json();

        // 2. Update Database using decoded userId from middleware
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
//  5.  Get me controller (Profile Fetching)
// ==========================================
export const getMe = async (req: Request) => {
    try {
        await dbconnect();

        // 1. Middleware Auth Check
        const authResult = await validateRequest(req);
        if (authResult.error || !authResult.user) {
            return NextResponse.json({ error: authResult.error || "Authentication failed" }, { status: authResult.status || 401 });
        }

        // 2. Find the user from database using decoded userId
        const user = await User.findById(authResult.user.userId).select("-password");

        if (!user) {
            return NextResponse.json({ error: "User not found in database" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user
        }, { status: 200 });

    } catch (error: any) {
        console.error("GET_ME_ERROR:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

// ==========================================
//   6. Update Profile Photo Controller
// ==========================================
export const UpdateProfilePhoto = async (req: Request) => {
    try {
        await dbconnect();
        // 1. Middleware Auth Check
        const authResult = await validateRequest(req);
        if (authResult.error || !authResult.user) {
            return NextResponse.json({ error: authResult.error || "Authentication failed" }, { status: authResult.status || 401 });
        }

        // 2. Get form data
        const formData = await req.formData();
        const file = formData.get("avatar") as File;

        if (!file) {
            return NextResponse.json({
                error: "No file uploaded"
            })
        }

        // 3. Upload to cloudinary
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResponse: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "LMS_PORTAL",
                    public_id: `user-${authResult.user.userId}`,
                    transformation: [{ width: 200, height: 200, crop: "fill" }]
                },
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        });
        // 4. Update user's photoURL in database
        const updatedUser = await User.findByIdAndUpdate(
            authResult.user.userId,
            { photoURL: uploadResponse.secure_url },
            { new: true }
        ).select("-password");

        return NextResponse.json({
            success: true,
            user: updatedUser
        })
    } catch (error: any) {
        console.error("PROFILE PHOTO UPDATE ERROR:", error.message);
        return NextResponse.json({ error: "Failed to update profile photo" }, { status: 500 });
    }
}