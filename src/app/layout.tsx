import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const interSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const outfitMono = Outfit({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BidTools | Equipment Rental Bidding",
  description: "BidTools - The premier equipment rental bidding platform for contractors and suppliers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${interSans.variable} ${outfitMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
