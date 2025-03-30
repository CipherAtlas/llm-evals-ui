// src/app/api/gemini/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  const { prompt, model } = await request.json();
  
  // Initialize the Gemini client with your API key.
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
  
  // Get the Gemini generative model dynamically from the request.
  const generativeModel = genAI.getGenerativeModel({ model });
  
  try {
    // Generate content using the specified Gemini model.
    const result = await generativeModel.generateContent(prompt);
    const responseText = result.response.text();
    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
