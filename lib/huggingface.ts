import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Free models available on HuggingFace Inference API
export const MODELS = {
  chat: "Qwen/Qwen2.5-Coder-32B-Instruct",
  summarization: "facebook/bart-large-cnn",
};

export async function chatCompletion(
  systemPrompt: string,
  userMessage: string,
  history: {role: "user" | "ai", content: string}[] = []
): Promise<string> {
  try {
    let result = "";
    
    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];
    
    // Add conversation history
    for (const msg of history) {
      messages.push({ 
        role: msg.role === "user" ? "user" : "assistant", 
        content: msg.content 
      });
    }
    
    // Add current user message
    messages.push({ role: "user", content: userMessage });

    const stream = hf.chatCompletionStream({
      model: MODELS.chat,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      if (chunk.choices?.[0]?.delta?.content) {
        result += chunk.choices[0].delta.content;
      }
    }
    return result.trim();
  } catch (error: any) {
    console.error("HuggingFace chat error inside hf.ts:", error, error?.stack);
    throw new Error(`AI error: ${error.message} - ${error.stack}`);
  }
}

export async function summarizeText(text: string): Promise<string> {
  try {
    const result = await hf.summarization({
      model: MODELS.summarization,
      inputs: text,
      parameters: {
        max_length: 250,
        min_length: 50,
      },
    });
    return result.summary_text;
  } catch (error) {
    console.error("HuggingFace summarization error:", error);
    throw new Error("Summarization service unavailable. Please try again.");
  }
}

export default hf;
