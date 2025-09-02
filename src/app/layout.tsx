import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Providers from "../components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventário Maker",
  description: "Sistema de inventário para laboratórios maker.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} bg-gray-50 text-gray-800`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}