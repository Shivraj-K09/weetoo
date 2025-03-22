"use server";

import {
  NAVER_CLIENT_ID,
  NAVER_TOKEN_URL,
  NAVER_PROFILE_URL,
  type NaverTokenResponse,
  type NaverUserResponse,
} from "@/lib/auth/naver";

const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

// Define the return type for our function
export type NaverCallbackResult = {
  success: boolean;
  redirectTo?: string;
  directLogin?: boolean;
  message?: string;
  error?: any;
  details?: string;
  email?: string;
  password?: string;
  userId?: string;
};

export async function handleNaverCallback(
  code: string
): Promise<NaverCallbackResult> {
  try {
    // Exchange code for token
    const tokenResponse = await fetch(NAVER_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: NAVER_CLIENT_ID,
        client_secret: NAVER_CLIENT_SECRET,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      throw new Error(`Failed to exchange code for token: ${tokenError}`);
    }

    const tokenData: NaverTokenResponse = await tokenResponse.json();

    // Get user profile
    const profileResponse = await fetch(NAVER_PROFILE_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      const profileError = await profileResponse.text();
      throw new Error(`Failed to fetch user profile: ${profileError}`);
    }

    const profileData: NaverUserResponse = await profileResponse.json();
    const { id, email, name, nickname, profile_image } = profileData.response;

    if (!email) {
      throw new Error("Email not provided by Naver");
    }

    // Call our API route to handle authentication with admin privileges
    const authResponse = await fetch(`${SITE_URL}/api/auth/naver`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        naver_id: id,
        name: name || nickname,
        profile_image,
      }),
    });

    const responseData = await authResponse.json();

    if (!authResponse.ok) {
      return {
        success: false,
        error: responseData.error || "Authentication failed",
        details: responseData.details || undefined,
        message: responseData.error || "Authentication failed",
      };
    }

    // Return success with the email and password for client-side login
    return {
      success: true,
      email: responseData.email,
      password: responseData.password,
      userId: responseData.userId,
      message: "Authentication successful",
    };
  } catch (error) {
    console.error("Naver auth error:", error);
    return {
      success: false,
      error,
      message: error instanceof Error ? error.message : "Authentication failed",
    };
  }
}
