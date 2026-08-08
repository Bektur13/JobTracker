import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const application = await prisma.jobApplication.findMany();
    return NextResponse.json(application,
    { status: 200 })
}