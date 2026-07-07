"use client"

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathName = usePathname()
    const isAuthPage = pathName.startsWith("/auth")

    return (
        <>
            {!isAuthPage && <Header/>}
            {children}
            {!isAuthPage && <Footer/>}
        </>
    )
} 