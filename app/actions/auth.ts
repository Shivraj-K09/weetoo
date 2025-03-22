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
  error?: unknown;
  details?: string;
  email?: string;
  password?: string;
  userId?: string;
};

// Define the API response type
interface NaverAuthApiResponse {
  success?: boolean;
  error?: string;
  details?: string;
  email?: string;
  password?: string;
  userId?: string;
}

export async function handleNaverCallback(
  code: string
): Promise<NaverCallbackResult> {
  try {
    // Exchange code for token with retry logic
    let tokenData: NaverTokenResponse | null = null;
    let tokenAttempts = 0;
    const maxTokenAttempts = 3;

    while (!tokenData && tokenAttempts < maxTokenAttempts) {
      try {
        tokenAttempts++;
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
          console.error(
            `Token request failed (attempt ${tokenAttempts}/${maxTokenAttempts}):`,
            tokenError
          );

          if (tokenAttempts >= maxTokenAttempts) {
            throw new Error(
              `Failed to exchange code for token after ${maxTokenAttempts} attempts: ${tokenError}`
            );
          }

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        tokenData = await tokenResponse.json();
      } catch (err) {
        console.error(
          `Token request error (attempt ${tokenAttempts}/${maxTokenAttempts}):`,
          err
        );

        if (tokenAttempts >= maxTokenAttempts) {
          throw err;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!tokenData) {
      throw new Error("Failed to obtain token from Naver");
    }

    // Get user profile with retry logic
    let profileData: NaverUserResponse | null = null;
    let profileAttempts = 0;
    const maxProfileAttempts = 3;

    while (!profileData && profileAttempts < maxProfileAttempts) {
      try {
        profileAttempts++;
        const profileResponse = await fetch(NAVER_PROFILE_URL, {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        if (!profileResponse.ok) {
          const profileError = await profileResponse.text();
          console.error(
            `Profile request failed (attempt ${profileAttempts}/${maxProfileAttempts}):`,
            profileError
          );

          if (profileAttempts >= maxProfileAttempts) {
            throw new Error(
              `Failed to fetch user profile after ${maxProfileAttempts} attempts: ${profileError}`
            );
          }

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        profileData = await profileResponse.json();
      } catch (err) {
        console.error(
          `Profile request error (attempt ${profileAttempts}/${maxProfileAttempts}):`,
          err
        );

        if (profileAttempts >= maxProfileAttempts) {
          throw err;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!profileData) {
      throw new Error("Failed to obtain profile from Naver");
    }

    const { id, email, name, nickname, profile_image } = profileData.response;

    if (!email) {
      throw new Error("Email not provided by Naver");
    }

    // Call our API route to handle authentication with admin privileges
    // Also with retry logic
    let responseData: NaverAuthApiResponse | null = null;
    let apiAttempts = 0;
    const maxApiAttempts = 3;

    while (!responseData && apiAttempts < maxApiAttempts) {
      try {
        apiAttempts++;
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

        responseData = (await authResponse.json()) as NaverAuthApiResponse;

        if (!authResponse.ok) {
          console.error(
            `API request failed (attempt ${apiAttempts}/${maxApiAttempts}):`,
            responseData
          );

          if (apiAttempts >= maxApiAttempts) {
            return {
              success: false,
              error: responseData.error || "Authentication failed",
              details: responseData.details || undefined,
              message: responseData.error || "Authentication failed",
            };
          }

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
          responseData = null;
          continue;
        }
      } catch (err) {
        console.error(
          `API request error (attempt ${apiAttempts}/${maxApiAttempts}):`,
          err
        );

        if (apiAttempts >= maxApiAttempts) {
          throw err;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!responseData) {
      throw new Error("Failed to complete authentication with API");
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
