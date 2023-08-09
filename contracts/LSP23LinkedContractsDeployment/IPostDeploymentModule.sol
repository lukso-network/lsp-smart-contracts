// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IPostDeploymentModule {
    function executePostDeployment(
        address primaryContract,
        address secondaryContract,
        bytes calldata calldataToPostDeploymentModule
    ) external;
}
