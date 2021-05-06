// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "../../submodules/ERC725/implementations/contracts/ERC725/ERC725.sol";
import "../../submodules/ERC725/implementations/contracts/IERC1271.sol";

// modules
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// libraries
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import { ERC725Utils } from "../ERC725Utils.sol";

contract BasicKeyManager is ERC165, IERC1271 {
    using ECDSA for bytes32;
    using SafeMath for uint256;
    using ERC725Utils for *;

    ERC725 public Account;
    mapping (address => uint256) internal _nonceStore;

    bytes4 internal constant _INTERFACE_ID_ERC1271 = 0x1626ba7e;
    bytes4 internal constant _ERC1271FAILVALUE = 0xffffffff;

    // ROLE KEYS
    bytes12 internal constant KEY_PERMISSIONS =      0x4b80742d0000000082ac0000; // AddressPermissions:Permissions:<address>
    bytes12 internal constant KEY_ALLOWEDADDRESSES = 0x4b80742d00000000c6dd0000; // AddressPermissions:AllowedAddresses:<address>
    bytes12 internal constant KEY_ALLOWEDFUNCTIONS = 0x4b80742d000000008efe0000; // AddressPermissions:AllowedFunctions:<address>
    bytes12 internal constant KEY_ALLOWEDSTANDARDS = 0x4b80742d000000003efa0000; // AddressPermissions:AllowedStandards:<address>

    // ROLES VALUES
    // PERMISSION_CHANGE_KEYS e.g.
    bytes1 internal constant PERMISSION_CHANGEKEYS = 0x01;    // 0000 0001
    bytes1 internal constant PERMISSION_CHANGEOWNER = 0x01;    // 0000 0001
    bytes1 internal constant PERMISSION_SETDATA = 0x02;       // 0000 0010
    bytes1 internal constant PERMISSION_EXECUTE = 0x04;       // 0000 0100
    bytes1 internal constant PERMISSION_TRANSFERVALUE = 0x08; // 0000 1000
    bytes1 internal constant PERMISSION_SIGN = 0x10;          // 0001 0000

    //KEY_ALLOWEDFUNCTIONS > abi.decode(data, 'array') > [0xffffffffffffffffffffff]
    //KEY_ALLOWEDFUNCTIONS > abi.decode(data, 'array') > [0xcafecafecafe..., ]
    //KEY_ALLOWEDFUNCTIONS > abi.decode(data, 'array') > 0x

    bytes1 internal constant ROLE_ADMIN = 0xFF;   // 1111 1111
    bytes1 internal constant ROLE_EXECUTOR = 0x04;  // 0000 0100 (What other roles an executor should have?)

    // Set Permission Example
    //
    // PERMISSION_CHANGE_KEYS = 0x01
    // PERMISSION_SET_DATA    = 0x08
    //
    // 0. Initial
    // PermissionsOfUser = 0x00
    //
    // 1. Set SET_DATA Permission
    // PermissionsOfUser = PermissionOfUser OR PERMISSION_SET_DATA
    // now permission is 0x08    0000 1000
    //
    // 2. Set CHANGE_KEYS Permission
    // PermissionsOfUser = PermissionOfUser OR PERMISSION_SET_DATA
    // now permission is 0x09    0000 1001
    //
    // 3. Check If Has Permission SET_DATA
    // PermissionOfUser AND PERMISSION_SET_DATA == PERMISSION_SET_DATA
    // 0000 1001
    // 0000 0001    AND
    // 0000 0001
    // 4. Delete Permission SET_DATA
    // PermissionsOfUser = PermissionOfUser AND  NOT(PERMISSION_SET_DATA)
    // permission is now 0x08

    // EVENTS
    event Executed(uint256 indexed  _value, bytes _data);

    constructor(address _account) {
        // Set account
        Account = ERC725(_account);
    }

    modifier isAdmin(address _address) {
        /// TODO
        _;
    }

    modifier isExecutor(address _user) {
        /// TODO
        _;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        virtual override(ERC165) 
        returns (bool) 
    {
        return interfaceId == _INTERFACE_ID_ERC1271
        || super.supportsInterface(interfaceId);
    }


    function getNonce(address _address) public view returns (uint256) {
        return _nonceStore[_address];
    }

    // Execution
    // --------------------

    function execute(bytes memory _data) external payable {
        // require(hasRole(EXECUTOR_ROLE, _msgSender()), 'Only executors are allowed');

        // is trying to call exectue(operasiont, to, valuer, data )

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

        // require(hasRole(EXECUTOR_ROLE, from), 'Only executors are allowed');
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

    // Roles
    // --------------------

    /// TODO
    function getRoles(address _user) public view returns (bytes32) {

    }

    function setRole(address _user, bytes memory _role) public {
        bytes32 generatedKey = string("AddressPermissions").generateAddressMappingGroupingKey({
            _secondWord: "Permissions",
            _address: _user
        });
        Account.setData(generatedKey, _role);
    }

    /// TODO
    function grantRole(address _user, bytes2 _role) public returns (bool) {
        
    }

    /// TODO
    function revokeRole(address _user, bytes2 _role) public returns (bool) {
    
    }

    // Permissions
    // -------------------

    function _getPermissions(address _address) public view returns (bytes memory) {
        bytes32 generatedKey = BytesLib.toBytes32(abi.encodePacked(KEY_PERMISSIONS, bytes20(uint160(_address))), 0);    
        bytes memory permissions = Account.getData(generatedKey);
        return permissions;
    }

    /// TODO
    function verifyPermissions(address _address, bytes2 _permissions) public returns (bool) {

    }

    function _verifyOnePermissionSet(bytes2 _permissions, bytes2 _allowedPermission) public returns(bool) {
        require(
            uint16(_allowedPermission) & (uint16(_allowedPermission)-1) == 0, 
            "Trying to check more than one permission"
        );
        return (_permissions & _allowedPermission) != 0 ? true : false;
    }

    function _verifyAllPermissionsSet(bytes2 _permissions, bytes2 _allowedPermissions) public returns(bool) {
        bytes2 result = _permissions & _allowedPermissions;

        if (result == _allowedPermissions) {
            return true;
        } else {
            return false;
        }
    }

    function _findPermissionsNotSet(bytes2 _initialCheck, bytes2 _previousResult) public returns (bytes2) {
        return _initialCheck ^ _previousResult;
    }

    // Others (Allowed Standards, Function calls, Smart contracts, ...)
    // --------------------

    function _verifyStandard(address _address, address _standard) internal {
        
    }

    function _verifyFunctionCall(address _address, address _functionSignature) internal {

    }

    function _verifySmartContract(address _address, address _smartContract) internal {

    }

}
