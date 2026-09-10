import { NextResponse } from "next/server";
import { submitSymptomReport } from "@/server/store";
import { symptomKindSchema } from "@/domain/schemas";
import { z } from "zod";

const submitInputSchema = z.object({
  symptom: symptomKindSchema,
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
