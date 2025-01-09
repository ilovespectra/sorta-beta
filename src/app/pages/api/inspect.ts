import * as fs from 'fs/promises';

async function checkFileMetadata(filePath: string) {
    try {
        const stats = await fs.stat(filePath);
        
        console.log(`Metadata for file: ${filePath}`);
        console.log(`Birthtime: ${stats.birthtime}`);
        console.log(`Mtime: ${stats.mtime}`);
        console.log(`Atime: ${stats.atime}`);
        console.log(`Size: ${stats.size} bytes`);
        console.log(`Is Directory: ${stats.isDirectory()}`);
        console.log('---');
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(`Failed to read file: ${filePath} - ${err.message}`);
        } else {
            console.error(`Failed to read file: ${filePath} - Unknown error`);
        }
    }
}

// Example files (replace with actual paths you're debugging)
const filesToCheck = [
    '/your/desired/path'
];

for (const file of filesToCheck) {
    checkFileMetadata(file);
}
