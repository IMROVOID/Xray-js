import { useEffect, useState } from 'react';



export const useWasm = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadWasm = async () => {
            if (typeof window.XrayParseConfig === 'function') {
                setIsLoaded(true);
                return;
            }

            try {
                const go = new window.Go();
                const result = await WebAssembly.instantiateStreaming(
                    fetch("/main.wasm"),
                    go.importObject
                );

                // We need to define the callback BEFORE running the instance
                // because main.go calls it on start
                window.onWasmInitialized = () => {
                    console.log("Xray WASM Initialized");
                    setIsLoaded(true);
                };

                // Run the instance - this blocks in many Go WASM cases, 
                // but our main.go has a 'select{}' to keep it running.
                // We don't await this because it never returns.
                go.run(result.instance);

            } catch (err: any) {
                console.error("Failed to load WASM", err);
                setError(err.message);
            }
        };

        loadWasm();
    }, []);

    const parseConfig = (jsonConfig: string) => {
        if (!isLoaded || !window.XrayParseConfig) return "WASM not loaded";
        return window.XrayParseConfig(jsonConfig);
    };

    const getVersion = () => {
        if (!isLoaded || !window.XrayGetVersion) return "Loading...";
        return window.XrayGetVersion();
    }

    return { isLoaded, error, parseConfig, getVersion };
};
