"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();
  const hideLayout =
    pathName.startsWith("/auth") ||
    pathName.startsWith("/dashboard") ||
    pathName.startsWith("/editor") ||
    pathName.startsWith("/admin");   
  return (
    <>
      {!hideLayout && <Header />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}