$ErrorActionPreference = "Stop"

# Ensure assets directory exists
if (-not (Test-Path "assets")) {
    New-Item -ItemType Directory -Path "assets" | Out-Null
    Write-Host "Created assets directory."
}

# Download geoip.dat
if (-not (Test-Path "assets/geoip.dat")) {
    Write-Host "Downloading geoip.dat..."
    Invoke-WebRequest -Uri "https://github.com/v2fly/geoip/releases/latest/download/geoip.dat" -OutFile "assets/geoip.dat"
}

# Download geosite.dat
if (-not (Test-Path "assets/geosite.dat")) {
    Write-Host "Downloading geosite.dat..."
    Invoke-WebRequest -Uri "https://github.com/v2fly/domain-list-community/releases/latest/download/dlc.dat" -OutFile "assets/geosite.dat"
}

# Check if Go is available
$goAvailable = Get-Command "go" -ErrorAction SilentlyContinue

if ($goAvailable) {
    # Handle xray-core patching
    if (-not (Test-Path "assets/xray-patched")) {
        Write-Host "Setting up xray-core..."
        if (Test-Path "assets/xray-core") { Remove-Item "assets/xray-core" -Recurse -Force }
        
        # Clone and checkout
        Push-Location "assets"
        $version = Get-Content "..\xray-version.txt" -Raw
        $version = $version.Trim()
        git clone --branch $version --depth 1 https://github.com/xtls/xray-core
        Set-Location "xray-core"
        
        # Apply patch
        Write-Host "Applying patch..."
        $patchFile = "..\..\xray-wasm.patch"
        # Using git apply directly
        # construct absolute path for patch because git apply might need it or relative to cwd
        $absPatchPath = Resolve-Path $patchFile
        git apply $absPatchPath
        
        Pop-Location
        
        # Rename/Move
        Move-Item "assets/xray-core" "assets/xray-patched"
        Write-Host "xray-patched created."
    }

    # Copy wasm_exec.js
    Write-Host "Copying wasm_exec.js..."
    $goRoot = go env GOROOT
    Copy-Item "$goRoot\misc\wasm\wasm_exec.js" -Destination "." -Force

    # Build main.wasm
    Write-Host "Building main.wasm..."
    $env:GOARCH = "wasm"
    $env:GOOS = "js"
    go build -o main.wasm main.go
    $env:GOARCH = $null
    $env:GOOS = $null
    Write-Host "Build complete: main.wasm"

    # Generate xray.schema.json
    if (-not (Test-Path "xray.schema.json")) {
        Write-Host "Generating xray.schema.json..."
        
        $docsDir = "assets/Xray-docs-next-main"
        if (-not (Test-Path $docsDir)) {
            Write-Host "Downloading Xray docs..."
            $tarUrl = "https://github.com/XTLS/Xray-docs-next/archive/refs/heads/main.zip" # Using zip for easier windows handling if available, but repo is tar.gz usually.
            # Let's stick to curl/tar if available, or just standard Invoke-WebRequest with tar.
            # The makefile used curl | tar. PowerShell has tar since Windows 10 (usually).
            
            Push-Location "assets"
            curl.exe -fL https://github.com/XTLS/Xray-docs-next/archive/refs/heads/main.tar.gz -o docs.tar.gz
            tar.exe -xvzf docs.tar.gz
            Remove-Item docs.tar.gz
            Pop-Location
        }

        Write-Host "Parsing docs..."
        # Equivalent to: grep -r '' assets/Xray-docs-next-main/docs/en/config/ | cut -d: -f2- | python3 scrape-docs.py
        # We just need to feed the content of all files to the python script.
        
        $configFiles = Get-ChildItem -Path "$docsDir/docs/en/config" -Recurse -File
        $content = $configFiles | Get-Content
        
        # Pipe content to python script
        # We need to pass it via stdin. 
        $content | python scrape-docs.py | Set-Content "xray.schema.json" -Encoding UTF8
        Write-Host "Generated xray.schema.json"
    }

}
else {
    Write-Warning "Go not found. Falling back to pre-built binaries (Lite mode)."
    
    # Download main.wasm
    Write-Host "Downloading main.wasm..."
    Invoke-WebRequest -Uri "https://mmmray.github.io/xray-online/main.wasm" -OutFile "main.wasm"
    
    # Download wasm_exec.js
    Write-Host "Downloading wasm_exec.js..."
    Invoke-WebRequest -Uri "https://mmmray.github.io/xray-online/wasm_exec.js" -OutFile "wasm_exec.js"
    
    # Download xray.schema.json
    Write-Host "Downloading xray.schema.json..."
    Invoke-WebRequest -Uri "https://mmmray.github.io/xray-online/xray.schema.json" -OutFile "xray.schema.json"
}

Write-Host "Done!"
