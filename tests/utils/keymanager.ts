// prettier-ignore
export const enum KEYS {
       PERMISSIONS = "0x4b80742d0000000082ac0000", // AddressPermissions:Permissions:<address> --> bytes1
  ALLOWEDADDRESSES = "0x4b80742d00000000c6dd0000", // AddressPermissions:AllowedAddresses:<address> --> address[]
  ALLOWEDFUNCTIONS = "0x4b80742d000000008efe0000",
}

// prettier-ignore
export const enum PERMISSIONS {
    ALL = 0xff,           // 1111 1111
    CHANGEOWNER = 0x01,   // 0000 0001
    CHANGEKEYS = 0x02,    // 0000 0010
    SETDATA = 0x04,       // 0000 0100
    CALL = 0x08,          // 0000 1000
    DELEGATECALL = 0x10,  // 0001 0000
    DEPLOY = 0x20,        // 0010 0000
    TRANSFERVALUE = 0x40, // 0100 0000
    SIGN = 0x80           // 1000 0000
}

export const enum OPERATIONS {
  CALL = 0,
  DELEGATECALL = 1,
  DEPLOY = 2,
}

export const allowedAddresses = [
  "0xcafecafecafecafecafecafecafecafecafecafe",
  "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd",
];
