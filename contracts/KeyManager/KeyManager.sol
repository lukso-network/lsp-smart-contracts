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
    bytes12 internal constant KEY_PERMISSIONS      = 0x4b80742d0000000082ac0000; // AddressPermissions:Permissions:<address> --> bytes1
    bytes12 internal constant KEY_ALLOWEDADDRESSES = 0x4b80742d00000000c6dd0000; // AddressPermissions:AllowedAddresses:<address> --> address[]
    bytes12 internal constant KEY_ALLOWEDFUNCTIONS = 0x4b80742d000000008efe0000; // AddressPermissions:AllowedFunctions:<address> --> bytes4[]
    bytes12 internal constant KEY_ALLOWEDSTANDARDS = 0x4b80742d000000003efa0000; // AddressPermissions:AllowedStandards:<address> --> bytes4[]

    // PERMISSIONS VALUES
    bytes1 internal constant PERMISSION_CHANGEOWNER   = 0x01;   // 0000 0001
    bytes1 internal constant PERMISSION_CHANGEKEYS    = 0x02;   // 0000 0010
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

    function execute(bytes calldata _data)
        external
        payable
        returns (bool success_)
    {
        // TODO implement an assembly function to move the calldata pointer?
        bytes4 ERC725Selector;
        
        assembly { 
            ERC725Selector := calldataload(68) 
        }

        if (ERC725Selector == SETDATA_SELECTOR) {
            bytes8 key;
            bool isAllowed;
            string memory failureMessage;
            assembly {
                key := calldataload(72)
            }

            if (key == 0x4b80742d00000000) {
                isAllowed = verifyPermission(PERMISSION_CHANGEKEYS, msg.sender);
                failureMessage = "KeyManager:execute: Not authorized to change keys";
            } else {
                isAllowed = verifyPermission(PERMISSION_SETDATA, msg.sender);
                failureMessage = "KeyManager:execute: Not authorized to setData";
            }

            if (isAllowed == false) revert(failureMessage);
        }
        
        if (ERC725Selector == EXECUTE_SELECTOR) {
            uint operationType;
            address recipient;
            uint value;
            bytes4 functionSelector;

            // Check for CALL, DELEGATECALL or DEPLOY
            bytes1 permission;
            string memory failureMessage;
            assembly {
                operationType := calldataload(72)
                switch operationType
                case 0 { permission := PERMISSION_CALL } 
                case 1 { permission := PERMISSION_DELEGATECALL }
                case 2 { permission := PERMISSION_DEPLOY }
                // TODO: revert for any other invalid operation type
            }
            bool operationAllowed = verifyPermission(permission, msg.sender);

            if (operationAllowed == false && permission == PERMISSION_CALL) revert("KeyManager:execute: not authorized to perform CALL");
            if (operationAllowed == false && permission == PERMISSION_DELEGATECALL) revert("KeyManager:execute: not authorized to perform DELEGATECALL");
            if (operationAllowed == false && permission == PERMISSION_DEPLOY) revert("KeyManager:execute: not authorized to perform DEPLOY");

            // Check for authorized addresses
            assembly { recipient := calldataload(104) }
            
            address[] memory allowedAddresses = getAllowedAddresses(msg.sender);
            bool addressAllowed;

            for (uint ii = 0; ii <= allowedAddresses.length - 1; ii++) {
                addressAllowed = (recipient == allowedAddresses[ii]);
                if (addressAllowed == true) break;
            }
            if (addressAllowed == false) revert('KeyManager:execute: Not authorized to interact with this address');

            // Check for value
            assembly { value := calldataload(136) }

            bool transferAllowed;
            if (value > 0) {
                transferAllowed = verifyPermission(PERMISSION_TRANSFERVALUE, msg.sender);
                if (transferAllowed == false) revert("KeyManager:execute: Not authorized to transfer ethers");
            }

            // Check for functions
            // 1st 32 bytes = memory location
            // 2nd 32 bytes = bytes array length
            // remaining = the actual bytes array
            assembly { functionSelector := calldataload(232) }

            bytes4[] memory allowedFunctions = getAllowedFunctions(msg.sender);
            bool functionAllowed;

            for (uint ii = 0; ii <= allowedFunctions.length - 1; ii++) {
                functionAllowed = (functionSelector == allowedFunctions[ii]);
                if (functionAllowed == true) break;
            }
            if (functionAllowed == false) revert("KeyManager:execute: Not authorised to run this function");

        }
        
        if (ERC725Selector == TRANSFEROWNERSHIP_SELECTOR) {
            bool isAllowed = verifyPermission(PERMISSION_CHANGEOWNER, msg.sender);
            if (isAllowed == false) revert("KeyManager:execute: Not authorized to transfer ownership");
        }

        (success_, ) = address(Account).call{value: msg.value, gas: gasleft()}(_data);
        if (success_ == true) emit Executed(msg.value, _data);
    }

    function verifyPermission(bytes1 _permission, address _user) public view returns (bool) {
        bytes32 permissionKey;
        bytes memory computedKey = abi.encodePacked(KEY_PERMISSIONS, _user);
        
        assembly { 
            permissionKey := mload(add(computedKey, 32))
        }

        bytes1 storedPermission;
        bytes memory fetchResult = Account.getData(permissionKey);

        assembly {
            storedPermission := mload(add(fetchResult, 32))
        }

        uint8 resultCheck = uint8(_permission) & uint8(storedPermission);

        if (resultCheck == uint8(_permission)) { // pass
            return true;
        } else if (resultCheck == 0) {  // fail 
            return false;
        } else {    // refer
            // in this case, the user has part of the permissions, but not all of them
            return false;
        }
    }

    function getAllowedAddresses(address _user) public view returns (address[] memory) {
        bytes memory allowedAddressesKeyComputed = abi.encodePacked(KEY_ALLOWEDADDRESSES, _user);
        bytes32 allowedAddressesKey;
        assembly {
            allowedAddressesKey := mload(add(allowedAddressesKeyComputed, 32))
        }
        address[] memory allowedAddresses = abi.decode(Account.getData(allowedAddressesKey), (address[]));
        return allowedAddresses;
    }

    function getAllowedFunctions(address _user) public view returns (bytes4[] memory) {
        bytes memory allowedAddressesKeyComputed = abi.encodePacked(KEY_ALLOWEDFUNCTIONS, _user);
        bytes32 allowedFunctionsKey;
        assembly {
            allowedFunctionsKey := mload(add(allowedAddressesKeyComputed, 32))
        }
        bytes4[] memory allowedFunctions = abi.decode(Account.getData(allowedFunctionsKey), (bytes4[]));
        return allowedFunctions;
    }

}