import fs from 'fs';
import path from 'path';
import { execSync, exec } from 'child_process';
import https from 'https';
import os from 'os';

// Constants
const ASSETS_DIR = 'assets';
const XRAY_VERSION_FILE = 'xray-version.txt';
const XRAY_WASM_PATCH = 'xray-wasm.patch';
const GO_MOD_FILE = 'go.mod';
const MAIN_GO_FILE = 'main.go';
const WASM_EXEC = 'wasm_exec.js';
const MAIN_WASM = 'main.wasm';
const XRAY_SCHEMA = 'xray.schema.json';

// Helper to run commands
function run(command, options = {}) {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit', ...options });
}

// Helper to download files
async function download(url, dest) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading ${url} -> ${dest}`);
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

// Check if file exists
function exists(path) {
    return fs.existsSync(path);
}

// Get Go env
function getGoEnv(key) {
    return execSync(`go env ${key}`).toString().trim();
}

async function buildLite() {
    console.log("Lite build: Downloading pre-built assets...");
    await download("https://mmmray.github.io/xray-online/main.wasm", "main.wasm");
    await download("https://mmmray.github.io/xray-online/wasm_exec.js", "wasm_exec.js");
    await download("https://mmmray.github.io/xray-online/xray.schema.json", "xray.schema.json");
    console.log("Lite build complete.");
}

async function buildFull() {
    // Ensure assets directory
    if (!exists(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR);
    }

    // 1. Download geoip.dat
    if (!exists(path.join(ASSETS_DIR, 'geoip.dat'))) {
        await download("https://github.com/v2fly/geoip/releases/latest/download/geoip.dat", path.join(ASSETS_DIR, 'geoip.dat'));
    }

    // 2. Download geosite.dat
    if (!exists(path.join(ASSETS_DIR, 'geosite.dat'))) {
        await download("https://github.com/v2fly/domain-list-community/releases/latest/download/dlc.dat", path.join(ASSETS_DIR, 'geosite.dat'));
    }

    // 3. Setup xray-patched
    if (!exists(path.join(ASSETS_DIR, 'xray-patched'))) {
        if (exists(path.join(ASSETS_DIR, 'xray-core'))) {
            fs.rmSync(path.join(ASSETS_DIR, 'xray-core'), { recursive: true, force: true });
        }

        const xrayVersion = fs.readFileSync(XRAY_VERSION_FILE, 'utf8').trim();
        console.log(`Cloning xray-core version ${xrayVersion}...`);

        run(`git clone --branch ${xrayVersion} --depth 1 https://github.com/xtls/xray-core`, { cwd: ASSETS_DIR });

        console.log("Applying patch...");
        const patchPath = path.resolve(XRAY_WASM_PATCH);
        // Construct command to apply patch
        // git apply typically runs from the root of the repo
        run(`git apply "${patchPath}"`, { cwd: path.join(ASSETS_DIR, 'xray-core') });

        fs.renameSync(path.join(ASSETS_DIR, 'xray-core'), path.join(ASSETS_DIR, 'xray-patched'));
    }

    // 4. Copy wasm_exec.js
    const goRoot = getGoEnv('GOROOT');
    const wasmExecSrc = path.join(goRoot, 'misc', 'wasm', 'wasm_exec.js');
    fs.copyFileSync(wasmExecSrc, WASM_EXEC);
    console.log(`Copied ${WASM_EXEC}`);

    // 5. Build main.wasm
    console.log("Building main.wasm...");
    const env = { ...process.env, GOOS: 'js', GOARCH: 'wasm' };
    run(`go build -o ${MAIN_WASM} ${MAIN_GO_FILE}`, { env });

    // 6. Generate xray.schema.json
    if (!exists(XRAY_SCHEMA)) {
        console.log("Generating xray.schema.json...");
        const docsDir = path.join(ASSETS_DIR, 'Xray-docs-next-main');

        // Download docs if needed
        if (!exists(docsDir)) {
            // Using tarball download and extraction is complex in pure node without deps
            // We can use the system tar or curl if available, but let's try to simulate what the ps1 did or use a lightweight approach
            // PS1 used tar.exe. Let's assume tar is available since the user is on Windows with likely Git Bash or similar env that has commands, or modern Windows.
            const tarUrl = "https://github.com/XTLS/Xray-docs-next/archive/refs/heads/main.tar.gz";
            console.log("Downloading docs...");
            // Using curl and tar via shell for simplicity as implementing tar xz in pure JS requires deps like 'tar' or 'zlib' handling which might be overkill if we assume environment.
            // However, we want to be "Node JS" native.
            // Let's rely on 'tar' command presence (from git bash or windows system32)
            run(`curl -fL ${tarUrl} | tar xvzf -`, { cwd: ASSETS_DIR, shell: true });
        }

        // Aggregate content
        const configDir = path.join(docsDir, 'docs', 'en', 'config');
        let allContent = '';

        function readDirRecursive(dir) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    readDirRecursive(fullPath);
                } else {
                    allContent += fs.readFileSync(fullPath, 'utf8') + '\n';
                }
            }
        }

        readDirRecursive(configDir);

        // Pipe to script
        // We can run the scripts/scrape-docs.js directly via node
        console.log("Running scrape-docs.js...");
        const scrapeProc = exec('node scripts/scrape-docs.js', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            fs.writeFileSync(XRAY_SCHEMA, stdout);
            console.log(`Generated ${XRAY_SCHEMA}`);
        });

        scrapeProc.stdin.write(allContent);
        scrapeProc.stdin.end();
    }
}

async function main() {
    const isLite = process.argv.includes('--lite');

    // Check for Go presence for full build
    try {
        execSync('go version', { stdio: 'ignore' });
    } catch (e) {
        console.warn("Go not found or failed to run. Defaulting to Lite build.");
        await buildLite();
        return;
    }

    if (isLite) {
        await buildLite();
    } else {
        await buildFull();
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
