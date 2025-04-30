export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ReduxProvider from "@/redux/ReduxProvider";
import AuthProvider from "@/auth/Provider";
import ToastClient from "@/components/ui/ToastClient";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "@soat",
  description: "소극장 공연을 손쉽게 예매할 수 있는 온라인 플랫폼",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable}`}>
      <body className={pretendard.className}>
        <AuthProvider>
          <ReduxProvider>
            {children}
            <ToastClient />
            <div id="modal-root"></div>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
