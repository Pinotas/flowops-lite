import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/navbar";

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
        <NavBar />
        {children}
      </body>
    </html>
  );
}