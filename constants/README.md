# Constants

## What is here? 

This directory contain JSON file that declares constants (`constants_defined.json`) and python scripts that generate source code files containing declared constants in different programming languages (like TypeScript, Swift and Kotlin).

## Purpose

The main purpose is to (pros):
    - CI support - every time LSP is created/updated there is most likely some new JSONSchema, constant or enum to release. Now we are just one `python3.9 generate_all.py` call away from update;
    - reduce manual labor of updating each and every of the source code files written in different languages for different tools;
    - avoiding the need to be familiar with different programming lanuages of unrelated areas. It is not difficult to write simple files in unfamiliar programming languages but it could be somewhat cumbersome to validate the syntax of the source code as it could require a) to search for online REPL tools or validators that could easily be not ideal (sometimes they are intentionally limited) or b) manually preparing you local environment to use a specific language (can be a lot more difficult);
    - adding a backbone to add support for new languages. Provided scripts are very similar between each other. They could be used to add support for a new language quite easily. 
    
Cons:
    - as time goes by languages' versions supported by these scripts are inevitably going to be outdated. Though, most likely the backwards compatibility will be there anyway. It's the new syntax features that we won't get a taste of until we update scripts manually. Language versions incompatibility is **very unlikely** to be happening any time soon.

## How to use?

First of all, when a new constant must be added you should think whether it is an `enum`, `JSONSchema`, `json` object or a single line declaration - `const`.

Supported types:
    - `enum`;
    - `json`;
    - `JSONSchema`;
    - `const`.

Optional attributes for all objects:
    -   `documentation` - can be absent, null, String or an array of other primitive type objects like `Int`s and `String`s.

Example 1:
```
{
   "type":"const",
   "name":"OwnershipTransfered",
   "value":"\"0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0\"",
   "documentation":[
      "event OwnershipTransferred(",
      "   address indexed previousOwner,",
      "   address indexed newOwner,",
      ");",
      "",
      "signature = keccak256('OwnershipTransferred(address,address)')"
   ]
}
```

Will result into (Kotlin in example):
```
/**
 event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner,
 );
 
 signature = keccak256('OwnershipTransferred(address,address)')
 */
public val OwnershipTransfered = "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0"
```

Example 2:
```
{
   "name":"ALL_PERMISSIONS_SET",
   "type":"const",
   "documentation":"binary = .... 1111 1111 1111 (only 1s)",
   "value":"\"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff\""
}
```

Will result into (Kotlin in example):
```
/// binary = .... 1111 1111 1111 (only 1s)
public val ALL_PERMISSIONS_SET = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
```

### Types requirements.

<h4>`enum`</h4>

Enumeration requires name, raw type like `String` or any other primitive type, and a list of cases (at least an empty list or scripts will crash).

**Required attributes:**
    - `"type": "enum"`;
    - `name` is the actual name of the enumeration;
    - `rawValueType` is the type of the underlying values of this enumeration. `rawValueType` can be one of the following or an error will be thrown:
        - `String`;
        - `Int`;
        - `UInt`;
        - `Double`;
        - `Float`.
    - `cases` is an array of objects where each of them represents a single case. 
        Case object looks the following way:

        ```
        {
            "key": "The name of this case or how it will be referenced in source code.",
            "value": "The value for this case" 
        }
        ```

You can set the value for the key `value` always as a string. It is the `rawValueType` that matters and will actually decide whether the end value will be wrapped with quotes or not.

Example:
```json
{
   "name": "DemoEnum",
   "type": "enum",
   "rawValueType":"Int",
   "cases":[
      {
         "key":"CASE_1",
         "value":"123" // Set as a String
      },
      {
         "key":"CASE_2"
         "value":2345 // Set as an Int
      }
    ]
}
```

Will generate in TypeScript:

```typescript
export const enum DemoEnum {
	CASE_1 = 123,
	CASE_2 = 2345
}
```

But if you change the `rawValueType` to `String` the output will be the following:

```typescript
export const enum DemoEnum {
	CASE_1 = "123",
	CASE_2 = "2345"
}
```

Here is an example of an enum:

```json
{
   "name":"ERC1271",
   "type":"enum",
   "rawValueType":"String",
   "documentation":"ERC1271\n----------",
   "cases":[
      {
         "key":"MAGIC_VALUE",
         "value":"0x1626ba7e"
      },
      {
         "key":"FAIL_VALUE",
         "value":"0xffffffff"
      }
   ]
},
```

<h4>`json`</h4>

In TypeScript this will be a JSON based object, in other languages it will be a class (e.g. in Swift, Java), a class/companion object/object (e.g. in Kotlin). The leading force to name it as `json` was that it is obvious for TypeScript to declare the JSON structure. Since, broadly speaking, other languages do no support direct JSON in source code they are falling back to using classes, structs, data classes and/or other suitable solution.

**Required attributes:**
    - `"type": "json"`;
    - `name` is the actual name of the JSON object.
    
Optional attributes:
    - `members` - an array of other constants, JSON objects or JSONSchemas. Enumerations are not supported as nested members of other objects.
    
Example:
```json
{
   "name":"BasicUPSetup_Schema",
   "type":"json",
   "members":[
      {
         "name":"LSP3Profile",
         "type":"JSONSchema",
         "key":"ERC725YKeys.LSP3.LSP3Profile",
         "keyType":"Singleton",
         "valueContent":"JSONURL",
         "valueType":"bytes"
      }
   ]
},
```

Output in TypeScript:
```typescript
export const BasicUPSetup_Schema =  {
	LSP3Profile:  {
		name: "LSP3Profile",
		key: ERC725YKeys.LSP3.LSP3Profile,
		keyType: "Singleton",
		valueContent: "JSONURL",
		valueType: "bytes",
	}
}
```   

Output in Kotlin (flawed):
```kotlin
public class BasicUPSetup_Schema {
	public companion object {
		public val LSP3Profile = JSONSchema(name = "LSP3Profile",
			key = "ERC725YKeys.LSP3.LSP3Profile", /// Flawed. Key should be either a HEX String or a reference to another schema (like in this case).
			keyType = KeyType("Singleton"),
			valueContent = ValueContent("JSONURL"),
			valueType = ValueType("bytes"))
   }
}         
```
    
<h4>`const`</h4>

Simply a constant declaration. It is important to format the `value` correctly as it will be placed without any formatting into the source code, thus, any strings should have escaped double qoutes.

**Required attributes:**
    - `"type": "const"`;
    - `name` is the actual name of the constant;
    - `value` the formatted value of the constant. 
    
Example:
```json
{
   "name":"ALL_PERMISSIONS_SET",
   "type":"const",
   "value":"\"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff\""
}
```

Output in TypeScript:
```typescript
export const ALL_PERMISSIONS_SET = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
```

Output in Kotlin:
```Kotlin
public val ALL_PERMISSIONS_SET = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
```


<h4>`JSONSchema`</h4>

A specific type that is expected as a separately declared class or struct in languages like `Swift` and `Kotlin`. In TypeScript source code an object with type `JSONSchema` will be declared as a complex JSON object.

**Required attributes:**
    - `"type": "JSONSchema"`;
    - `name` - see [ERC725YJSONSchema specification](https://github.com/lukso-network/LIPs/blob/7f546aa94f4f9f661f223c7fee6d291926170447/LSPs/LSP-2-ERC725YJSONSchema.md#specification);
    - `type` - see [ERC725YJSONSchema specification](https://github.com/lukso-network/LIPs/blob/7f546aa94f4f9f661f223c7fee6d291926170447/LSPs/LSP-2-ERC725YJSONSchema.md#specification);
    - `key` - see [ERC725YJSONSchema specification](https://github.com/lukso-network/LIPs/blob/7f546aa94f4f9f661f223c7fee6d291926170447/LSPs/LSP-2-ERC725YJSONSchema.md#specification);
    - `keyType` - see [ERC725YJSONSchema specification](https://github.com/lukso-network/LIPs/blob/7f546aa94f4f9f661f223c7fee6d291926170447/LSPs/LSP-2-ERC725YJSONSchema.md#specification);
    - `valueContent` - see [ERC725YJSONSchema specification](https://github.com/lukso-network/LIPs/blob/7f546aa94f4f9f661f223c7fee6d291926170447/LSPs/LSP-2-ERC725YJSONSchema.md#specification);
    - `valueType` - see [ERC725YJSONSchema specification](https://github.com/lukso-network/LIPs/blob/7f546aa94f4f9f661f223c7fee6d291926170447/LSPs/LSP-2-ERC725YJSONSchema.md#specification);
    
Optional attributes:
    - `elementValueContent` - ? 
    - `elementValueType` - ?
    
Example:
```json
{
   "name":"LSP3IssuedAssets[]",
   "type":"JSONSchema",
   "key":"ERC725YKeys.LSP3.LSP3IssuedAssetsArray",
   "keyType":"Array",
   "valueContent":"Number",
   "valueType":"uint256",
   "elementValueContent":"Address",
   "elementValueType":"address"
}
```

Output in TypeScript:
```typescript
LSP3IssuedAssetsArray:  {
	name: "LSP3IssuedAssets[]",
	key: ERC725YKeys.LSP3.LSP3IssuedAssetsArray,
	keyType: "Array",
	valueContent: "Number",
	valueType: "uint256",
	elementValueContent: "Address",
	elementValueType: "address",
}
```

Output in Swift:
```Swift
public static let LSP3IssuedAssetsArray = JSONSchema(name: "LSP3IssuedAssets[]",
                                                     key: "ERC725YKeys.LSP3.LSP3IssuedAssetsArray",
                                                     keyType: .Array,
                                                     valueContent: .Number,
                                                     valueType: .uint256,
                                                     elementValueContent: .Address,
                                                     elementValueType: .address)
```

Output in Kotlin:
```Kotlin
public val LSP3IssuedAssets = JSONSchema(name = "LSP3IssuedAssets[]",
	key = "ERC725YKeys.LSP3.LSP3IssuedAssetsArray",
	keyType = KeyType("Array"),
	valueContent = ValueContent("Number"),
	valueType = ValueType("uint256", 32),
	elementValueContent = ElementValueContent("Address"),
	elementValueType = ElementValueType("address"))
```

