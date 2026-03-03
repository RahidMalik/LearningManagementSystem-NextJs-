"use client";
import { Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    // YAHAN FIX KIYA HAI: bg-white aur dark mode colors add kiye hain taake pichla color blend na ho
    <footer className="border-t border-slate-200 dark:border-slate-800 mt-auto bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-[#0a348f] dark:text-blue-400">
              CYBEX
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Empowering your journey through cutting-edge IT education and
              expertise. Join our community to thrive together.
            </p>
            <div className="flex gap-4 text-[#0a348f] dark:text-blue-400 pt-2">
              <Facebook
                size={20}
                className="cursor-pointer hover:scale-110 hover:text-blue-600 dark:hover:text-white transition-all"
              />
              <Instagram
                size={20}
                className="cursor-pointer hover:scale-110 hover:text-pink-600 dark:hover:text-white transition-all"
              />
              <Twitter
                size={20}
                className="cursor-pointer hover:scale-110 hover:text-blue-400 dark:hover:text-white transition-all"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">
              Platform
            </h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li className="hover:text-[#0a348f] dark:hover:text-blue-400 cursor-pointer transition-colors w-fit">
                Browse Courses
              </li>
              <li className="hover:text-[#0a348f] dark:hover:text-blue-400 cursor-pointer transition-colors w-fit">
                Instructor Mode
              </li>
              <li className="hover:text-[#0a348f] dark:hover:text-blue-400 cursor-pointer transition-colors w-fit">
                LMS Features
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">
              Support
            </h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li className="hover:text-[#0a348f] dark:hover:text-blue-400 cursor-pointer transition-colors w-fit">
                Help Center
              </li>
              <li className="hover:text-[#0a348f] dark:hover:text-blue-400 cursor-pointer transition-colors w-fit">
                Terms of Service
              </li>
              <li className="hover:text-[#0a348f] dark:hover:text-blue-400 cursor-pointer transition-colors w-fit">
                Privacy Policy
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-slate-200 dark:border-slate-800 mt-12 pt-8 text-center text-sm text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} Cybex IT Group. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
