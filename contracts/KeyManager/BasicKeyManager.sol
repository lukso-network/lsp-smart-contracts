// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "../../submodules/ERC725/implementations/contracts/ERC725/IERC725X.sol";
import "../../submodules/ERC725/implementations/contracts/IERC1271.sol";

// modules
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// libraries
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract BasicKeyManager is ERC165Storage, IERC1271 {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    IERC725X public Account;
    mapping (address => uint256) internal _nonceStore;

    bytes4 internal constant _INTERFACE_ID_ERC1271 = 0x1626ba7e;
    bytes4 internal constant _ERC1271FAILVALUE = 0xffffffff;

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
        _registerInterface(_INTERFACE_ID_ERC1271);

        // Link account
        Account = IERC725X(_account);

        // make owner an executor
        // set roles at once, to safe gas
        _setRoles(0x1111, _newOwner);


        // allow execution itself
//        _setRole(DEFAULT_ADMIN_ROLE, _account); // TODO only for UniversalProfile BETA
//        _setRole(EXECUTOR_ROLE, _account);
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

    function _setRoles(bytes2 _roles, address _key) internal {

    }

    function _verifyRole(bytes1[] memory _role, address _key) internal {

    }

    /* Modifers */
//    modifier verifyRole() {
//        require(msg.sender == account, 'Only the connected account call this function');
//        _;
//    }
}
