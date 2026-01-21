import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { validateEnv } from "@/lib/env";
import { validateServerEnv } from "@/lib/env-server";

// Ensure environment variables are present at runtime
try {
  validateEnv(); // Public vars
  validateServerEnv(); // Server vars
} catch (e) {
  console.error("FATAL: Environment validation failed", e);
  if (process.env.NODE_ENV === "production") {
    throw e;
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Math Lovers - The Best Math Community",
  description: "Join the Math Lovers community to solve problems, share knowledge, and rank up!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
