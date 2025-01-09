import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config();

// Constants for file paths
const metadataDestination = process.env.metadataDestination!;
const metadataName = process.env.metadataName!;
const metadataOutputFile = path.join(metadataDestination, metadataName);

// Function to calculate file hash
async function getFileHash(filePath: string): Promise<string | null> {
    try {
        const fileContent = await fs.readFile(filePath);
        const hash = crypto.createHash('sha256').update(fileContent).digest('hex');
        return hash;
    } catch (err) {
        console.error(`Error hashing file: ${filePath} - ${err}`);
        return null;
    }
}

// Function to ensure metadata file exists, if not create it
async function ensureMetadataFileExists(metadataFile: string) {
    try {
        // Check if metadata file exists, if not, create it
        await fs.access(metadataFile); // This checks if the file exists
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            // File doesn't exist, create an empty structure
            const initialData = { files: [] };
            await fs.writeFile(metadataFile, JSON.stringify(initialData, null, 4), 'utf8');
            console.log('Metadata file created');
        } else {
            console.error(`Error accessing metadata file: ${(err as Error).message}`);
            throw err;
        }
    }
}

// Function to update the metadata file immediately after each file is processed
async function updateMetadataFile(filesMetadata: { files: { filename: string; path: string; timestamp: string; copied: boolean; hash: string | null }[] }) {
    try {
        await fs.writeFile(metadataOutputFile, JSON.stringify(filesMetadata, null, 4), 'utf8');
        console.log(`Metadata updated in ${metadataOutputFile}`);
    } catch (err) {
        console.error(`Error updating metadata file: ${err}`);
    }
}

// Main function to gather metadata
async function getFileMetadata(dir: string, metadataFile: string) {
    const filesMetadata: { files: { filename: string; path: string; timestamp: string; copied: boolean; hash: string | null }[] } = {
        files: [],
    };

    // Ensure metadata file exists before proceeding
    await ensureMetadataFileExists(metadataFile);

    // Scan the directory and update metadata incrementally
    const scanDirectory = async (currentDir: string) => {
        let items;
        try {
            items = await fs.readdir(currentDir, { withFileTypes: true });
        } catch (err) {
            const error = err as NodeJS.ErrnoException;
            if (error.code === 'EPERM') {
                console.warn(`Skipping restricted folder: ${currentDir}`);
                return;
            } else {
                throw err;
            }
        }

        for (const item of items) {
            const filePath = path.join(currentDir, item.name);

            if (item.name.startsWith('.')) {
                continue;
            }

            if (item.isDirectory()) {
                await scanDirectory(filePath); // Recursively scan subdirectories
            } else {
                try {
                    // Skip files already processed
                    const existingFile = filesMetadata.files.find(f => f.filename === item.name && f.path === filePath);
                    if (existingFile) {
                        console.log(`Skipping already processed file: ${filePath}`);
                        continue;
                    }

                    const stats = await fs.stat(filePath);
                    console.log(`Checking file: ${filePath}`);
                    console.log(`Birthtime: ${stats.birthtime}`);
                    console.log(`Mtime: ${stats.mtime}`);

                    const timestamp = stats.birthtime || stats.mtime;
                    if (timestamp) {
                        const hash = await getFileHash(filePath);

                        // Add new file metadata to the array
                        filesMetadata.files.push({
                            filename: item.name,
                            path: filePath,
                            timestamp: timestamp.toISOString(),
                            copied: false,
                            hash: hash || null,
                        });

                        // Update metadata file incrementally after processing each file
                        await updateMetadataFile(filesMetadata);
                    } else {
                        console.warn(`No valid timestamp for file: ${filePath}`);
                    }
                } catch (err) {
                    const error = err as Error;
                    if (error instanceof Error) {
                        console.warn(`Failed to read file: ${filePath} - ${error.message}`);
                    }
                }
            }
        }
    };

    await scanDirectory(dir);
}

// Get the source directory from command-line arguments
const sourceDir = process.argv[2];

if (!sourceDir) {
    console.error('Usage: ts-node createMetadata.ts <sourceDir>');
    process.exit(1);
}

getFileMetadata(sourceDir, metadataOutputFile).catch((err) => {
    const error = err as Error;
    if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
    } else {
        console.error('An unknown error occurred.');
    }
});
