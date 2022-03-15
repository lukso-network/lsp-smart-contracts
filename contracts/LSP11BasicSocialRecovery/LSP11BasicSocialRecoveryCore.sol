// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/utils/OwnableUnset.sol";
import "@erc725/smart-contracts/contracts/ERC725.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../LSP6KeyManager/LSP6KeyManager.sol";

// libraries
import "../Utils/ERC725Utils.sol";

// interfaces
import "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import "./ILSP11BasicSocialRecovery.sol";

// constants
import "../LSP1UniversalReceiver/LSP1Constants.sol";
import "../LSP6KeyManager/LSP6Constants.sol";
import "./LSP11Constants.sol";

/**
 * @title Core Implementation of LSP11-BasicSocialRecovery standard
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @notice Recovers the permission of a key to control an ERC725 contract through LSP6KeyManager
 */
abstract contract LSP11BasicSocialRecoveryCore is
    ILSP11BasicSocialRecovery,
    OwnableUnset,
    ERC165
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // ---- state variables

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    ERC725 public override account;

    // The guardians threshold
    uint256 internal _guardiansThreshold;

    // The number of successfull recovery processes
    uint256 internal _recoveryCounter;

    // The secret hash set by the owner
    bytes32 internal _secretHash;

    // Stores the address voted for by a guardian in a specific
    // recoverProcessId, in the current `_recoveryCounter`
    mapping(uint256 => mapping(bytes32 => mapping(address => address)))
        internal _guardiansVotes;

    // Mapps all recoverProcessesIds to the _recoveryCounter
    mapping(uint256 => EnumerableSet.Bytes32Set) internal _recoverProcessesIds;

    // Stores the guardians
    EnumerableSet.AddressSet internal _guardians;

    // All Permission to set for the new Owner
    bytes internal constant _ALL_PERMISSIONS =
        hex"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

    // ---- modifiers

    /**
     * @dev Throws if hash provided is bytes32(0)
     */
    modifier NotZeroBytes32(bytes32 secretHash) virtual {
        require(secretHash != bytes32(0), "Invalid hash");
        _;
    }

    /**
     * @dev Throws if called by any account other than the guardians
     */
    modifier onlyGuardians() virtual {
        require(_guardians.contains(msg.sender), "Caller is not a guardian");
        _;
    }

    /**
     * @dev Throws if:
     * - The address trying to recover didn't reach the guardiansThreshold
     * - The secret word provided is incorrect
     */
    modifier recoverRequirements(
        bytes32 recoverProcessId,
        string memory plainSecret
    ) virtual {
        uint256 senderVotes;
        for (uint256 i = 0; i < _guardians.length(); i++) {
            if (
                _guardiansVotes[_recoveryCounter][recoverProcessId][
                    _guardians.at(i)
                ] == msg.sender
            ) {
                senderVotes++;
            }
        }
        require(
            senderVotes >= _guardiansThreshold,
            "You didnt reach the threshold"
        );

        require(
            keccak256(abi.encodePacked(plainSecret)) == _secretHash,
            "Wrong secret"
        );
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
    function getRecoverProcessesIds()
        public
        view
        override
        returns (bytes32[] memory)
    {
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
    function addGuardian(address newGuardian)
        public
        virtual
        override
        onlyOwner
    {
        require(
            !_guardians.contains(newGuardian),
            "Provided address is already a guardian"
        );
        _guardians.add(newGuardian);
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function removeGuardian(address currentGuardian)
        public
        virtual
        override
        onlyOwner
    {
        require(
            _guardians.contains(currentGuardian),
            "Provided address is not a guardian"
        );
        require(
            _guardians.length() > _guardiansThreshold,
            "Guardians number can not be lower than the threshold"
        );
        _guardians.remove(currentGuardian);
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function setThreshold(uint256 newThreshold)
        public
        virtual
        override
        onlyOwner
    {
        require(
            newThreshold <= _guardians.length() && newThreshold > 0,
            "Threshold should be between 1 and the guardiansCount"
        );
        _guardiansThreshold = newThreshold;
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function setSecret(bytes32 newHash)
        public
        virtual
        override
        onlyOwner
        NotZeroBytes32(newHash)
    {
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
        _recoverProcessesIds[_recoveryCounter].add(recoverProcessId);
        _guardiansVotes[_recoveryCounter][recoverProcessId][
            msg.sender
        ] = newOwner;
    }

    /**
     * @inheritdoc ILSP11BasicSocialRecovery
     */
    function recoverOwnership(
        bytes32 recoverProcessId,
        string memory plainSecret,
        bytes32 newHash
    )
        public
        virtual
        override
        NotZeroBytes32(newHash)
        recoverRequirements(recoverProcessId, plainSecret)
    {
        _recoveryCounter++;
        _secretHash = newHash;

        address keyManager = account.owner();
        require(
            ERC165Checker.supportsInterface(keyManager, _INTERFACEID_LSP6),
            "Owner of the account doesn't support LSP6 InterfaceId"
        );

        (bytes32[] memory keys, bytes[] memory values) = LSP6Utils
            .setupPermissions(account, msg.sender, _ALL_PERMISSIONS);

        LSP6Utils.setDataViaKeyManager(keyManager, keys, values);
    }

    // ---- overrides functions

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(bytes4 _interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return
            _interfaceId == _INTERFACEID_LSP11 ||
            super.supportsInterface(_interfaceId);
    }
}
