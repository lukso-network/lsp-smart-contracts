// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {
    OwnableUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {
    LSP8IdentifiableDigitalAsset
} from "../../../contracts/LSP8IdentifiableDigitalAsset.sol";
import {
    LSP8IdentifiableDigitalAssetInitAbstract
} from "../../../contracts/LSP8IdentifiableDigitalAssetInitAbstract.sol";
import {
    AccessControlExtendedAbstract
} from "../../../contracts/extensions/AccessControlExtended/AccessControlExtendedAbstract.sol";
import {
    AccessControlExtendedInitAbstract
} from "../../../contracts/extensions/AccessControlExtended/AccessControlExtendedInitAbstract.sol";
import {
    LSP8CappedBalanceAbstract
} from "../../../contracts/extensions/LSP8CappedBalance/LSP8CappedBalanceAbstract.sol";
import {
    LSP8CappedBalanceInitAbstract
} from "../../../contracts/extensions/LSP8CappedBalance/LSP8CappedBalanceInitAbstract.sol";
import {
    LSP8CappedSupplyAbstract
} from "../../../contracts/extensions/LSP8CappedSupply/LSP8CappedSupplyAbstract.sol";
import {
    LSP8CappedSupplyInitAbstract
} from "../../../contracts/extensions/LSP8CappedSupply/LSP8CappedSupplyInitAbstract.sol";
import {
    LSP8MintableAbstract
} from "../../../contracts/extensions/LSP8Mintable/LSP8MintableAbstract.sol";
import {
    LSP8MintableInitAbstract
} from "../../../contracts/extensions/LSP8Mintable/LSP8MintableInitAbstract.sol";
import {
    LSP8NonTransferableAbstract
} from "../../../contracts/extensions/LSP8NonTransferable/LSP8NonTransferableAbstract.sol";
import {
    LSP8NonTransferableInitAbstract
} from "../../../contracts/extensions/LSP8NonTransferable/LSP8NonTransferableInitAbstract.sol";
import {
    LSP8RevokableAbstract
} from "../../../contracts/extensions/LSP8Revokable/LSP8RevokableAbstract.sol";
import {
    LSP8RevokableInitAbstract
} from "../../../contracts/extensions/LSP8Revokable/LSP8RevokableInitAbstract.sol";
import {
    _LSP4_TOKEN_TYPE_NFT
} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {_LSP8_TOKENID_FORMAT_NUMBER} from "../../../contracts/LSP8Constants.sol";

contract MockLSP8AccessControlExtended is
    LSP8IdentifiableDigitalAsset,
    AccessControlExtendedAbstract
{
    bytes32 public constant TEST_ROLE = keccak256("TestRole");

    constructor(address newOwner_)
        LSP8IdentifiableDigitalAsset(
            "AC NFT",
            "ACNFT",
            newOwner_,
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER
        )
        AccessControlExtendedAbstract()
    {}

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(LSP8IdentifiableDigitalAsset, AccessControlExtendedAbstract)
        returns (bool)
    {
        return
            LSP8IdentifiableDigitalAsset.supportsInterface(interfaceId) ||
            AccessControlExtendedAbstract.supportsInterface(interfaceId);
    }

    function _transferOwnership(
        address newOwner
    ) internal virtual override(AccessControlExtendedAbstract, Ownable) {
        AccessControlExtendedAbstract._transferOwnership(newOwner);
    }
}

contract MockLSP8AccessControlExtendedInit is
    LSP8IdentifiableDigitalAssetInitAbstract,
    AccessControlExtendedInitAbstract
{
    bytes32 public constant TEST_ROLE = keccak256("TestRole");

    constructor() {
        _disableInitializers();
    }

    function initialize(address newOwner_) external initializer {
        LSP8IdentifiableDigitalAssetInitAbstract._initialize(
            "AC NFT Init",
            "ACNI",
            newOwner_,
            _LSP4_TOKEN_TYPE_NFT,
            _LSP8_TOKENID_FORMAT_NUMBER
        );
        __AccessControlExtended_init();
    }

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            LSP8IdentifiableDigitalAssetInitAbstract,
            AccessControlExtendedInitAbstract
        )
        returns (bool)
    {
        return
            LSP8IdentifiableDigitalAssetInitAbstract.supportsInterface(
                interfaceId
            ) ||
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

contract MockLSP8CappedBalance is LSP8CappedBalanceAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        uint256 tokenBalanceCap_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
        AccessControlExtendedAbstract()
        LSP8CappedBalanceAbstract(tokenBalanceCap_)
    {}

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }

    function transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public override {
        _transfer(from, to, tokenId, force, data);
    }
}

contract MockLSP8CappedBalanceInit is LSP8CappedBalanceInitAbstract {
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        uint256 tokenBalanceCap_
    ) external initializer {
        __LSP8CappedBalance_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_,
            tokenBalanceCap_
        );
    }

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }

    function transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public override {
        _transfer(from, to, tokenId, force, data);
    }
}

contract MockLSP8CappedSupply is LSP8CappedSupplyAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        uint256 tokenSupplyCap_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
        LSP8CappedSupplyAbstract(tokenSupplyCap_)
    {}

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }
}

contract MockLSP8CappedSupplyInit is LSP8CappedSupplyInitAbstract {
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        uint256 tokenSupplyCap_
    ) external initializer {
        __LSP8CappedSupply_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_,
            tokenSupplyCap_
        );
    }

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }
}

contract MockLSP8Mintable is LSP8MintableAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        bool mintable_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
        AccessControlExtendedAbstract()
        LSP8MintableAbstract(mintable_)
    {}

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public override {
        super.mint(to, tokenId, force, data);
    }
}

contract MockLSP8MintableInit is LSP8MintableInitAbstract {
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        bool mintable_
    ) external initializer {
        __LSP8Mintable_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_,
            mintable_
        );
    }

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public override {
        super.mint(to, tokenId, force, data);
    }
}

contract MockLSP8NonTransferable is LSP8NonTransferableAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
        AccessControlExtendedAbstract()
        LSP8NonTransferableAbstract(transferLockStart_, transferLockEnd_)
    {}

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }

    function transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public override {
        _transfer(from, to, tokenId, force, data);
    }
}

contract MockLSP8NonTransferableInit is LSP8NonTransferableInitAbstract {
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        uint256 transferLockStart_,
        uint256 transferLockEnd_
    ) external initializer {
        __LSP8NonTransferable_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_,
            transferLockStart_,
            transferLockEnd_
        );
    }

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }

    function transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public override {
        _transfer(from, to, tokenId, force, data);
    }
}

contract MockLSP8Revokable is LSP8RevokableAbstract {
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        bool isRevokable_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
        AccessControlExtendedAbstract()
        LSP8RevokableAbstract(isRevokable_)
    {}

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }

    function revoke(
        address from,
        address to,
        bytes32 tokenId,
        bytes memory data
    ) public override onlyRole(REVOKER_ROLE) {
        super.revoke(from, to, tokenId, data);
    }
}

contract MockLSP8RevokableInit is LSP8RevokableInitAbstract {
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        uint256 lsp8TokenIdFormat_,
        bool isRevokable_
    ) external initializer {
        __LSP8Revokable_init(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_,
            isRevokable_
        );
    }

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }

    function revoke(
        address from,
        address to,
        bytes32 tokenId,
        bytes memory data
    ) public override onlyRole(REVOKER_ROLE) {
        super.revoke(from, to, tokenId, data);
    }
}
