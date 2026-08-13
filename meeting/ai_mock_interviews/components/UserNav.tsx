"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, User as UserIcon, Trash2 } from "lucide-react";
import { purgeUserDataAndSignOut } from "@/lib/actions/auth.action";

interface UserNavProps {
  user: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
}

export function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    toast.loading("Clearing all session data & logging out…");

    try {
      // 1. Clear local storage & session storage
      if (typeof window !== "undefined") {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }

      // 2. Call server action to purge user data from DB and delete session cookie
      await purgeUserDataAndSignOut(user?.id);

      toast.dismiss();
      toast.success("Logged out successfully. All data cleared.");
      
      // 3. Redirect to sign-in page
      router.push("/sign-in");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      toast.dismiss();
      toast.error("Error logging out.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative z-50 flex items-center" ref={dropdownRef}>
      {/* Profile Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 rounded-full border border-white/15 hover:border-indigo-500/50 transition-all cursor-pointer bg-white/5 hover:bg-white/10"
        title="User Options"
      >
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-indigo-400/30">
          <Image
            src="/user-avatar.png"
            alt={user?.name || "User Profile"}
            width={36}
            height={36}
            className="object-cover w-full h-full"
          />
        </div>
        <span className="text-xs font-semibold text-white/90 pr-2 hidden sm:inline-block max-w-[100px] truncate">
          {user?.name || "Candidate"}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-64 rounded-2xl bg-[#131728] border border-white/15 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="flex items-center gap-3 p-2 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-indigo-400/40 shrink-0">
              <Image
                src="/user-avatar.png"
                alt={user?.name || "Avatar"}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name || "Candidate"}</p>
              <p className="text-xs text-white/50 truncate">{user?.email || "user@careernexa.ai"}</p>
            </div>
          </div>

          {/* Action Items */}
          <div className="mt-2 space-y-1">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                Logout & Clear All Data
              </span>
              <LogOut className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
