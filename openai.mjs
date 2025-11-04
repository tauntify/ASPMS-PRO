// openai.mjs
import OpenAI from "openai";

// --- SETUP ---
// For testing you can hard-code your key here.
// Later, move it into an environment variable or .env file for security.
const openai = new OpenAI({
  apiKey: "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"
});

// --- MAIN ---
async function main() {
  try {
    // Send a prompt to the model
    const response = await openai.responses.create({
      model: "gpt-5-nano",
      input: "Write a haiku about AI",
      store: true
    });

    // Print the text that comes back
    console.log("AI Haiku:\n", response.output_text);
  } catch (error) {
    console.error("Error:", error);
  }
}

// --- RUN ---
main();
