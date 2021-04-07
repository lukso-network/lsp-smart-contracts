// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "../../submodules/ERC725/implementations/contracts/ERC725/IERC725X.sol";
import "../../submodules/ERC725/implementations/contracts/IERC1271.sol";

// modules
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// libraries
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract BasicKeyManager is ERC165, IERC1271 {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    IERC725X public Account;
    mapping (address => uint256) internal _nonceStore;

    bytes4 internal constant _INTERFACE_ID_ERC1271 = 0x1626ba7e;
    bytes4 internal constant _ERC1271FAILVALUE = 0xffffffff;

    // ROLE KEYS
    bytes12 internal constant ROLEKEY_ROLES =            0xd76bc04c00000000eced0000; // ERC725AccountKeyRoles:Roles:<address>
    bytes12 internal constant ROLEKEY_ALLOWEDADDRESSES = 0xd76bc04c00000000c6dd0000; // ERC725AccountKeyRoles:AllowedAddresses:<address>
    bytes12 internal constant ROLEKEY_ALLOWEDFUNCTIONS = 0xd76bc04c000000008efe0000; // ERC725AccountKeyRoles:AllowedFunctions:<address>
    bytes12 internal constant ROLEKEY_ALLOWEDSTANDARDS = 0xd76bc04c000000003efa0000; // ERC725AccountKeyRoles:AllowedStandards:<address>

    // ROLES
    bytes1 internal constant ROLE_CHANGEKEYS = 0x01;
    bytes1 internal constant ROLE_SETDATA = 0x01;
    bytes1 internal constant ROLE_EXECUTE = 0x01;
    bytes1 internal constant ROLE_TRANSFERVALUE = 0x01;
    bytes1 internal constant ROLE_SIGN = 0x01;

    // EVENTS
    event Executed(uint256 indexed  _value, bytes _data);

    // CONSTRUCTOR
    constructor(address _account, address _newOwner) {

        // Link account
        Account = IERC725X(_account);

        // give initial owner roles: ROLE_CHANGEKEYS, ROLE_SETDATA, ROLE_EXECUTE, ROLE_TRANSFERVALUE, ROLE_SIGN
        bytes32 memory generatedKey = ROLEKEY_ROLES + bytes20(uint256(uint160(_address)));
        Account.setData(generatedKey, 0x1111);

    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165) returns (bool) {
        return interfaceId == _INTERFACE_ID_ERC1271
        || super.supportsInterface(interfaceId);
    }


    function getNonce(address _address)
    public
    view
    returns (uint256) {
        return _nonceStore[_address];
    }


    function execute(bytes memory _data)
    external
    payable
    {
//        require(hasRole(EXECUTOR_ROLE, _msgSender()), 'Only executors are allowed');

        address(Account).call{value: msg.value, gas: gasleft()}(_data); //(success, ) =
        emit Executed(msg.value, _data);
    }


    // allows anybody to execute given they have a signed messaged from an executor
    function executeRelayedCall(
        address signedFor,
        bytes memory _data,
        uint256 _nonce,
        bytes memory _signature
    )
    external
    {
        require(signedFor == address(this), 'Message not signed for this keyManager');

        bytes memory blob = abi.encodePacked(
            address(this), // needs to be signed for this keyManager
            _data,
            _nonce // Prevents replays
        );

        // recover the signer
        address from = keccak256(blob).toEthSignedMessageHash().recover(_signature);

//        require(hasRole(EXECUTOR_ROLE, from), 'Only executors are allowed');
        require(_nonceStore[from] == _nonce, 'Incorrect nonce');

        // increase the nonce
        _nonceStore[from] = _nonceStore[from].add(1);

        address(Account).call{value: 0, gas: gasleft()}(_data); //(success, ) =
        emit Executed(0, _data);
    }

    /**
    * @notice Checks if an owner signed `_data`.
    * ERC1271 interface.
    *
    * @param _hash hash of the data signed//Arbitrary length data signed on the behalf of address(this)
    * @param _signature owner's signature(s) of the data
    */
    function isValidSignature(bytes32 _hash, bytes memory _signature)
    override
    public
    pure
    returns (bytes4 magicValue)
    {
        address recoveredAddress = ECDSA.recover(_hash, _signature);

        return (true)//  _verifyRole([ROLE_SIGN], recoveredAddress)       hasRole(EXECUTOR_ROLE, recoveredAddress) || hasRole(DEFAULT_ADMIN_ROLE, recoveredAddress))
            ? _INTERFACE_ID_ERC1271
            : _ERC1271FAILVALUE;
    }


    // Internal functions
    function _getData(bytes32 _key) returns(bytes) {
        return Account.getData(_key);
    }

//    function _setRoles(address _key, bytes memory _roles) internal {
//        Account.setData(generatedKey, _roles);
//    }

    function _verifyRole(address _key, bytes1[] memory _role) internal {

    }

    function _verifyStandard(address _key, address _standard) internal {

    }

    function _verifyFunctionCall(address _key, address _functionSignature) internal {

    }

    function _verifySmartContract(address _key, address _smartContract) internal {

    }

    /* Modifers */
//    modifier verifyRole() {
//        require(msg.sender == account, 'Only the connected account call this function');
//        _;
//    }
}
