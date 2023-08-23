// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IPostDeploymentModule {
    /**
     * @dev Executes post-deployment logic for the primary and secondary contracts.
     * @notice This function can be used to perform any additional setup or configuration after the primary and secondary contracts have been deployed.
     *
     * @param primaryContract Address of the deployed primary contract.
     * @param secondaryContract Address of the deployed secondary contract.
     * @param calldataToPostDeploymentModule Calldata to be passed for the post-deployment execution.
     */
    function executePostDeployment(
        address primaryContract,
        address secondaryContract,
        bytes calldata calldataToPostDeploymentModule
    ) external;
}
