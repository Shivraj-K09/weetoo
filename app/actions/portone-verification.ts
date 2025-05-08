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
}

// Store API secret in environment variable
const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET;
const PORTONE_API_URL = "https://api.portone.io/v2";

// Get access token from PortOne
export async function getPortOneToken(): Promise<string | null> {
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
      let errorData;
      try {
        // Try to parse as JSON if possible
        const text = await response.text();
        errorData = text ? JSON.parse(text) : "No response body";
      } catch (e) {
        // If parsing fails, use the response status text
        errorData = `Status ${response.status}: ${response.statusText || "Unknown error"}`;
      }
      console.error("PortOne token error:", errorData);
      return null;
    }

    const data: PortOneTokenResponse = await response.json();
    return data.accessToken;
  } catch (error) {
    console.error("Error getting PortOne token:", error);
    return null;
  }
}

// Initiate identity verification
export async function initiateVerification(formData: {
  fullName: string;
  residentRegistrationNumber: string;
  mobileNumber: string;
}): Promise<{ success: boolean; verificationId?: string; message?: string }> {
  try {
    const accessToken = await getPortOneToken();

    if (!accessToken) {
      return { success: false, message: "Failed to authenticate with PortOne" };
    }

    // Create identity verification request
    const verificationResponse = await fetch(
      `${PORTONE_API_URL}/identity-verifications`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
      let errorData;
      try {
        const text = await verificationResponse.text();
        errorData = text ? JSON.parse(text) : "No response body";
      } catch (e) {
        errorData = `Status ${verificationResponse.status}: ${verificationResponse.statusText || "Unknown error"}`;
      }
      console.error("PortOne verification initiation error:", errorData);
      return {
        success: false,
        message: "Failed to initiate identity verification",
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
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "SMS",
          // Add any other required fields based on PortOne API documentation
        }),
      }
    );

    if (!sendResponse.ok) {
      let errorData;
      try {
        const text = await sendResponse.text();
        errorData = text ? JSON.parse(text) : "No response body";
      } catch (e) {
        errorData = `Status ${sendResponse.status}: ${sendResponse.statusText || "Unknown error"}`;
      }
      console.error("PortOne verification code sending error:", errorData);
      return {
        success: false,
        message: "Failed to send verification code",
      };
    }

    return {
      success: true,
      verificationId: verificationData.identityVerificationId,
    };
  } catch (error) {
    console.error("Error initiating verification:", error);
    return {
      success: false,
      message: "An unexpected error occurred during verification initiation",
    };
  }
}

// Confirm identity verification with code
export async function confirmVerification(
  verificationCode: string
): Promise<PortOneVerificationResult> {
  try {
    const accessToken = await getPortOneToken();

    if (!accessToken) {
      return {
        success: false,
        verified: false,
        message: "Failed to authenticate with PortOne",
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
      };
    }

    // Confirm verification with code
    const confirmResponse = await fetch(
      `${PORTONE_API_URL}/identity-verifications/${verificationId}/confirm`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: verificationCode,
          // Add any other required fields based on PortOne API documentation
        }),
      }
    );

    if (!confirmResponse.ok) {
      let errorData;
      try {
        const text = await confirmResponse.text();
        errorData = text ? JSON.parse(text) : "No response body";
      } catch (e) {
        errorData = `Status ${confirmResponse.status}: ${confirmResponse.statusText || "Unknown error"}`;
      }
      console.error("PortOne verification confirmation error:", errorData);
      return {
        success: false,
        verified: false,
        message: "Failed to confirm identity verification",
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
    console.error("Error confirming verification:", error);
    return {
      success: false,
      verified: false,
      message: "An unexpected error occurred during verification confirmation",
      error,
    };
  }
}
