import type { Metadata } from "next";
import { Geist_Mono, Manrope, Newsreader } from "next/font/google";
import "./globals.css";

const uiSans = Manrope({
  variable: "--font-ui-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const editorialSerif = Newsreader({
  variable: "--font-editorial-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Free ASME Citation Generator",
  description: "Generate accurate ASME format citations instantly. A free and precise online ASME citation generator that allows you to fully customize and manually edit your references before copying.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${uiSans.variable} ${geistMono.variable} ${editorialSerif.variable} h-full w-full antialiased`}
    >
      <body className="min-h-full w-full">{children}</body>
    </html>
  );
}
