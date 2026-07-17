import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const newApplication = await prisma.application.create({
            data: {
                company: body.company,
                role: body.role,
                status: body.status,
                notes: body.notes,
                skills: body.skills
        
            }
        });

        return NextResponse.json(newApplication, { status: 201 });
    }catch(e) {
        return NextResponse.json({ e: 'Failed to create application '}, { status: 500 });
    }
}