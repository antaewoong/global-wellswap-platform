import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'WellSwap API is running'
  });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
