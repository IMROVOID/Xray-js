default:
  @just --list

# Build the project (requires Go)
build:
  node scripts/build.js

# Download pre-built assets (Lite mode)
dev-lite:
  node scripts/build.js --lite

# Serve the current directory
serve:
  python3 -m http.server
