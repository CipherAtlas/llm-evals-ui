import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt, model, temperature, system, imageData } = await request.json();
    console.log("Request body:", { prompt, model, temperature, system, imageData });

    // Prepare messages with correct OpenAI message types
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    // Add system message if provided
    if (system) {
      messages.push({
        role: "system",
        content: system
      });
    }

    // Prepare user message content
    const userMessageContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      { type: "text", text: prompt }
    ];

    // Add image if provided
    if (imageData) {
      userMessageContent.push({
        type: "image_url",
        image_url: { url: imageData }
      });
    }

    // Add user message
    messages.push({
      role: "user",
      content: userMessageContent
    });

    console.log("Combined messages:", JSON.stringify(messages, null, 2));

    // Create completion with proper OpenAI types
    const completion = await openai.chat.completions.create({
      model,
      temperature,
      messages: messages,
    });

    return NextResponse.json({
      response: completion.choices[0].message.content,
    });
  } catch (error: any) {
    console.error("Error in Chat API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}