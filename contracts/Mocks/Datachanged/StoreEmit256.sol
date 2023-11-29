// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {BytesLib} from "solidity-bytes-utils/contracts/BytesLib.sol";

contract StoreEmit256 {
    mapping(bytes32 => bytes) _store;
    event DataChanged(bytes32 indexed d, bytes v);



    function setData(bytes32 d, bytes memory value) public {
        _store[d] = value;

        emit DataChanged(
                d,
                value.length <= 256
                    ? value
                    : BytesLib.slice(value, 0, 256)
            );
    }
}
