import { chatCompletion } from "@/lib/huggingface";

export async function POST(request: Request) {
  try {
    const { code, framework } = await request.json();
    if (!code || code.trim().length < 5) {
      return Response.json({ error: "Please provide code to test." }, { status: 400 });
    }

    const systemPrompt = `You are a strict QA automation engineer. Generate a comprehensive unit test suite for the provided code using the ${framework} framework. 
Include edge cases, null checks, boundaries, and standard behavior. 
Return ONLY markdown with the code block containing the tests. No introductory fluff.`;

    const result = await chatCompletion(systemPrompt, `Generate ${framework} tests for this code:\n\n\`\`\`\n${code}\n\`\`\``);
    return Response.json({ result });
  } catch (error: any) {
    return Response.json({ error: error.message || "Test generation failed" }, { status: 500 });
  }
}
