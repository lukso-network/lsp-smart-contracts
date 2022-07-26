// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {ILSP11BasicSocialRecovery} from "./ILSP11BasicSocialRecovery.sol";

// libraries
import {ERC165Checker} from "../Custom/ERC165Checker.sol";
import {LSP6Utils} from "../LSP6KeyManager/LSP6Utils.sol";

// modules
import {ERC725} from "@erc725/smart-contracts/contracts/ERC725.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {LSP6KeyManager} from "../LSP6KeyManager/LSP6KeyManager.sol";

// constants
import {_INTERFACEID_LSP6, _ALL_DEFAULT_PERMISSIONS} from "../LSP6KeyManager/LSP6Constants.sol";
import {_INTERFACEID_LSP11} from "./LSP11Constants.sol";

/**
 * @title Core Implementation of LSP11-BasicSocialRecovery standard
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @notice Recovers the permission of a key to control an ERC725 contract through LSP6KeyManager
 */
abstract contract LSP11BasicSocialRecoveryCore is OwnableUnset, ERC165, ILSP11BasicSocialRecovery {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // ---- state variables

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    address public override account;

    // The guardians threshold
    uint256 internal _guardiansThreshold;

    // The number of successfull recovery processes
    uint256 internal _recoveryCounter;

    // The secret hash set by the owner
    bytes32 internal _secretHash;

    // Stores the address voted for by a guardian in a specific
    // recoverProcessId, in the current `_recoveryCounter`
    mapping(uint256 => mapping(bytes32 => mapping(address => address))) internal _guardiansVotes;

    // Maps all recoverProcessesIds to the _recoveryCounter
    mapping(uint256 => EnumerableSet.Bytes32Set) internal _recoverProcessesIds;

    // List of guardians addresses
    EnumerableSet.AddressSet internal _guardians;

    // All Permission to set for the new Owner

    // ---- modifiers

    /**
     * @dev Throws if hash provided is bytes32(0)
     */
    modifier NotZeroBytes32(bytes32 secretHash) virtual {
        require(secretHash != bytes32(0), "Secret Hash cannot be bytes32(0)");
        _;
    }

    /**
     * @dev Throws if called by any account other than the guardians
     */
    modifier onlyGuardians() virtual {
        require(_guardians.contains(msg.sender), "Caller is not a guardian");
        _;
    }

    // ---- public view functions

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function getGuardians() public view override returns (address[] memory) {
        return _guardians.values();
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function isGuardian(address _address) public view override returns (bool) {
        return _guardians.contains(_address);
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function getRecoverProcessesIds() public view override returns (bytes32[] memory) {
        return _recoverProcessesIds[_recoveryCounter].values();
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function getGuardiansThreshold() public view override returns (uint256) {
        return _guardiansThreshold;
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function getGuardianVote(bytes32 recoverProcessId, address guardian)
        public
        view
        override
        returns (address)
    {
        return _guardiansVotes[_recoveryCounter][recoverProcessId][guardian];
    }

    // ---- public functions

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function addGuardian(address newGuardian) public virtual override onlyOwner {
        require(!_guardians.contains(newGuardian), "Provided address is already a guardian");
        _guardians.add(newGuardian);
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function removeGuardian(address currentGuardian) public virtual override onlyOwner {
        require(_guardians.contains(currentGuardian), "Provided address is not a guardian");
        require(
            _guardians.length() > _guardiansThreshold,
            "Guardians number can not be lower than the threshold"
        );
        _guardians.remove(currentGuardian);
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function setThreshold(uint256 newThreshold) public virtual override onlyOwner {
        require(
            newThreshold <= _guardians.length() && newThreshold > 0,
            "Threshold should be between 1 and the guardiansCount"
        );
        _guardiansThreshold = newThreshold;
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function setSecret(bytes32 newHash) public virtual override onlyOwner NotZeroBytes32(newHash) {
        _secretHash = newHash;
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function voteToRecover(bytes32 recoverProcessId, address newOwner)
        public
        virtual
        override
        onlyGuardians
    {
        uint256 recoverCounter = _recoveryCounter;
        _recoverProcessesIds[recoverCounter].add(recoverProcessId);
        _guardiansVotes[recoverCounter][recoverProcessId][msg.sender] = newOwner;
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function recoverOwnership(
        bytes32 recoverProcessId,
        string memory plainSecret,
        bytes32 newHash
    ) public virtual override NotZeroBytes32(newHash) {
        _checkRequirements(recoverProcessId, plainSecret);

        _secretHash = newHash;
        // Starting new recovery counter
        unchecked {
            _recoveryCounter++;
        }

        address keyManager = ERC725(account).owner();
        require(
            ERC165Checker.supportsERC165Interface(keyManager, _INTERFACEID_LSP6),
            "Owner of account doesn't support LSP6 InterfaceId"
        );

        // Setting permissions for `msg.sender`
        (bytes32[] memory keys, bytes[] memory values) = LSP6Utils
            .createPermissionsKeysForController(
                ERC725(account),
                msg.sender,
                abi.encodePacked(_ALL_DEFAULT_PERMISSIONS)
            );

        LSP6Utils.setDataViaKeyManager(keyManager, keys, values);
    }

    // ---- overrides functions

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(bytes4 _interfaceId) public view virtual override returns (bool) {
        return _interfaceId == _INTERFACEID_LSP11 || super.supportsInterface(_interfaceId);
    }

    // ---- internal functions

    /**
     * @dev Throws if:
     * - The address trying to recover didn't reach the guardiansThreshold
     * - The secret word provided is incorrect
     */
    function _checkRequirements(bytes32 recoverProcessId, string memory plainSecret) internal view {
        uint256 recoverCounter = _recoveryCounter;
        uint256 senderVotes;
        uint256 guardiansLength = _guardians.length();

        unchecked {
            for (uint256 i = 0; i < guardiansLength; i++) {
                if (
                    _guardiansVotes[recoverCounter][recoverProcessId][_guardians.at(i)] ==
                    msg.sender
                ) {
                    senderVotes++;
                }
            }
        }
        require(senderVotes >= _guardiansThreshold, "You didnt reach the threshold");

        require(keccak256(abi.encodePacked(plainSecret)) == _secretHash, "Wrong secret");
    }
}
