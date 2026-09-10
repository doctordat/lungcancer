import { NextResponse } from "next/server";
import { patientAcknowledgeCarePlan } from "@/server/store";
import { idSchema } from "@/domain/schemas";
import { z } from "zod";

const ackInputSchema = z.object({
  carePlanVersionId: idSchema,
  expectedVersion: z.number().int().min(0),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const validated = ackInputSchema.parse(raw);
    const updatedState = patientAcknowledgeCarePlan(validated);
    return NextResponse.json({ success: true, data: updatedState });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Patient acknowledgement failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
