# Xray-js Live Demo

![Deploy Status](https://github.com/IMROVOID/Xray-js/actions/workflows/deploy.yml/badge.svg)

A modern, responsive React application demonstrating **Xray-core** features directly in the browser using **WebAssembly (WASM)**.

## 🚀 Live Demo

[**View Live Demo**](https://IMROVOID.github.io/Xray-js/) This project is built by compiling the actual **Xray-core** source code into WASM, creating a secure, client-side playground with an intelligent code editor.

![Xray-js Screenshot](https://raw.githubusercontent.com/IMROVOID/Xray-js/refs/heads/main/public/screenshot.webp)

## ✨ Key Features

* **Native Validation:** Uses the real Xray-core logic via WebAssembly to parse configurations, ensuring 100% accuracy compared to the native binary.
* **Intelligent Editor:** Embedded code editor features syntax highlighting, auto-completion, and hovering documentation based on the Xray schema.
* **Client-Side Privacy:** Your configurations are processed entirely in your browser's memory using WASM. No sensitive config data is sent to any backend server.
* **Shareable Configurations:** Generate short, Brotli-compressed links to share complex configurations with others securely and easily.
* **Cross-Platform Logic:** Patched Go code removes system-level dependencies (like raw sockets), allowing the core routing logic to run on any modern web browser.

## 📁 Project Structure

The project is organized to separate the Go/WASM backend logic from the frontend presentation.

```text
/xray-js
├── assets/             # Temporary folder for downloaded Xray source and GeoIP data
├── scripts/            # Build scripts for Node.js
├── main.go             # The Go entry point interfacing between JS and Xray-core
├── main.wasm           # The compiled binary (generated after build)
├── index.html          # Main frontend UI and Monaco Editor logic
├── wasm_exec.js        # Go WebAssembly loader script
├── scrape-docs.py      # Python script to generate JSON schema from docs
├── build.ps1           # Windows build automation script
├── build.py            # Python build automation script
├── Makefile            # Linux/macOS build commands
├── Justfile            # Rules for "just" command runner
├── package.json        # Node.js configuration and scripts
└── xray.schema.json    # Generated validation schema for the editor

```

## ⚙️ How to Run the Project

To get a local copy up and running, follow these simple steps.

1. **Clone the repository:**

    ```sh
    git clone https://github.com/IMROVOID/xray-js.git
    ```

2. **Navigate to the project directory:**

    ```sh
    cd xray-js
    ```

3. **Build the WASM binary (Requires Go 1.22+):**
    * **Linux/macOS:**

        ```sh
        make build
        ```

    * **Windows (PowerShell):**

        ```ps1
        .\build.ps1
        ```

    * **Node.js:**

        ```sh
        npm install
        npm run build
        ```

    * **Python:**

        ```sh
        python3 build.py
        ```

    * **Just:**

        ```sh
        just build
        ```

4. **Run the local server:**

    * **Node.js (Recommended):**

        ```sh
        npm run dev
        ```

        The application will be available at `http://localhost:5173`.

    * **Python:**

        ```sh
        python3 -m http.server
        ```

        The application will be available at `http://localhost:8000`.

## 🔧 How to Modify the Page

This project was designed to be easily customizable. Here’s how you can modify its key parts:

* **Xray Logic:** The Go-to-JS bridge is located in `main.go`. Modifications to the core require applying changes to `xray-wasm.patch`.
* **Editor Configuration:** To change the editor theme, snippets, or validation rules, modify the script section in `index.html`.
* **Validation Schema:** If Xray updates its configuration format, run `python3 scrape-docs.py` to regenerate `xray.schema.json`.
* **Styling:** All CSS styles for the glassmorphic UI and layout are defined within the `<style>` block in `index.html`.

## 🛠️ Technologies & Libraries Used

This project leverages several powerful tools to bring a system-level binary to the web.

| Library | Link | Description |
| :--- | :--- | :--- |
| **WebAssembly** | [webassembly.org](https://webassembly.org/) | A binary instruction format that allows Go code to run in the browser at near-native speed. |
| **Go (Golang)** | [go.dev](https://go.dev/) | The programming language used to build Xray-core and the WASM bridge. |
| **Xray-core** | [github.com/xtls/xray-core](https://github.com/xtls/xray-core) | The core networking platform and configuration logic. |
| **Brotli-WASM** | [github.com/google/brotli](https://github.com/google/brotli) | Used for high-efficiency compression of configuration strings for sharing. |
| **FontAwesome** | [fontawesome.com](https://fontawesome.com/) | Beautiful & consistent icons for the UI buttons. |

## 🚀 Deployment to GitHub Pages

This repository includes a GitHub Actions workflow for automated deployment.

1. **Configure Repository:**
    * Go to **Settings** > **Pages**.
    * Set **Source** to **GitHub Actions**.

2. **Trigger Deployment:**
    * The workflow is defined in `.github/workflows/deploy.yml`.
    * Simply push to the `main` branch:

        ```sh
        git push origin main
        ```

3. **Automatic Build:**
    * GitHub Actions will automatically set up Go, build the `main.wasm` binary, generate the schema, and deploy the artifacts.
    * Your site will be live at `https://<your-username>.github.io/xray-js/` within a few minutes.

---

## 📜 License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

> This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

**Key Requirements of GPL-3.0:**
*   **Disclose Source:** You must make the source code available when you distribute the software.
*   **License and Copyright Notice:** You must include a copy of the license and the original copyright notice.
*   **Same License:** If you modify the code or use it as a library, your project must also be licensed under GPL-3.0 (Copyleft).
*   **No Warranty:** This software is provided "as is" without any warranty of any kind.

For more details, please see the [LICENSE](LICENSE) file in this repository.

---

## © About the Developer

This application was developed and is maintained by **Roham Andarzgou**.

I'm a passionate professional from Iran specializing in Graphic Design, Web Development, and cross-platform app development with Dart & Flutter. I thrive on turning innovative ideas into reality, whether it's a stunning visual, a responsive website, or a polished desktop app like this one. I also develop immersive games using Unreal Engine.

* **Website:** [rovoid.ir](https://rovoid.ir)
* **GitHub:** [IMROVOID](https://github.com/IMROVOID)
* **LinkedIn:** [Roham Andarzgou](https://www.linkedin.com/in/roham-andarzgouu)

### 🙏 Support This Project

If you find this application useful, please consider a donation. As I am based in Iran, cryptocurrency is the only way I can receive support. Thank you!

| Cryptocurrency | Address |
| :--- | :--- |
| **Bitcoin** (BTC) | `bc1qd35yqx3xt28dy6fd87xzd62cj7ch35p68ep3p8` |
| **Ethereum** (ETH) | `0xA39Dfd80309e881cF1464dDb00cF0a17bF0322e3` |
| **USDT** (TRC20) | `THMe6FdXkA2Pw45yKaXBHRnkX3fjyKCzfy` |
| **Solana** (SOL) | `9QZHMTN4Pu6BCxiN2yABEcR3P4sXtBjkog9GXNxWbav1` |
| **TON** | `UQCp0OawnofpZTNZk-69wlqIx_wQpzKBgDpxY2JK5iynh3mC` |
