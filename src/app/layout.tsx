import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

const aeonik = localFont({
  variable: "--font-aeonik",
  src: [
    {
      path: "./fonts/AeonikPro-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/AeonikPro-Medium.otf",
      weight: "500",
      style: "medium",
    },
  ],
});

import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${aeonik.variable} min-h-[calc(100vh+100px)] antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
