// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {
    LSP7DigitalAssetInitAbstract
} from "../../LSP7DigitalAssetInitAbstract.sol";

// interfaces
import {ILSP7RoleOperators} from "./ILSP7RoleOperators.sol";

// libraries
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {LSP1Utils} from "@lukso/lsp1-contracts/contracts/LSP1Utils.sol";

// constants
import {
    _MINT_ROLE,
    _ALLOW_TRANSFER_ROLE,
    _INFINITE_BALANCE_ROLE,
    _DEAD_ADDRESS,
    _TYPEID_LSP7_ROLE_OPERATOR
} from "./LSP7RoleOperatorsConstants.sol";

// errors
import {
    LSP7RoleOperatorsInvalidIndexRange,
    LSP7RoleOperatorsCannotRemoveReservedAddress,
    LSP7RoleOperatorsNotAuthorized,
    LSP7RoleOperatorsNotOwnerOrSelf
} from "./LSP7RoleOperatorsErrors.sol";

abstract contract LSP7RoleOperatorsInitAbstract is
    ILSP7RoleOperators,
    LSP7DigitalAssetInitAbstract
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    mapping(bytes32 role => EnumerableSet.AddressSet addresses)
        internal _roleAddresses;

    mapping(bytes32 role => mapping(address operator => bytes data))
        internal _roleOperatorData;

    mapping(address operator => EnumerableSet.Bytes32Set roles)
        internal _operatorRoles;

    function __LSP7RoleOperators_init(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    ) internal virtual onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
        __LSP7RoleOperators_init_unchained(newOwner_);
    }

    function __LSP7RoleOperators_init_unchained(
        address newOwner_
    ) internal virtual onlyInitializing {
        _roleAddresses[_MINT_ROLE].add(newOwner_);
        _operatorRoles[newOwner_].add(_MINT_ROLE);

        _roleAddresses[_ALLOW_TRANSFER_ROLE].add(newOwner_);
        _operatorRoles[newOwner_].add(_ALLOW_TRANSFER_ROLE);
        _roleAddresses[_ALLOW_TRANSFER_ROLE].add(address(0));
        _operatorRoles[address(0)].add(_ALLOW_TRANSFER_ROLE);

        _roleAddresses[_INFINITE_BALANCE_ROLE].add(newOwner_);
        _operatorRoles[newOwner_].add(_INFINITE_BALANCE_ROLE);
        _roleAddresses[_INFINITE_BALANCE_ROLE].add(address(0));
        _operatorRoles[address(0)].add(_INFINITE_BALANCE_ROLE);
        _roleAddresses[_INFINITE_BALANCE_ROLE].add(_DEAD_ADDRESS);
        _operatorRoles[_DEAD_ADDRESS].add(_INFINITE_BALANCE_ROLE);
    }

    /// @inheritdoc ILSP7RoleOperators
    function authorizeRoleOperator(
        bytes32 role,
        address operator,
        bytes calldata data
    ) public override onlyOwner {
        bool added = _roleAddresses[role].add(operator);
        if (added) {
            _operatorRoles[operator].add(role);
            emit RoleOperatorChanged(operator, role, true);
            _notifyRoleOperator(operator, role, true);
        }

        if (data.length > 0 || _roleOperatorData[role][operator].length > 0) {
            _roleOperatorData[role][operator] = data;
            emit RoleOperatorDataChanged(role, operator, data);
        }
    }

    /// @inheritdoc ILSP7RoleOperators
    function revokeRoleOperator(
        bytes32 role,
        address operator
    ) public override {
        require(
            msg.sender == owner() || msg.sender == operator,
            LSP7RoleOperatorsNotOwnerOrSelf(msg.sender, operator)
        );
        require(
            operator != address(0) && operator != _DEAD_ADDRESS,
            LSP7RoleOperatorsCannotRemoveReservedAddress(operator)
        );
        bool removed = _roleAddresses[role].remove(operator);
        if (removed) {
            _operatorRoles[operator].remove(role);
            if (_roleOperatorData[role][operator].length > 0) {
                delete _roleOperatorData[role][operator];
                emit RoleOperatorDataChanged(role, operator, "");
            }
            emit RoleOperatorChanged(operator, role, false);
            _notifyRoleOperator(operator, role, false);
        }
    }

    /// @inheritdoc ILSP7RoleOperators
    function hasRole(
        address operator,
        bytes32 role
    ) public view override returns (bool) {
        return _roleAddresses[role].contains(operator);
    }

    /// @inheritdoc ILSP7RoleOperators
    function getRolesFor(
        address operator
    ) public view override returns (bytes32[] memory) {
        return _operatorRoles[operator].values();
    }

    /// @inheritdoc ILSP7RoleOperators
    function getOperatorsCountForRole(
        bytes32 role
    ) public view returns (uint256) {
        return _roleAddresses[role].length();
    }

    /// @inheritdoc ILSP7RoleOperators
    function getRoleOperatorsByIndex(
        bytes32 role,
        uint256 startIndex,
        uint256 endIndex
    ) public view returns (address[] memory) {
        uint256 roleOperatorsCount = _roleAddresses[role].length();
        require(
            startIndex < endIndex && endIndex <= roleOperatorsCount,
            LSP7RoleOperatorsInvalidIndexRange(
                startIndex,
                endIndex,
                roleOperatorsCount
            )
        );

        uint256 sliceLength = endIndex - startIndex;

        address[] memory roleOperatorsSlice = new address[](sliceLength);

        for (uint256 index = 0; index < sliceLength; ++index) {
            roleOperatorsSlice[index] = _roleAddresses[role].at(
                startIndex + index
            );
        }

        return roleOperatorsSlice;
    }

    /// @inheritdoc ILSP7RoleOperators
    function setRoleOperatorData(
        bytes32 role,
        address operator,
        bytes calldata data
    ) public override onlyOwner {
        require(
            _roleAddresses[role].contains(operator),
            LSP7RoleOperatorsNotAuthorized(role, operator)
        );
        _roleOperatorData[role][operator] = data;
        emit RoleOperatorDataChanged(role, operator, data);
    }

    /// @inheritdoc ILSP7RoleOperators
    function getRoleOperatorData(
        bytes32 role,
        address operator
    ) public view override returns (bytes memory) {
        return _roleOperatorData[role][operator];
    }

    /**
     * @dev Attempt to notify the role operator about the role change.
     * This is done by calling its {universalReceiver} function with the `_TYPEID_LSP7_ROLE_OPERATOR` as typeId,
     * if `operator` is a contract that supports the LSP1 interface.
     * If `operator` is an EOA or a contract that does not support the LSP1 interface, nothing will happen and no notification will be sent.
     *
     * @param operator The address to call the {universalReceiver} function on.
     * @param role The role identifier.
     * @param added True if the operator was added, false if removed.
     */
    function _notifyRoleOperator(
        address operator,
        bytes32 role,
        bool added
    ) internal virtual {
        bytes memory lsp1Data = abi.encode(msg.sender, role, added);

        LSP1Utils.notifyUniversalReceiver(
            operator,
            _TYPEID_LSP7_ROLE_OPERATOR,
            lsp1Data
        );
    }
}
