#!/usr/bin/env python3
"""Shared helpers for reading deployments/contracts.json."""

import json
import sys
from pathlib import Path

DEPLOYMENTS_DIR = Path(__file__).resolve().parent.parent
CONTRACTS_JSON = DEPLOYMENTS_DIR / "contracts.json"

VERIFICATION_FIELDS = ("standardJsonInputFilePath", "compilerVersion", "contractId")


def load_contracts():
    return json.loads(CONTRACTS_JSON.read_text())


def iter_entries(contracts):
    for name, entry in contracts.items():
        if "versions" in entry:
            for version_entry in entry["versions"]:
                yield name, version_entry
        else:
            yield name, entry


def contract_id_from_entry(name, entry):
    version = entry.get("version")
    if version:
        return f"{name}-v{version}"
    return name


def list_verifiable_contract_ids(contracts=None):
    contracts = contracts or load_contracts()
    ids = []
    for name, entry in iter_entries(contracts):
        if entry.get("standardJsonInputFilePath") is not None:
            ids.append(contract_id_from_entry(name, entry))
    return sorted(ids)


def parse_contract_id(contract_id):
    if "-v" in contract_id:
        name, version = contract_id.split("-v", 1)
        return name, version
    return contract_id, None


def load_entry_by_contract_id(contract_id, contracts=None):
    name, version = parse_contract_id(contract_id)
    contracts = contracts or load_contracts()

    if name not in contracts:
        sys.exit(f"❌ {name} not found in deployments/contracts.json")

    entry = contracts[name]
    if "versions" in entry:
        if version is None:
            sys.exit(f"❌ {name} is versioned, use {name}-v<version>")
        entry = next((v for v in entry["versions"] if v.get("version") == version), None)
        if entry is None:
            sys.exit(f"❌ Version {version} not found for {name} in contracts.json")

    return name, entry


def find_entry_by_address(contracts, address):
    target = address.lower()
    for name, entry in iter_entries(contracts):
        entry_address = entry.get("address")
        if entry_address and entry_address.lower() == target:
            return name, entry
    return None, None


def require_verification_metadata(name, entry, identifier):
    missing = [field for field in VERIFICATION_FIELDS if entry.get(field) is None]
    if missing:
        sys.exit(
            f"No verification metadata for {identifier}. "
            f"Missing fields in contracts.json: {', '.join(missing)}"
        )

    return {field: entry[field] for field in VERIFICATION_FIELDS}


def contract_name_from_id(contract_id):
    return contract_id.split("-v", 1)[0]
