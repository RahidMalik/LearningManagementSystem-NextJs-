import { Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-white border-t mt-20">
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#0a348f]">CYBEX</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering your journey through cutting-edge IT education and
              expertise. Join our community to thrive together.
            </p>
            <div className="flex gap-4 text-[#0a348f]">
              <Facebook
                size={20}
                className="cursor-pointer hover:scale-110 transition-transform"
              />
              <Instagram
                size={20}
                className="cursor-pointer hover:scale-110 transition-transform"
              />
              <Twitter
                size={20}
                className="cursor-pointer hover:scale-110 transition-transform"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-[#0a348f] cursor-pointer">
                Browse Courses
              </li>
              <li className="hover:text-[#0a348f] cursor-pointer">
                Instructor Mode
              </li>
              <li className="hover:text-[#0a348f] cursor-pointer">
                LMS Features
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-[#0a348f] cursor-pointer">
                Help Center
              </li>
              <li className="hover:text-[#0a348f] cursor-pointer">
                Terms of Service
              </li>
              <li className="hover:text-[#0a348f] cursor-pointer">
                Privacy Policy
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold mb-4">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe for course updates.
            </p>
            <div className="flex gap-2">
              <input
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:border-[#0a348f]"
                placeholder="Email"
              />
              <button className="bg-[#0a348f] text-white px-4 py-2 rounded-lg text-sm font-bold">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Cybex IT Group. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
