// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {console2} from "../../../lib/forge-std/src/console2.sol";
import {LSP7MintableInit} from "../contracts/presets/LSP7MintableInit.sol";
import {NickFactoryDeployScript} from "./scripts/NickFactoryDeployScript.sol";

contract DeployLSP7MintableInitScript is NickFactoryDeployScript {
    function run() public returns (LSP7MintableInit deployedContract) {
        vm.startBroadcast();

        deployedContract = LSP7MintableInit(
            payable(_deployViaNickFactory(type(LSP7MintableInit).creationCode))
        );

        vm.stopBroadcast();

        console2.log(
            "LSP7MintableInit deployed at:",
            address(deployedContract)
        );
    }
}
