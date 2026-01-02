import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    // Note: listModels is on the class instance in newer versions or via a different way?
    // Actually typically it's specific to the API. 
    // The SDK might not expose listModels directly on GoogleGenerativeAI instance easily in all versions.
    // Let's try to just change the model name first to something known to be stable like 'gemini-1.5-flash-001'.
    console.log("Listing models is not always directly simple in the helper, let's try to just run a test.");
}

// Actually, I will just update the model to gemini-1.5-flash-001 as it is the stable version.
// The error "models/gemini-1.5-flash is not found" strongly suggests the alias text is wrong or the endpoint expects the versioned name.
