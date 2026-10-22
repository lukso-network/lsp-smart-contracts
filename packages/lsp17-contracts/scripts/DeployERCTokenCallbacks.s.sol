// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

import {console2} from "forge-std/console2.sol";
import {ERCTokenCallbacks} from "../contracts/ERCTokenCallbacks.sol";
import {NickFactoryDeployScript} from "./NickFactoryDeployScript.sol";

contract DeployERCTokenCallbacksScript is NickFactoryDeployScript {
    function run() public returns (ERCTokenCallbacks deployedContract) {
        vm.startBroadcast();

        deployedContract = ERCTokenCallbacks(
            payable(_deployViaNickFactory(type(ERCTokenCallbacks).creationCode))
        );

        vm.stopBroadcast();

        console2.log(
            "ERCTokenCallbacks deployed at:",
            address(deployedContract)
        );
    }
}
