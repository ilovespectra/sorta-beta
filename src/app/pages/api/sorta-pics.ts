import * as fs from 'fs/promises';
import * as path from 'path';
import pLimit from 'p-limit';
import chalk from 'chalk';
// import { SingleBar, Presets } from 'cli-progress';
import * as dotenv from 'dotenv';
dotenv.config();

const metadataDestination = process.env.metadataDestination!;
const metadataName = process.env.metadataName!;
const metadataFilePath = path.join(metadataDestination, metadataName);

interface FileMetadata {
    filename: string;
    path: string;
    timestamp: string;
    copied: boolean;
    hash: string;
}

let fileMetadataArray: FileMetadata[] = [];
let fileMetadataMap: Record<string, FileMetadata> = {};
const copiedHashes: Set<string> = new Set(); 

let duplicateCount = 0;
let spaceSaved = 0;

try {
    const metadataFile = await fs.readFile(metadataFilePath, 'utf-8');
    fileMetadataArray = JSON.parse(metadataFile).files;

    fileMetadataMap = fileMetadataArray.reduce((map, item) => {
        map[item.path] = item;
        return map;
    }, {} as Record<string, FileMetadata>);

    fileMetadataArray.forEach((item) => {
        if (item.copied) {
            copiedHashes.add(item.hash);
        }
    });
} catch (err) {
    console.error(chalk.red(`Error reading metadata file: ${err}`));
}

const imageExtensions = new Set([
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp',
    '.ico', '.heic', '.heif', '.raw', '.cr2', '.nef', '.orf', '.arw',
    '.sr2', '.dng', '.raf', '.rw2', '.pef', '.svg', '.img', '.psd', '.xcf', '.pcx', '.jp2',
]);

function formatTimestamp(timestamp: string): string {
    if (timestamp === "1980-01-01T05:00:00.000Z") {
        console.warn(chalk.yellow(`Invalid timestamp: ${timestamp}. Using current date.`));
        return new Date().toISOString().split('T')[0]; 
    }

    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function directoryExists(dir: string): Promise<boolean> {
    try {
        await fs.access(dir);
        return true;
    } catch {
        return false;
    }
}

async function updateMetadataFile() {
    await fs.writeFile(metadataFilePath, JSON.stringify({ files: fileMetadataArray }, null, 4), 'utf-8');
}

async function organizeFilesByType(srcDir: string, destDir: string) {
    const limit = pLimit(10);
    const allFiles: string[] = [];

    const collectFiles = async (currentDir: string) => {
        try {
            const items = await fs.readdir(currentDir, { withFileTypes: true });
    
            for (const item of items) {
                const itemPath = path.join(currentDir, item.name);
    
                if (item.name.startsWith('.')) {
                    console.warn(chalk.yellow(`Skipping hidden or system directory: ${itemPath}`));
                    continue;
                }
    
                if (item.isDirectory()) {
                    await collectFiles(itemPath);
                } else {
                    allFiles.push(itemPath);
                }
            }
        } catch (err) {
            if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EPERM') {
                console.warn(chalk.yellow(`Permission denied: ${currentDir}`));
            } else {
                console.error(chalk.red(`Error accessing directory: ${currentDir}`));
                console.error(err);
            }
        }
    };

    await collectFiles(srcDir);

    const relevantFiles = allFiles.filter(filePath =>
        imageExtensions.has(path.extname(filePath).toLowerCase())
    );

    const totalFiles = relevantFiles.length;
    if (totalFiles === 0) {
        console.log('No images to organize.');
        return;
    }

    console.log(`Found ${totalFiles} images. Starting organization...`);

    // const progressBar = new SingleBar({
    //     format: `Processing |${chalk.cyan('{bar}')}| {percentage}% | {value}/{total} Images`,
    //     barCompleteChar: '\u2588',
    //     barIncompleteChar: '\u2591',
    //     hideCursor: true,
    // }, Presets.shades_classic);

    // progressBar.start(totalFiles, 0);

    let processedFiles = 0;

    const processFile = async (filePath: string) => {
        const ext = path.extname(filePath).toLowerCase();
        const metadata = fileMetadataMap[filePath];
        if (!metadata) {
            console.log(chalk.yellow(`No metadata for image: ${filePath}`));
            // progressBar.increment();
            return;
        }

        if (copiedHashes.has(metadata.hash)) {
            console.log(chalk.cyan(`Image already copied (duplicate hash): ${filePath}`));
            duplicateCount++;

            const stats = await fs.stat(filePath);
            spaceSaved += stats.size;
            // progressBar.increment();
            return;
        }

        const typeDir = path.join(destDir, 'images', ext.replace('.', ''));
        if (!(await directoryExists(typeDir))) {
            await fs.mkdir(typeDir, { recursive: true });
        }

        const formattedTimestamp = formatTimestamp(metadata.timestamp);
        const baseName = path.basename(filePath, ext);
        let destFileName = `${formattedTimestamp}_${baseName}${ext}`;
        let destPath = path.join(typeDir, destFileName);

        try {
            if (await fs.access(destPath).then(() => true).catch(() => false)) {
                console.log(chalk.yellow(`Image already exists: ${destPath}`));
                destFileName = `${formattedTimestamp}_${baseName}_copy${ext}`;
                destPath = path.join(typeDir, destFileName);
            }

            await fs.copyFile(filePath, destPath);
            console.log(chalk.green(`Moved: ${filePath} -> ${destPath}`));

            metadata.copied = true;
            copiedHashes.add(metadata.hash);
            processedFiles++;
            // progressBar.increment();
        } catch (err) {
            console.error(chalk.red(`Error processing image: ${filePath}`));
            console.error(err);
        }
    };

    const processFilesConcurrently = async () => {
        const promises = relevantFiles.map((filePath) => {
            return limit(async () => {
                await processFile(filePath);
            });
        });
    
        await Promise.all(promises);
    };
    
    await processFilesConcurrently();

    // progressBar.stop();
    console.log(`Processed ${processedFiles} out of ${totalFiles} files.`);
    console.log(chalk.yellow(`Found ${duplicateCount} duplicates and saved ${chalk.green((spaceSaved / (1024 * 1024)).toFixed(2))} MB by skipping them.`));

    await updateMetadataFile();
}

const srcDir = process.env.sourceDir!; 
const destDir = process.env.destinationDir!; 

await organizeFilesByType(srcDir, destDir);
