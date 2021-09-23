// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "../../submodules/ERC725/implementations/contracts/IERC1271.sol";
import "../KeyManager/KeyManager.sol";
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


    function calculateSelectorLSP6KeyManager() public pure returns (bytes4) {
        KeyManager i;

        return i.execute.selector
            ^ i.executeRelayCall.selector
            ^ i.getNonce.selector
            ^ i.isValidSignature.selector;
    }

    function calculateSelectorERC1271() public pure returns (bytes4) {
        IERC1271 i;

        return i.isValidSignature.selector;
    }
}
