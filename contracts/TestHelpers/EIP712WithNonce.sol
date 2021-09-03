// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

contract EIP712WithNonce {
    mapping(address => mapping(uint256 => uint256)) internal _nonces;

    // idx is a 256bits (unsigned) integer, where
    //      - the 128 leftmost bits are the timeline index
    //  and - the 128 rightmost bits are the nonce within the timeline
    function _verifyNonce(address owner, uint256 idx) internal virtual returns (bool) {
        // idx % (1 << 128) : nonce   -------  (idx >> 128) : timeline
        // require (nonce == _nonces[owner][timeline]
        require(idx % (1 << 128) == _nonces[owner][idx >> 128]++);
        return true ;
    }

    function getNonce(address from, uint128 timelineId) public view virtual returns (uint256) {
        // out of order nonces. For sequential nonces, use timelineId = 0
        uint128 nonceId = uint128(_nonces[from][timelineId]);
        return uint256(timelineId) << 128 | nonceId;
    }

}