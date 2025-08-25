import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      message: "WellSwap API is running"
    });
  } catch (error) {
    return NextResponse.json({ 
      status: "error", 
      message: "Internal server error" 
    }, { status: 500 });
  }
}

export async function HEAD(request: NextRequest) {
  try {
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
