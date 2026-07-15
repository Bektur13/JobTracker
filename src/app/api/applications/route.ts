import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest, { params }: {params: Promise<{team: string}>}) => {
    const { team } = await params;
}

export const POST = async (request: NextRequest) => {

}