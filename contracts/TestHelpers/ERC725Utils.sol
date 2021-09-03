// SPDX-License-Identifier: GPL-3.0

/**
 * @title ERC725 Utility library to encode key types
 * @dev based on LSP2 - ERC725Y JSON Schema
 *      https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#array
 */
pragma solidity ^0.8.0;

library ERC725Utils {

    function generateSingletonKey(string memory _keyName)
        public 
        pure
        returns (bytes32)
    {
        return keccak256(bytes(_keyName));
    }   

    function generateArrayKey(string memory _keyName)
        public
        pure
        returns (bytes32)
    {
        bytes memory keyName = bytes(_keyName);
        
        require(
            keyName[keyName.length - 2] == 0x5b // "[" in utf8 encoded
            && keyName[keyName.length - 1] == 0x5d,  // "]" in utf8
            "Missing empty square brackets \"[]\" at the end of the key name"
        );

        return keccak256(keyName);
    }
    
    function generateMappingKey(string memory _firstWord, string memory _lastWord)
        public
        pure
        returns (bytes32 key_)
    {
        bytes32 firstWordHash = keccak256(bytes(_firstWord));
        bytes32 lastWordHash = keccak256(bytes(_lastWord));
        
        bytes memory temporaryBytes = abi.encodePacked(
            bytes16(firstWordHash), 
            bytes12(0), 
            bytes4(lastWordHash)
        );
        
        assembly {
            key_ := mload(add(temporaryBytes, 32))
        }
    
    }

    function generateAddressMappingKey(string memory _firstWord, address _address)
        public 
        pure
        returns (bytes32 key_)
    {   
        bytes32 firstWordHash = keccak256(bytes(_firstWord));

        bytes memory temporaryBytes = abi.encodePacked(
            bytes8(firstWordHash), 
            bytes4(0), 
            _address
        );

        assembly {
            key_ := mload(add(temporaryBytes, 32))
        }

    }

    function generateAddressMappingGroupingKey(
        string memory _firstWord, 
        string memory _secondWord, 
        address _address
    )
        public
        pure
        returns (bytes32 key_)
    {
        bytes32 firstWordHash = keccak256(bytes(_firstWord));
        bytes32 secondWordHash = keccak256(bytes(_secondWord));

        bytes memory temporaryBytes = abi.encodePacked(
            bytes4(firstWordHash),
            bytes4(0),
            bytes2(secondWordHash),
            bytes2(0),
            _address
        );

        assembly {
            key_ := mload(add(temporaryBytes, 32))
        }
    }

}

/**
 * re-use bitmasks operations below when for refactoring functions above in Assembly to save gas
 */
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

    function getFirst4Bytes(bytes32 _data) public pure returns (bytes4) {
        return bytes4(_data);
    }
    
    function getFirst4Bytes(string memory _data) public pure returns (bytes4) {
        bytes32 hash = keccak256(bytes(_data));
        return bytes4(hash);
    }
    
}