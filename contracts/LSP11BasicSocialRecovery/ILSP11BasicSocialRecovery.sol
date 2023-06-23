// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @title Interface of the LSP11 - Basic Social Recovery standard, a contract to recover access control into an account.
 * @dev Sets permission for a controller address after a recovery process to interact with an ERC725
 * contract via the LSP6KeyManager
 */
interface ILSP11BasicSocialRecovery {
    /**
     * @notice Emitted when setting a new guardian for the target
     * @param newGuardian The address of the added guardian
     */
    event GuardianAdded(address indexed newGuardian);

    /**
     * @notice Emitted when removing an existing guardian for the target
     * @param removedGuardian The address of the guardian removed
     */
    event GuardianRemoved(address indexed removedGuardian);

    /**
     * @notice Emitted when changing the guardian threshold
     * @param guardianThreshold The minimum number of selection by guardians needed by a controller to start
     * a recovery process
     */
    event GuardiansThresholdChanged(uint256 indexed guardianThreshold);

    /**
     * @notice Emitted when changing the secret hash
     * @param secretHash The secret hash used to finish the recovery process
     */
    event SecretHashChanged(bytes32 indexed secretHash);

    /**
     * @notice Emitted when a guardian select a new potentiel controller address for the target
     * @param recoveryCounter The current recovery process counter
     * @param guardian The address of the guardian
     * @param addressSelected The address selected by the guardian
     */
    event SelectedNewController(
        uint256 indexed recoveryCounter,
        address indexed guardian,
        address indexed addressSelected
    );

    /**
     * @notice Emitted when the recovery process is finished by the controller who
     * reached the guardian threshold and submitted the string that produce the secretHash
     * @param recoveryCounter The current recovery process
     * @param newController The address of the new controller controlling the target by the KeyManager
     * @param guardians The array of addresses containing the guardians of the target
     */
    event RecoveryProcessSuccessful(
        uint256 indexed recoveryCounter,
        address indexed newController,
        bytes32 indexed newSecretHash,
        address[] guardians
    );

    /**
     * @dev The address of an ERC725 contract where we want to recover
     * and set permissions for a controller address
     */
    function target() external view returns (address);

    /**
     * @dev Returns the current recovery counter
     * When a recovery process is successfully finished the recovery counter is incremented
     */
    function getRecoveryCounter() external view returns (uint256);

    /**
     * @dev Returns the addresses of all guardians
     * The guardians will select an address to be added as a controller
     * key for the linked `target` if he reaches the guardian threshold and
     * provide the correct string that produce the secretHash
     */
    function getGuardians() external view returns (address[] memory);

    /**
     * @dev Returns TRUE if the address provided is a guardian, FALSE otherwise
     * @param _address The address to query
     */
    function isGuardian(address _address) external view returns (bool);

    /**
     * @dev Returns the recovery secret hash
     */
    function getRecoverySecretHash() external view returns (bytes32);

    /**
     * @dev Returns the guardian threshold
     * The guardian threshold represents the minimum number of selection by guardians required
     * for an address to start a recovery process
     */
    function getGuardiansThreshold() external view returns (uint256);

    /**
     * @dev Returns the address of a controller that a `guardian` selected for in order to recover the target
     * @param guardian the address of a guardian to query his selection
     * @return the address that `guardian` selected
     */
    function getGuardianChoice(
        address guardian
    ) external view returns (address);

    /**
     * @dev Adds a guardian of the target
     * @dev Can be called only by the owner
     * @param newGuardian The address to add as a guardian
     */
    function addGuardian(address newGuardian) external;

    /**
     * @dev Removes a guardian of the target
     * @dev Can be called only by the owner
     * @param currentGuardian The address of the existing guardian to remove
     *
     * Requirements:
     *
     * - The guardians count should be higher or equal to the guardain threshold
     */
    function removeGuardian(address currentGuardian) external;

    /**
     * @dev Sets the hash of the secret string to be provided in `recoverOwnership(..)` function
     * @dev Can be called only by the owner
     * @param newRecoverSecretHash The hash of the secret string
     *
     * Requirements:
     *
     * - `secretHash` cannot be bytes32(0)
     */
    function setRecoverySecretHash(bytes32 newRecoverSecretHash) external;

    /**
     * @dev Sets the minimum number of selection by the guardians required so that an
     * address can recover ownership
     *
     * @dev Can be called only by the owner
     * @param guardiansThreshold The threshold to set
     *
     * Requirements:
     * - `guardiansThreshold` cannot be more than the guardians count.
     */
    function setGuardiansThreshold(uint256 guardiansThreshold) external;

    /**
     * @dev select an address to be a potentiel controller address if he reaches
     * the guardian threshold and provide the correct secret string
     *
     * Requirements:
     * - only guardians can select an address
     *
     * @param addressSelected The address selected by the guardian
     */
    function selectNewController(address addressSelected) external;

    /**
     * @dev Recovers the ownership permissions of an address in the linked target
     * and increment the recover counter
     *
     * Requirements
     * - the address of the recoverer must have a selection equal or higher than the threshold
     * defined in `getGuardiansThreshold(...)`
     *
     * - must have provided the right `plainSecret` that produces the secret Hash
     *
     * @param recoverer The address of the recoverer
     * @param plainSecret The secret word that produce the secret Hash
     * @param newHash The new secret Hash to be used in the next recovery process
     */
    function recoverOwnership(
        address recoverer,
        string memory plainSecret,
        bytes32 newHash
    ) external;
}
