import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/apiKey";

export const runtime = "nodejs";

// Next.js Route Handlers don't get Express's cors() middleware for free —
// only chrome-extension:// origins need access here, so echo the origin
// back only when it matches that scheme rather than allowing "*".
function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (origin?.startsWith("chrome-extension://")) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

export async function POST(req: NextRequest) {
  const headers = corsHeaders(req.headers.get("origin"));

  const body = await req.json().catch(() => null);
  const code = body?.code;

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "code is required" }, { status: 400, headers });
  }

  const dbUser = await prisma.user.findUnique({ where: { connectedCode: code } });

  if (!dbUser || !dbUser.connecteCodeExpiresAt || dbUser.connecteCodeExpiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400, headers });
  }

  const apiKey = dbUser.apiKey ?? generateApiKey();

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      apiKey,
      connectedCode: null,
      connecteCodeExpiresAt: null,
    },
  });

  return NextResponse.json({ apiKey }, { headers });
}
