// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {LSP7DigitalAsset} from "../../LSP7DigitalAsset.sol";

// interfaces
import {ILSP7RoleOperators} from "./ILSP7RoleOperators.sol";

// libraries
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// constants
import {
    _MINT_ROLE,
    _ALLOW_TRANSFER_ROLE,
    _INFINITE_BALANCE_ROLE,
    _DEAD_ADDRESS,
    _ZERO_ADDRESS
} from "./LSP7RoleOperatorsConstants.sol";

// errors
import {
    LSP7RoleOperatorsInvalidIndexRange,
    LSP7RoleOperatorsCannotRemoveReservedAddress,
    LSP7RoleOperatorsNotAuthorized,
    LSP7RoleOperatorsArrayLengthMismatch
} from "./LSP7RoleOperatorsErrors.sol";

abstract contract LSP7RoleOperatorsAbstract is
    ILSP7RoleOperators,
    LSP7DigitalAsset
{
    using EnumerableSet for EnumerableSet.AddressSet;

    mapping(bytes32 role => EnumerableSet.AddressSet addresses)
        internal _roleAddresses;

    mapping(bytes32 role => mapping(address operator => bytes data))
        internal _roleOperatorData;

    constructor(address newOwner_) {
        _roleAddresses[_MINT_ROLE].add(newOwner_);

        _roleAddresses[_ALLOW_TRANSFER_ROLE].add(newOwner_);
        _roleAddresses[_ALLOW_TRANSFER_ROLE].add(_ZERO_ADDRESS);

        _roleAddresses[_INFINITE_BALANCE_ROLE].add(newOwner_);
        _roleAddresses[_INFINITE_BALANCE_ROLE].add(_ZERO_ADDRESS);
        _roleAddresses[_INFINITE_BALANCE_ROLE].add(_DEAD_ADDRESS);
    }

    /// @inheritdoc ILSP7RoleOperators
    function authorizeRoleOperator(
        bytes32 role,
        address _address
    ) public override onlyOwner {
        bool added = _roleAddresses[role].add(_address);
        if (added) emit RoleOperatorChanged(role, _address, true);
    }

    /// @inheritdoc ILSP7RoleOperators
    function authorizeRoleOperatorWithData(
        bytes32 role,
        address operator,
        bytes calldata data
    ) public override onlyOwner {
        bool added = _roleAddresses[role].add(operator);
        if (added) emit RoleOperatorChanged(role, operator, true);

        if (data.length > 0 || _roleOperatorData[role][operator].length > 0) {
            _roleOperatorData[role][operator] = data;
            emit RoleOperatorDataChanged(role, operator, data);
        }
    }

    /// @inheritdoc ILSP7RoleOperators
    function revokeRoleOperator(
        bytes32 role,
        address _address
    ) public override onlyOwner {
        require(
            _address != address(0) && _address != _DEAD_ADDRESS,
            LSP7RoleOperatorsCannotRemoveReservedAddress(_address)
        );
        bool removed = _roleAddresses[role].remove(_address);
        if (removed) {
            // Clear any associated data
            if (_roleOperatorData[role][_address].length > 0) {
                delete _roleOperatorData[role][_address];
                emit RoleOperatorDataChanged(role, _address, "");
            }
            emit RoleOperatorChanged(role, _address, false);
        }
    }

    /// @inheritdoc ILSP7RoleOperators
    function isRoleOperator(
        bytes32 role,
        address _address
    ) public view override returns (bool) {
        return _roleAddresses[role].contains(_address);
    }

    /// @inheritdoc ILSP7RoleOperators
    function getRoleOperatorsLength(
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
        uint256 allowedAddressesCount = _roleAddresses[role].length();
        require(
            startIndex < endIndex && endIndex <= allowedAddressesCount,
            LSP7RoleOperatorsInvalidIndexRange(
                startIndex,
                endIndex,
                allowedAddressesCount
            )
        );

        uint256 sliceLength = endIndex - startIndex;

        address[] memory allowlistedAddresses = new address[](sliceLength);

        for (uint256 index = 0; index < sliceLength; ++index) {
            allowlistedAddresses[index] = _roleAddresses[role].at(
                startIndex + index
            );
        }

        return allowlistedAddresses;
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

    /// @inheritdoc ILSP7RoleOperators
    function authorizeRoleOperatorBatch(
        bytes32 role,
        address[] calldata operators,
        bytes[] calldata dataArray
    ) public override onlyOwner {
        require(
            operators.length == dataArray.length,
            LSP7RoleOperatorsArrayLengthMismatch(operators.length, dataArray.length)
        );

        for (uint256 i = 0; i < operators.length; ) {
            address operator = operators[i];
            bytes calldata data = dataArray[i];

            bool added = _roleAddresses[role].add(operator);
            if (added) emit RoleOperatorChanged(role, operator, true);

            if (data.length > 0 || _roleOperatorData[role][operator].length > 0) {
                _roleOperatorData[role][operator] = data;
                emit RoleOperatorDataChanged(role, operator, data);
            }

            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc ILSP7RoleOperators
    function revokeRoleOperatorBatch(
        bytes32 role,
        address[] calldata operators
    ) public override onlyOwner {
        for (uint256 i = 0; i < operators.length; ) {
            address operator = operators[i];

            require(
                operator != address(0) && operator != _DEAD_ADDRESS,
                LSP7RoleOperatorsCannotRemoveReservedAddress(operator)
            );

            bool removed = _roleAddresses[role].remove(operator);
            if (removed) {
                if (_roleOperatorData[role][operator].length > 0) {
                    delete _roleOperatorData[role][operator];
                    emit RoleOperatorDataChanged(role, operator, "");
                }
                emit RoleOperatorChanged(role, operator, false);
            }

            unchecked {
                ++i;
            }
        }
    }
}
