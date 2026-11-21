import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SessionGuard } from "@/components/SessionGuard";
import { SessionProvider } from "next-auth/react";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { ThemeProvider } from "@/components/ThemeProvider";

// Bundle fonts locally so builds do not depend on Google Fonts responses.
const beVietnamPro = localFont({
  src: [
    { path: "./fonts/BeVietnamPro-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/BeVietnamPro-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/BeVietnamPro-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/BeVietnamPro-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/BeVietnamPro-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/BeVietnamPro-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "./fonts/BeVietnamPro-Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

const interSans = localFont({
  src: "./fonts/Inter-Variable.ttf",
  weight: "300 600",
  style: "normal",
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-Variable.ttf",
  weight: "400 500",
  style: "normal",
  variable: "--font-mono",
  display: "swap",
});

// Heading font — Mulish hỗ trợ vietnamese, dùng làm font-heading
const mulishFont = localFont({
  src: "./fonts/Mulish-Variable.ttf",
  weight: "400 900",
  style: "normal",
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ResumeAI — Xây Dựng CV Tích Hợp AI",
    template: "%s | ResumeBuilder",
  },
  description:
    "Nền tảng tạo CV thông minh hàng đầu. AI phân tích, tối ưu ATS score và giúp bạn nổi bật trước nhà tuyển dụng.",
  keywords: ["CV builder", "tạo CV", "AI CV", "ATS", "resume builder", "ResumeAI"],
  authors: [{ name: "ResumeBuilder Team" }],
  creator: "ResumeBuilder",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://resumebuilder.io",
    siteName: "ResumeBuilder",
    title: "ResumeBuilder — Tạo CV Chuyên Nghiệp ",
    description: "AI phân tích và tối ưu CV của bạn để vượt qua hệ thống ATS.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeBuilder — Tạo CV Chuyên Nghiệp ",
    description: "AI phân tích và tối ưu CV của bạn để vượt qua hệ thống ATS.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`
        ${beVietnamPro.variable}
        ${interSans.variable}
        ${jetbrainsMono.variable}
        ${mulishFont.variable}
        h-full antialiased
      `}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg-base text-text-primary">
        <ThemeProvider>
          <SessionProvider>
            <SessionGuard>
              {/* <Header /> */}
              <ConditionalLayout>{children}</ConditionalLayout>
              {/* <Footer /> */}
            </SessionGuard>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
