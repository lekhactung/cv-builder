import NextAuth, { DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import Google from "next-auth/providers/google"

const ACCESS_TOKEN_EXPIRES_IN = 15 * 60      
// const ACCESS_TOKEN_EXPIRES_IN = 15

const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 
// const REFRESH_TOKEN_EXPIRES_IN = 5 * 60

declare module "next-auth" {
    interface Session {
        user: { id: string } & DefaultSession["user"]
        error?: "RefreshTokenExpired"
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        id: string
        accessTokenExpires: number
        refreshTokenExpires: number
        error?: "RefreshTokenExpired"
    }
}

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

async function refreshAccessToken(token: any) {
    try {
        if (Date.now() > token.refreshTokenExpires) {
            return { ...token, error: "RefreshTokenExpired" }
        }

        const user = await prisma.user.findUnique({ where: { id: token.id } })
        if (!user) {
            return { ...token, error: "RefreshTokenExpired" }
        }

        return {
            ...token,
            accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRES_IN * 1000,
            error: undefined,
        }
    } catch (err) {
        return { ...token, error: "RefreshTokenExpired" }
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),

    session: {
        strategy: "jwt",
        maxAge: REFRESH_TOKEN_EXPIRES_IN, 
    },

    providers: [
        Google({}),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials)
                if (!parsed.success) return null

                const { email, password } = parsed.data

                const user = await prisma.user.findUnique({ where: { email } })
                if (!user || !user.password) return null

                const passwordMatch = await bcrypt.compare(password, user.password)
                if (!passwordMatch) return null

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                }
            },
        }),
    ],

    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google" && profile?.picture) {
                if (user.id && !user.image) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { image: profile.picture },
                    })
                    user.image = profile.picture
                }
            }
            return true
        },

        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: user.id as string,
                    picture: user.image ?? token.picture,
                    accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRES_IN * 1000,
                    refreshTokenExpires: Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000,
                }
            }

            if (Date.now() < token.accessTokenExpires) {
                return token
            }
            return await refreshAccessToken(token)
        },

        session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.image = token.picture ?? session.user.image
                session.error = token.error as "RefreshTokenExpired" | undefined
            }
            return session
        },
    },

    pages: {
        signIn: "/auth",
    },
})
