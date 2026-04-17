import { chatCompletion } from "@/lib/huggingface";

export async function POST(request: Request) {
  try {
    const { code, action } = await request.json();
    if (!code || code.trim().length < 5) {
      return Response.json({ error: "Please provide code to analyze." }, { status: 400 });
    }

    let systemPrompt = "";
    if (action === "explain") {
      systemPrompt = `You are a senior software engineer. Explain the provided code line-by-line or block-by-block. Break down complex logic into easy-to-understand concepts. Format your response cleanly using Markdown.`;
    } else {
      systemPrompt = `You are an expert code optimizer. Review the provided code and refactor it to improve readability, performance, and best practices. First, briefly explain the improvements you made, then provide the full refactored code block.`;
    }

    const result = await chatCompletion(systemPrompt, `Here is the code:\n\n\`\`\`\n${code}\n\`\`\``);
    return Response.json({ result });
  } catch (error: any) {
    return Response.json({ error: error.message || "Analysis failed" }, { status: 500 });
  }
}
