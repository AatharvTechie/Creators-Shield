
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "Cron route is set up." });
}
