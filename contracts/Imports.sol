// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// solhint-disable no-unused-import
import {
    UniversalProfileInit
} from "@lukso/universalprofile-contracts/contracts/UniversalProfileInit.sol";
import {
    LSP1UniversalReceiverDelegateUP
} from "@lukso/lsp1delegate-contracts/contracts/LSP1UniversalReceiverDelegateUP.sol";
import {
    LSP1UniversalReceiverDelegateVault
} from "@lukso/lsp1delegate-contracts/contracts/LSP1UniversalReceiverDelegateVault.sol";

import {
    LSP7Mintable
} from "@lukso/lsp7-contracts/contracts/presets/LSP7Mintable.sol";
import {
    LSP7MintableInit
} from "@lukso/lsp7-contracts/contracts/presets/LSP7MintableInit.sol";
import {
    LSP8Mintable
} from "@lukso/lsp8-contracts/contracts/presets/LSP8Mintable.sol";
import {
    LSP8MintableInit
} from "@lukso/lsp8-contracts/contracts/presets/LSP8MintableInit.sol";
import {LSP9Vault} from "@lukso/lsp9-contracts/contracts/LSP9Vault.sol";
import {LSP9VaultInit} from "@lukso/lsp9-contracts/contracts/LSP9VaultInit.sol";
import {
    LSP23LinkedContractsFactory
} from "@lukso/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol";
import {
    UniversalProfileInitPostDeploymentModule
} from "@lukso/lsp23-contracts/contracts/modules/UniversalProfileInitPostDeploymentModule.sol";
import {
    UniversalProfilePostDeploymentModule
} from "@lukso/lsp23-contracts/contracts/modules/UniversalProfilePostDeploymentModule.sol";
import {
    IPostDeploymentModule
} from "@lukso/lsp23-contracts/contracts/IPostDeploymentModule.sol";
