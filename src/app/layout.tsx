import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/providers/ToastProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BM Digital | Dashboard de Tráfego Pago",
  description: "Sistema de gestão de tráfego pago para agências",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
