// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {Script} from "../../../lib/forge-std/src/Script.sol";
import {console2} from "../../../lib/forge-std/src/console2.sol";
import {LSP8MintableInit} from "../contracts/presets/LSP8MintableInit.sol";

contract DeployLSP8MintableInitScript is Script {
    function run() public returns (LSP8MintableInit deployedContract) {
        vm.startBroadcast();

        deployedContract = new LSP8MintableInit();

        vm.stopBroadcast();

        console2.log(
            "LSP8MintableInit deployed at:",
            address(deployedContract)
        );
    }
}
