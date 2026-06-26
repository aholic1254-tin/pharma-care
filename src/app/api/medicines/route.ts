import { NextResponse } from "next/server";
import { getDrugs } from "@/lib/supabase/medicines";

export async function GET() {
  try {
    const drugs = await getDrugs();
    return NextResponse.json(drugs);
  } catch {
    return NextResponse.json({ error: "Failed to fetch medicines" }, { status: 500 });
  }
}
