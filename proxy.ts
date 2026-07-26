import { auth } from "@/auth";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
    const isProtected = req.nextUrl.pathname.startsWith("/dashboard") ||
        req.nextUrl.pathname.startsWith("/editor");
    console.log("=== PROXY ===", req.nextUrl.pathname, "auth:", !!req.auth)

    if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/auth", req.url));
    }

    if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/", req.url));
    }
});

export const config = {
    matcher: ["/dashboard/:path*", "/editor/:path*", "/auth/:path*" , "/about", "/",],
};
