// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {Script} from "../../../lib/forge-std/src/Script.sol";
import {console2} from "../../../lib/forge-std/src/console2.sol";
import {LSP7CustomizableTokenInit} from "../contracts/presets/LSP7CustomizableTokenInit.sol";

contract DeployLSP7CustomizableTokenInitScript is Script {
    function run() public returns (LSP7CustomizableTokenInit deployedContract) {
        vm.startBroadcast();

        deployedContract = new LSP7CustomizableTokenInit();

        vm.stopBroadcast();

        console2.log(
            "LSP7CustomizableTokenInit deployed at:",
            address(deployedContract)
        );
    }
}
