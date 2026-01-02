import { GoogleAIFileManager } from "@google/generative-ai/server";
import * as dotenv from "dotenv";

dotenv.config();

async function listFiles() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Error: GEMINI_API_KEY is not set.");
        process.exit(1);
    }

    const fileManager = new GoogleAIFileManager(apiKey);

    try {
        console.log("Fetching files from Gemini...");
        const listFilesResponse = await fileManager.listFiles();

        if (!listFilesResponse.files || listFilesResponse.files.length === 0) {
            console.log("No files found.");
            return;
        }

        console.log(`\nFound ${listFilesResponse.files.length} files:\n`);

        // sort by creation time if available, or just list
        listFilesResponse.files.forEach((file) => {
            console.log(`- Name: ${file.displayName}`);
            console.log(`  URI: ${file.uri}`);
            console.log(`  MIME Type: ${file.mimeType}`);
            console.log(`  State: ${file.state}`);
            console.log(`  Created: ${file.createTime}`); // Might need to check exact property name
            console.log("-----------------------------------");
        });

    } catch (error) {
        console.error("Error listing files:", error);
    }
}

listFiles();
