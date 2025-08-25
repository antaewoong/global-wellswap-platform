import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WellSwap - 혁신적인 Web3 보험자산 거래 플랫폼",
  description: "AI 기반 보험자산 거래 플랫폼. 홍콩, 싱가포르, 글로벌 시장에서 보험 상품을 안전하고 효율적으로 거래하세요. 블록체인 기반 멀티시그 보안과 실시간 AI 가치평가를 제공합니다.",
  keywords: "보험자산, Web3, 블록체인, AI 가치평가, 홍콩 보험, 싱가포르 보험, 멀티시그, 보험 거래 플랫폼",
  authors: [{ name: "WellSwap Team" }],
  creator: "WellSwap",
  publisher: "WellSwap",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://wellswap.netlify.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "WellSwap - 혁신적인 Web3 보험자산 거래 플랫폼",
    description: "AI 기반 보험자산 거래 플랫폼. 홍콩, 싱가포르, 글로벌 시장에서 보험 상품을 안전하고 효율적으로 거래하세요.",
    url: 'https://wellswap.netlify.app',
    siteName: 'WellSwap',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WellSwap - Web3 보험자산 거래 플랫폼',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "WellSwap - 혁신적인 Web3 보험자산 거래 플랫폼",
    description: "AI 기반 보험자산 거래 플랫폼. 블록체인 기반 멀티시그 보안과 실시간 AI 가치평가를 제공합니다.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
