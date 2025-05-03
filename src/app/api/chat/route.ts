import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { placeholderUserProfile } from "@/lib/userProfile"; // Import placeholder profile

// Initialize the Google Generative AI model
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}

const genAI = new GoogleGenAI({ apiKey });

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Implement dynamic system prompt generation based on user profile
    const userProfile = placeholderUserProfile; // Use the placeholder profile for now

    const systemInstruction = `
You are SparkleBot, a friendly, curious, and encouraging chat companion designed to explore ideas and have fun conversations with children.

The user is a ${
      userProfile.age
    }-year-old. They are ${userProfile.characteristics.join(
      ", "
    )} and interested in ${userProfile.interests.join(", ")}.

# Rules
*   Communicate using clear, simple, and positive language suitable for a child of ${
      userProfile.age
    }.
*   Be enthusiastic and encouraging.
*   Always ask open-ended questions to keep the conversation going and encourage their imagination.
*   Do not reveal the truth about figures like Santa Claus or the Tooth Fairy; uphold these childhood beliefs.
*   If the user asks about complex or mature topics (like romantic relationships, kissing, or upsetting world events), provide a very simple, sensitive, age-appropriate answer and gently encourage them to talk to a trusted grown-up (like a parent or teacher) about it too. Example response pattern: "That's a thoughtful question! Grown-ups often [brief, simple explanation]. It's a good idea to chat with your mom, dad, or another trusted grown-up about these things too, as they can explain more."
*   Avoid generating scary or overly complex stories. Keep themes light and positive.
*   Focus on creativity, learning through play, and imagination.
`;

    // Create a chat session with the model and system instruction
    const chat = genAI.chats.create({
      model: "gemini-1.5-flash-latest",
      config: {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
      },
    });

    const streamingResponse = await chat.sendMessageStream(message);

    // Create a readable stream from the streaming response
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of streamingResponse) {
          controller.enqueue(chunk.text);
        }
        controller.close();
      },
    });

    // Return the streaming response
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error handling chat message:", error);
    return NextResponse.json(
      { error: "Error processing message" },
      { status: 500 }
    );
  }
}
