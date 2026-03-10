import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/configs/mongodb";
import { User } from "@/models/User";
import { Enrollment } from "@/models/Enrollment";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        const { userId, status } = body;

        if (!userId || !["active", "revoked"].includes(status)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        await User.findByIdAndUpdate(userId, { $set: { status } });

        await Enrollment.updateMany(
            { user: userId },
            { $set: { status } }
        );

        return NextResponse.json({
            success: true,
            message: `User and all their courses are now ${status}`
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}