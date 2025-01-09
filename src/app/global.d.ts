// globals.d.ts or similar file

// Global interface example (for specific use cases)
export {};

declare global {
  interface Window {
    showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
  }
}

// Declare modules for missing type definitions
declare module 'cli-progress';
declare module 'fs-extra';
declare module 'jsonfile';
declare module 'luxon';
declare module 'progress';
declare module 'react';
declare module 'dotenv';
declare module 'chalk';
