import { chatCompletion } from "@/lib/huggingface";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code || code.trim().length < 5) {
      return Response.json({ error: "Please provide code to analyze." }, { status: 400 });
    }

    const systemPrompt = `You are an expert debugger and security analyst. Your task is to detect bugs, syntax errors, logical flaws, and potential edge cases in the provided code snippet.
1. Highlight the problem(s).
2. Explain WHY it is a problem.
3. Provide the corrected/fixed code snippet.
Use clean markdown framing.`;

    const result = await chatCompletion(systemPrompt, `Check this code for bugs:\n\n\`\`\`\n${code}\n\`\`\``);
    return Response.json({ result });
  } catch (error: any) {
    return Response.json({ error: error.message || "Analysis failed" }, { status: 500 });
  }
}
