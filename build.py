import os
import sys
import shutil
import urllib.request
import subprocess
import tarfile
import pathlib

# Constants
ASSETS_DIR = "assets"
XRAY_VERSION_FILE = "xray-version.txt"
XRAY_WASM_PATCH = "xray-wasm.patch"
MAIN_GO_FILE = "main.go"
WASM_EXEC = "wasm_exec.js"
MAIN_WASM = "main.wasm"
XRAY_SCHEMA = "xray.schema.json"

def run(command, cwd=None, env=None):
    print(f"Running: {command}")
    subprocess.check_call(command, shell=True, cwd=cwd, env=env)

def download(url, dest):
    print(f"Downloading {url} -> {dest}")
    urllib.request.urlretrieve(url, dest)

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def get_go_env(key):
    return subprocess.check_output(["go", "env", key], text=True).strip()

def build_lite():
    print("Lite build: Downloading pre-built assets...")
    download("https://mmmray.github.io/xray-online/main.wasm", "main.wasm")
    download("https://mmmray.github.io/xray-online/wasm_exec.js", "wasm_exec.js")
    download("https://mmmray.github.io/xray-online/xray.schema.json", "xray.schema.json")
    print("Lite build complete.")

def build_full():
    ensure_dir(ASSETS_DIR)

    # 1. Download geoip.dat
    geoip_path = os.path.join(ASSETS_DIR, "geoip.dat")
    if not os.path.exists(geoip_path):
        download("https://github.com/v2fly/geoip/releases/latest/download/geoip.dat", geoip_path)

    # 2. Download geosite.dat
    geosite_path = os.path.join(ASSETS_DIR, "geosite.dat")
    if not os.path.exists(geosite_path):
        download("https://github.com/v2fly/domain-list-community/releases/latest/download/dlc.dat", geosite_path)

    # 3. Setup xray-patched
    xray_patched_path = os.path.join(ASSETS_DIR, "xray-patched")
    if not os.path.exists(xray_patched_path):
        xray_core_path = os.path.join(ASSETS_DIR, "xray-core")
        if os.path.exists(xray_core_path):
            shutil.rmtree(xray_core_path)
        
        with open(XRAY_VERSION_FILE, "r") as f:
            xray_version = f.read().strip()
        
        print(f"Cloning xray-core version {xray_version}...")
        run(f"git clone --branch {xray_version} --depth 1 https://github.com/xtls/xray-core", cwd=ASSETS_DIR)
        
        print("Applying patch...")
        patch_path = os.path.abspath(XRAY_WASM_PATCH)
        run(f'git apply "{patch_path}"', cwd=xray_core_path)
        
        os.rename(xray_core_path, xray_patched_path)

    # 4. Copy wasm_exec.js
    go_root = get_go_env("GOROOT")
    wasm_exec_src = os.path.join(go_root, "misc", "wasm", "wasm_exec.js")
    shutil.copy(wasm_exec_src, WASM_EXEC)
    print(f"Copied {WASM_EXEC}")

    # 5. Build main.wasm
    print("Building main.wasm...")
    env = os.environ.copy()
    env["GOOS"] = "js"
    env["GOARCH"] = "wasm"
    run(f"go build -o {MAIN_WASM} {MAIN_GO_FILE}", env=env)

    # 6. Generate xray.schema.json
    if not os.path.exists(XRAY_SCHEMA):
        print("Generating xray.schema.json...")
        docs_dir = os.path.join(ASSETS_DIR, "Xray-docs-next-main")
        
        if not os.path.exists(docs_dir):
            tar_url = "https://github.com/XTLS/Xray-docs-next/archive/refs/heads/main.tar.gz"
            print("Downloading docs...")
            tar_path = os.path.join(ASSETS_DIR, "docs.tar.gz")
            download(tar_url, tar_path)
            
            with tarfile.open(tar_path, "r:gz") as tar:
                tar.extractall(path=ASSETS_DIR)
            os.remove(tar_path)
        
        # Aggregate content
        config_dir = os.path.join(docs_dir, "docs", "en", "config")
        all_content = ""
        
        for root, dirs, files in os.walk(config_dir):
            for file in files:
                with open(os.path.join(root, file), "r", encoding="utf-8") as f:
                    all_content += f.read() + "\n"
        
        # Run scrape-docs.py (the original one or we could use the JS one if we wanted, but let's stick to python for python build)
        print("Running scrape-docs.py...")
        process = subprocess.Popen([sys.executable, "scrape-docs.py"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
        stdout, stderr = process.communicate(input=all_content)
        
        if process.returncode != 0:
            print(f"Error generating schema: {stderr}")
        else:
            with open(XRAY_SCHEMA, "w", encoding="utf-8") as f:
                f.write(stdout)
            print(f"Generated {XRAY_SCHEMA}")

def main():
    if "--lite" in sys.argv:
        build_lite()
        return

    try:
        subprocess.check_call(["go", "version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Go not found. Defaulting to Lite build.")
        build_lite()
        return

    build_full()

if __name__ == "__main__":
    main()
