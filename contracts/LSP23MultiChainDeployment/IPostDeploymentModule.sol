// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IPostDeploymentModule {
    function executePostDeployment(
        address ownerControlledContract,
        address ownerContract,
        bytes calldata calldataToPostDeploymentModule
    ) external;
}
