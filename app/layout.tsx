import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "¿Argentina 🐂 o 🐻? | Índice Económico Simplificado",
  description:
    "Analiza la situación económica de Argentina con nuestro índice simplificado. Datos actualizados sobre inflación, riesgo país, mercados financieros y más.",
  keywords:
    "Argentina, economía, índice, inflación, riesgo país, mercado financiero, análisis económico",
  authors: [{ name: "0xKoller" }],
  openGraph: {
    title: "¿Argentina 🐂 o 🐻? | Índice Económico Simplificado",
    description:
      "Descubre el estado actual de la economía argentina con nuestro índice simplificado. Datos actualizados y fáciles de entender.",
    url: "https://argentina-bull-or-bear.vercel.app",
    type: "website",
    locale: "es_AR",
    images: [],
    siteName: "Argentina 🐂 o 🐻",
  },
  icons: {
    icon: "/favicon.svg",
  },
  twitter: {
    card: "summary_large_image",
    site: "@0xKoller",
    creator: "@0xKoller",
    title: "¿Argentina 🐂 o 🐻? | Índice Económico Simplificado",
    description:
      "Analiza la economía argentina de un vistazo con nuestro índice simplificado. Datos actualizados diariamente.",
    images: ["https://argentina-bull-or-bear.vercel.app/og-image.png"],
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
