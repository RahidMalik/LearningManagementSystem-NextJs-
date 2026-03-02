import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: { name: "Test Product" },
                        unit_amount: 5000,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel",
        });

        return NextResponse.json({ id: session.id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}