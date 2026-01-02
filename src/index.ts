import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { GeminiFileManager } from "./fileManager";
import { GeminiSearch } from "./search";

// Load environment variables
dotenv.config();

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        console.error("Error: GEMINI_API_KEY is not set in .env file.");
        process.exit(1);
    }

    // Define the directory to search. Defaults to 'knowledge_base' in the current directory.
    const targetDir = process.argv[2] || path.join(process.cwd(), "knowledge_base");

    if (!fs.existsSync(targetDir)) {
        console.error(`Error: Directory not found: ${targetDir}`);
        console.error("Please create a 'knowledge_base' folder and add some files.");
        process.exit(1);
    }

    console.log(`\nTARGET DIRECTORY: ${targetDir}`);

    const fileManager = new GeminiFileManager(apiKey);
    const search = new GeminiSearch(apiKey);

    try {
        console.log(`\n--- Gemini File Search POC ---\n`);

        // 1. Upload Files
        const uploadedFiles = await fileManager.uploadDirectory(targetDir);

        if (uploadedFiles.length === 0) {
            console.log("No files uploaded. Exiting.");
            return;
        }

        // 2. Query
        // We can ask the user what they want to know, or run a default query.
        // For POC, let's take the query from args or hardcode a test one.
        const query = process.argv[3] || "What is the summary of these documents?";

        console.log(`\nQuestion: "${query}"\n`);
        const answer = await search.queryWithFiles(query, uploadedFiles);

        console.log("\n--- Gemini Answer ---\n");
        console.log(answer);
        console.log("\n---------------------\n");

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();
