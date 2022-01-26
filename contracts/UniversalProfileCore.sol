// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "./LSP0ERC725Account/LSP0ERC725AccountCore.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

// libraries
import "./Utils/ERC725Utils.sol";

/**
 * @title Core implementation of a LUKSO's Universal Profile based on LSP3
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera, Yamen Merhi
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
abstract contract UniversalProfileCore is ERC165Storage, LSP0ERC725AccountCore {
    bytes32[] public dataKeys;

    /* non-standard public functions */

    /**
     * @dev Returns all the keys set on the account
     * @return The array of keys set on the account
     */
    function allDataKeys() public view returns (bytes32[] memory) {
        return dataKeys;
    }

    /* Standard public functions */

    /**
     * @inheritdoc IERC725Y
     * @dev Sets array of data at multiple given `key`
     * Push all the keys to the `dataKeys` array
     * SHOULD only be callable by the owner of the contract set via ERC173
     *
     * Emits a {DataChanged} event.
     */
    function setData(bytes32[] memory _keys, bytes[] memory _values)
        public
        virtual
        override
        onlyOwner
    {
        require(
            _keys.length == _values.length,
            "Keys length not equal to values length"
        );
        for (uint256 ii = 0; ii < _keys.length; ii++) {
            if (store[_keys[ii]].length == 0) {
                dataKeys.push(_keys[ii]);
            }
            _setData(_keys[ii], _values[ii]);
        }
    }
}
