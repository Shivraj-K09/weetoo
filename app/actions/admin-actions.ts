"use server";

import { createClient } from "@/lib/supabase/server";
import { randomInt } from "crypto";
import { sendOtpEmail } from "./email-service";

// Function to generate a random 6-digit OTP
function generateOTP(): string {
  return randomInt(100000, 999999).toString();
}

// Function to send admin OTP
export async function sendAdminOtp(email: string) {
  try {
    console.log("sendAdminOtp called for email:", email);

    // Create server-side Supabase client
    const supabaseServer = await createClient();

    // Check if user has admin role
    const { data: userData, error: userError } = await supabaseServer
      .from("users")
      .select("id, email, role, first_name, last_name")
      .eq("email", email)
      .single();

    console.log("User data from database:", userData, "Error:", userError);

    if (userError) {
      console.error("Error fetching user:", userError);
      return {
        success: false,
        error: `User lookup failed: ${userError.message}`,
      };
    }

    if (!userData) {
      return { success: false, error: "User not found" };
    }

    if (userData.role !== "admin" && userData.role !== "super_admin") {
      console.error("User does not have admin role:", userData.role);
      return {
        success: false,
        error: "Unauthorized access: User is not an admin",
      };
    }

    // Generate OTP
    const otp = generateOTP();
    console.log("Generated OTP:", otp, "for user:", userData.id);

    // Calculate expiration (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Check if there's an existing valid OTP
    const { data: existingOtp, error: existingOtpError } = await supabaseServer
      .from("admin_otps")
      .select("otp, expires_at")
      .eq("user_id", userData.id) // Use user_id instead of email for better referential integrity
      .gt("expires_at", new Date().toISOString())
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no record is found

    console.log("Existing OTP check:", existingOtp, "Error:", existingOtpError);

    if (existingOtpError && existingOtpError.code !== "PGRST116") {
      console.error("Error checking existing OTP:", existingOtpError);
      return {
        success: false,
        error: `Database error: ${existingOtpError.message}`,
      };
    }

    // If there's a valid existing OTP, use that instead of creating a new one
    if (existingOtp) {
      console.log("Using existing OTP:", existingOtp.otp);
      // Send the existing OTP
      const emailResult = await sendOtpEmail(userData.email, existingOtp.otp);
      if (!emailResult.success) {
        return {
          success: false,
          error: `Failed to send OTP email: ${emailResult.error}`,
        };
      }
      return { success: true };
    }

    // Store OTP in database
    console.log("Storing new OTP in database");
    const { data: insertData, error: insertError } = await supabaseServer
      .from("admin_otps")
      .insert({
        user_id: userData.id, // Store user_id instead of/in addition to email
        email: userData.email, // Still store email for convenience
        otp,
        expires_at: expiresAt.toISOString(),
      })
      .select();

    console.log("Insert result:", insertData, "Error:", insertError);

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return {
        success: false,
        error: `Failed to generate OTP: ${insertError.message}`,
      };
    }

    // Send OTP via email
    console.log("Sending new OTP via email");
    const emailResult = await sendOtpEmail(userData.email, otp);
    if (!emailResult.success) {
      return {
        success: false,
        error: `Failed to send OTP email: ${emailResult.error}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in sendAdminOtp:", error);
    return {
      success: false,
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

// Function to verify admin OTP
export async function verifyAdminOtp(email: string, otp: string) {
  try {
    console.log("verifyAdminOtp called for email:", email, "with OTP:", otp);

    // Create server-side Supabase client
    const supabaseServer = await createClient();

    // Get the user first
    const { data: userData, error: userError } = await supabaseServer
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    console.log("User data from database:", userData, "Error:", userError);

    if (userError) {
      console.error("Error fetching user:", userError);
      return {
        success: false,
        error: `User lookup failed: ${userError.message}`,
      };
    }

    if (!userData) {
      return { success: false, error: "User not found" };
    }

    // Check if OTP is valid using user_id
    const { data, error } = await supabaseServer
      .from("admin_otps")
      .select("id, otp")
      .eq("user_id", userData.id)
      .eq("otp", otp)
      .gt("expires_at", new Date().toISOString())
      .eq("used", false)
      .single();

    console.log("OTP verification result:", data, "Error:", error);

    if (error) {
      console.error("Error verifying OTP:", error);
      return { success: false, error: "Invalid or expired OTP" };
    }

    if (!data) {
      return { success: false, error: "Invalid or expired OTP" };
    }

    // Mark OTP as used
    const { error: updateError } = await supabaseServer
      .from("admin_otps")
      .update({ used: true })
      .eq("id", data.id);

    console.log("Mark OTP as used result. Error:", updateError);

    if (updateError) {
      console.error("Error marking OTP as used:", updateError);
      // Still return success as the verification was successful
      // This is just a cleanup operation
    }

    return { success: true };
  } catch (error) {
    console.error("Error in verifyAdminOtp:", error);
    return {
      success: false,
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
