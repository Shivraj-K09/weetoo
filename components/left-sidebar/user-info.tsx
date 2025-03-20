"use client";

import {
  CircleUserRoundIcon,
  SettingsIcon,
  Wallet,
  LogOut,
  Bell,
  BadgeCheck,
  Mail,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

type UserData = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  provider_type: string;
  kor_coins: number;
  level?: number;
  levelProgress?: number;
  notifications?: number;
  accountType?: string;
  avatar_url?: string;
};

export function UserInfo() {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setIsLoggedIn(true);

          // Fetch user data from public.users table
          const { data: userProfile, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error fetching user profile:", error);
            return;
          }

          // Set default values for fields not in the database
          setUserData({
            ...userProfile,
            level: 1,
            levelProgress: 50,
            notifications: 0,
            accountType:
              userProfile.provider_type === "email" ? "Standard" : "Social",
          });
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setIsLoggedIn(true);

          // Fetch user data
          const { data: userProfile, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error fetching user profile:", error);
            return;
          }

          setUserData({
            ...userProfile,
            level: 1,
            levelProgress: 50,
            notifications: 0,
            accountType:
              userProfile.provider_type === "email" ? "Standard" : "Social",
          });
        } else if (event === "SIGNED_OUT") {
          setIsLoggedIn(false);
          setUserData(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Update local state immediately
      setIsLoggedIn(false);
      setUserData(null);

      toast.success("Signed out successfully");

      // Don't redirect to login page, just show the login card
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  // Function to partially hide email
  const hideEmail = (email: string) => {
    const [username, domain] = email.split("@");
    const hiddenUsername =
      username.charAt(0) + "***" + username.charAt(username.length - 1);
    return `${hiddenUsername}@${domain}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300">
        <div className="h-1 w-full bg-gradient-to-r from-[#c74135] to-[#d15a4f]"></div>
        <div className="p-5 flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <div className="h-8 w-8 rounded-full animate-pulse bg-gray-200"></div>
          </div>
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
        </div>
      </section>
    );
  }

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <section
        aria-label="User Profile - Not Logged In"
        className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 group"
      >
        {/* Accent border at top */}
        <div className="h-1 w-full bg-gradient-to-r from-[#c74135] to-[#d15a4f]"></div>

        {/* Not logged in content */}
        <div className="p-5 flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <CircleUserRoundIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">Welcome</h3>
          <p className="text-sm text-gray-500 mb-4 text-center">
            Sign in to access your account
          </p>

          <button
            className="flex items-center gap-2 bg-[#c74135] hover:bg-[#b33a2f] text-white px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
            onClick={() => {
              router.push("/login");
            }}
          >
            <span>Sign In</span>
            <ArrowRight
              className={`h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5`}
            />
          </button>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100 p-4 text-center">
          <span className="text-sm text-gray-500">Don't have an account? </span>
          <Link
            href="/register"
            className="text-sm font-medium text-[#c74135] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Register now
          </Link>
        </footer>
      </section>
    );
  }

  // Logged in state
  return (
    <section
      aria-label="User Profile"
      className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300"
    >
      {/* Accent border at top */}
      <div className="h-1 w-full bg-gradient-to-r from-[#c74135] to-[#d15a4f]"></div>

      {/* User profile section */}
      <header className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8e9e8] ring-1 ring-[#e9c3c0] transition-all duration-300 hover:ring-2 hover:ring-[#e9c3c0]">
                {userData?.avatar_url ? (
                  <img
                    src={userData.avatar_url || "/placeholder.svg"}
                    alt={`${userData.first_name}'s avatar`}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <CircleUserRoundIcon className="h-7 w-7 text-[#c74135]" />
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400"></div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-medium text-gray-800">
                  {userData?.first_name} {userData?.last_name}
                </span>
                <BadgeCheck className="h-4 w-4 text-[#c74135]" />
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {userData?.email ? hideEmail(userData.email) : ""}
                </span>
              </div>
            </div>
          </div>

          <button
            className="group flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500 transition-all hover:bg-[#f8e9e8] hover:text-[#c74135]"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={handleSignOut}
          >
            <LogOut
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                isHovering ? "translate-x-0.5" : ""
              }`}
            />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Level progress */}
      <div className="mx-5 mb-4 rounded-lg bg-gray-50 p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e9c3c0]">
              <span className="text-xs font-medium text-[#c74135]">
                {userData?.level}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              Level {userData?.level}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Level {(userData?.level || 0) + 1}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#c74135] to-[#d15a4f] transition-all duration-1000 ease-in-out"
            style={{ width: `${userData?.levelProgress || 0}%` }}
          ></div>
        </div>

        <div className="mt-1.5 flex justify-between">
          <span className="text-xs text-gray-500">
            {userData?.levelProgress}% Complete
          </span>
          <span className="text-xs font-medium text-[#c74135]">
            {userData?.accountType}
          </span>
        </div>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-2 gap-4 px-5 pb-5">
        <div className="group flex items-center gap-3 rounded-lg bg-gray-50 p-3.5 transition-all duration-200 hover:bg-[#f8e9e8]">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white transition-all duration-200">
            <Wallet className="h-4.5 w-4.5 text-[#c74135]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 group-hover:text-[#c74135]">
              kor_coin
            </span>
            <span className="font-medium text-[#c74135]">
              {userData?.kor_coins?.toLocaleString() || "0"}
            </span>
          </div>
        </div>

        <div className="group flex items-center gap-3 rounded-lg bg-gray-50 p-3.5 transition-all duration-200 hover:bg-[#f8e9e8]">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white transition-all duration-200">
            <Bell className="h-4.5 w-4.5 text-[#c74135]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 group-hover:text-[#c74135]">
              in box
            </span>
            <span className="font-medium text-gray-700">
              {userData?.notifications || "0"}
            </span>
          </div>
        </div>
      </div>

      {/* Settings link */}
      <footer className="border-t border-gray-100">
        <Link
          href="/settings"
          className="flex items-center justify-between px-5 py-4 transition-all duration-200 hover:bg-[#f8e9e8]"
        >
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              Account Settings
            </span>
          </div>
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e9c3c0] text-xs font-medium text-[#c74135]">
            1
          </div>
        </Link>
      </footer>
    </section>
  );
}
