import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import fs from "fs";
import path from "path";
import mime from "mime-types";

export class GeminiFileManager {
    private fileManager: GoogleAIFileManager;

    constructor(apiKey: string) {
        this.fileManager = new GoogleAIFileManager(apiKey);
    }

    async uploadDirectory(directoryPath: string) {
        console.log(`Scanning directory: ${directoryPath}`);
        const files = this.getFilesRecursively(directoryPath);

        // Fetch existing files to avoid duplicates
        console.log("Fetching existing files from Gemini...");
        const existingFilesMap = new Map<string, any>();
        try {
            let listFilesResponse = await this.fileManager.listFiles();
            // Basic pagination handling (up to a reasonable limit for this POC)
            if (listFilesResponse.files) {
                listFilesResponse.files.forEach(f => {
                    if (f.displayName) existingFilesMap.set(f.displayName, f);
                });
            }
        } catch (error) {
            console.warn("Failed to list existing files, will attempt to upload all:", error);
        }

        const uploadedFiles = [];
        const filesToProcess = [];

        console.log(`Found ${files.length} local files.`);

        for (const filePath of files) {
            const fileName = path.basename(filePath);
            const mimeType = mime.lookup(filePath) || "text/plain";

            if (existingFilesMap.has(fileName)) {
                console.log(`File ${fileName} already exists in Gemini. Skipping upload.`);
                uploadedFiles.push(existingFilesMap.get(fileName));
            } else {
                console.log(`Uploading ${fileName} (${mimeType})...`);
                try {
                    const uploadResponse = await this.fileManager.uploadFile(filePath, {
                        mimeType: mimeType,
                        displayName: fileName,
                    });

                    console.log(`Uploaded ${fileName}. URI: ${uploadResponse.file.uri}`);
                    uploadedFiles.push(uploadResponse.file);
                    filesToProcess.push(uploadResponse.file);
                } catch (error) {
                    console.error(`Failed to upload ${fileName}:`, error);
                }
            }
        }

        if (filesToProcess.length > 0) {
            console.log("Waiting for new files to be processed...");
            await this.waitForFilesActive(filesToProcess);
        }

        return uploadedFiles;
    }

    private getFilesRecursively(dir: string, fileList: string[] = []) {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                if (!file.startsWith(".") && file !== 'node_modules') {
                    this.getFilesRecursively(filePath, fileList);
                }
            } else {
                if (!file.startsWith(".")) {
                    fileList.push(filePath);
                }
            }
        });
        return fileList;
    }

    async waitForFilesActive(files: any[]) {
        console.log("Checking file processing status...");
        for (const file of files) {
            let fileStatus = await this.fileManager.getFile(file.name);
            while (fileStatus.state === FileState.PROCESSING) {
                process.stdout.write(".");
                await new Promise((resolve) => setTimeout(resolve, 2000));
                fileStatus = await this.fileManager.getFile(file.name);
            }
            if (fileStatus.state !== FileState.ACTIVE) {
                console.error(`File ${file.displayName} failed to process: ${fileStatus.state}`);
            }
        }
        console.log("\nAll files processed.");
    }
}
