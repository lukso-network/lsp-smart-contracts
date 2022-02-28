// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/utils/OwnableUnset.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "@erc725/smart-contracts/contracts/ERC725.sol";
import "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import "../LSP6KeyManager/LSP6KeyManager.sol";

// libraries
import "../Utils/ERC725Utils.sol";

// interfaces
import "./ILSP11SocialRecovery.sol";

// constants
import "../LSP1UniversalReceiver/LSP1Constants.sol";
import "../LSP6KeyManager/LSP6Constants.sol";
import "./LSP11Constants.sol";

/**
 * @title Core Implementation of LSP11-SocialRecovery standard
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @notice Recovers the permission of a key to control an ERC725 contract through LSP6KeyManager
 */
abstract contract LSP11SocialRecoveryCore is
    ILSP11SocialRecovery,
    ERC165Storage,
    OwnableUnset
{
    // The account to recover
    ERC725 public account;

    // The hash of the secret word set by the owner
    bytes32 private _secretHash;

    // The minimum number of votes that an address should get
    // to be granted the owner permissions in the ERC725 contract
    uint256 public recoverThreshold;

    // The number of recovery attempt
    uint256 public recoverCounter;

    // The current number of the guardians
    uint256 public guardiansNumber;

    // Mapping to track if an address is a guardian
    mapping(address => bool) public isGuardian;

    // Mapping to track if the guardians has voted in the current recovery process
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Mapping to track the votes of the address to recover in the current recovery process
    mapping(uint256 => mapping(address => uint256)) public controllerVotes;

    // modifiers

    /**
     * @dev Reverts if called by any account other than the guardians.
     */
    modifier onlyGuardians() {
        require(isGuardian[msg.sender] == true, "Caller is not a guardian");
        _;
    }

    // public functions

    /**
     * @dev See {IERC165-supportsInterface}.
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

    /**
     * @inheritdoc ILSP11SocialRecovery
     */
    function addGuardian(address newGuardian)
        public
        virtual
        override
        onlyOwner
    {
        require(
            isGuardian[newGuardian] == false,
            "Provided address is already a guardian"
        );
        isGuardian[newGuardian] = true;
        guardiansNumber++;
    }

    /**
     * @inheritdoc ILSP11SocialRecovery
     */
    function removeGuardian(address currentGuardian)
        public
        virtual
        override
        onlyOwner
    {
        require(
            isGuardian[currentGuardian] == true,
            "Provided address is not a guardian"
        );
        require(
            guardiansNumber >= recoverThreshold,
            "Guardians number can not be lower than the threshold"
        );
        isGuardian[currentGuardian] = false;
        guardiansNumber--;
    }

    /**
     * @inheritdoc ILSP11SocialRecovery
     */
    function setThreshold(uint256 newThreshold)
        public
        virtual
        override
        onlyOwner
    {
        require(
            newThreshold <= guardiansNumber,
            "Threshold can not be higher than the guardians number"
        );
        recoverThreshold = newThreshold;
    }

    /**
     * @inheritdoc ILSP11SocialRecovery
     */
    function setSecret(bytes32 newHash) public virtual override onlyOwner {
        require(newHash != bytes32(0), "Invalid hash");
        _secretHash = newHash;
    }

    /**
     * @inheritdoc ILSP11SocialRecovery
     */
    function startRecovery(address newOwner)
        public
        virtual
        override
        onlyGuardians
    {
        require(
            hasVoted[recoverCounter][msg.sender] == false,
            "Caller already voted"
        );

        hasVoted[recoverCounter][msg.sender] = true;
        controllerVotes[recoverCounter][newOwner]++;
    }

    /**
     * @inheritdoc ILSP11SocialRecovery
     */
    function recoverOwnership(string memory plainSecret, bytes32 newHash)
        public
        virtual
        override
    {
        require(
            controllerVotes[recoverCounter][msg.sender] >= recoverThreshold,
            "Caller votes below recover threshold"
        );
        require(
            keccak256(abi.encodePacked(plainSecret)) == _secretHash,
            "Invalid secret"
        );
        recoverCounter++;
        _secretHash = newHash;
        address keyManager = account.owner();
        bytes
            memory permissions = hex"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

        (bytes32[] memory keys, bytes[] memory values) = LSP6Utils
            .setupPermissions(account, msg.sender, permissions);

        bytes memory payload = abi.encodeWithSelector(
            IERC725Y.setData.selector,
            keys,
            values
        );
        ILSP6KeyManager(keyManager).execute(payload);
    }
}
