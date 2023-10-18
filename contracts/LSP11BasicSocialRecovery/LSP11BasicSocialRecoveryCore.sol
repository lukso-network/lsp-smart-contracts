// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {ILSP11BasicSocialRecovery} from "./ILSP11BasicSocialRecovery.sol";

// libraries
import {LSP6Utils} from "../LSP6KeyManager/LSP6Utils.sol";

// modules
import {ERC725} from "@erc725/smart-contracts/contracts/ERC725.sol";
import {
    OwnableUnset
} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// constants
import {ALL_REGULAR_PERMISSIONS} from "../LSP6KeyManager/LSP6Constants.sol";
import {_INTERFACEID_LSP11} from "./LSP11Constants.sol";
import {
    CallerIsNotGuardian,
    GuardianAlreadyExist,
    GuardianDoNotExist,
    GuardiansNumberCannotGoBelowThreshold,
    ThresholdCannotBeHigherThanGuardiansNumber,
    SecretHashCannotBeZero,
    AddressZeroNotAllowed,
    ThresholdNotReachedForRecoverer,
    WrongPlainSecret
} from "./LSP11Errors.sol";

/**
 * @title Core Implementation of LSP11-BasicSocialRecovery standard
 * @dev Sets permission for a controller address after a recovery process to interact with an ERC725
 * contract via the LSP6KeyManager
 */
abstract contract LSP11BasicSocialRecoveryCore is
    OwnableUnset,
    ERC165,
    ILSP11BasicSocialRecovery
{
    using EnumerableSet for EnumerableSet.AddressSet;

    address internal _target;

    // The guardians threshold
    uint256 internal _guardiansThreshold;

    // The number of successfull recovery processes
    uint256 internal _recoveryCounter;

    // The secret hash to be set by the owner
    bytes32 internal _recoverySecretHash;

    // Stores the address selected by a guardian
    // in the current `_recoveryCounter`
    mapping(uint256 => mapping(address => address)) internal _guardiansChoice;

    // List of guardians addresses
    EnumerableSet.AddressSet internal _guardians;

    /**
     * @dev Throws if called by any account other than the guardians
     */
    modifier onlyGuardians() virtual {
        if (!_guardians.contains(msg.sender))
            revert CallerIsNotGuardian(msg.sender);
        _;
    }

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(
        bytes4 _interfaceId
    ) public view virtual override returns (bool) {
        return
            _interfaceId == _INTERFACEID_LSP11 ||
            super.supportsInterface(_interfaceId);
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function target() public view virtual override returns (address) {
        return _target;
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function getRecoveryCounter()
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _recoveryCounter;
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function getGuardians()
        public
        view
        virtual
        override
        returns (address[] memory)
    {
        return _guardians.values();
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function isGuardian(
        address _address
    ) public view virtual override returns (bool) {
        return _guardians.contains(_address);
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function getGuardiansThreshold()
        public
        view
        virtual
        override
        returns (uint256)
    {
        return _guardiansThreshold;
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function getRecoverySecretHash()
        public
        view
        virtual
        override
        returns (bytes32)
    {
        return _recoverySecretHash;
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function getGuardianChoice(
        address guardian
    ) public view virtual override returns (address) {
        return _guardiansChoice[_recoveryCounter][guardian];
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function addGuardian(
        address newGuardian
    ) public virtual override onlyOwner {
        if (_guardians.contains(newGuardian))
            revert GuardianAlreadyExist(newGuardian);

        _guardians.add(newGuardian);
        emit GuardianAdded(newGuardian);
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function removeGuardian(
        address existingGuardian
    ) public virtual override onlyOwner {
        if (!_guardians.contains(existingGuardian))
            revert GuardianDoNotExist(existingGuardian);
        if (_guardians.length() == _guardiansThreshold)
            revert GuardiansNumberCannotGoBelowThreshold(_guardiansThreshold);

        _guardians.remove(existingGuardian);
        emit GuardianRemoved(existingGuardian);
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function setGuardiansThreshold(
        uint256 newThreshold
    ) public virtual override onlyOwner {
        if (newThreshold > _guardians.length())
            revert ThresholdCannotBeHigherThanGuardiansNumber(
                newThreshold,
                _guardians.length()
            );

        _guardiansThreshold = newThreshold;
        emit GuardiansThresholdChanged(newThreshold);
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     * @dev Throws if hash provided is bytes32(0)
     */
    function setRecoverySecretHash(
        bytes32 newRecoverSecretHash
    ) public virtual override onlyOwner {
        if (newRecoverSecretHash == bytes32(0)) revert SecretHashCannotBeZero();

        _recoverySecretHash = newRecoverSecretHash;
        emit SecretHashChanged(newRecoverSecretHash);
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function selectNewController(
        address addressSelected
    ) public virtual override onlyGuardians {
        uint256 currentRecoveryCounter = _recoveryCounter;

        _guardiansChoice[currentRecoveryCounter][msg.sender] = addressSelected;
        emit SelectedNewController(
            currentRecoveryCounter,
            msg.sender,
            addressSelected
        );
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function recoverOwnership(
        address recoverer,
        string memory plainSecret,
        bytes32 newSecretHash
    ) public virtual override {
        // caching storage variables
        uint256 currentRecoveryCounter = _recoveryCounter;
        address[] memory guardians = _guardians.values();
        address target_ = _target;

        _validateRequirements(
            recoverer,
            currentRecoveryCounter,
            plainSecret,
            newSecretHash,
            guardians
        );

        _recoveryCounter++;
        _recoverySecretHash = newSecretHash;
        emit SecretHashChanged(newSecretHash);

        address keyManager = ERC725(target_).owner();

        // Setting permissions for `recoverer`
        (bytes32[] memory keys, bytes[] memory values) = LSP6Utils
            .generateNewPermissionsKeys(
                ERC725(target_),
                recoverer,
                ALL_REGULAR_PERMISSIONS
            );

        LSP6Utils.setDataViaKeyManager(keyManager, keys, values);

        emit RecoveryProcessSuccessful(
            currentRecoveryCounter,
            recoverer,
            newSecretHash,
            guardians
        );

        _cleanStorage(currentRecoveryCounter, guardians.length, guardians);
    }

    /**
     * @dev The number of guardians should be reasonable, as the validation method
     * is using a loop to check the selection of each guardian
     *
     * Throws if:
     * - The address trying to recover didn't reach the guardiansThreshold
     * - The new hash being set is bytes32(0)
     * - The secret word provided is incorrect
     */
    function _validateRequirements(
        address recoverer,
        uint256 currentRecoveryCounter,
        string memory plainSecret,
        bytes32 newHash,
        address[] memory guardians
    ) internal view virtual {
        if (recoverer == address(0)) revert AddressZeroNotAllowed();
        uint256 callerSelections;

        unchecked {
            for (uint256 i; i < guardians.length; i++) {
                if (
                    _guardiansChoice[currentRecoveryCounter][guardians[i]] ==
                    recoverer
                ) callerSelections++;
            }
        }

        uint256 guardiansThreshold = _guardiansThreshold;

        if (callerSelections < guardiansThreshold)
            revert ThresholdNotReachedForRecoverer(
                recoverer,
                callerSelections,
                guardiansThreshold
            );
        if (newHash == bytes32(0)) revert SecretHashCannotBeZero();
        if (keccak256(abi.encodePacked(plainSecret)) != _recoverySecretHash)
            revert WrongPlainSecret();
    }

    /**
     * @dev Remove the guardians choice after a successfull recovery process
     * To avoid keeping unnecessary state
     */
    function _cleanStorage(
        uint256 recoveryCounter,
        uint256 guardiansLength,
        address[] memory guardians
    ) internal virtual {
        unchecked {
            for (uint256 i; i < guardiansLength; i++) {
                delete _guardiansChoice[recoveryCounter][guardians[i]];
            }
        }
    }
}
