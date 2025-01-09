import { execSync } from 'child_process';
import fs from 'fs';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env file
config();

// Helper function to assert that environment variables are defined
function assertEnvVar(variable: string | undefined, name: string): string {
  if (!variable) {
    throw new Error(`Environment variable ${name} is required but is missing!`);
  }
  return variable; // Narrowed to string
}

// Extract and validate environment variables
const sourceDir = assertEnvVar(process.env.sourceDir, 'sourceDir');
const destinationDir = assertEnvVar(process.env.destinationDir, 'destinationDir');
const metadataDestination = assertEnvVar(process.env.metadataDestination, 'metadataDestination');
const metadataName = assertEnvVar(process.env.metadataName, 'metadataName');
const scriptPath = assertEnvVar(process.env.scriptPath, 'scriptPath');
const createMetadata = assertEnvVar(process.env.createMetadata, 'createMetadata');
const sortaPics = assertEnvVar(process.env.sortaPics, 'sortaPics');
const sortaVids = assertEnvVar(process.env.sortaVids, 'sortaVids');
const sortaAudio = assertEnvVar(process.env.sortaAudio, 'sortaAudio');
const sortaElse = assertEnvVar(process.env.sortaElse, 'sortaElse');

console.log("srcDir:", process.env.sourceDir);
console.log("destDir:", process.env.destinationDir);

// Function to execute shell commands
function executeCommand(command: string) {
  try {
    console.log(`\nRunning command: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\nError executing command: ${command}`);
    console.error(error);
    process.exit(1); // Exit the script on failure
  }
}

// Function to get the total size of a directory
function getDirectorySize(directoryPath: string): string {
  try {
    const command = process.platform === 'win32'
      ? `powershell -Command "& {Get-ChildItem -Recurse '${directoryPath}' | Measure-Object -Property Length -Sum | ForEach-Object { [math]::Round($_.Sum / 1MB, 2) } }"`
      : `du -sh "${directoryPath}" | cut -f1`;
    return execSync(command).toString().trim();
  } catch {
    return 'Unable to determine size.';
  }
}

// Function to get available space on the destination drive
function getAvailableSpace(destinationPath: string): string {
  try {
    const command = process.platform === 'win32'
      ? `powershell -Command "& {Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Root -eq '${path.parse(destinationPath).root}' } | Select-Object -ExpandProperty Free | ForEach-Object { [math]::Round($_ / 1GB, 2) + ' GB' } }"`
      : `df -h "${destinationPath}" | awk 'NR==2 {print $4}'`;
    return execSync(command).toString().trim();
  } catch {
    return 'Unable to determine available space.';
  }
}

// Function to create a directory if it doesn't exist
function ensureDirectoryExists(directoryPath: string) {
  if (!fs.existsSync(directoryPath)) {
    console.log(`Creating directory: ${directoryPath}`);
    fs.mkdirSync(directoryPath, { recursive: true });
  } else {
    console.log(`Directory already exists: ${directoryPath}`);
  }
}

// Ensure the destination folder exists
ensureDirectoryExists(destinationDir);

// Display total size of the source directory
console.log('\nTotal size of the source directory:');
const sourceSize = getDirectorySize(sourceDir);
console.log(sourceSize);

// Display available space on the destination drive
console.log('\nAvailable space on the destination drive:');
const availableSpace = getAvailableSpace(destinationDir);
console.log(availableSpace);

// Build commands using validated environment variables
const commands = [
  `npx ts-node --esm ${path.join(scriptPath, createMetadata)} ${sourceDir} ${path.join(metadataDestination, metadataName)}`,
  `npx --max-old-space-size=4096 ts-node --esm ${path.join(scriptPath, sortaPics)} ${sourceDir} ${destinationDir}`,
  `npx --max-old-space-size=4096 ts-node --esm ${path.join(scriptPath, sortaVids)} ${sourceDir} ${destinationDir}`,
  `npx --max-old-space-size=4096 ts-node --esm ${path.join(scriptPath, sortaAudio)} ${sourceDir} ${destinationDir}`,
  `npx --max-old-space-size=4096 ts-node --esm ${path.join(scriptPath, sortaElse)} ${sourceDir} ${destinationDir}`,
];

// Run each command sequentially
commands.forEach((command, index) => {
  console.log(`\nExecuting command ${index + 1}/${commands.length}:`);
  executeCommand(command);
});

console.log('\nAll commands executed successfully!');
