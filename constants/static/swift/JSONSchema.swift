//
//  JSONSchema.swift
//  UniversalProfile
//
//  Created by JeneaVranceanu.
//  LUKSO Blockchain GmbH © 2021
//

import Foundation

/**
 Implementation of [ERC725Y JSON Schema specification](https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md#specification ).
 */
public struct JSONSchema {
    
    public let name: String
    public let key: String
    public let keyType: JSONSchema.KeyType
    public let valueType: JSONSchema.ValueType
    public let valueContent: JSONSchema.ValueContent
    
    public enum KeyType: String {
        /// A simple key.
        case Singleton = "Singleton"
        /// An array spanning multiple ERC725Y keys.
        case Array = "Array"
        /// A key that maps two words.
        case Mapping = "Mapping"
        /// A key that maps a word, to a grouping word to an address.
        case MappingWithGrouping = "MappingWithGrouping"
    }
    
    public enum ValueType {
        /// The bytes are a UTF8 encoded string
        case string
        /// The bytes are an 20 bytes address
        case address
        /// The bytes are a uint256
        case uint256
        /// The bytes are a 32 bytes
        case bytes32
        /// The bytes are a bytes
        case bytes
        ///  The bytes are a UTF8 encoded string array
        case stringArray
        ///  The bytes are an 20 bytes address array
        case addressArray
        ///  The bytes are a uint256 array
        case uint256Array
        ///  The bytes are a bytes array
        case bytesArray
        ///  The bytes are a N bytes
        case bytesNArray(Int)
        
        var rawValue: String {
            switch self {
                case .string:
                    return "string"
                case .address:
                    return "address"
                case .uint256:
                    return "uint256"
                case .bytes32:
                    return "bytes32"
                case .bytes:
                    return "bytes"
                case .stringArray:
                    return "string[]"
                case .addressArray:
                    return "address[]"
                case .uint256Array:
                    return "uint256[]"
                case .bytesArray:
                    return "bytes[]"
                case .bytesNArray(let count):
                    return "bytes\(count)[]"
            }
        }
    }
    
    public enum ValueContent {
        ///  The content are bytes.
        case Bytes
        ///  The content are bytes with length N.
        case BytesN(Int)
        ///  The content is a number.
        case Number
        ///  The content is a UTF8 string.
        case String
        ///  The content is an address.
        case Address
        ///  The content is an keccak256 32 bytes hash.
        case Keccak256
        ///  The content contains the hash function, hash and link to the asset file.
        case AssetURL
        ///  The content contains the hash function, hash and link to the JSON file.
        case JSONURL
        ///  The content is an URL encoded as UTF8 string.
        case URL
        ///  The content is structured Markdown mostly encoded as UTF8 string.
        case Markdown
        /// If the value content are specific bytes, than the returned value is expected to equal those bytes.
        case SpecificBytes(String)
        case Mixed
        
        public var rawValue: String {
            switch self {
                case .Bytes:
                    return "Bytes"
                case .BytesN(let val):
                    return "Bytes\(val)"
                case .Number:
                    return "Number"
                case .String:
                    return "String"
                case .Address:
                    return "Address"
                case .Keccak256:
                    return "Keccak256"
                case .AssetURL:
                    return "AssetURL"
                case .JSONURL:
                    return "JSONURL"
                case .URL:
                    return "URL"
                case .Markdown:
                    return "Markdown"
                case .SpecificBytes(let specificBytes):
                    return specificBytes
                case .Mixed:
                    return "Mixed"
            }
        }
    }
}
