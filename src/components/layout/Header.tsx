import { Search, Bell, Settings, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex flex-col md:flex-row md:h-16 items-center justify-between px-4 py-2 md:py-0 lg:px-8 gap-3 md:gap-0">
        <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 hover:bg-slate-100 rounded-lg">
                    <Menu size={24} className="text-[#0a348f]" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <SheetHeader>
                    <SheetTitle className="text-left text-[#0a348f] text-2xl font-bold">
                      CYBEX
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-8 pl-4">
                    <Link
                      href="/dashboard"
                      className="text-lg font-medium border-b pb-2"
                    >
                      My Courses
                    </Link>
                    <Link
                      href="/explore"
                      className="text-lg font-medium border-b pb-2"
                    >
                      Explore
                    </Link>
                    <Link
                      href="/mentors"
                      className="text-lg font-medium border-b pb-2"
                    >
                      Mentors
                    </Link>
                    <Link
                      href="/settings"
                      className="text-lg font-medium border-b pb-2"
                    >
                      Settings
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            <Link href="/" className="text-2xl font-bold text-[#0a348f]">
              CYBEX
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium ml-8">
            <Link
              href="/dashboard"
              className="hover:text-[#0a348f] transition-colors"
            >
              My Courses
            </Link>
            <Link
              href="/explore"
              className="hover:text-[#0a348f] transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/mentors"
              className="hover:text-[#0a348f] transition-colors"
            >
              Mentors
            </Link>
          </nav>

          <div className="flex md:hidden items-center gap-3">
            <Bell size={20} className="text-muted-foreground" />
            <div className="h-8 w-8 rounded-full bg-[#0a348f] flex items-center justify-center text-white text-sm font-bold">
              F
            </div>
          </div>
        </div>

        <div className="w-full md:flex-1 md:px-8 max-w-md">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              placeholder="Search for courses..."
              className="pl-10 rounded-xl bg-slate-50 border-none focus-visible:ring-[#0a348f] h-10 md:h-11 w-full"
            />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <button className="p-2 hover:bg-slate-100 rounded-full">
              <Bell size={20} />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-full hidden lg:block">
              <Settings size={20} />
            </button>
          </div>
          <div className="h-9 w-9 rounded-full bg-[#0a348f] flex items-center justify-center text-white font-bold cursor-pointer">
            F
          </div>
        </div>
      </div>
    </header>
  );
};
