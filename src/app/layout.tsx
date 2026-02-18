"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/shared/BottomNav/page";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideLayout = [
    "/welcome",
    "/login",
    "/signup",
    "/reset",
    "/success",
  ].includes(pathname);

  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />

        <div className="min-h-screen flex flex-col">
          {!hideLayout && <Header />}

          <main className="grow">{children}</main>

          {!hideLayout && <Footer />}
          {!hideLayout && <BottomNav />}
        </div>
      </body>
    </html>
  );
}
