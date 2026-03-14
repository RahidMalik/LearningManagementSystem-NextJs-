"use client";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/shared/BottomNav";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
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
    "/reset-password",
    "/reset-success",
  ].includes(pathname);

  const hideFooter =
    pathname === "/messages" || pathname.startsWith("/messages/");

  return (
    <html lang="en">
      <body className="antialiased font-sans bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider>
          <NotificationProvider>
            <Toaster position="top-right" reverseOrder={false} />
            <div className="flex flex-col min-h-screen">
              {!hideLayout && <Header />}
              <main className="grow">{children}</main>
              {!hideLayout && !hideFooter && <Footer />}
              {!hideLayout && !hideFooter && <BottomNav />}
            </div>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
