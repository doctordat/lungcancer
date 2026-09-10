import { NextResponse } from "next/server";
import { submitSymptomReport } from "@/server/store";
import { symptomKindSchema, dyspneaTriggerSchema, progressionSchema } from "@/domain/schemas";
import { z } from "zod";

const submitInputSchema = z.object({
  symptom: symptomKindSchema,
  dyspneaTrigger: dyspneaTriggerSchema.default(null),
  progression: progressionSchema.default(null),
  spo2: z.number().min(50).max(100).nullable().default(null),
  temperature: z.number().min(34).max(43).nullable().default(null),
  diarrheaEpisodes: z.number().int().min(0).max(99).default(0),
  fever: z.boolean().default(false),
  notes: z.string().default(""),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const validated = submitInputSchema.parse(raw);
    const result = submitSymptomReport(validated);
    return NextResponse.json({ success: true, data: result.state, reportId: result.reportId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid symptom report submission";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
