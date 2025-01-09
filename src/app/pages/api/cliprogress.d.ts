declare module 'cli-progress' {
    // Define the options for SingleBar's constructor
    interface SingleBarOptions {
        format: string;
        barCompleteChar: string;
        barIncompleteChar: string;
        hideCursor: boolean;
    }

    // Define the Presets object
    export const Presets: {
        shades_classic: object;
        // Add other presets as necessary
    };

    // Declare the SingleBar class with its methods
    export class SingleBar {
        constructor(options: SingleBarOptions, presets: typeof Presets);

        start(total: number, startValue: number): void;
        increment(): void;
        stop(): void;
    }
}
