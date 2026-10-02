import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: "0.1.0",
    provider: process.env.LLM_PROVIDER ?? "google",
    strategy: process.env.EXPLORE_STRATEGY ?? "html",
  });
}
