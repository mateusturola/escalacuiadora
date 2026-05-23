import type { Metadata } from "next";
import "./globals.css";
import { Noto_Serif, Public_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const publicSansHeading = Public_Sans({subsets:['latin'],variable:'--font-heading'});

const notoSerif = Noto_Serif({subsets:['latin'],variable:'--font-serif'});

export const metadata: Metadata = {
  title: "EscalaCuidadora - Sistema de Escalas",
  description: "Sistema de gerenciamento de escalas para cuidadoras",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={cn("font-serif", notoSerif.variable, publicSansHeading.variable)}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
