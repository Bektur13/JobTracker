import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function resolveDbUser(clerkId: string) {
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
