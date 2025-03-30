// src/app/api/anthropic/route.ts
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const { prompt, model, max_tokens, temperature, system } = await request.json();

  try {
    const msg = await anthropic.messages.create({
      model: model || "claude-3-7-sonnet-20250219", // default if none provided
      max_tokens: max_tokens || 1000,
      temperature: temperature || 1,
      system: system || "Respond only with short poems.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ response: msg });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
