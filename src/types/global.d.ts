export { };

declare global {
    interface Window {
        Go: any;
        XrayParseConfig?: (config: string) => string | null;
        XrayGetVersion?: () => string;
        onWasmInitialized?: () => void;
    }
}
