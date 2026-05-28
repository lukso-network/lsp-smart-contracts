// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {console2} from "forge-std/console2.sol";
import {LSP8MintableInit} from "../contracts/presets/LSP8MintableInit.sol";
import {NickFactoryDeployScript} from "./NickFactoryDeployScript.sol";

contract DeployLSP8MintableInitScript is NickFactoryDeployScript {
    function run() public returns (LSP8MintableInit deployedContract) {
        vm.startBroadcast();

        deployedContract = LSP8MintableInit(
            payable(_deployViaNickFactory(type(LSP8MintableInit).creationCode))
        );

        vm.stopBroadcast();

        console2.log(
            "LSP8MintableInit deployed at:",
            address(deployedContract)
        );
    }
}
