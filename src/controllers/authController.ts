import dbconnect from "@/configs/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/jwt";
import { verifyToken } from "@/lib/jwt";

// --- Validations Helpers ---
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;


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

        // 5. Existing User Check
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        // 6. Password Hashing
        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashPassword
        });
        const { password: _, ...userWithoutPassword } = newUser._doc;

        // Don't return Password for security reasons
        const token = signToken({ userId: newUser._id, email: newUser.email });

        return NextResponse.json({ success: true, user: userWithoutPassword, token });

    } catch (error: any) {
        console.error("DEBUG ERROR:", error)
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

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
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials (Wrong password)" }, { status: 401 });
        }

        // 4. Success Response
        const token = signToken({ userId: user._id, email: user.email });


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

// 3. Firebase Sync (Google Auth)
export const syncFirebaseUser = async (req: Request) => {
    try {
        await dbconnect();
        const { name, email, photoURL, uid } = await req.json();

        let user = await User.findOne({ email });

        if (user) {

            user.name = name || user.name;
            user.photoURL = photoURL || user.photoURL;

            if (!user.googleId) user.googleId = uid;
            await user.save();
        } else {
            user = await User.create({
                name,
                email,
                photoURL,
                googleId: uid,
                isVerified: true
            });
        }

        const token = signToken({ userId: user._id, email: user.email });

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

// 2. Update Profile Controller
export const updateProfile = async (req: Request) => {
    try {
        await dbconnect();
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.split(" ")[1];

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded: any = verifyToken(token);
        const { name } = await req.json();

        const updatedUser = await User.findByIdAndUpdate(
            decoded.userId,
            { name },
            { new: true }
        ).select("-password");

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// 4.  Get me controller (Profile Fetching)
export const getMe = async (req: Request) => {
    try {
        await dbconnect();
        // 1. Authorization Header check karein
        const authHeader = req.headers.get("authorization");
        const token = authHeader?.split(" ")[1];

        if (!token) {
            return NextResponse.json({ error: "Access denied. No token provided." }, { status: 401 });
        }

        // 2. Verify the token
        const decoded: any = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }

        // 3. Find the user from database using decoded userId
        const user = await User.findById(decoded.userId).select("-password");

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

