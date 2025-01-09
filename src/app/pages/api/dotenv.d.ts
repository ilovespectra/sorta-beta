declare module 'dotenv' {
    export function config(options?: { path?: string; debug?: boolean; override?: boolean }): void;
  }
  