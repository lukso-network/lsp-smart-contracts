// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {Script} from "../../../lib/forge-std/src/Script.sol";
import {console2} from "../../../lib/forge-std/src/console2.sol";
import {LSP8CustomizableTokenInit} from "../contracts/presets/LSP8CustomizableTokenInit.sol";

contract DeployLSP8CustomizableTokenInitScript is Script {
    function run() public returns (LSP8CustomizableTokenInit deployedContract) {
        vm.startBroadcast();

        deployedContract = new LSP8CustomizableTokenInit();

        vm.stopBroadcast();

        console2.log(
            "LSP8CustomizableTokenInit deployed at:",
            address(deployedContract)
        );
    }
}
