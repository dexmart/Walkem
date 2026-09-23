import { NextResponse } from "next/server";
import { z } from "zod";
import { getProductsByIds } from "@/lib/data";

const body = z.object({ ids: z.array(z.string().uuid()).max(50) });

export async function POST(request: Request) {
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  try {
    return NextResponse.json({ products: await getProductsByIds(parsed.data.ids) });
  } catch {
    return NextResponse.json({ error: "Could not check stock" }, { status: 502 });
  }
}
