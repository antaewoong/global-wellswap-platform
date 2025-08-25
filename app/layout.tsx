import type { Metadata, Viewport } from "next";
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
  title: "WellSwap - 글로벌 보험 자산 거래 플랫폼",
  description: "AI 기반 보험 자산 거래 플랫폼 - 홍콩, 한국, 싱가포르",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2c5aa0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="application-name" content="WellSwap" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WellSwap" />
        <meta name="description" content="AI 기반 보험 자산 거래 플랫폼" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2c5aa0" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icon-192.png" color="#2c5aa0" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://wellswap.com" />
        <meta name="twitter:title" content="WellSwap" />
        <meta name="twitter:description" content="AI 기반 보험 자산 거래 플랫폼" />
        <meta name="twitter:image" content="/og-image.png" />
        <meta name="twitter:creator" content="@wellswap" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="WellSwap" />
        <meta property="og:description" content="AI 기반 보험 자산 거래 플랫폼" />
        <meta property="og:site_name" content="WellSwap" />
        <meta property="og:url" content="https://wellswap.com" />
        <meta property="og:image" content="/og-image.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        
        {/* PWA Service Worker 등록 (개발 환경에서는 비활성화) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
