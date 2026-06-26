import { NextRequest, NextResponse } from "next/server";
import { getLotsForDetail } from "@/lib/supabase/inventory";

export async function GET(request: NextRequest) {
  const drugId = request.nextUrl.searchParams.get("drug_id");
  if (!drugId || isNaN(Number(drugId))) {
    return NextResponse.json({ error: "drug_id required" }, { status: 400 });
  }
  try {
    const lots = await getLotsForDetail(Number(drugId));
    return NextResponse.json(lots);
  } catch {
    return NextResponse.json({ error: "Failed to fetch lots" }, { status: 500 });
  }
}
