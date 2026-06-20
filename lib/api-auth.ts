import { auth } from "@/lib/auth";

/**
 * Verifica a sessão do utilizador numa API route.
 * Devolve o empresaId se autenticado, ou null se não estiver.
 */
export async function getEmpresaId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.empresaId) {
    return null;
  }
  return session.user.empresaId;
}