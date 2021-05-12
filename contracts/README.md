
## AddressPermissions:Permissions:<address>

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

## AddressPermissions:AllowedFunctions:<address> --> bytes4[]

Returns a `bytes4[]` array, corresponding to **functions signatures**.

```
KEY_ALLOWEDFUNCTIONS > abi.decode(data, 'array') > [0xffffffffffffffffffffff]
KEY_ALLOWEDFUNCTIONS > abi.decode(data, 'array') > [0xcafecafecafe..., ]
KEY_ALLOWEDFUNCTIONS > abi.decode(data, 'array') > 0x
```

