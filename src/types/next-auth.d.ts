import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    sessionExpiresAt?: string;
    user: {
      id: string;
      role: string;
      approved: boolean;
      firstName: string;
      lastName: string;
      isEmailVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    approved: boolean;
    firstName: string;
    lastName: string;
    isEmailVerified?: boolean;
    rememberMe?: boolean;
    sessionExpiresAt?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    approved?: boolean;
    firstName?: string;
    lastName?: string;
    isEmailVerified?: boolean;
    rememberMe?: boolean;
    sessionExpiresAt?: string;
  }
}
