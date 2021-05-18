// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import { ERC725Y } from "../../submodules/ERC725/implementations/contracts/ERC725/ERC725Y.sol";
import { IERC1271 } from "../../submodules/ERC725/implementations/contracts/IERC1271.sol";

// modules
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// libraries
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { ERC725Utils } from "../ERC725Utils.sol";

contract KeyManager is ERC165, IERC1271 {
    using ECDSA for bytes32;
    using ERC725Utils for *;

    ERC725Y public Account;
    mapping (address => uint256) internal _nonceStore;

    bytes4 internal constant _INTERFACE_ID_ERC1271 = 0x1626ba7e;
    bytes4 internal constant _ERC1271FAILVALUE = 0xffffffff;

    // PERMISSION KEYS
    bytes12 internal constant KEY_PERMISSIONS      = 0x4b80742d0000000082ac0000; // AddressPermissions:Permissions:<address>
    bytes12 internal constant KEY_ALLOWEDADDRESSES = 0x4b80742d00000000c6dd0000; // AddressPermissions:AllowedAddresses:<address> --> address[]
    bytes12 internal constant KEY_ALLOWEDFUNCTIONS = 0x4b80742d000000008efe0000; // AddressPermissions:AllowedFunctions:<address> --> bytes4[]
    bytes12 internal constant KEY_ALLOWEDSTANDARDS = 0x4b80742d000000003efa0000; // AddressPermissions:AllowedStandards:<address> --> bytes4[]

    // PERMISSIONS VALUES
    bytes1 internal constant PERMISSION_CHANGEOWNER   = 0x01;   // 0000 0001
    bytes1 internal constant PERMISSION_CHANGKEYS     = 0x02;   // 0000 0010
    bytes1 internal constant PERMISSION_SETDATA       = 0x04;   // 0000 0100
    bytes1 internal constant PERMISSION_CALL          = 0x08;   // 0000 1000
    bytes1 internal constant PERMISSION_DELEGATECALL  = 0x10;   // 0001 0000
    bytes1 internal constant PERMISSION_DEPLOY        = 0x20;   // 0010 0000
    bytes1 internal constant PERMISSION_TRANSFERVALUE = 0x40;   // 0100 0000
    bytes1 internal constant PERMISSION_SIGN          = 0x80;   // 1000 0000

    // selectors
    bytes4 internal constant SETDATA_SELECTOR = 0x7f23690c;
    bytes4 internal constant EXECUTE_SELECTOR = 0x44c028fe;
    bytes4 internal constant TRANSFEROWNERSHIP_SELECTOR = 0xf2fde38b;

    event Executed(uint256 indexed  _value, bytes _data);

    constructor(address _account) {
        // Set account
        Account = ERC725Y(_account);
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

        return (true)
            ? _INTERFACE_ID_ERC1271
            : _ERC1271FAILVALUE;
    }

    // Execution
    // --------------------

    function execute(bytes calldata _data)
        external
        payable
    {
        bytes4 ERC725Selector;
        assembly { 
            ERC725Selector := calldataload(68) 
        }


        if (ERC725Selector == SETDATA_SELECTOR) {
            bool isAllowed = verifyPermission(PERMISSION_SETDATA, msg.sender);
        }
        
        if (ERC725Selector == EXECUTE_SELECTOR) {
            
        }
        
        if (ERC725Selector == TRANSFEROWNERSHIP_SELECTOR) {
            bool isAllowed = verifyPermission(PERMISSION_CHANGEOWNER, msg.sender);
        }
    }

    function verifyPermission(bytes1 _permission, address _user) internal returns (bool) {
        bytes32 permissionKey = abi.encodePacked(KEY_PERMISSIONS, _user);
        bytes1 storedPermission;
        
        bytes memory result = Account.getData(permissionKey);

        assembly {
            storedPermission := mload(add(result, 32))
        }

        return (_permission & storedPermission) != 0 ? true : false;
    }

}