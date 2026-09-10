import { NextResponse } from "next/server";
import { nurseValidateReport } from "@/server/store";
import { idSchema } from "@/domain/schemas";
import { z } from "zod";

const nurseValidateInputSchema = z.object({
  reportId: idSchema,
  expectedVersion: z.number().int().min(0),
  escalationRequired: z.boolean(),
  context: z.string().trim().min(1, "Vui lòng nhập ghi chú lâm sàng từ điều dưỡng"),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const validated = nurseValidateInputSchema.parse(raw);
    const updatedState = nurseValidateReport(validated);
    return NextResponse.json({ success: true, data: updatedState });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nurse validation failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
