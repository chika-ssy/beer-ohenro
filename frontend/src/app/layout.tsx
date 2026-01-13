// src/app/layout.tsx
import type { Metadata } from "next";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "麦酒遍路",
  description: "四国のクラフトブルワリーを巡る旅",
  icons: {
    icon: '/icon_hop.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <GoogleMapsProvider>
          {children}
        </GoogleMapsProvider>
      </body>
    </html>
  );
}