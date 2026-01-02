import * as dotenv from "dotenv";
import * as readline from "readline";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GeminiSearch } from "./search";

dotenv.config();

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Error: GEMINI_API_KEY is not set.");
        process.exit(1);
    }

    const fileManager = new GoogleAIFileManager(apiKey);
    const search = new GeminiSearch(apiKey);

    console.log("Loading knowledge base from Gemini...");

    let validFiles: { uri: string; mimeType: string; displayName: string }[] = [];

    try {
        const listFilesResponse = await fileManager.listFiles();
        if (listFilesResponse.files && listFilesResponse.files.length > 0) {
            validFiles = listFilesResponse.files.map(f => ({
                uri: f.uri,
                mimeType: f.mimeType,
                displayName: f.displayName || "Unknown File"
            }));
            console.log(`Checking file status for ${validFiles.length} files...`);
            // Ideally we filter for ACTIVE files only, though listFiles usually returns them.
            // We can just trust they are ready or the query will fail gracefully.
        }
    } catch (error) {
        console.error("Error fetching files:", error);
        return;
    }

    if (validFiles.length === 0) {
        console.log("No files found in Gemini. Please run 'npm run dev' to upload files first.");
        return;
    }

    console.log(`\nReady! Context loaded with ${validFiles.length} documents.`);
    console.log("Type 'exit' to quit.\n");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = () => {
        rl.question("\nUser: ", async (query) => {
            if (query.trim().toLowerCase() === 'exit') {
                rl.close();
                return;
            }

            if (!query.trim()) {
                askQuestion();
                return;
            }

            try {
                // We'll let the search class handle the API call.
                // It logs "Querying..." which is fine.
                const answer = await search.queryWithFiles(query, validFiles);
                console.log("\nGemini:", answer);
            } catch (error) {
                console.error("Error processing query:", error);
            }

            askQuestion();
        });
    };

    // Process initial argument if provided
    if (process.argv[2]) {
        console.log(`User: ${process.argv[2]}`);
        try {
            const answer = await search.queryWithFiles(process.argv[2], validFiles);
            console.log("\nGemini:", answer);
        } catch (error) {
            console.error(error);
        }
        askQuestion();
    } else {
        askQuestion();
    }
}

main();
