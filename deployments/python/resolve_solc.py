#!/usr/bin/env python3
"""Resolve (and if needed, install) a solc binary for a given version."""

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
