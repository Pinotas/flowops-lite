import { NextRequest, NextResponse } from "next/server";

// Guarda a preferência "Manter sessão iniciada" num cookie marcador
// legível por JavaScript (sem Max-Age, logo apagado quando o browser
// fecha). O AppShell usa-o, em conjunto com sessionStorage, para detetar
// se o browser foi reaberto desde o login e, nesse caso, terminar a
// sessão — ver components/AppShell.tsx.
export async function POST(req: NextRequest) {
  const { lembrar } = await req.json();
  const res = NextResponse.json({ ok: true });

  if (lembrar) {
    res.cookies.delete("flowops-lembrar");
  } else {
    res.cookies.set("flowops-lembrar", "0", {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
  }

  return res;
}
