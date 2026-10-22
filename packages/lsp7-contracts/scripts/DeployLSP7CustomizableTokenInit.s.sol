// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {console2} from "forge-std/console2.sol";
import {
    LSP7CustomizableTokenInit
} from "../contracts/presets/LSP7CustomizableTokenInit.sol";
import {NickFactoryDeployScript} from "./NickFactoryDeployScript.sol";

contract DeployLSP7CustomizableTokenInitScript is NickFactoryDeployScript {
    function run() public returns (LSP7CustomizableTokenInit deployedContract) {
        vm.startBroadcast();

        deployedContract = LSP7CustomizableTokenInit(
            payable(
                _deployViaNickFactory(
                    type(LSP7CustomizableTokenInit).creationCode
                )
            )
        );

        vm.stopBroadcast();

        console2.log(
            "LSP7CustomizableTokenInit deployed at:",
            address(deployedContract)
        );
    }
}
