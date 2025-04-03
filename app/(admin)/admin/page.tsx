"use client";

import { useState, useEffect } from "react";
import { AdminDevelopment } from "@/components/admin/admin-page";
import { AdminUnderConstruction } from "@/components/admin/maintenance";

export default function Admin() {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    // Check if we're in production environment
    setIsProduction(process.env.NODE_ENV === "production");
  }, []);

  // Render the appropriate component based on environment
  return isProduction ? <AdminUnderConstruction /> : <AdminDevelopment />;
}
