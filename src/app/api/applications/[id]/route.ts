import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: {params: Promise<{ id: string}>}) {
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search');
    
    return NextResponse.json({    
      message: "Product fetched successfully",
      productId: id,
      searchFilter: searchQuery || "none"
    },
    { status: 200 })
}