import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'StudentOS',
    mode: process.env.STUDENTOS_TEST_MODE === '1' ? 'test' : 'standard',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
