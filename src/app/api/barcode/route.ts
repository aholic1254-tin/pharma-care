import { NextRequest, NextResponse } from "next/server";
import { lookupBarcode } from "@/lib/supabase/barcodes";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const match = await lookupBarcode(code);
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(match);
}
