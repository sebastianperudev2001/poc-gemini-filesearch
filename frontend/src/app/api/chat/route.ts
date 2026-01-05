/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, message, fileUris } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API Key required" }, { status: 401 });
    }
    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prepare content parts
    // We only assume PDFs for this POC
    const parts: any[] = [];
    
    if (fileUris && Array.isArray(fileUris)) {
        fileUris.forEach((uri: string) => {
            parts.push({
                fileData: {
                    mimeType: "application/pdf",
                    fileUri: uri
                }
            });
        });
    }

    parts.push({ text: message });

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
