import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      empresaId: string;
      empresaNome: string;
      empresaLogoUrl: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    empresaId: string;
    empresaNome: string;
    empresaLogoUrl: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    empresaId: string;
    empresaNome: string;
    empresaLogoUrl: string | null;
  }
}
