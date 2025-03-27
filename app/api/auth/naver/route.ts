import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

// Create a Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const { email, naver_id, name, profile_image } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    try {
      // First, check if the user exists by looking up their email
      const { data: users, error: listError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (listError) {
        console.error("Error listing users:", listError);
        return NextResponse.json(
          { error: "Failed to check if user exists" },
          { status: 500 }
        );
      }

      const existingUser = users.users.find((user) => user.email === email);
      let userId: string;
      const password: string = crypto.randomUUID(); // Generate a secure random password

      if (existingUser) {
        console.log("User exists, updating metadata");
        userId = existingUser.id;

        // Update user metadata
        const { error: updateError } =
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
              naver_id,
              name,
              avatar_url: profile_image,
              provider: "naver",
              provider_id: naver_id,
              full_name: name,
              role: "user",
            },
            password, // Update password so we can sign in with it
          });

        if (updateError) {
          console.error("Error updating user metadata:", updateError);
          return NextResponse.json(
            { error: "Failed to update user metadata" },
            { status: 500 }
          );
        }
      } else {
        console.log("User doesn't exist, creating new user");

        // Create the user with the random password
        const { data: newUser, error: createError } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              naver_id,
              name,
              avatar_url: profile_image,
              provider: "naver",
              provider_id: naver_id,
              full_name: name,
              role: "user",
            },
          });

        if (createError) {
          console.error("Error creating user:", createError);
          return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
          );
        }

        userId = newUser.user.id;
      }

      // Split the name into first_name and last_name
      let first_name = name;
      let last_name = "";

      if (name && name.includes(" ")) {
        const nameParts = name.split(" ");
        first_name = nameParts[0];
        last_name = nameParts.slice(1).join(" ");
      }

      // Update or insert user data in the users table with ALL required fields
      try {
        await supabaseAdmin.from("users").upsert(
          {
            id: userId,
            email,
            naver_id,
            first_name,
            last_name,
            name,
            avatar_url: profile_image,
            provider_type: "naver",
            kor_coins: 0, // Default value
            role: "user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        );
      } catch (err) {
        console.error("Error upserting user data:", err);
        // Continue anyway, this is not critical
      }

      // Instead of trying to sign in here, we'll return the email and password
      // so the client can sign in directly
      return NextResponse.json({
        success: true,
        email,
        password,
        userId,
      });
    } catch (error) {
      console.error("Error in authentication flow:", error);
      return NextResponse.json(
        {
          error: "Authentication failed",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in Naver auth API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
