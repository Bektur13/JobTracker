import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/apiKey";
import { resolveDbUser } from "@/lib/dbUser";

export const runtime = "nodejs";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await resolveDbUser(clerkId);
  return NextResponse.json({ apiKey: dbUser.apiKey });
}

export async function POST() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await resolveDbUser(clerkId);
  const apiKey = generateApiKey();

  await prisma.user.update({ where: { id: dbUser.id }, data: { apiKey } });

  return NextResponse.json({ apiKey });
}
