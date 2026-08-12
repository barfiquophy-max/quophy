import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MiniCart from "@/components/MiniCart";
import MobileMenu from "@/components/MobileMenu";
import SearchOverlay from "@/components/SearchOverlay";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Emporio Armani | Iconic Italian Style US",
  description:
    "Discover the Emporio Armani collections for men, women and kids: clothing, shoes, bags and accessories.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-us">
      <body className={`${inter.variable} font-sans antialiased`}>
        <StoreProvider>
          <Header />
          <MobileMenu />
          <SearchOverlay />
          <MiniCart />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
