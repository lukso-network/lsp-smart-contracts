// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";

/**
 * @dev Contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage
 */
interface ILSP6KeyManager is
    IERC1271
    /* is ERC165 */
{
    event Executed(uint256 indexed _value, bytes _data);

    /**
     * @notice returns the address of the account linked to this KeyManager
     * @dev this can be a contract that implements
     *  - ERC725X only
     *  - ERC725Y only
     *  - any ERC725 based contract (so implementing both ERC725X and ERC725Y)
     *
     * @return the address of the linked account
     */
    function account() external view returns (address);

    /**
     * @notice get latest nonce for `_from` for channel ID: `_channel`
     * @dev use channel ID = 0 for sequential nonces, any other number for out-of-order execution (= execution in parallel)
     * @param _address caller address
     * @param _channel channel id
     */
    function getNonce(address _address, uint256 _channel) external view returns (uint256);

    /**
     * @notice execute the following payload on the ERC725Account: `_data`
     * @dev the ERC725Account will return some data on successful call, or revert on failure
     * @param _data the payload to execute. Obtained in web3 via encodeABI()
     * @return result_ the data being returned by the ERC725 Account
     */
    function execute(bytes calldata _data) external payable returns (bytes memory);

    /**
     * @dev allows anybody to execute given they have a signed message from an executor
     * @param _signedFor this KeyManager
     * @param _nonce the address' nonce (in a specific `_channel`), obtained via `getNonce(...)`. Used to prevent replay attack
     * @param _data obtained via encodeABI() in web3
     * @param _signature bytes32 ethereum signature
     * @return result_ the data being returned by the ERC725 Account
     */
    function executeRelayCall(
        address _signedFor,
        uint256 _nonce,
        bytes calldata _data,
        bytes memory _signature
    ) external payable returns (bytes memory);
}
