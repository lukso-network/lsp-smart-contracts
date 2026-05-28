// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {console2} from "forge-std/console2.sol";
import {
    LSP8CustomizableTokenInit
} from "../contracts/presets/LSP8CustomizableTokenInit.sol";
import {NickFactoryDeployScript} from "./NickFactoryDeployScript.sol";

contract DeployLSP8CustomizableTokenInitScript is NickFactoryDeployScript {
    function run() public returns (LSP8CustomizableTokenInit deployedContract) {
        vm.startBroadcast();

        deployedContract = LSP8CustomizableTokenInit(
            payable(
                _deployViaNickFactory(
                    type(LSP8CustomizableTokenInit).creationCode
                )
            )
        );

        vm.stopBroadcast();

        console2.log(
            "LSP8CustomizableTokenInit deployed at:",
            address(deployedContract)
        );
    }
}
