"use server";

import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

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
const PORTONE_API_URL = "https://api.portone.io";

// Add a debug mode flag at the top of the file
const DEBUG_MODE = true; // Set to false in production

// Update this with your actual channel key from the PortOne console
// This should be the channel key for the Danal identity verification channel you just created
const PORTONE_CHANNEL_KEY = "channel-key-5e46b62a-eaab-4594-b776-a33827a7f989"; // Replace with your actual channel key

// Get access token from PortOne
export async function getPortOneToken(): Promise<{
  success: boolean;
  token?: string;
  errorDetails?: string;
}> {
  try {
    console.log("Requesting PortOne API token");

    if (!PORTONE_API_SECRET) {
      console.error("PORTONE_API_SECRET environment variable is not set");
      return {
        success: false,
        errorDetails:
          "API Secret is not configured. Please check your environment variables.",
      };
    }

    const response = await fetch(`${PORTONE_API_URL}/login/api-secret`, {
      method: "POST",
      headers: {
        Authorization: `PortOne ${PORTONE_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiSecret: PORTONE_API_SECRET,
      }),
    });

    if (!response.ok) {
      const errorMessage = `Status ${response.status}: ${response.statusText || "Unknown error"}`;
      console.error("PortOne token request failed:", errorMessage);

      let errorDetails = "";
      try {
        // Try to parse as JSON if possible
        const text = await response.text();
        console.error("PortOne token error response:", text);

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
    console.log("Successfully obtained PortOne API token");
    return { success: true, token: data.accessToken };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      "Network or server error during token request:",
      errorMessage
    );
    return {
      success: false,
      errorDetails: `Network or server error: ${errorMessage}`,
    };
  }
}

// Update the initiateVerification function based on the v2 API documentation
export async function initiateVerification(formData: {
  fullName: string;
  birthDate: string; // 7 digits (YYMMDD + gender digit)
  mobileNumber: string;
}): Promise<{
  success: boolean;
  verificationId?: string;
  message?: string;
  errorDetails?: string;
}> {
  try {
    // Log the start of verification process (without sensitive data)
    if (DEBUG_MODE)
      console.log("Starting identity verification process", {
        fullName: formData.fullName,
      });

    // Format the mobile number correctly - remove all non-numeric characters
    const formattedMobileNumber = formData.mobileNumber.replace(/[^0-9]/g, "");

    // Format the birthdate correctly - remove all non-numeric characters
    const formattedInput = formData.birthDate.replace(/[^0-9]/g, "");

    if (DEBUG_MODE) {
      console.log("Raw mobile number:", formData.mobileNumber);
      console.log("Formatted mobile number:", formattedMobileNumber);
      console.log(
        "Formatted mobile number length:",
        formattedMobileNumber.length
      );
      console.log("Formatted input length:", formattedInput.length);
    }

    // Validate formatted data
    if (formattedInput.length !== 7) {
      return {
        success: false,
        message: "Invalid format",
        errorDetails: "Input must be exactly 7 digits (YYMMDD + gender digit)",
      };
    }

    // Extract the birthdate (first 6 digits) and gender indicator (7th digit)
    const formattedBirthDate = formattedInput.substring(0, 6);
    const genderIndicator = formattedInput.substring(6, 7);

    if (DEBUG_MODE) {
      console.log("Extracted birthdate:", formattedBirthDate);
      console.log("Extracted gender indicator:", genderIndicator);
    }

    const tokenResult = await getPortOneToken();

    if (!tokenResult.success) {
      console.error("PortOne authentication failed:", tokenResult.errorDetails);
      return {
        success: false,
        message: "Failed to authenticate with PortOne API",
        errorDetails: tokenResult.errorDetails,
      };
    }

    if (DEBUG_MODE) console.log("Successfully obtained PortOne token");

    // Generate a unique ID for the verification
    const verificationId = uuidv4();

    if (DEBUG_MODE) console.log("Generated verification ID:", verificationId);

    // Store verification ID in a cookie for the session
    const cookieStore = await cookies();
    cookieStore.set("verification_id", verificationId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    // Determine birth year based on gender indicator
    // For Korean citizens: 1,2 = born before 2000, 3,4 = born after 2000
    let birthYear = "";
    if (
      genderIndicator === "1" ||
      genderIndicator === "2" ||
      genderIndicator === "5" ||
      genderIndicator === "6"
    ) {
      birthYear = "19" + formattedBirthDate.substring(0, 2);
    } else if (
      genderIndicator === "3" ||
      genderIndicator === "4" ||
      genderIndicator === "7" ||
      genderIndicator === "8"
    ) {
      birthYear = "20" + formattedBirthDate.substring(0, 2);
    } else {
      birthYear = "19" + formattedBirthDate.substring(0, 2); // Default to 1900s if unknown
    }

    // Format birthdate as YYYY-MM-DD for the API
    const birthMonth = formattedBirthDate.substring(2, 4);
    const birthDay = formattedBirthDate.substring(4, 6);
    const formattedBirthDateForAPI = `${birthYear}-${birthMonth}-${birthDay}`;

    if (DEBUG_MODE)
      console.log("Formatted birth date for API:", formattedBirthDateForAPI);

    // Determine the likely telecom operator based on the mobile number
    // This is a guess - the actual operator might be different
    let operator = "SKT"; // Default to SKT
    if (formattedMobileNumber.startsWith("010")) {
      // Try to guess based on number ranges, but this is not reliable
      // It's better to try multiple operators or let the user select
      operator = "SKT"; // Default for 010
    } else if (formattedMobileNumber.startsWith("011")) {
      operator = "SKT";
    } else if (formattedMobileNumber.startsWith("016")) {
      operator = "KTF";
    } else if (formattedMobileNumber.startsWith("017")) {
      operator = "SKT";
    } else if (formattedMobileNumber.startsWith("018")) {
      operator = "KTF";
    } else if (formattedMobileNumber.startsWith("019")) {
      operator = "LGT";
    }

    // Add Danal-specific parameters as mentioned in the documentation
    const danalBypass = {
      danal: {
        IsCarrier: operator, // Try with the guessed operator
        CPTITLE: "WEETOO", // Your service name
      },
    };

    // Prepare the request body according to v2 API
    const requestBody = {
      channelKey: PORTONE_CHANNEL_KEY,
      method: "SMS",
      customer: {
        name: formData.fullName,
        birthDate: formattedBirthDateForAPI,
        phoneNumber: formattedMobileNumber,
        identityNumber: formattedInput, // Send the full 7-digit input
      },
      bypass: danalBypass, // Add Danal-specific parameters
    };

    if (DEBUG_MODE) {
      console.log("Sending verification request with body:", {
        ...requestBody,
        customer: {
          ...requestBody.customer,
          identityNumber: "XXXXXXX", // Mask sensitive data in logs
          phoneNumber: "XXXXXXXXXX",
        },
      });
    }

    // Make the API request
    const sendResponse = await fetch(
      `${PORTONE_API_URL}/identity-verifications/${verificationId}/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    // Handle the response
    if (sendResponse.ok) {
      if (DEBUG_MODE) console.log("Successfully sent verification code");
      return {
        success: true,
        verificationId: verificationId,
      };
    } else {
      // Handle error response
      let errorDetails = "";
      try {
        const text = await sendResponse.text();
        if (DEBUG_MODE) console.error("Verification request failed:", text);

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

      // If we get a specific error about permissions, provide a clear message
      if (
        errorDetails.includes("permission") ||
        errorDetails.includes("contract") ||
        errorDetails.includes("access")
      ) {
        return {
          success: false,
          message: "Permission error with PortOne API",
          errorDetails: `
You've successfully set up the channel, but there may still be pending permission requirements.

According to the documentation, to access additional customer information (like phone number or telecom operator), you need to:

1. Display personal information processing policies on your website
2. Send a request email to cs@portone.io with:
   - Company name
   - Business registration number
   - Danal merchant ID (CPID) for identity verification
   - Business type
   - Reason for requiring the information
   - URL to your personal information privacy policy

Please check if you've completed these steps and received confirmation from PortOne.
          `,
        };
      }

      return {
        success: false,
        message: `Failed to send verification code with status ${sendResponse.status}`,
        errorDetails: errorDetails,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Unexpected error during verification:", errorMessage);
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
          otp: verificationCode, // According to the documentation, this is the field name for SMS verification
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
    cookieStore.delete("verification_id");

    // Extract verification details from the response
    const verificationDetails = confirmData.identityVerification || confirmData;

    return {
      success: true,
      verified: true,
      name: verificationDetails.name,
      gender: verificationDetails.gender,
      birthDate: verificationDetails.birthDate,
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
