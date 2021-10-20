import { ethers } from "hardhat";

// prettier-ignore
export const enum KEYS {
       PERMISSIONS = "0x4b80742d0000000082ac0000", // AddressPermissions:Permissions:<address> --> bytes1
  ALLOWEDADDRESSES = "0x4b80742d00000000c6dd0000", // AddressPermissions:AllowedAddresses:<address> --> address[]
  ALLOWEDFUNCTIONS = "0x4b80742d000000008efe0000",
}

// hex =    0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
// binary = .... 1111 1111 1111 (only 1s)
export const ALL_PERMISSIONS_SET = ethers.utils.hexlify(ethers.constants.MaxUint256);

// prettier-ignore
export const enum PERMISSIONS {
    CHANGEOWNER    = 0x0000000000000000000000000000000000000000000000000000000000000001, // .... 0000 0000 0001
    CHANGEKEYS     = 0x0000000000000000000000000000000000000000000000000000000000000002, // .... .... .... 0010
    SETDATA        = 0x0000000000000000000000000000000000000000000000000000000000000004, // .... .... .... 0100
    CALL           = 0x0000000000000000000000000000000000000000000000000000000000000008, // .... .... .... 1000
    STATICCALL     = 0x0000000000000000000000000000000000000000000000000000000000000010, // .... .... 0001 ....
    DELEGATECALL   = 0x0000000000000000000000000000000000000000000000000000000000000020, // .... .... 0010 ....
    DEPLOY         = 0x0000000000000000000000000000000000000000000000000000000000000040, // .... .... 0100 ....
    TRANSFERVALUE  = 0x0000000000000000000000000000000000000000000000000000000000000080, // .... .... 1000 ....
    SIGN           = 0x0000000000000000000000000000000000000000000000000000000000000100  // .... 0001 .... ....
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
