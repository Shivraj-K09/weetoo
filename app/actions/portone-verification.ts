"use server";

import { cookies } from "next/headers";

// Types for PortOne API responses
interface PortOneTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface PortOneVerificationResponse {
  identityVerificationId: string;
}

interface PortOneVerificationResult {
  success: boolean;
  verified: boolean;
  name?: string;
  gender?: string;
  birthDate?: string;
  message?: string;
  error?: any;
  errorCode?: string;
  errorDetails?: string;
}

// Store API secret in environment variable
const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET;
const PORTONE_API_URL = "https://api.portone.io/v2";

// Get access token from PortOne
export async function getPortOneToken(): Promise<{
  success: boolean;
  token?: string;
  errorDetails?: string;
}> {
  try {
    const response = await fetch(`${PORTONE_API_URL}/login/api-secret`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiSecret: PORTONE_API_SECRET,
      }),
    });

    if (!response.ok) {
      const errorMessage = `Status ${response.status}: ${response.statusText || "Unknown error"}`;
      let errorDetails = "";

      try {
        // Try to parse as JSON if possible
        const text = await response.text();
        if (text) {
          try {
            const errorJson = JSON.parse(text);
            errorDetails = JSON.stringify(errorJson);
          } catch {
            errorDetails = text;
          }
        } else {
          errorDetails = "No response body received from PortOne API";
        }
      } catch (e) {
        errorDetails = `Failed to read response: ${e instanceof Error ? e.message : String(e)}`;
      }

      return {
        success: false,
        errorDetails: `Authentication failed: ${errorMessage}. Details: ${errorDetails}`,
      };
    }

    const data: PortOneTokenResponse = await response.json();
    return { success: true, token: data.accessToken };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      errorDetails: `Network or server error: ${errorMessage}`,
    };
  }
}

// Initiate identity verification
export async function initiateVerification(formData: {
  fullName: string;
  residentRegistrationNumber: string;
  mobileNumber: string;
}): Promise<{
  success: boolean;
  verificationId?: string;
  message?: string;
  errorDetails?: string;
}> {
  try {
    const tokenResult = await getPortOneToken();

    if (!tokenResult.success) {
      return {
        success: false,
        message: "Failed to authenticate with PortOne API",
        errorDetails: tokenResult.errorDetails,
      };
    }

    // Create identity verification request
    const verificationResponse = await fetch(
      `${PORTONE_API_URL}/identity-verifications`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName,
          residentRegistrationNumber: formData.residentRegistrationNumber,
          mobileNumber: formData.mobileNumber,
          // Add any other required fields based on PortOne API documentation
        }),
      }
    );

    if (!verificationResponse.ok) {
      let errorDetails = "";
      try {
        const text = await verificationResponse.text();
        if (text) {
          try {
            const errorJson = JSON.parse(text);
            errorDetails = JSON.stringify(errorJson);
          } catch {
            errorDetails = text;
          }
        } else {
          errorDetails = "No response body";
        }
      } catch (e) {
        errorDetails = `Failed to read response: ${e instanceof Error ? e.message : String(e)}`;
      }

      return {
        success: false,
        message: `Verification request failed with status ${verificationResponse.status}`,
        errorDetails: errorDetails,
      };
    }

    const verificationData: PortOneVerificationResponse =
      await verificationResponse.json();

    // Store verification ID in a cookie for the session
    const cookieStore = await cookies();
    cookieStore.set(
      "verification_id",
      verificationData.identityVerificationId,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10, // 10 minutes
        path: "/",
      }
    );

    // Send verification code to user's mobile
    const sendResponse = await fetch(
      `${PORTONE_API_URL}/identity-verifications/${verificationData.identityVerificationId}/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "SMS",
          // Add any other required fields based on PortOne API documentation
        }),
      }
    );

    if (!sendResponse.ok) {
      let errorDetails = "";
      try {
        const text = await sendResponse.text();
        if (text) {
          try {
            const errorJson = JSON.parse(text);
            errorDetails = JSON.stringify(errorJson);
          } catch {
            errorDetails = text;
          }
        } else {
          errorDetails = "No response body";
        }
      } catch (e) {
        errorDetails = `Failed to read response: ${e instanceof Error ? e.message : String(e)}`;
      }

      return {
        success: false,
        message: `Failed to send verification code with status ${sendResponse.status}`,
        errorDetails: errorDetails,
      };
    }

    return {
      success: true,
      verificationId: verificationData.identityVerificationId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: "An unexpected error occurred during verification initiation",
      errorDetails: errorMessage,
    };
  }
}

// Confirm identity verification with code
export async function confirmVerification(
  verificationCode: string
): Promise<PortOneVerificationResult> {
  try {
    const tokenResult = await getPortOneToken();

    if (!tokenResult.success) {
      return {
        success: false,
        verified: false,
        message: "Failed to authenticate with PortOne",
        errorDetails: tokenResult.errorDetails,
      };
    }

    // Get verification ID from cookie
    const cookieStore = await cookies();
    const verificationId = cookieStore.get("verification_id")?.value;

    if (!verificationId) {
      return {
        success: false,
        verified: false,
        message: "Verification session expired or invalid",
        errorDetails: "No verification ID found in cookies",
      };
    }

    // Confirm verification with code
    const confirmResponse = await fetch(
      `${PORTONE_API_URL}/identity-verifications/${verificationId}/confirm`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: verificationCode,
          // Add any other required fields based on PortOne API documentation
        }),
      }
    );

    if (!confirmResponse.ok) {
      let errorDetails = "";
      try {
        const text = await confirmResponse.text();
        if (text) {
          try {
            const errorJson = JSON.parse(text);
            errorDetails = JSON.stringify(errorJson);
          } catch {
            errorDetails = text;
          }
        } else {
          errorDetails = "No response body";
        }
      } catch (e) {
        errorDetails = `Failed to read response: ${e instanceof Error ? e.message : String(e)}`;
      }

      return {
        success: false,
        verified: false,
        message: `Failed to confirm identity verification with status ${confirmResponse.status}`,
        errorDetails: errorDetails,
      };
    }

    const confirmData = await confirmResponse.json();

    // Clean up the cookie
    const cookieStoreCleanup = await cookies();
    cookieStoreCleanup.delete("verification_id");

    return {
      success: true,
      verified: true,
      name: confirmData.name,
      gender: confirmData.gender,
      birthDate: confirmData.birthDate,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      verified: false,
      message: "An unexpected error occurred during verification confirmation",
      errorDetails: errorMessage,
    };
  }
}

// Add the following function after confirmVerification
async function refreshPortOneToken(
  refreshToken: string
): Promise<{ success: boolean; token?: string; errorDetails?: string }> {
  try {
    const response = await fetch(`${PORTONE_API_URL}/token/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorMessage = `Status ${response.status}: ${response.statusText || "Unknown error"}`;
      let errorDetails = "";

      try {
        const text = await response.text();
        if (text) {
          try {
            const errorJson = JSON.parse(text);
            errorDetails = JSON.stringify(errorJson);
          } catch {
            errorDetails = text;
          }
        } else {
          errorDetails = "No response body received from PortOne API";
        }
      } catch (e) {
        errorDetails = `Failed to read response: ${e instanceof Error ? e.message : String(e)}`;
      }

      return {
        success: false,
        errorDetails: `Token refresh failed: ${errorMessage}. Details: ${errorDetails}`,
      };
    }

    const data: PortOneTokenResponse = await response.json();

    // Update the token in a cookie for the session
    const cookieStore = await cookies();
    cookieStore.set("portone_token", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    return { success: true, token: data.accessToken };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      errorDetails: `Network or server error during token refresh: ${errorMessage}`,
    };
  }
}
