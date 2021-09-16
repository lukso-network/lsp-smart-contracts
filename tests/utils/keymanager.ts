import { ethers } from "hardhat";

// prettier-ignore
// Permission keys
const KEY_PERMISSIONS = "0x4b80742d0000000082ac0000"; // AddressPermissions:Permissions:<address> --> bytes1
const KEY_ALLOWEDADDRESSES = "0x4b80742d00000000c6dd0000"; // AddressPermissions:AllowedAddresses:<address> --> address[]
const KEY_ALLOWEDFUNCTIONS = "0x4b80742d000000008efe0000";

// prettier-ignore
// Permissions
const ALL_PERMISSIONS = ethers.BigNumber.from(0xff).toNumber();
const PERMISSION_CHANGEOWNER = ethers.BigNumber.from(0x01).toNumber(); // 0000 0001
const PERMISSION_CHANGEKEYS = ethers.BigNumber.from(0x02).toNumber(); // 0000 0010
const PERMISSION_SETDATA = ethers.BigNumber.from(0x04).toNumber(); // 0000 0100
const PERMISSION_CALL = ethers.BigNumber.from(0x08).toNumber(); // 0000 1000
const PERMISSION_DELEGATECALL = ethers.BigNumber.from(0x10).toNumber(); // 0001 0000
const PERMISSION_DEPLOY = ethers.BigNumber.from(0x20).toNumber(); // 0010 0000
const PERMISSION_TRANSFERVALUE = ethers.BigNumber.from(0x40).toNumber(); // 0100 0000
const PERMISSION_SIGN = ethers.BigNumber.from(0x80).toNumber(); // 1000 0000

export const enum OPERATIONS {
  CALL = 0,
  DELEGATECALL = 1,
  DEPLOY = 2,
}

module.exports = {
  KEY_PERMISSIONS,
  KEY_ALLOWEDADDRESSES,
  KEY_ALLOWEDFUNCTIONS,
  ALL_PERMISSIONS,
  PERMISSION_SETDATA,
  PERMISSION_CALL,
  PERMISSION_TRANSFERVALUE,
  PERMISSION_SIGN,
};
