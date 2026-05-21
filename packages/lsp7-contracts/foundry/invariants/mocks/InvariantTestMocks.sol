// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {LSP7DigitalAsset} from "../../../contracts/LSP7DigitalAsset.sol";
import {
    LSP7DigitalAssetInitAbstract
} from "../../../contracts/LSP7DigitalAssetInitAbstract.sol";
import {
    AccessControlExtendedAbstract
} from "../../../contracts/extensions/AccessControlExtended/AccessControlExtendedAbstract.sol";
import {
    AccessControlExtendedInitAbstract
} from "../../../contracts/extensions/AccessControlExtended/AccessControlExtendedInitAbstract.sol";
import {
    LSP7MintableAbstract
} from "../../../contracts/extensions/LSP7Mintable/LSP7MintableAbstract.sol";
import {
    LSP7MintableInitAbstract
} from "../../../contracts/extensions/LSP7Mintable/LSP7MintableInitAbstract.sol";
import {
    LSP7CappedBalanceAbstract
} from "../../../contracts/extensions/LSP7CappedBalance/LSP7CappedBalanceAbstract.sol";
import {
    LSP7CappedBalanceInitAbstract
} from "../../../contracts/extensions/LSP7CappedBalance/LSP7CappedBalanceInitAbstract.sol";
import {
    LSP7CappedSupplyAbstract
} from "../../../contracts/extensions/LSP7CappedSupply/LSP7CappedSupplyAbstract.sol";
import {
    LSP7CappedSupplyInitAbstract
} from "../../../contracts/extensions/LSP7CappedSupply/LSP7CappedSupplyInitAbstract.sol";
import {LSP7MintableInit} from "../../../contracts/presets/LSP7MintableInit.sol";
import {
    LSP7NonTransferableAbstract
} from "../../../contracts/extensions/LSP7NonTransferable/LSP7NonTransferableAbstract.sol";
import {
    LSP7NonTransferableInitAbstract
} from "../../../contracts/extensions/LSP7NonTransferable/LSP7NonTransferableInitAbstract.sol";
import {
    LSP7RevokableAbstract
} from "../../../contracts/extensions/LSP7Revokable/LSP7RevokableAbstract.sol";
import {
    LSP7RevokableInitAbstract
} from "../../../contracts/extensions/LSP7Revokable/LSP7RevokableInitAbstract.sol";
import {
    _LSP4_TOKEN_TYPE_TOKEN
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";

contract MockAccessControlExtended is
    LSP7DigitalAsset,
    AccessControlExtendedAbstract
{
    bytes32 public constant TEST_ROLE = keccak256("TestRole");

    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        AccessControlExtendedAbstract()
    {}

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(LSP7DigitalAsset, AccessControlExtendedAbstract)
        returns (bool)
    {
        return
            LSP7DigitalAsset.supportsInterface(interfaceId) ||
            AccessControlExtendedAbstract.supportsInterface(interfaceId);
    }

    function _transferOwnership(
        address newOwner
    ) internal virtual override(AccessControlExtendedAbstract, Ownable) {
        AccessControlExtendedAbstract._transferOwnership(newOwner);
    }
}

contract MockAccessControlExtendedInit is
    LSP7DigitalAssetInitAbstract,
    AccessControlExtendedInitAbstract
{
    bytes32 public constant TEST_ROLE = keccak256("TestRole");

    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    ) external initializer {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
        __AccessControlExtended_init();
    }

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            LSP7DigitalAssetInitAbstract,
            AccessControlExtendedInitAbstract
        )
        returns (bool)
    {
        return
            LSP7DigitalAssetInitAbstract.supportsInterface(interfaceId) ||
            AccessControlExtendedInitAbstract.supportsInterface(interfaceId);
    }

    function _transferOwnership(
        address newOwner
    )
        internal
        virtual
        override(AccessControlExtendedInitAbstract, OwnableUpgradeable)
    {
        AccessControlExtendedInitAbstract._transferOwnership(newOwner);
    }
}

contract MockLSP7Mintable is LSP7MintableAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        bool mintable_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        AccessControlExtendedAbstract()
        LSP7MintableAbstract(mintable_)
    {}
}

contract MockLSP7CappedBalance is LSP7CappedBalanceAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 tokenBalanceCap_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        AccessControlExtendedAbstract()
        LSP7CappedBalanceAbstract(tokenBalanceCap_)
    {}

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }

    function transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public override {
        _transfer(from, to, amount, force, data);
    }
}

contract MockLSP7CappedBalanceInit is LSP7CappedBalanceInitAbstract {
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 tokenBalanceCap_
    ) external initializer {
        __LSP7CappedBalance_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_,
            tokenBalanceCap_
        );
    }

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }

    function transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public override {
        _transfer(from, to, amount, force, data);
    }
}

contract MockLSP7CappedSupply is LSP7CappedSupplyAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 tokenSupplyCap_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        LSP7CappedSupplyAbstract(tokenSupplyCap_)
    {}

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }
}

contract MockLSP7CappedSupplyInit is LSP7CappedSupplyInitAbstract {
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 tokenSupplyCap_
    ) external initializer {
        __LSP7CappedSupply_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_,
            tokenSupplyCap_
        );
    }

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }
}

/// @dev Thin wrapper so invariant 12 can target LSP7MintableInit directly.
contract LSP7MintableInitHarness is LSP7MintableInit {}

contract MockLSP7NonTransferable is LSP7NonTransferableAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        AccessControlExtendedAbstract()
        LSP7NonTransferableAbstract(transferLockStart_, transferLockEnd_)
    {}

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }

    function burn(address from, uint256 amount, bytes memory data) public {
        if (msg.sender != from) {
            _spendAllowance(msg.sender, from, amount);
        }
        _burn(from, amount, data);
    }

    function transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public override {
        _transfer(from, to, amount, force, data);
    }
}

contract MockLSP7NonTransferableInit is LSP7NonTransferableInitAbstract {
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    ) external initializer {
        __LSP7NonTransferable_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_,
            transferLockStart_,
            transferLockEnd_
        );
    }

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }

    function burn(address from, uint256 amount, bytes memory data) public {
        if (msg.sender != from) {
            _spendAllowance(msg.sender, from, amount);
        }
        _burn(from, amount, data);
    }

    function transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public override {
        _transfer(from, to, amount, force, data);
    }
}

contract MockLSP7Revokable is LSP7RevokableAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        bool isRevokable_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        AccessControlExtendedAbstract()
        LSP7RevokableAbstract(isRevokable_)
    {}

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }

    function revoke(
        address from,
        address to,
        uint256 amount,
        bytes memory data
    ) public override onlyRole(REVOKER_ROLE) {
        super.revoke(from, to, amount, data);
    }
}

contract MockLSP7RevokableInit is LSP7RevokableInitAbstract {
    constructor() {
        _disableInitializers();
    }

    function initialize(address newOwner_, bool isRevokable_) external initializer {
        __LSP7Revokable_init(
            "Revokable Init",
            "RVI",
            newOwner_,
            _LSP4_TOKEN_TYPE_TOKEN,
            false,
            isRevokable_
        );
    }

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public {
        _mint(to, amount, force, data);
    }

    function revoke(
        address from,
        address to,
        uint256 amount,
        bytes memory data
    ) public override onlyRole(REVOKER_ROLE) {
        super.revoke(from, to, amount, data);
    }
}
