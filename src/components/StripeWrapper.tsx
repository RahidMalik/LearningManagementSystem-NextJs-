"use client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Apni Publishable Key yahan dalein
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function StripeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
