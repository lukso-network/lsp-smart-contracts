#!/usr/bin/env python3
"""Solc toolchain: resolve/install a solc binary and compile Standard JSON input."""

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

def svm_base_dirs():
    """Return candidate svm install roots, in priority order.

    Foundry installs solc under ``~/.svm/`` only when that directory already
    exists. Otherwise it uses platform-specific data directories — see
    https://getfoundry.sh/misc/faq/
    """
    home = Path.home()
    bases = []

    svm_home = os.environ.get("SVM_HOME")
    if svm_home:
        bases.append(Path(svm_home))

    bases.append(home / ".svm")

    xdg_data_home = os.environ.get("XDG_DATA_HOME")
    if xdg_data_home:
        bases.append(Path(xdg_data_home) / "svm")
    elif sys.platform == "darwin":
        bases.append(home / "Library" / "Application Support" / "svm")
    else:
        bases.append(home / ".local" / "share" / "svm")

    # Preserve order but drop duplicates.
    seen = set()
    unique = []
    for base in bases:
        key = str(base.resolve()) if base.exists() else str(base)
        if key not in seen:
            seen.add(key)
            unique.append(base)
    return unique

def resolve_solc_binary(version):
    """Return the path to an installed ``solc-{version}`` binary, or ``None``."""
    binary_name = f"solc-{version}"
    for base in svm_base_dirs():
        candidate = base / version / binary_name
        if candidate.is_file():
            return candidate
    return None

def install_solc_via_forge(version):
    """Trigger a Foundry-managed solc download for ``version``."""
    forge = shutil.which("forge")
    if forge is None:
        return None

    with tempfile.TemporaryDirectory(prefix="lsp-solc-install-") as tmp:
        root = Path(tmp)
        (root / "foundry.toml").write_text(
            f'[profile.default]\nsrc = "src"\nout = "out"\nsolc = "{version}"\n'
        )
        src_dir = root / "src"
        src_dir.mkdir()
        (src_dir / "C.sol").write_text(
            "\n".join(
                [
                    "// SPDX-License-Identifier: MIT",
                    f"pragma solidity ^{version};",
                    "contract C {}",
                ]
            )
        )

        result = subprocess.run(
            [forge, "build", "--root", str(root), "--use", version],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0:
            stderr = (result.stderr or result.stdout or "").strip()
            raise RuntimeError(
                f"forge failed to install solc {version}"
                + (f":\n{stderr[:500]}" if stderr else "")
            )

    return resolve_solc_binary(version)

def ensure_solc_binary(version):
    """Return the solc binary path, installing it via Foundry if missing."""
    found = resolve_solc_binary(version)
    if found is not None:
        return found

    try:
        installed = install_solc_via_forge(version)
    except RuntimeError as err:
        searched = ", ".join(str(base / version) for base in svm_base_dirs())
        sys.exit(
            f"❌ solc {version} is not installed and could not be downloaded automatically.\n"
            f"   {err}\n"
            f"   Searched: {searched}\n"
            f"   Ensure Foundry (`forge`) is installed and can reach the network, "
            f"or install manually: foundryup && forge build --use {version}"
        )

    if installed is None:
        searched = ", ".join(str(base / version) for base in svm_base_dirs())
        sys.exit(
            f"❌ solc {version} still not found after a Foundry install attempt.\n"
            f"   Searched: {searched}"
        )

    return installed

def strip_cbor_metadata(bytecode):
    """Strip the CBOR metadata blob from the bytecode
    The CBOR metadata blob is appended at the end of the bytecode, and its last
    2 bytes encode the blob length. Removing it isolates the executable code.
    
    @param: bytecode The bytecode to strip the CBOR metadata blob from
    @return: The bytecode with the CBOR metadata blob stripped
    """
    
    if len(bytecode) < 4:
        return bytecode
    meta_len = int(bytecode[-4:], 16)
    cut = (meta_len + 2) * 2
    return bytecode[:-cut] if cut < len(bytecode) else bytecode

def compile_creation_bytecode(solc_version, std_json_input_file, contract_name):
    """Return the compiled bytecode

    @param: solc_version The Solidity compiler version to use
    @param: std_json_input_file The path to the std-json-input file to use for compilation
    @param: contract_name The name of the contract to compile

    @return: The generated compiled creation bytecode
    """
    solc_bin = ensure_solc_binary(solc_version)

    std_input = json.loads(Path(std_json_input_file).read_text())
    std_input.setdefault("settings", {})["outputSelection"] = {
        "*": {"*": ["evm.bytecode.object"]}
    }

    # Run solc compiler
    result = subprocess.run(
        [str(solc_bin), "--standard-json"],
        input=json.dumps(std_input),
        capture_output=True,
        text=True,
        check=False,
    )
    # solc failures often produce empty/non-JSON stdout with the real error on
    # stderr, so guard the parse to surface the underlying compiler error.
    if not result.stdout.strip():
        sys.exit(
            f"❌ solc produced no output (exit code {result.returncode}).\n"
            + (result.stderr or "").strip()[:500]
        )

    try:
        output = json.loads(result.stdout)
    except json.JSONDecodeError:
        sys.exit(
            f"❌ Could not parse solc output as JSON (exit code {result.returncode}).\n"
            + (result.stderr or result.stdout or "").strip()[:500]
        )

    errors = [error for error in output.get("errors", []) if error.get("severity") == "error"]
    if errors:
        sys.exit("❌ Compilation failed:\n" + errors[0].get("formattedMessage", "")[:500])

    for source_contracts in output.get("contracts", {}).values():
        if contract_name in source_contracts:
            return source_contracts[contract_name]["evm"]["bytecode"]["object"]

    sys.exit(f"❌ Contract {contract_name} not found in compiler output")

