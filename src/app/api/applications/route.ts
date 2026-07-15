import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { company, role, status, notes, skills} = body;
        if(!company || !role || !status || !notes || !skills) {
            return NextResponse.json(
                { error: 'Missing required fields'},
                { status: 400 }
            )
        }

        return NextResponse.json(
            { 
                message: 'Application created successfulluy!',
                data: {company, role, status, notes, skills
            }}
        )
    }catch(e) {
        return NextResponse.json({
            error: "Invalid JSON format"
        }, { status: 400 })
    }
}