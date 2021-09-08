// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../../submodules/ERC725/implementations/contracts/ERC725/IERC725X.sol";
import "../../submodules/ERC725/implementations/contracts/ERC725/IERC725Y.sol";
import "../../submodules/ERC725/implementations/contracts/IERC1271.sol";
import "../_LSPs/ILSP1_UniversalReceiver.sol";
import "../_LSPs/ILSP1_UniversalReceiverDelegate.sol";

contract CalculateERC165Selectors {

    function calculateSelectorLSP1() public pure returns (bytes4) {
        ILSP1 i;
        return i.universalReceiver.selector;
    }

    function calculateSelectorLSP1Delegate() public pure returns (bytes4) {
        ILSP1Delegate i;
        return i.universalReceiverDelegate.selector;
    }

    function calculateSelectorERC725X() public pure returns (bytes4) {
        IERC725X i;
        return i.execute.selector;
    }

    function calculateSelectorERC725Y() public pure returns (bytes4) {
        IERC725Y i;
        return i.getData.selector
        ^ i.setData.selector;
    }

    function calculateSelectorERC1271() public pure returns (bytes4) {
        IERC1271 i;
        return i.isValidSignature.selector;
    }
}
