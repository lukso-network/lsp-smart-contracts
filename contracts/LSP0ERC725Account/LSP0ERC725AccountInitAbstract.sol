// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {LSP0ERC725AccountCore} from "./LSP0ERC725AccountCore.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";

/**
 * @title Inheritable Proxy Implementation of LSP0-ERC725Account Standard
 *        https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-0-ERC725Account.md
 *
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42)
 * @dev A smart contract account including basic functionalities such as:
 *
 * - Detecting supported standards using ERC165
 *   https://eips.ethereum.org/EIPS/eip-165
 *
 * - Executing several operation on other addresses including creating contracts using ERC725X
 *   https://github.com/ERC725Alliance/ERC725/blob/develop/docs/ERC-725.md
 *
 * - Storing data in a generic way using ERC725Y
 *   https://github.com/ERC725Alliance/ERC725/blob/develop/docs/ERC-725.md
 *
 * - Validating signatures using ERC1271
 *   https://eips.ethereum.org/EIPS/eip-1271
 *
 * - Receiving notification and react on them using LSP1
 *   https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-1-UniversalReceiver.md
 *
 * - Secure ownership management using LSP14
 *   https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-14-Ownable2Step.md
 *
 * - Extending the account with new functions and interfaceIds of future standards using LSP17
 *   https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-17-ContractExtension.md
 *
 * - Verifying calls on the owner to allow unified and standard interaction with the account using LSP20
 *   https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-20-CallVerification.md
 */
abstract contract LSP0ERC725AccountInitAbstract is Initializable, LSP0ERC725AccountCore {
    /**
     * @notice Initializing the contract owner to: `newOwner`
     * @dev Sets the owner of the contract. ERC725X & ERC725Y parent contracts
     * are not initialised as they don't have non-zero initial state.
     * If you decide to add non-zero initial state to any of those
     * contracts, you MUST initialize them here
     * @param newOwner the owner of the contract
     */
    function _initialize(address newOwner) internal virtual onlyInitializing {
        if (msg.value != 0) emit ValueReceived(msg.sender, msg.value);
        OwnableUnset._setOwner(newOwner);
    }
}
