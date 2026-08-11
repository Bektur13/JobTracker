import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/apiKey";

export const runtime = "nodejs";

async function resolveDbUser(clerkId: string) {
  let dbUser = await prisma.user.findUnique({ where: { clerkId } });

  if (!dbUser) {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);
    const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      throw new Error("Clerk account has no email address on file");
    }

    dbUser = await prisma.user.upsert({
      where: { clerkId },
      update: {},
      create: {
        clerkId,
        email,
        name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
      },
    });
  }

  return dbUser;
}

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
