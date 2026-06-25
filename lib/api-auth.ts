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

/**
 * Devolve { empresaId, utilizadorId } da sessão atual, ou null se não autenticado.
 */
export async function getSessaoAtual(): Promise<{
  empresaId: string;
  utilizadorId: string;
} | null> {
  const session = await auth();
  if (!session?.user?.empresaId || !session.user.id) {
    return null;
  }
  return { empresaId: session.user.empresaId, utilizadorId: session.user.id };
}