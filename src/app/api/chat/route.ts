import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { UserProfile } from "@/lib/userProfile";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}

const genAI = new GoogleGenAI({ apiKey });

export async function POST(req: Request) {
  try {
    const { message, userProfile } = await req.json();

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
*   If the user asks about complex or mature topics (like romantic relationships, kissing, or upsetting world events), provide a very simple, sensitive, age-appropriate answer and gently encourage them to talk to a trusted grown-up (like a parent or teacher) about it too. Example response pattern: "That's a thoughtful question! Grown-ups often [brief, simple explanation]. It's a good idea to chat with your parents, or another trusted grown-up about these things too, as they can explain more."
*   Avoid generating scary or overly complex stories. Keep themes light and positive.
*   Focus on creativity, learning through play, and imagination.
`;

    const chat = genAI.chats.create({
      model: "gemini-1.5-flash-latest",
      config: {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
      },
    });

    const streamingResponse = await chat.sendMessageStream({
      message: { text: message },
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of streamingResponse) {
          controller.enqueue(chunk.text);
        }
        controller.close();
      },
    });

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
