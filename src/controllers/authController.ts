import dbconnect from "@/configs/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

// --- Validations Helpers ---
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
// Kam az kam: 8 characters, 1 Uppercase, 1 Lowercase, 1 Number

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

        // Password return nahi karna security ke liye
        const { password: _, ...userWithoutPassword } = newUser._doc;

        return NextResponse.json({ success: true, user: userWithoutPassword });

    } catch (error: any) {
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
        const { password: _, ...userData } = user._doc;
        return NextResponse.json({
            success: true,
            message: `Welcome back ${user.name}`,
            user: userData
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// 3. Firebase Sync (Google Auth)
export const syncFirebaseUser = async (req: Request) => {
    try {
        await dbconnect();
        const { name, email, image, uid } = await req.json();

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                image,
                role: "student",
                firebaseUid: uid
            });
        }
        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};