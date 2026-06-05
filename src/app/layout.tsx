import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ascendant 2026",
  description: "Ascendant 2026 hackathon desktop experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetBrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-mocha-base text-mocha-text">
        {children}
      </body>
    </html>
  );
}
