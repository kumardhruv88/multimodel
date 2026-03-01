import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEXUS AI",
  description: "Think Deeper. Create Faster. Know More.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-[#212121] text-[#ececec] antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
