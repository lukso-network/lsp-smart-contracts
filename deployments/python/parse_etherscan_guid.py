#!/usr/bin/env python3
"""Validate an Etherscan API response and print the verification GUID."""

import json
import sys


def main():
    data = json.load(sys.stdin)
    status = str(data.get("status", ""))
    message = data.get("message", "")
    result = data.get("result", "")

    if status != "1":
        sys.exit(
            f"Etherscan API error (status={status!r}, message={message!r}): {result}"
        )

    if not isinstance(result, str) or not result.strip():
        sys.exit(f"Etherscan response missing GUID: {data}")

    print(result.strip())


if __name__ == "__main__":
    main()
