import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      empresaId: string;
      empresaNome: string;
    } & DefaultSession["user"];
  }

  interface User {
    empresaId: string;
    empresaNome: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    empresaId: string;
    empresaNome: string;
  }
}