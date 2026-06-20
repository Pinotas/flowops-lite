import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/navbar";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "FlowOps",
  description: "Gestão de clientes, orçamentos e trabalhos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body>
        <AuthProvider>
          <NavBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}