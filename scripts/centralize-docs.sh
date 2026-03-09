#!/usr/bin/env bash
# centralize-docs.sh
#
# Collects generated NatSpec docs from each package's docs/ folder
# into a single root docs/ folder, preserving the contracts/ and
# libraries/ split and organizing by package label.
#
# After centralizing:
#   1. Cleans up per-package docs/ folders
#   2. Runs prettier on the centralized docs for consistent formatting
#
# Usage: bash scripts/centralize-docs.sh
#
# Structure:
#   docs/
#     contracts/
#       LSP0ERC725Account/
#         LSP0ERC725Account.md
#         ...
#       LSP6KeyManager/
#         LSP6KeyManager.md
#         ...
#     libraries/
#       LSP1UniversalReceiver/
#         LSP1Utils.md
#       LSP2ERC725YJSONSchema/
#         LSP2Utils.md
#       ...

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs"

# Mapping from package directory name to docs folder label
# Format: "package-dir:docs-label"
PACKAGE_MAP=(
  "lsp0-contracts:LSP0ERC725Account"
  "lsp1-contracts:LSP1UniversalReceiver"
  "lsp1delegate-contracts:LSP1UniversalReceiverDelegate"
  "lsp2-contracts:LSP2ERC725YJSONSchema"
  "lsp3-contracts:LSP3ProfileMetadata"
  "lsp4-contracts:LSP4DigitalAssetMetadata"
  "lsp5-contracts:LSP5ReceivedAssets"
  "lsp6-contracts:LSP6KeyManager"
  "lsp7-contracts:LSP7DigitalAsset"
  "lsp8-contracts:LSP8IdentifiableDigitalAsset"
  "lsp9-contracts:LSP9Vault"
  "lsp10-contracts:LSP10ReceivedVaults"
  "lsp11-contracts:LSP11BasicSocialRecovery"
  "lsp12-contracts:LSP12IssuedAssets"
  "lsp14-contracts:LSP14Ownable2Step"
  "lsp16-contracts:LSP16UniversalFactory"
  "lsp17-contracts:LSP17Extensions"
  "lsp17contractextension-contracts:LSP17ContractExtension"
  "lsp20-contracts:LSP20CallVerification"
  "lsp23-contracts:LSP23LinkedContractsFactory"
  "lsp25-contracts:LSP25ExecuteRelayCall"
  "lsp26-contracts:LSP26FollowerSystem"
  "universalprofile-contracts:UniversalProfile"
)

echo "[centralize-docs] Clearing root docs/ folder..."
rm -rf "$DOCS_DIR"
mkdir -p "$DOCS_DIR/contracts" "$DOCS_DIR/libraries"

contract_count=0
library_count=0

for entry in "${PACKAGE_MAP[@]}"; do
  pkg_dir="${entry%%:*}"
  docs_label="${entry##*:}"
  src_dir="$ROOT_DIR/packages/$pkg_dir/docs"

  if [ ! -d "$src_dir" ]; then
    continue
  fi

  # Copy contracts
  if [ -d "$src_dir/contracts" ] && [ "$(ls -A "$src_dir/contracts" 2>/dev/null)" ]; then
    dest_dir="$DOCS_DIR/contracts/$docs_label"
    mkdir -p "$dest_dir"
    find "$src_dir/contracts" -name "*.md" -exec cp {} "$dest_dir/" \;
    file_count=$(find "$dest_dir" -name "*.md" | wc -l)
    contract_count=$((contract_count + file_count))
    echo "  contracts/$docs_label: $file_count docs"
  fi

  # Copy libraries
  if [ -d "$src_dir/libraries" ] && [ "$(ls -A "$src_dir/libraries" 2>/dev/null)" ]; then
    dest_dir="$DOCS_DIR/libraries/$docs_label"
    mkdir -p "$dest_dir"
    find "$src_dir/libraries" -name "*.md" -exec cp {} "$dest_dir/" \;
    file_count=$(find "$dest_dir" -name "*.md" | wc -l)
    library_count=$((library_count + file_count))
    echo "  libraries/$docs_label: $file_count docs"
  fi
done

echo ""
echo "[centralize-docs] Centralized $contract_count contract docs and $library_count library docs into docs/"

# ── Clean up per-package docs/ folders ──────────────────────────────
echo "[centralize-docs] Cleaning up per-package docs/ folders..."
for entry in "${PACKAGE_MAP[@]}"; do
  pkg_dir="${entry%%:*}"
  src_dir="$ROOT_DIR/packages/$pkg_dir/docs"
  if [ -d "$src_dir" ]; then
    rm -rf "$src_dir"
  fi
done
echo "[centralize-docs] Per-package docs/ folders cleaned up."

# ── Format with prettier ────────────────────────────────────────────
# docs/ is in .prettierignore so we use --ignore-path /dev/null to bypass
echo "[centralize-docs] Formatting docs with prettier..."
if command -v npx &>/dev/null; then
  npx prettier --write --ignore-path /dev/null "$DOCS_DIR/**/*.md" 2>&1 || echo "[centralize-docs] Warning: prettier formatting failed (non-fatal)"
else
  echo "[centralize-docs] Warning: npx not found, skipping prettier formatting"
fi

echo "[centralize-docs] Done!"
