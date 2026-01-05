import { GoogleAIFileManager } from "@google/generative-ai/server";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export async function POST(request: NextRequest) {

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const apiKey = formData.get("apiKey") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: "API Key required" }, { status: 401 });
    }

    const fileManager = new GoogleAIFileManager(apiKey);

    // Write file to temp directory first because fileManager needs a path
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempPath = join(tmpdir(), `upload-${Date.now()}-${file.name}`);
    await writeFile(tempPath, buffer);

    try {
      const uploadResponse = await fileManager.uploadFile(tempPath, {
        mimeType: file.type,
        displayName: file.name,
      });

      console.log(`Uploaded file ${file.name} as: ${uploadResponse.file.name}`);

      return NextResponse.json({ 
        success: true, 
        fileUri: uploadResponse.file.uri,
        name: uploadResponse.file.name 
      });

    } finally {
      // Clean up temp file
      await unlink(tempPath).catch(console.error);
    }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
