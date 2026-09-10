import { describe, expect, it } from "vitest";
import { assessDemoTriage, DEMO_TRIAGE_RULE_VERSION } from "./triage";

describe("demo triage rules", () => {
  it("classifies a report without triggers as stable", () => {
    expect(assessDemoTriage({ symptom: "none", diarrheaEpisodes: 0, fever: false })).toMatchObject({
      priority: "stable",
      ruleVersion: DEMO_TRIAGE_RULE_VERSION,
      triggers: [],
      clinicallyValidated: false,
    });
  });

  it("classifies fever or frequent diarrhea for review today", () => {
    expect(assessDemoTriage({ symptom: "diarrhea", diarrheaEpisodes: 4, fever: true })).toMatchObject({
      priority: "review_today",
      triggers: ["diarrhea_episodes:gte_4", "fever:true"],
    });
  });

  it("gives urgent symptoms precedence", () => {
    expect(assessDemoTriage({ symptom: "dyspnea", diarrheaEpisodes: 5, fever: true })).toMatchObject({
      priority: "urgent",
      triggers: ["symptom:dyspnea"],
    });
  });
});
