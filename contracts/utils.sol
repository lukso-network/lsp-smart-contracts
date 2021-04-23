// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract ERC725Utils {
    
    function computeMappingKey(string memory _key, string memory _value)
        public
        pure
        returns (bytes32)
    {
        bytes32 keyHash = keccak256(bytes(_key));
        bytes32 valueHash = keccak256(bytes(_value));
        
        bytes16 keyPart = bytes16(keyHash);
        bytes4 valuePart = bytes4(valueHash);
        
        bytes memory temporaryBytes = abi.encodePacked(keyPart, bytes12(0), valuePart);

        bytes32 key_;
        
        assembly {
            _key := mload(temporaryBytes)
        }
        
        return key_;
    }
    
    function getFirst4Bytes(bytes32 _data) public pure returns (bytes4) {
        return bytes4(_data);
    }
    
    function getFirst4Bytes(string memory _data) public pure returns (bytes4) {
        bytes32 hash = keccak256(bytes(_data));
        return bytes4(hash);
    }
    
    
    
    
}

pragma solidity ^0.8.0;

contract BytesUtils {

    /*
    function getFirstNBytes(
        bytes32 _x,
        uint8 _n
    ) public pure returns (bytes4) {
        
        bytes32 nOnes = bytes32(2 ** _n - 1);
        bytes32 mask = nOnes >> (256 - _n); // Total 8 bits
        return _x & mask;
    }
    */
    
    function getFirstNBytes(
        bytes1 _x,
        uint8 _n
    ) public pure returns (bytes1) {
        require(2 ** _n < 255, "Overflow encountered ! ");
        bytes1 nOnes = bytes1(uint8(2) ** _n - 1);
        bytes1 mask = nOnes >> (8 - _n); // Total 8 bits
        return _x & mask;
    }
    
    function test(bytes1 _value, bytes1 _mask) public pure returns(bytes1) {
        return _value & _mask;
    }   
    
    // Try with the following:
    // value: 0xcafecafecafecafecafecafecafecafe12345678901234567890123456789012
    // mask: 0x3FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE00000000000000000000000000000000
    // return: just the 'cafe' part
    function getFirstHalf(bytes32 _value, bytes32 _mask) public pure returns(bytes16) {
        bytes32 result = _value & _mask;
        return bytes16(result);
    }
    
}

// 0xcafecafe52D386f254917e481eB44e9943F39138

// 0xcafecafe4d1a35a74cb8def4342a0b7edf1a39083c98f47dd22d0560844b2045