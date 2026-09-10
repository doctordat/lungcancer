import { NextResponse } from "next/server";
import { readClinicalState, resetClinicalState } from "@/server/store";

export async function GET() {
  try {
    const state = readClinicalState();
    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.action === "reset") {
      const state = resetClinicalState();
      return NextResponse.json({ success: true, data: state });
    }
    const state = readClinicalState();
    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
