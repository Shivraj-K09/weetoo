import { Toaster } from "@/components/ui/sonner";

import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider"; // Import AuthProvider
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weetoo",
  description: "Weetoo: A Trading Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className={`antialiased`}>
        <AuthProvider>
          {" "}
          {/* Wrap children with AuthProvider */}
          {children}
        </AuthProvider>
        <Analytics />

        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
