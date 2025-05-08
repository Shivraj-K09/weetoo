"use client";

import type React from "react";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getNaverOAuthURL } from "@/lib/auth/naver";
import { supabase, type SupportedProvider } from "@/lib/supabase/client";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  initiateVerification,
  confirmVerification,
} from "@/app/actions/portone-verification";
// Import the new component at the top of the file
import { VerificationErrorDisplay } from "./verification-error-display";

// Define verification steps
enum VerificationStep {
  INITIAL_FORM = 0,
  VERIFICATION_CODE = 1,
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  // Verification state
  const [verificationStep, setVerificationStep] = useState<VerificationStep>(
    VerificationStep.INITIAL_FORM
  );
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    // Changed from residentRegistrationNumber to birthDate
    birthDate: "",
    mobileNumber: "",
  });

  // Slides with titles and subtitles
  const slides = [
    {
      title: "Start Trading Today",
      subtitle: "Join thousands of traders worldwide",
      image:
        "https://images.unsplash.com/photo-1642543348745-03b1219733d9?q=80&w=2070&auto=format&fit=crop",
    },
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
  ];

  // Carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Update the validateForm function to properly check for 6 digits only
  const validateForm = () => {
    // Existing validation
    if (!formData.first_name.trim()) {
      toast.error("First name is required");
      return false;
    }

    if (!formData.last_name.trim()) {
      toast.error("Last name is required");
      return false;
    }

    if (!formData.nickname.trim()) {
      toast.error("Nickname is required");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    // Updated validation for birthDate - ONLY 6 digits
    if (!formData.birthDate.trim()) {
      toast.error("Birth date is required");
      return false;
    }

    // Strict validation for birthdate format (YYMMDD) - exactly 6 digits
    const birthDateRegex = /^\d{6}$/;
    if (!birthDateRegex.test(formData.birthDate)) {
      toast.error(
        "Please enter a valid birth date (YYMMDD) - exactly 6 digits"
      );
      return false;
    }

    if (!formData.mobileNumber.trim()) {
      toast.error("Mobile Number is required");
      return false;
    }

    // Basic validation for Korean mobile number format
    const mobileRegex = /^01[016789]-\d{3,4}-\d{4}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      toast.error("Please enter a valid mobile number (010-XXXX-XXXX)");
      return false;
    }

    if (!agreeTerms) {
      toast.error("You must agree to the Terms of Service and Privacy Policy");
      return false;
    }

    return true;
  };

  // Update the handleSubmit function to use birthDate instead of RRN
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate form
    if (!validateForm()) return;

    setIsLoading(true);
    setVerificationError(null);

    try {
      // Initiate identity verification
      const fullName = `${formData.last_name}${formData.first_name}`; // Korean name format: Last name + First name
      console.log("Starting verification for:", fullName);

      const verificationResult = await initiateVerification({
        fullName,
        birthDate: formData.birthDate.replace(/-/g, ""), // Send only the birthdate (6 digits)
        mobileNumber: formData.mobileNumber,
      });

      if (!verificationResult.success) {
        // Show detailed error message
        const errorMessage = verificationResult.errorDetails
          ? `${verificationResult.message}: ${verificationResult.errorDetails}`
          : verificationResult.message || "Failed to initiate verification";

        console.error("Verification error:", errorMessage);
        setVerificationError(errorMessage);
        toast.error("Failed to initiate verification. Please try again.");
        return;
      }

      // Store verification ID and move to verification code step
      setVerificationId(verificationResult.verificationId || null);
      setVerificationStep(VerificationStep.VERIFICATION_CODE);
      toast.success("Verification code sent to your mobile number");
    } catch (err) {
      console.error("Verification initiation error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start verification";
      setVerificationError(errorMessage);
      toast.error("Failed to initiate verification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationCodeSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      // Confirm verification with code
      const confirmResult = await confirmVerification(verificationCode);

      if (!confirmResult.success || !confirmResult.verified) {
        // Show detailed error message
        const errorMessage = confirmResult.errorDetails
          ? `${confirmResult.message}: ${confirmResult.errorDetails}`
          : confirmResult.message || "Failed to verify identity";

        throw new Error(errorMessage);
      }

      // Verification successful, now create Supabase account
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            nickname: formData.nickname,
            role: "user",
            // Store verification data in user metadata
            verified: true,
            verification_date: new Date().toISOString(),
          },
        },
      });

      if (signUpError) throw signUpError;

      // Sign out immediately after registration
      await supabase.auth.signOut();

      // Redirect to login page with success message
      router.push("/login?registered=true");
    } catch (err) {
      console.error("Verification or registration error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to verify identity or create account";
      setVerificationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSocialLogin = async (provider: SupportedProvider) => {
    try {
      setIsLoading(true);

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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // Replace the handleBirthDateChange function with this simplified version
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // Allow only numbers

    // Strictly limit to 6 digits
    if (value.length > 6) {
      value = value.substring(0, 6);
    }

    setFormData((prev) => ({ ...prev, birthDate: value }));
  };

  // Format the mobile number as user types
  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9-]/g, ""); // Allow only numbers and hyphens

    // Format as 010-XXXX-XXXX or 010-XXX-XXXX
    if (value.length <= 3) {
      // Just the first part
    } else if (value.length > 3 && value.length <= 7) {
      // Check if there's already a hyphen after the first 3 digits
      if (value.charAt(3) !== "-" && !value.includes("-")) {
        value = `${value.substring(0, 3)}-${value.substring(3)}`;
      }
    } else if (value.length > 7) {
      // Check for hyphens
      if (!value.includes("-")) {
        value = `${value.substring(0, 3)}-${value.substring(3, 7)}-${value.substring(7, 11)}`;
      } else if (value.indexOf("-") === 3 && value.lastIndexOf("-") === 3) {
        // Only has first hyphen
        const secondPart = value.substring(4);
        if (secondPart.length > 4) {
          value = `${value.substring(0, 8)}-${value.substring(8)}`;
        }
      }
    }

    // Limit to correct length
    if (value.split("-").join("").length > 11) {
      const parts = value.split("-");
      if (parts.length === 3) {
        value = `${parts[0]}-${parts[1]}-${parts[2].substring(0, 4)}`;
      } else if (parts.length === 2) {
        value = `${parts[0]}-${parts[1].substring(0, 8)}`;
      } else {
        value = value.substring(0, 11);
      }
    }

    setFormData((prev) => ({ ...prev, mobileNumber: value }));
  };

  // Go back to the initial form
  const handleBackToForm = () => {
    setVerificationStep(VerificationStep.INITIAL_FORM);
    setVerificationCode("");
    setVerificationError(null);
  };

  return (
    <div className="flex min-h-screen w-full bg-black text-white">
      {/* Logo in top left */}
      <div className="absolute left-6 top-6 z-10 flex w-[calc(100%-3rem)] items-center justify-between md:left-10 md:top-10 md:w-[calc(50%-5rem)]">
        <div className="flex items-center space-x-2">
          <svg
            className="h-6 w-6 text-[#e74c3c]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 12L7 3L12 12L17 3L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 21L7 12L12 21L17 12L22 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xl font-bold">
            <span className="text-[#e74c3c]">W</span>EE
            <span className="text-[#e74c3c]">T</span>OO
          </span>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-gray-400 hover:text-[#e74c3c] hover:underline"
          aria-label="Return to main website"
        >
          Back to website
        </Link>
      </div>

      {/* Form Section */}
      <main className="relative flex w-full flex-col justify-center px-6 md:w-1/2 md:px-10 lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Create account</h1>
            <p className="mt-2 text-gray-400">
              Join thousands of users on our platform
            </p>
          </div>

          {verificationStep === VerificationStep.INITIAL_FORM ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Social login buttons */}
              <div className="grid grid-cols-3 gap-3">
                {/* Google Login */}
                <Button
                  variant="outline"
                  type="button"
                  className="h-12 w-full rounded-xl border-gray-800 bg-transparent px-0 hover:bg-gray-800"
                  aria-label="Sign up with Google"
                  onClick={() => handleSocialLogin("google")}
                >
                  <Icons.google2Icon className="w-5 h-5" />
                </Button>

                {/* Kakao Login */}
                <Button
                  variant="outline"
                  type="button"
                  className="h-12 w-full rounded-xl border-gray-800 !bg-[#FEE500] px-0 !text-black hover:!bg-[#FEE500]/90 hover:!text-black"
                  aria-label="Sign up with Kakao"
                  onClick={() => handleSocialLogin("kakao")}
                >
                  <Icons.kakao2Icon className="w-5 h-5" />
                </Button>

                {/* Naver Login */}
                <Button
                  variant="outline"
                  type="button"
                  className="h-12 w-full rounded-xl border-gray-800 !bg-[#03C75A] px-0 !text-white hover:!bg-[#03C75A]/90 hover:!text-white"
                  aria-label="Sign up with Naver"
                  onClick={() => handleSocialLogin("naver")}
                >
                  <Icons.naver2Icon className="w-5 h-5" />
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span
                    className="w-full border-t border-gray-800"
                    aria-hidden="true"
                  />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-black px-2 text-gray-400">
                    or continue with email
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="First Name"
                    className="h-12 rounded-xl border-gray-800 bg-transparent transition-colors focus-visible:border-[#e74c3c] focus-visible:ring-[#e74c3c]"
                    required
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Last Name"
                    className="h-12 rounded-xl border-gray-800 bg-transparent transition-colors focus-visible:border-[#e74c3c] focus-visible:ring-[#e74c3c]"
                    required
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <Input
                  id="nickname"
                  name="nickname"
                  type="text"
                  placeholder="Nickname"
                  className="h-12 rounded-xl border-gray-800 bg-transparent transition-colors focus-visible:border-[#e74c3c] focus-visible:ring-[#e74c3c]"
                  required
                  value={formData.nickname}
                  onChange={handleInputChange}
                />
              </div>

              {/* Replace the birthDate input field with this updated version */}
              <div>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="text"
                  placeholder="Birth Date (YYMMDD) - 6 digits only"
                  className="h-12 rounded-xl border-gray-800 bg-transparent transition-colors focus-visible:border-[#e74c3c] focus-visible:ring-[#e74c3c]"
                  required
                  maxLength={6}
                  value={formData.birthDate}
                  onChange={handleBirthDateChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter only the 6 digits of your birth date (e.g., 980215 for
                  Feb 15, 1998)
                </p>
              </div>

              <div>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  placeholder="Mobile Phone Number (010-XXXX-XXXX)"
                  className="h-12 rounded-xl border-gray-800 bg-transparent transition-colors focus-visible:border-[#e74c3c] focus-visible:ring-[#e74c3c]"
                  required
                  maxLength={13}
                  value={formData.mobileNumber}
                  onChange={handleMobileNumberChange}
                />
              </div>

              <div>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="h-12 rounded-xl border-gray-800 bg-transparent transition-colors focus-visible:border-[#e74c3c] focus-visible:ring-[#e74c3c]"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="relative">
                <Input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="h-12 rounded-xl border-gray-800 bg-transparent pr-10 transition-colors focus-visible:border-[#e74c3c] focus-visible:ring-[#e74c3c]"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-[#e74c3c]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="h-12 rounded-xl border-gray-800 bg-transparent pr-10 transition-colors focus-visible:border-[#e74c3c] focus-visible:ring-[#e74c3c]"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-[#e74c3c]"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) =>
                    setAgreeTerms(checked as boolean)
                  }
                  className="border-gray-700 text-[#e74c3c] data-[state=checked]:bg-[#e74c3c] data-[state=checked]:text-white"
                  required
                />
                <Label htmlFor="terms" className="text-xs text-gray-400">
                  I agree to the{" "}
                  <Link href="#" className="text-[#e74c3c] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-[#e74c3c] hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="relative h-12 w-full overflow-hidden rounded-xl bg-[#e74c3c] font-medium text-white transition-all hover:bg-[#c0392b] mt-2"
                disabled={isLoading || !agreeTerms}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span className="ml-2">Creating account...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    Create account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={handleVerificationCodeSubmit}
              className="flex flex-col gap-6"
            >
              {verificationError && (
                <VerificationErrorDisplay error={verificationError} />
              )}

              <div className="text-center mb-4">
                <h2 className="text-lg font-medium">Verify Your Identity</h2>
                <p className="text-sm text-gray-400 mt-1">
                  A verification code has been sent to your mobile number.
                  Please enter it below to complete your registration.
                </p>
              </div>

              <div>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="Enter verification code"
                  className="h-12 rounded-xl border-gray-800 bg-transparent transition-colors focus-visible:border-[#e74c3c] focus-visible:ring-[#e74c3c] text-center text-lg tracking-wider"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  type="submit"
                  className="relative h-12 w-full overflow-hidden rounded-xl bg-[#e74c3c] font-medium text-white transition-all hover:bg-[#c0392b]"
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span className="ml-2">Verifying...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      Verify and Create Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-xl border-gray-800 bg-transparent hover:bg-gray-800"
                  onClick={handleBackToForm}
                  disabled={isVerifying}
                >
                  Back to Form
                </Button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center text-sm">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-[#e74c3c] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Image Carousel Section - Only visible on md and larger screens */}
      <aside
        className="hidden md:block md:w-1/2"
        aria-label="Feature highlights"
      >
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
                src={slide.image || ""}
                alt={slide.title}
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
                <h2 className="mb-2 text-4xl font-bold">{slide.title}</h2>
                <p className="text-xl text-white/90">{slide.subtitle}</p>
              </div>
            </div>
          ))}

          {/* Carousel indicators */}
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
      </aside>
    </div>
  );
}
