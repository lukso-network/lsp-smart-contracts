// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

// constants
import {_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY} from "../LSP1UniversalReceiver/LSP1Constants.sol";

error ReentrantAddressNotURD();

abstract contract LSP6ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant(address upAddress) {
        _nonReentrantBefore(upAddress);
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore(address upAddress) private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        if (_status == _ENTERED) {
            //compare URD address and msg.sender
            //if msg.sender != URD address => revert

            address urdAddress = address(
                bytes20(IERC725Y(upAddress).getData(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY))
            );

            if (msg.sender != urdAddress) revert ReentrantAddressNotURD();
        }

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }
}
