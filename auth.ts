import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import Google from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import { profileImageUrl } from "@/lib/profile-image";

const ACCESS_TOKEN_EXPIRES_IN = 15 * 60;
// const ACCESS_TOKEN_EXPIRES_IN = 15

const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60;
// const REFRESH_TOKEN_EXPIRES_IN = 5 * 60

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      isPro: boolean;
      allowedTemplates: string[];
    } & DefaultSession["user"];
    error?: "RefreshTokenExpired";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN";
    isPro: boolean;
    allowedTemplates: string[];
    accessTokenExpires: number;
    refreshTokenExpires: number;
    error?: "RefreshTokenExpired";
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (Date.now() > token.refreshTokenExpires) {
      return { ...token, error: "RefreshTokenExpired" };
    }

    const user = await prisma.user.findUnique({ where: { id: token.id } });
    if (!user) {
      return { ...token, error: "RefreshTokenExpired" };
    }

    return {
      ...token,
      name: user.name,
      email: user.email,
      picture: profileImageUrl(user.image, user.updatedAt),
      accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRES_IN * 1000,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshTokenExpired" };
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
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: {
            name: true,
            email: true,
            image: true,
            updatedAt: true,
            role: true,
            subscription: {
              select: {
                status: true,
                plan: {
                  select: {
                    templates: {
                      select: { templateId: true },
                    },
                  },
                },
              },
            },
          },
        });

        const allowedTemplates = dbUser?.subscription?.plan?.templates?.map(
          (t) => t.templateId,
        ) || ["single", "two-col"]; // default to free templates if none found

        return {
          ...token,
          id: user.id as string,
          name: dbUser?.name ?? user.name,
          email: dbUser?.email ?? user.email,
          picture: dbUser ? profileImageUrl(dbUser.image, dbUser.updatedAt) : null,
          role: dbUser?.role ?? "USER",
          isPro:
            dbUser?.subscription?.status === "ACTIVE" ||
            dbUser?.subscription?.status === "TRIALING",
          allowedTemplates,
          accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRES_IN * 1000,
          refreshTokenExpires: Date.now() + REFRESH_TOKEN_EXPIRES_IN * 1000,
        };
      }

      // Read trusted profile fields from the database, never from the update payload.
      if (trigger === "update") return await refreshAccessToken(token);

      if (Date.now() < token.accessTokenExpires) {
        return token;
      }
      return await refreshAccessToken(token);
    },

    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? session.user.email;
        session.user.image = token.picture ?? null;
        session.user.role = token.role as "USER" | "ADMIN";
        session.user.isPro = token.isPro as boolean;
        session.user.allowedTemplates = (token.allowedTemplates as string[]) || [
          "single",
          "two-col",
        ];
        session.error = token.error as "RefreshTokenExpired" | undefined;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth",
  },
});
