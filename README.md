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

## Example


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

