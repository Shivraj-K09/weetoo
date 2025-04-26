"use server";

import { createServerClient } from "@/lib/supabase/server";

// Upload image to Supabase Storage
export async function uploadImage(file: File) {
  const supabase = await createServerClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to upload images" };
  }

  // Generate a unique file name
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  // Upload the file
  const { error } = await supabase.storage
    .from("post-images")
    .upload(filePath, file);

  if (error) {
    console.error("Error uploading image:", error);
    return { error: error.message };
  }

  // Get the public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("post-images").getPublicUrl(filePath);

  return { url: publicUrl };
}
