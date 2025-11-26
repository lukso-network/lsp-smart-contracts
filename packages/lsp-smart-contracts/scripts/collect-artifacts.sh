#!/bin/bash

# Script to collect artifacts from all LSP packages into the lsp-smart-contracts package
# This replaces the hardhat prepare-package task for the aggregated package

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"
PACKAGES_DIR="$(dirname "$PACKAGE_DIR")"
ARTIFACTS_DIR="$PACKAGE_DIR/artifacts"

echo "🚀 Collecting artifacts from all packages..."
echo ""

# Remove existing artifacts directory and create a fresh one
rm -rf "$ARTIFACTS_DIR"
mkdir -p "$ARTIFACTS_DIR"

# Copy all artifacts from other packages (excluding lsp-smart-contracts itself)
for pkg_dir in "$PACKAGES_DIR"/*-contracts; do
    # Skip lsp-smart-contracts itself
    if [ "$(basename "$pkg_dir")" = "lsp-smart-contracts" ]; then
        continue
    fi

    pkg_artifacts="$pkg_dir/artifacts"

    # Copy all files from artifacts directory if it exists
    if [ -d "$pkg_artifacts" ]; then
        cp "$pkg_artifacts"/* "$ARTIFACTS_DIR/" 2>/dev/null || true
    fi
done

echo "✅ Collected artifacts into $ARTIFACTS_DIR"
echo ""
echo "✨ Artifact collection complete!"
