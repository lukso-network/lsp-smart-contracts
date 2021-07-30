# universalprofile-smart-contracts
The reference implementation for universal profiles smart contracts.

## Installation

```bash
# install truffle globally
$ npm install -g truffle

$ git clone https://github.com/lukso-network/universalprofile-smart-contracts.git
$ cd ./universalprofile-smart-contracts

# make sure to download the ERC725 submodule
$ git submodule update --init --recursive

# install dependencies
$ npm install
# and also for the submododule
$ cd ./submodules/ERC725/implementations && npm install
```

## Running tests

To run all the tests, you can run:

```bash
$ npm test
```

To run specific tests files:
* run a local network
* deploy the smart contracts
* specify the test file to run

```bash
# run a blockchain locally
$ truffle develop

# compile all contracts
> compile --all

# deploy all contracts
> migrate --reset

# run tests
> test test/<test-file>.test.js
```

## Examples


This is an example of the steps to do to set a permission.

```
// Set Permission Example
//
// PERMISSION_CHANGE_KEYS = 0x01
// PERMISSION_SET_DATA    = 0x08
//
// 0. Initial
// PermissionsOfUser = 0x00
//
// 1. Set SET_DATA Permission
// PermissionsOfUser = PermissionOfUser OR PERMISSION_SET_DATA
// now permission is 0x08    0000 1000
//
// 2. Set CHANGE_KEYS Permission
// PermissionsOfUser = PermissionOfUser OR PERMISSION_SET_DATA
// now permission is 0x09    0000 1001
//
// 3. Check If Has Permission SET_DATA
// PermissionOfUser AND PERMISSION_SET_DATA == PERMISSION_SET_DATA
// 0000 1001
// 0000 0001    AND
// 0000 0001
// 4. Delete Permission SET_DATA
// PermissionsOfUser = PermissionOfUser AND  NOT(PERMISSION_SET_DATA)
// permission is now 0x08
```

### AddressPermissions:AllowedFunctions:<address> --> bytes4[]

Returns an array of `bytes4[]`, corresponding to **functions signatures**.

```
KEY_ALLOWEDFUNCTIONS > abi.decode(data, 'array') > [0xffffffffffffffffffffff]
KEY_ALLOWEDFUNCTIONS > abi.decode(data, 'array') > [0xcafecafecafe..., ]
KEY_ALLOWEDFUNCTIONS > abi.decode(data, 'array') > 0x
```

### Payload example

For the following payload:

```javascript
let simpleContractPayload = simpleContract.contract.methods.setName("Test").encodeABI()
let executePayload = erc725Account.contract.methods.execute(
    OPERATION_CALL,
    simpleContract.address,
    0,
    simpleContractPayload
).encodeABI()
```

Here is a detail of the layout of the calldata.

```
(0)   0x44c028fe
(4)   0x0000000000000000000000000000000000000000000000000000000000000000
(36)  0x0000000000000000000000002c2b9c9a4a25e24b174f26114e8926a9f2128fe4
(68)  0x0000000000000000000000000000000000000000000000000000000000000000
(100) 0x0000000000000000000000000000000000000000000000000000000000000080
(132) 0x0000000000000000000000000000000000000000000000000000000000000064
(164) 0xc47f0027
(168) 0x0000000000000000000000000000000000000000000000000000000000000020
(200) 0x0000000000000000000000000000000000000000000000000000000000000004
(232) 0x5465737400000000000000000000000000000000000000000000000000000000
(xxx) 0x00000000000000000000000000000000000000000000000000000000
```

For a calldata with an empty payload as the 4th parameter, it would look like this:

```
(0)   0x44c028fe
(4)   0x0000000000000000000000000000000000000000000000000000000000000000
(36)  0x000000000000000000000000f17f52151ebef6c7334fad080c5704d77216b732
(68)  0x00000000000000000000000000000000000000000000000029a2241af62c0000
(100) 0x0000000000000000000000000000000000000000000000000000000000000080
(132) 0x0000000000000000000000000000000000000000000000000000000000000000
```

## Smart Weakness List to test

Below a list of vulnerabilities to try on KeyManager + ERC725 Account + Universal Receiver.
List is based on https://swcregistry.io/

* SWC-135: Code With No Effects
* SWC-133: Hash Collisions With Multiple Variable Length Arguments
* SWC-131: Presence of unused variables
* SWC-130: Right-To-Left-Override control character (U+202E)
* SWC-126: Insufficient Gas Griefing **(test on executeRelay(...))**
* SWC-125: Incorrect Inheritance Order (double check this)
* SWC-124: Write to Arbitrary Storage Location **(make sure you there are no cases like this on ERC725 account)**
* SWC-123: Requirement violation
* SWC-121: missing protection against Signature Replay Attacks
* SWC-119: Shadowing State Variables **(verify)**
* SWC-117: Signature Malleability **(not sure to understand)**
* SWC-109: Uninitialized storage pointer
* SWC-108: State Variable Default Visibility **(check all state variables visibilities across all contracts)**
* SWC-105: Unprotected Ether Withdrawal **(check across the contracts that some functions cannot exposed this potentially)**
* SWC-104: Unchecked Call Return Value **(verify if in some functions, not checking can lead to unintentional contract behaviour)**
* SWC-102: Outdated Compiler Version **(verify if any old contract or library being used implement a very old prama version. Make a list of them)**
* SWC-101: Integer Overflow and Underflow **(Look for potential cases across contracts)**

Not sure:

* SWC-132: Unexpected Ether balance
