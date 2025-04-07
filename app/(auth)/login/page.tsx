"use client";

import type React from "react";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, TrendingUp, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, type SupportedProvider } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";
import { Icons } from "@/components/icons";
import { getNaverOAuthURL } from "@/lib/auth/naver";

// Create a client component that uses useSearchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Display success message when user is registered
  useEffect(() => {
    if (isRegistered) {
      toast.success("Account created successfully. Please sign in.");
    }
  }, [isRegistered]);

  // Slides with titles and subtitles
  const slides = [
    {
      title: "Real-time Analytics",
      subtitle: "Make informed Decisions",
      image:
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Secure Investments",
      subtitle: "Advanced Protection",
      image:
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2070&auto=format&fit=crop",
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

  // seEffect to simulate content loading
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Store the remember me preference in localStorage
      localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

      const { error: signUpError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) throw signUpError;
      toast.success("Signed in successfully.");

      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSocialLogin = async (provider: SupportedProvider) => {
    try {
      setIsLoading(true);

      // Store the remember me preference in localStorage
      localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

      // For Google and Kakao, use Supabase OAuth
      if (provider === "google" || provider === "kakao") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider as "google" | "kakao",
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
          },
        });

        if (error) throw error;
      } else if (provider === "naver") {
        // For Naver, use our custom implementation
        window.location.href = getNaverOAuthURL();
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle Naver login with remember me
  const handleNaverLogin = () => {
    // Store the remember me preference in localStorage
    localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

    // Redirect to Naver OAuth URL
    window.location.href = getNaverOAuthURL();
  };

  // Load remember me preference from localStorage
  useEffect(() => {
    const savedRememberMe = localStorage.getItem("rememberMe");
    if (savedRememberMe) {
      setRememberMe(savedRememberMe === "true");
    }
  }, []);

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

            {/* Skeleton for social login buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>

              {/* Skeleton for divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <Skeleton className="h-[1px] w-full" />
                </div>
                <div className="relative flex justify-center">
                  <Skeleton className="h-4 w-40 rounded-sm" />
                </div>
              </div>

              {/* Skeleton for form fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>

              {/* Skeleton for sign up link */}
              <div className="flex justify-center pt-4">
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-md"
          >
            {/* Existing content remains the same */}
            <div className="mb-10">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl font-bold"
              >
                Welcome back
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-2 text-muted-foreground"
              >
                Sign in to access your WEETOO dashboard
              </motion.p>
            </div>

            {/* Social Login Buttons - Side by Side */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="grid grid-cols-3 gap-3">
                {/* Google Login */}
                <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                  <Button
                    variant="outline"
                    type="button"
                    className="h-12 w-full rounded-xl border-[#e74c3c]/20 bg-transparent px-0 hover:bg-[#e74c3c]/5 cursor-pointer"
                    aria-label="Sign in with Google"
                    onClick={() => handleSocialLogin("google")}
                  >
                    <Icons.google2Icon className="w-5 h-5" />
                    <span className="sr-only">Sign in with Google</span>
                  </Button>
                </motion.div>

                {/* Kakao Login */}
                <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                  <Button
                    variant="outline"
                    type="button"
                    className="h-12 w-full rounded-xl border-primary/20 !bg-[#FEE500] px-0 !text-black hover:!bg-[#FEE500]/90 hover:!text-black cursor-pointer"
                    aria-label="Sign in with Kakao"
                    onClick={() => handleSocialLogin("kakao")}
                  >
                    <Icons.kakao2Icon className="w-5 h-5 " />
                    <span className="sr-only">Sign in with Kakao</span>
                  </Button>
                </motion.div>

                {/* Naver Login */}
                <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                  <Button
                    variant="outline"
                    type="button"
                    className="h-12 w-full rounded-xl border-primary/20 !bg-[#03C75A] px-0 !text-white hover:!bg-[#03C75A]/90 hover:!text-white cursor-pointer"
                    aria-label="Sign in with Naver"
                    onClick={handleNaverLogin}
                  >
                    <Icons.naver2Icon className="w-5 h-5" />
                    <span className="sr-only">Sign in with Naver</span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <span
                  className="w-full border-t border-primary/10"
                  aria-hidden="true"
                />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground select-none">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Login Form with improved design */}
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
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="h-12 rounded-xl border-[#e74c3c]/20 bg-[#f8f9fa]/20 transition-colors focus-visible:border-[#e74c3c] focus-visible:ring-[#e74c3c]"
                    required
                    aria-required="true"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-[#e74c3c] hover:underline"
                      aria-label="Forgot your password? Reset it here"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-12 rounded-xl border-[#e74c3c]/20 bg-[#f8f9fa]/20 pr-10 transition-colors focus-visible:border-[#e74c3c] focus-visible:ring-[#e74c3c]"
                      required
                      aria-required="true"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleInputChange}
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
                  <div className="flex items-center space-x-2 pt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) =>
                          setRememberMe(checked as boolean)
                        }
                        className="border-[#e74c3c]/30 text-primary data-[state=checked]:bg-[#e74c3c] data-[state=checked]:text-primary-foreground cursor-pointer"
                      />
                      <Label
                        htmlFor="remember"
                        className="text-xs text-muted-foreground cursor-pointer"
                      >
                        Remember me
                      </Label>
                    </div>
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
                        <span className="ml-2">Signing in...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center">
                        Sign in
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center text-sm"
            >
              <p className="text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-[#e74c3c] hover:underline"
                >
                  Sign up
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

// Main component with Suspense boundary
export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
