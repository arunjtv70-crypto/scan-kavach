import type { Metadata } from "next";
import { Inter, Fraunces, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const notoSansDev = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "600", "700"], variable: "--font-devanagari" });

export const metadata: Metadata = {
  title: "Scam Kavach",
  description: "AI shield against digital arrest and fraud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${fraunces.variable} ${notoSansDev.variable} font-sans antialiased bg-ivory text-ink min-h-screen flex flex-col`}
      >
        <Providers>
          <Header />
          <main className="flex-1 p-4 max-w-md mx-auto w-full font-sans">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
