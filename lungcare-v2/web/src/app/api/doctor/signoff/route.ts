import { NextResponse } from "next/server";
import { doctorSignOffDecision } from "@/server/store";
import { idSchema } from "@/domain/schemas";
import { z } from "zod";

const doctorSignOffInputSchema = z.object({
  reportId: idSchema,
  expectedVersion: z.number().int().min(0),
  outcome: z.enum(["care_plan_update", "no_plan_change", "needs_information"]),
  rationale: z.string().trim().min(1, "Vui lòng nhập giải thích / căn cứ lâm sàng của bác sĩ"),
  newPlanSummary: z.string().trim().optional(),
  doctorName: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const validated = doctorSignOffInputSchema.parse(raw);
    const updatedState = doctorSignOffDecision(validated);
    return NextResponse.json({ success: true, data: updatedState });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Physician sign-off failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
