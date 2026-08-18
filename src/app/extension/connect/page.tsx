import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { resolveDbUser } from "@/lib/dbUser";
import { generateConnectCode } from "@/lib/apiKey";

export const runtime = "nodejs";

const CONNECT_CODE_TTL_MS = 2 * 60 * 1000;

export default async function ExtensionConnectPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const dbUser = await resolveDbUser(clerkId);
  const connectedCode = generateConnectCode();

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      connectedCode,
      connecteCodeExpiresAt: new Date(Date.now() + CONNECT_CODE_TTL_MS),
    },
  });

  redirect(`/extension/connected?code=${connectedCode}`);
}
