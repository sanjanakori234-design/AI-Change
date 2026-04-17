import { chatCompletion } from "@/lib/huggingface";

export async function POST(request: Request) {
  try {
    const { query, context, history } = await request.json();
    if (!query || query.trim().length < 2) {
      return Response.json({ error: "Please provide a query." }, { status: 400 });
    }

    const systemPrompt = `You are a highly intelligent repository AI assistant. 
You answer questions about the user's codebase. 
If context files are provided, answer STRICTLY based on those files. Explain functions, track variables, and clarify architecture. Use Markdown to format code blocks cleanly.`;

    const fullMessage = context ? `Context Files:\n${context}\n\nUser Question: ${query}` : `User Question: ${query}`;
    
    // Safety crop for enormous contexts to fit model limits (e.g., 4000 chars roughly to not exceed free HF limits)
    const croppedMessage = fullMessage.substring(0, 10000); 

    const reply = await chatCompletion(systemPrompt, croppedMessage, history || []);
    return Response.json({ reply });
  } catch (error: any) {
    return Response.json({ error: error.message || "Chat failed", fullError: error }, { status: 500 });
  }
}
