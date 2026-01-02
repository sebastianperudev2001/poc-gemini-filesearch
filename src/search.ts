import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiSearch {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
        });
    }

    async queryWithFiles(query: string, files: { uri: string; mimeType: string }[]) {
        console.log(`Querying Gemini with ${files.length} files...`);

        // Prepare the content parts with file data
        const parts = [
            ...files.map((file) => ({
                fileData: {
                    mimeType: file.mimeType,
                    fileUri: file.uri,
                },
            })),
            { text: query },
        ];

        try {
            const result = await this.model.generateContent(parts);
            //   const response = await result.response;
            return result.response.text();
        } catch (error) {
            console.error("Error generating content:", error);
            throw error;
        }
    }
}
