import { AdminDevelopment } from "@/components/admin/admin-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Weetoo",
  description: "Weetoo: A Trading Platform. Admin Page",
};

export default function Admin() {
  // Render the appropriate component based on environment
  return <AdminDevelopment />;
}
