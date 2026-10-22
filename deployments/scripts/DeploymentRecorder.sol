// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

import {Script} from "forge-std/Script.sol";

/// @dev Foundry execution contexts, as defined by the forge `isContext`
/// cheatcode (and the up-to-date forge-std `Vm.ForgeContext`).
enum ForgeContext {
    TestGroup,
    Test,
    Coverage,
    Snapshot,
    ScriptGroup,
    ScriptDryRun,
    ScriptBroadcast,
    ScriptResume,
    Unknown
}

/// @dev Cheatcodes implemented by the forge binary but missing from the
/// (older) vendored forge-std Vm interface in `lib/forge-std`. Everything
/// available in the vendored `Vm.sol` (`writeFile`, `toString`, `readFile`...)
/// is called through `vm` directly instead.
interface VmMissingCheats {
    // Typed parseJson variants
    function parseJsonBytes32(
        string calldata json,
        string calldata key
    ) external pure returns (bytes32);

    function parseJsonBytes(
        string calldata json,
        string calldata key
    ) external pure returns (bytes memory);

    function parseJsonAddress(
        string calldata json,
        string calldata key
    ) external pure returns (address);

    function parseJsonString(
        string calldata json,
        string calldata key
    ) external pure returns (string memory);

    function parseJsonUint(
        string calldata json,
        string calldata key
    ) external pure returns (uint256);

    function keyExistsJson(
        string calldata json,
        string calldata key
    ) external view returns (bool);

    // Filesystem & execution context
    function createDir(string calldata path, bool recursive) external;

    function isContext(ForgeContext context) external view returns (bool);
}

/// @title Writes per-chain, per-contract deployment status records to JSON files
/// under `deployments/chains/<mainnet|testnet>/<chainSlug>/`.
abstract contract DeploymentRecorder is Script {
    VmMissingCheats internal constant vmCheats = VmMissingCheats(VM_ADDRESS);

    struct DeploymentRecord {
        string network; // "mainnet" or "testnet"
        string chainSlug;
        string contractName;
        string version; // empty for flat singletons (serialized as null)
        address contractAddress;
        address deployer;
        string status; // "deployed" or "already-deployed"
        bool runtimeBytecodeMatch;
    }

    string private _cachedNetwork;
    string private _cachedSlug;

    /// @dev Writes (or overwrites) the JSON status record for a contract
    /// deployment. No-op outside of a broadcast run (`--broadcast`), so dry
    /// runs never pollute the registry.
    function _recordDeployment(
        string memory json,
        string memory artifactKey,
        address deployedContract,
        address deployer,
        string memory status,
        bool runtimeBytecodeMatch
    ) internal {
        if (!vmCheats.isContext(ForgeContext.ScriptBroadcast)) return;

        DeploymentRecord memory record;
        (record.network, record.chainSlug) = _resolveChain();
        (record.contractName, record.version) = _parseArtifactKey(
            json,
            artifactKey
        );
        record.contractAddress = deployedContract;
        record.deployer = deployer;
        record.status = status;
        record.runtimeBytecodeMatch = runtimeBytecodeMatch;

        _writeRecord(record);
    }

    function _writeRecord(DeploymentRecord memory record) private {
        string memory dirPath = string.concat(
            "deployments/chains/",
            record.network,
            "/",
            record.chainSlug
        );

        vmCheats.createDir(dirPath, true);
        vm.writeFile(
            string.concat(
                dirPath,
                "/",
                _deploymentRecordFilename(record.contractName, record.version)
            ),
            _toJson(record)
        );
    }

    function _toJson(
        DeploymentRecord memory record
    ) private view returns (string memory) {
        string memory versionField = bytes(record.version).length == 0
            ? "null"
            : string.concat('"', record.version, '"');

        return
            string.concat(
                string.concat(
                    "{\n",
                    '  "chainId": ',
                    vm.toString(block.chainid),
                    ",\n",
                    '  "chainSlug": "',
                    record.chainSlug,
                    '",\n',
                    '  "network": "',
                    record.network,
                    '",\n',
                    '  "contract": "',
                    record.contractName,
                    '",\n',
                    '  "version": ',
                    versionField,
                    ",\n"
                ),
                string.concat(
                    '  "address": "',
                    vm.toString(record.contractAddress),
                    '",\n',
                    '  "deployer": "',
                    vm.toString(record.deployer),
                    '",\n',
                    '  "status": "',
                    record.status,
                    '",\n',
                    '  "runtimeBytecodeMatch": ',
                    vm.toString(record.runtimeBytecodeMatch),
                    ",\n",
                    '  "timestamp": ',
                    vm.toString(block.timestamp),
                    ",\n"
                ),
                '  "rpcUrlUsed": null,\n',
                '  "txHash": null,\n',
                '  "blockNumber": null\n',
                "}"
            );
    }

    /// @dev Resolves the current chain (`block.chainid`) against
    /// `chains-mainnet.json`, then `chains-testnet.json`. Reverts if the chain
    /// is listed in neither. The result is cached for the run.
    function _resolveChain()
        internal
        returns (string memory network, string memory slug)
    {
        if (bytes(_cachedNetwork).length > 0) {
            return (_cachedNetwork, _cachedSlug);
        }

        bool found;
        (found, slug) = _lookupChainInFile("deployments/chains-mainnet.json");
        if (found) {
            (_cachedNetwork, _cachedSlug) = ("mainnet", slug);
            return ("mainnet", slug);
        }

        (found, slug) = _lookupChainInFile("deployments/chains-testnet.json");
        if (found) {
            (_cachedNetwork, _cachedSlug) = ("testnet", slug);
            return ("testnet", slug);
        }

        revert(
            "Chain not found in deployments/chains-mainnet.json or chains-testnet.json. Add the chain with a slug field first."
        );
    }

    function _lookupChainInFile(
        string memory path
    ) private view returns (bool found, string memory slug) {
        string memory json = vm.readFile(path);

        for (uint256 i = 0; ; i++) {
            string memory entryKey = string.concat(
                "$[",
                vm.toString(i),
                "]"
            );

            if (!vmCheats.keyExistsJson(json, entryKey)) break;

            uint256 entryChainId = vmCheats.parseJsonUint(
                json,
                string.concat(entryKey, ".chainId")
            );

            if (entryChainId == block.chainid) {
                return (
                    true,
                    vmCheats.parseJsonString(
                        json,
                        string.concat(entryKey, ".slug")
                    )
                );
            }
        }
    }

    /// @dev Derives contract name and optional version from an artifact JSON
    /// key. The key format is produced by our own scripts, so it is always
    /// either `.<Name>` (flat singleton) or `.<Name>.versions[<i>]`.
    function _parseArtifactKey(
        string memory json,
        string memory key
    )
        internal
        pure
        returns (string memory contractName, string memory version)
    {
        bytes memory keyBytes = bytes(key);

        require(
            keyBytes.length > 1 && keyBytes[0] == ".",
            "Invalid artifact key"
        );

        // The second "." (if any) marks the start of ".versions[<i>]".
        uint256 nameEnd = keyBytes.length;
        for (uint256 i = 1; i < keyBytes.length; i++) {
            if (keyBytes[i] == ".") {
                nameEnd = i;
                break;
            }
        }

        contractName = _substring(key, 1, nameEnd);
        version = nameEnd == keyBytes.length
            ? ""
            : vmCheats.parseJsonString(json, string.concat(key, ".version"));
    }

    function _deploymentRecordFilename(
        string memory contractName,
        string memory version
    ) private pure returns (string memory) {
        if (bytes(version).length == 0) {
            return string.concat("deploy-", contractName, ".json");
        }

        return string.concat("deploy-", contractName, "-v", version, ".json");
    }

    function _substring(
        string memory value,
        uint256 start,
        uint256 end
    ) internal pure returns (string memory) {
        bytes memory valueBytes = bytes(value);
        bytes memory result = new bytes(end - start);

        for (uint256 i = start; i < end; i++) {
            result[i - start] = valueBytes[i];
        }

        return string(result);
    }
}
