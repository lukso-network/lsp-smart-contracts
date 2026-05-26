// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {Script} from "../../../lib/forge-std/src/Script.sol";
import {console2} from "../../../lib/forge-std/src/console2.sol";
import {LSP7MintableInit} from "../contracts/presets/LSP7MintableInit.sol";

contract DeployLSP7MintableInitScript is Script {
    function run() public returns (LSP7MintableInit deployedContract) {
        vm.startBroadcast();

        deployedContract = new LSP7MintableInit();

        vm.stopBroadcast();

        console2.log(
            "LSP7MintableInit deployed at:",
            address(deployedContract)
        );
    }
}
