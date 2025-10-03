// app/api/export/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // TODO: aquí llamarías a tu backend real con los parámetros recibidos
  console.log("Export payload:", body);

  return NextResponse.json({ ok: true, message: "Export recibido (stub)" });
}
