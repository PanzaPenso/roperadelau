import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "El Ropero De Lau - Fashion Marketplace",
  description: "Discover unique fashion pieces at El Ropero De Lau. Sustainable, stylish, and affordable clothing for every occasion.",
  keywords: "fashion, clothing, marketplace, sustainable fashion, women's clothing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
