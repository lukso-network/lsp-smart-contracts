// prettier-ignore
export const enum KEYS {
       PERMISSIONS = "0x4b80742d0000000082ac0000", // AddressPermissions:Permissions:<address> --> bytes1
  ALLOWEDADDRESSES = "0x4b80742d00000000c6dd0000", // AddressPermissions:AllowedAddresses:<address> --> address[]
  ALLOWEDFUNCTIONS = "0x4b80742d000000008efe0000",
}

// prettier-ignore
export const enum PERMISSIONS {
    ALL            = 0xffff, // 0000 0000 1111 1111
    CHANGEOWNER    = 0x0001, // 0000 0000 0000 0001
    CHANGEKEYS     = 0x0002, // 0000 0000 0000 0010
    SETDATA        = 0x0004, // 0000 0000 0000 0100
    CALL           = 0x0008, // 0000 0000 0000 1000
    STATICCALL     = 0x0010, // 0000 0000 0001 0000
    DELEGATECALL   = 0x0020, // 0000 0000 0010 0000
    DEPLOY         = 0x0040, // 0000 0000 0100 0000
    TRANSFERVALUE  = 0x0080, // 0000 0000 1000 0000
    SIGN           = 0x0100  // 0000 0001 0000 0000
}

export const enum OPERATIONS {
  CALL = 0,
  CREATE = 1,
  CREATE2 = 2,
  STATICCALL = 3,
  DELEGATECALL = 4,
}

export const allowedAddresses = [
  "0xcafecafecafecafecafecafecafecafecafecafe",
  "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd",
];
