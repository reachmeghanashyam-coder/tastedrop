// app/api/health/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const hasKey = Boolean(process.env.QLOO_API_KEY);
  return NextResponse.json({
    status: "healthy",
    service: "TasteDrop Cultural Commerce Engine",
    qlooHost: "https://hackathon.api.qloo.com",
    apiConfigured: hasKey,
    timestamp: new Date().toISOString()
  });
}
