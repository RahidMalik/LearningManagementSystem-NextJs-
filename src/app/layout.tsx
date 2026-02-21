"use client";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/shared/BottomNav";
import "./globals.css";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  //Global Middleware Logic
  const router = useRouter();
  const authPages = ["/login", "/signup", "/welcome"];

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && authPages.includes(pathname)) {
      router.push("/");
    }
  }, [pathname, router]);

  const hideLayout = [
    "/welcome",
    "/login",
    "/signup",
    "/reset-password",
    "/reset-success",
  ].includes(pathname);

  return (
    <html lang="en">
      <body className="antialiased">
        <Toaster position="top-right" reverseOrder={false} />

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
