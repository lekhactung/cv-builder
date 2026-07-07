import type { Metadata } from "next";
import { Outfit, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SessionGuard } from "@/components/SessionGuard";
import { SessionProvider } from "next-auth/react";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

const outfitBody = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-body",
  display: "swap",
});

const interSans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
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
      className={`
        ${outfitBody.variable}
        ${interSans.variable}
        ${jetbrainsMono.variable}
        h-full antialiased
      `}
    >
      <body className="min-h-full flex flex-col bg-bg-dark text-text-primary">
        <SessionProvider>
          <SessionGuard>
            {/* <Header /> */}
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            {/* <Footer /> */}
          </SessionGuard>
        </SessionProvider>
      </body>
    </html>
  );
}
