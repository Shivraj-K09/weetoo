"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, TrendingUp, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { resetPassword } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Slides with titles and subtitles
  const slides = [
    {
      title: "Secure Account Recovery",
      subtitle: "Create a new password for your account",
      image:
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Real-time Analytics",
      subtitle: "Make informed Decisions",
      image:
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Start Trading Today",
      subtitle: "Join thousands of traders worldwide",
      image:
        "https://images.unsplash.com/photo-1642543348745-03b1219733d9?q=80&w=2070&auto=format&fit=crop",
    },
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const validateForm = () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!password) {
      toast.error("Password is required");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Call the server action to reset the password
      const result = await resetPassword(email, password);

      if (!result.success) {
        throw new Error(result.error || "Failed to reset password");
      }

      setIsSuccess(true);
      toast.success("Password has been reset successfully");
    } catch (error) {
      console.error("Password reset error:", error);

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("user not found")) {
          toast.error("No account found with this email address");
        } else if (error.message.includes("rate limit")) {
          toast.error("Too many attempts. Please try again later.");
        } else {
          toast.error(
            error.message || "Failed to reset password. Please try again."
          );
        }
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left side header with brand and back to website link */}
      <div className="absolute left-6 top-6 z-10 flex w-[calc(100%-3rem)] items-center justify-between md:left-10 md:top-10 md:w-[calc(50%-5rem)]">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-[#e74c3c]" aria-hidden="true" />
          <span className="text-xl font-bold">
            <span className="text-[#e74c3c]">W</span>EE
            <span className="text-[#e74c3c]">T</span>OO
          </span>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-[#e74c3c] hover:underline"
          aria-label="Return to main website"
        >
          Back to website
        </Link>
      </div>

      {/* Form Section */}
      <main className="relative flex w-full flex-col justify-center px-4 md:w-1/2 md:px-8 lg:px-12 xl:px-16">
        {isPageLoading ? (
          <div className="mx-auto w-full max-w-md space-y-8">
            {/* Skeleton for title and subtitle */}
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>

            {/* Skeleton for form fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            {/* Skeleton for sign up link */}
            <div className="flex justify-center pt-4">
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-md"
          >
            <div className="mb-10">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl font-bold"
              >
                {isSuccess ? "Password Reset" : "Reset Password"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-2 text-muted-foreground"
              >
                {isSuccess
                  ? "Your password has been reset successfully"
                  : "Enter your email and a new password"}
              </motion.p>
            </div>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <div className="rounded-lg bg-green-50 p-4 text-green-800 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>
                    Your password has been reset successfully. You can now log
                    in with your new password.
                  </p>
                </div>

                <Button
                  onClick={() => router.push("/login")}
                  className="relative h-12 w-full overflow-hidden rounded-xl bg-[#e74c3c] font-medium text-white transition-all hover:bg-[#c0392b] cursor-pointer"
                >
                  <span className="flex items-center justify-center">
                    Go to login
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </span>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="h-12 rounded-xl border-[#e74c3c]/20 bg-[#f8f9fa]/20 transition-colors focus-visible:border-[#e74c3c] focus-visible:ring-[#e74c3c]"
                      required
                      aria-required="true"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        className="h-12 rounded-xl border-[#e74c3c]/20 bg-[#f8f9fa]/20 pr-10 transition-colors focus-visible:border-[#e74c3c] focus-visible:ring-[#e74c3c]"
                        required
                        aria-required="true"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-[#e74c3c] cursor-pointer"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={showPassword ? "eye-off" : "eye"}
                            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                            transition={{ duration: 0.15 }}
                          >
                            {showPassword ? (
                              <EyeOff size={18} aria-hidden="true" />
                            ) : (
                              <Eye size={18} aria-hidden="true" />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        className="h-12 rounded-xl border-[#e74c3c]/20 bg-[#f8f9fa]/20 pr-10 transition-colors focus-visible:border-[#e74c3c] focus-visible:ring-[#e74c3c]"
                        required
                        aria-required="true"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-[#e74c3c] cursor-pointer"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.div
                            key={showConfirmPassword ? "eye-off" : "eye"}
                            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                            transition={{ duration: 0.15 }}
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={18} aria-hidden="true" />
                            ) : (
                              <Eye size={18} aria-hidden="true" />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </button>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="pt-2"
                  >
                    <Button
                      type="submit"
                      className="relative h-12 w-full overflow-hidden rounded-xl bg-[#e74c3c] font-medium text-white transition-all hover:bg-[#c0392b] cursor-pointer"
                      disabled={isLoading}
                      aria-busy={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div
                            className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                            aria-hidden="true"
                          ></div>
                          <span className="ml-2">Resetting password...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center">
                          Reset password
                          <ArrowRight
                            className="ml-2 h-5 w-5"
                            aria-hidden="true"
                          />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center text-sm"
            >
              <p className="text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[#e74c3c] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </motion.div>
        )}
      </main>

      {/* Image Carousel Section - Only visible on md and larger screens */}
      <aside
        className="hidden md:block md:w-1/2"
        aria-label="Feature highlights"
      >
        {isPageLoading ? (
          <div className="h-full w-full">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <div className="relative h-full w-full overflow-hidden">
            {/* Carousel images with text overlay */}
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  currentSlide === index ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={currentSlide !== index}
              >
                <Image
                  src={slide.image || "/placeholder.svg"}
                  alt=""
                  fill
                  className="object-cover"
                  aria-hidden="true"
                  unoptimized={slide.image?.startsWith(
                    "https://images.unsplash.com"
                  )}
                />
                {/* Gradient overlay - left to right */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-black/30"
                  aria-hidden="true"
                ></div>

                {/* Text overlay */}
                <div className="absolute bottom-32 left-0 w-full px-10 text-white">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: currentSlide === index ? 1 : 0,
                      y: currentSlide === index ? 0 : 20,
                    }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-2 text-4xl font-bold"
                  >
                    {slide.title}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: currentSlide === index ? 1 : 0,
                      y: currentSlide === index ? 0 : 20,
                    }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-xl text-white/90"
                  >
                    {slide.subtitle}
                  </motion.p>
                </div>
              </div>
            ))}

            {/* Carousel indicators - Matching the provided design */}
            <div
              className="absolute bottom-16 left-0 right-0 flex items-center px-10 space-x-2"
              role="tablist"
            >
              {slides.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className="flex items-center"
                  role="tab"
                  aria-selected={currentSlide === index}
                  aria-label={`View slide ${index + 1}: ${slide.title}`}
                >
                  <div
                    className={`transition-all duration-300 ${
                      currentSlide === index
                        ? "h-1 w-8 rounded-full bg-white"
                        : "h-2 w-2 rounded-full bg-white/40"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
