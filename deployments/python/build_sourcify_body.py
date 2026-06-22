#!/usr/bin/env python3
"""Build the JSON body for a Sourcify verification request."""

import argparse
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Build a Sourcify verification request body.")
    parser.add_argument("standard_json_input_file", help="Path to the Standard JSON input file")
    parser.add_argument("compiler_version", help="Full solc version string, e.g. v0.8.17+commit.8df45f5f")
    parser.add_argument("contract_identifier", help="Contract identifier, e.g. path/to/Contract.sol:Contract")
    args = parser.parse_args()

    std_input = json.loads(Path(args.standard_json_input_file).read_text())
    body = {
        "stdJsonInput": std_input,
        "compilerVersion": args.compiler_version,
        "contractIdentifier": args.contract_identifier,
    }
    print(json.dumps(body))


if __name__ == "__main__":
    main()
