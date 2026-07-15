import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: {params: Promise<{ id: string}>}) {
    const application = await prisma.application.findMany();
    
    const { id } = await params;
    return NextResponse.json(application,
    { status: 200 })
}