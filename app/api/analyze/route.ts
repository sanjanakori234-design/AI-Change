import { chatCompletion } from "@/lib/huggingface";

export async function POST(request: Request) {
  try {
    const { description, context } = await request.json();
    if (!description || description.trim().length < 5) {
      return Response.json({ error: "Please describe the change." }, { status: 400 });
    }

    const systemPrompt = `You are an AI Change Impact Analyzer for software systems.

When given a change description and optional context, respond in this exact format:

Summary:
- 1–2 bullets summarizing what the change is about and the main area it touches.

Impacted Elements:
- <File / module / function> — <Likelihood: High/Medium/Low>
  Reason: <1 short sentence>
- (list 5–10 items)

Side Effects & Risks:
- <Risk> — <1 short reason>
- (2–5 items)

Suggested Tests:
- <Test case> — <what it validates>
- (3–8 items)

Be concrete, concise, and use dependency and data-flow reasoning.
CRITICAL: AT THE VERY END OF YOUR RESPONSE, you must append exactly this line predicting a risk score from 1 to 100 based on the change size:
[RISK_SCORE: X]`;

    const userMsg = `Change: ${description}${context ? `\n\nProject Context: ${context}` : ""}`;
    let analysis = await chatCompletion(systemPrompt, userMsg);
    
    let riskScore = 40;
    const riskMatch = analysis.match(/\[RISK_SCORE:\s*(\d+)\]/i) || analysis.match(/RISK_SCORE:\s*(\d+)/i);
    if (riskMatch) {
      riskScore = parseInt(riskMatch[1], 10);
      analysis = analysis.replace(riskMatch[0], "").replace(/\[\]$/, "").trim();
    } else {
      if (analysis.toLowerCase().includes("high")) riskScore += 35;
      if (analysis.toLowerCase().includes("auth") || analysis.toLowerCase().includes("database")) riskScore += 20;
      riskScore = Math.min(riskScore, 100);
    }
    
    return Response.json({ analysis, riskScore });
  } catch (error: any) {
    return Response.json({ error: error.message || "Analysis failed" }, { status: 500 });
  }
}
