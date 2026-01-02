import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("API Key not found");
        return;
    }

    // The GoogleGenerativeAI class doesn't have listModels directly in some versions,
    // but we can use the fileManager or a raw request to check, OR just try to use the model object to get metadata if possible.
    // Actually, looking at the library docs, we can use the `getGenerativeModel` to just try standard ones.

    // However, the best way to list models is often via the REST API if the SDK doesn't expose it easily.
    // But let's try to use the SDK's `GoogleAIFileManager` or similar if it has it? No, FileManager is for files.

    // Let's try a raw fetch to the models endpoint.
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach((m: any) => {
                // Filter for generateContent supported models
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error structure:", data);
        }
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listModels();
