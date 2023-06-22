// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {
    LSP0ERC725AccountInitAbstract
} from "./LSP0ERC725AccountInitAbstract.sol";

/**
 * @title Deployable Proxy Implementation of LSP0-ERC725Account Standard
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
contract LSP0ERC725AccountInit is LSP0ERC725AccountInitAbstract {
    /**
     * @notice deploying a `LSP0ERC725AccountInit` base contract to be used behind proxy
     * @dev Locks the base contract on deployment, so that it cannot be initialized, owned and controlled by anyone
     * after it has been deployed. This is intended so that the sole purpose of this contract is to be used as a base
     * contract behind a proxy.
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializing the contract owner to: `initialOwner`
     * @dev Set `initialOwner` as the contract owner.
     * The `initialOwner` will then be allowed to call protected functions marked with the `onlyOwner` modifier.
     * The `initialize(address)` function also allows funding the contract on initialization.
     *
     * Emitted Events:
     * - ValueReceived: when the contract is funded on initialization.
     *
     * @param initialOwner the owner of the contract
     */
    function initialize(
        address initialOwner
    ) external payable virtual initializer {
        LSP0ERC725AccountInitAbstract._initialize(initialOwner);
    }
}
