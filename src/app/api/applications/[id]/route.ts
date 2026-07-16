import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const application = await prisma.application.findMany();
    return NextResponse.json(application,
    { status: 200 })
}