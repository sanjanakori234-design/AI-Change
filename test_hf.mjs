import { HfInference } from "@huggingface/inference";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function run() {
  try {
    const stream = hf.chatCompletionStream({
      model: "HuggingFaceH4/zephyr-7b-beta",
      messages: [
        { role: "system", content: "You are an AI" },
        { role: "user", content: "hello" }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });
    for await (const chunk of stream) {
      console.log(chunk);
      break;
    }
  } catch (e) {
    console.log("ERROR MESSAGE:", e.message);
    if (e.response && e.response.body) {
      console.log("ERROR BODY:", e.response.body);
    }
    console.log("ERROR OBJ:", JSON.stringify(e, null, 2));
  }
}
run();
