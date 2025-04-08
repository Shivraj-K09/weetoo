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
  ShieldUserIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react"; // Removed useEffect
import { useRouter } from "next/navigation";
// Removed supabase client import, toast import (handled by store)
import Image from "next/image";
import { useUserStore, useUserActions } from "@/lib/store/user-store"; // Import store and actions

// Removed UserData type, now using UserProfile from store

export function UserInfo() {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);

  // Get state and actions from Zustand store
  const {
    user,
    profile,
    isLoggedIn,
    isLoading,
    error: storeError,
  } = useUserStore();
  const { signOut } = useUserActions();

  // Sign out handler now uses the action from the store
  const handleSignOut = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent click if needed
    signOut();
  };
  // Function to partially hide email
  const hideEmail = (email: string) => {
    if (!email) return "";
    const [username, domain] = email.split("@");
    const hiddenUsername =
      username.charAt(0) + "***" + username.charAt(username.length - 1);
    return `${hiddenUsername}@${domain}`;
  };

  // Show loading state (using isLoading from store)
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

  // Not logged in state (using isLoggedIn from store)
  if (!isLoggedIn || (!user && !profile)) {
    // Added check for user/profile as well
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
          <span className="text-sm text-gray-500">
            Don&apos;t have an account?{" "}
          </span>
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

  // Logged in state (using profile and user from store)
  // Add default values for level, progress, notifications, accountType if not in profile
  const userData = profile
    ? {
        ...profile,
        level: 1, // Example default
        levelProgress: 50, // Example default
        notifications: 0, // Example default
        accountType: profile.provider_type === "email" ? "Standard" : "Social", // Example logic
      }
    : null; // Handle case where profile might still be null briefly

  // If logged in but profile hasn't loaded yet (or failed), show a minimal state or loading
  if (!userData && isLoggedIn) {
    // You might want a slightly different loading/skeleton state here
    // Or return null, or a basic message
    return (
      <section className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300">
        <div className="h-1 w-full bg-gradient-to-r from-[#c74135] to-[#d15a4f]"></div>
        <div className="p-5 flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <div className="h-8 w-8 rounded-full animate-pulse bg-gray-200"></div>
          </div>
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
          {storeError && (
            <p className="text-xs text-red-500 mt-2">Error: {storeError}</p>
          )}
        </div>
      </section>
    );
  }

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
                  <Image
                    src={userData.avatar_url || "/placeholder.svg"}
                    alt={`${userData.first_name}'s avatar`}
                    className="h-12 w-12 rounded-full object-cover"
                    width={48}
                    height={48}
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
            className="group flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500 transition-all hover:bg-[#f8e9e8] hover:text-[#c74135] cursor-pointer"
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
      <div className="border-t border-gray-100">
        <Link
          href="/my-profile"
          className="flex items-center justify-between px-5 py-4 transition-all duration-200 hover:bg-[#f8e9e8] border-b border-gray-100"
        >
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              Account Settings
            </span>
          </div>
        </Link>

        {/* Corrected condition: Show link if role is admin OR super_admin */}
        {(userData?.role === "admin" || userData?.role === "super_admin") && (
          <Link
            href="/admin"
            target="_blank"
            className="flex items-center justify-between px-5 py-4 transition-all duration-200 hover:bg-[#f8e9e8]"
          >
            <div className="flex items-center gap-2">
              <ShieldUserIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">
                Go to Admin Page
              </span>
            </div>
          </Link>
        )}
      </div>

      {/* Debug info (only in development, using error from store) */}
      {/* {process.env.NODE_ENV === "development" && storeError && (
        <details className="border-t border-gray-100 p-4 text-xs">
          <summary className="cursor-pointer text-gray-500">
            Debug Info (Store Error)
          </summary>
          <pre className="mt-2 whitespace-pre-wrap bg-gray-50 p-2 rounded text-gray-700 overflow-auto max-h-60">
            {storeError}
          </pre>
        </details>
      )} */}
    </section>
  );
}
