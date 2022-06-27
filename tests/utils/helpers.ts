import { ethers } from "hardhat";

export const abiCoder = ethers.utils.defaultAbiCoder;
export const provider = ethers.provider;

export const AddressOffset = "000000000000000000000000";
export const EMPTY_PAYLOAD = "0x";
export const ONE_ETH = ethers.utils.parseEther("1");

export const DUMMY_PRIVATEKEY =
  "0xcafecafe7D0F0EBcafeC2D7cafe84cafe3248DDcafe8B80C421CE4C55A26cafe";

export const DUMMY_RECIPIENT = ethers.utils.getAddress(
  "0xcafecafecafecafecafecafecafecafecafecafe"
);

export const LSP1_HOOK_PLACEHOLDER =
  "0xffffffffffffffff0000000000000000aaaaaaaaaaaaaaaa1111111111111111";

export const ERC777TokensRecipient =
  "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";

export const LSP5_ARRAY_KEY = {
  ELEMENT1:
    "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000000",
  ELEMENT2:
    "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000001",
  ELEMENT3:
    "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000002",
  ELEMENT4:
    "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000003",
  ELEMENT5:
    "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000004",
  ELEMENT6:
    "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000005",
  ELEMENT7:
    "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000006",
  ELEMENT8:
    "0x6460ee3c0aac563ccbf76d6e1d07bada00000000000000000000000000000007",
};

export const LSP10_ARRAY_KEY = {
  ELEMENT1:
    "0x55482936e01da86729a45d2b87a6b1d300000000000000000000000000000000",
  ELEMENT2:
    "0x55482936e01da86729a45d2b87a6b1d300000000000000000000000000000001",
  ELEMENT3:
    "0x55482936e01da86729a45d2b87a6b1d300000000000000000000000000000002",
  ELEMENT4:
    "0x55482936e01da86729a45d2b87a6b1d300000000000000000000000000000003",
  ELEMENT5:
    "0x55482936e01da86729a45d2b87a6b1d300000000000000000000000000000004",
  ELEMENT6:
    "0x55482936e01da86729a45d2b87a6b1d300000000000000000000000000000005",
  ELEMENT7:
    "0x55482936e01da86729a45d2b87a6b1d300000000000000000000000000000006",
  ELEMENT8:
    "0x55482936e01da86729a45d2b87a6b1d300000000000000000000000000000007",
};

// bytes8 index
export const INDEX = {
  ZERO: "0000000000000000",
  ONE: "0000000000000001",
  TWO: "0000000000000002",
  THREE: "0000000000000003",
  FOUR: "0000000000000004",
  FIVE: "0000000000000005",
  SIX: "0000000000000006",
  SEVEN: "0000000000000007",
};

// bytes32 arraylength

export const ARRAY_LENGTH = {
  ZERO: "0x0000000000000000000000000000000000000000000000000000000000000000",
  ONE: "0x0000000000000000000000000000000000000000000000000000000000000001",
  TWO: "0x0000000000000000000000000000000000000000000000000000000000000002",
  THREE: "0x0000000000000000000000000000000000000000000000000000000000000003",
  FOUR: "0x0000000000000000000000000000000000000000000000000000000000000004",
  FIVE: "0x0000000000000000000000000000000000000000000000000000000000000005",
  SIX: "0x0000000000000000000000000000000000000000000000000000000000000006",
  SEVEN: "0x0000000000000000000000000000000000000000000000000000000000000007",
  EIGHT: "0x0000000000000000000000000000000000000000000000000000000000000008",
};

// Random Token Id
export const TOKEN_ID = {
  ONE: "0xad7c5bef027816a800da1736444fb58a807ef4c9603b7848673f7e3a68eb14a5",
  TWO: "0xd4d1a59767271eefdc7830a772b9732a11d503531d972ab8c981a6b1c0e666e5",
  THREE: "0x3672b35640006da199633c5c75015da83589c4fb84ef8276b18076529e3d3196",
  FOUR: "0x80a6c6138772c2d7c710a3d49f4eea603028994b7e390f670dd68566005417f0",
  FIVE: "0x5c6f8b1aed769a328dad1ae15220e93730cdd52cb12817ae5fd8c15023d660d3",
  SIX: "0x65ce3c3668a850c4f9fce91762a3fb886380399f02a9eb1495055234e7c0287a",
  SEVEN: "0x00121ee2bd9802ce88a413ac1851c8afe6fe7474fb5d1b7da4475151b013da53",
  EIGHT: "0x367f9d97f8dd1bece61f8b74c5db7616958147682674fd32de73490bd6347f60",
};

export function getRandomAddresses(count) {
  let addresses = [];
  for (let ii = 0; ii < count; ii++) {
    // addresses stored under ERC725Y storage have always lowercases character.
    // therefore, disable the checksum by converting to lowercase to avoid failing tests
    let randomAddress = new ethers.Wallet.createRandom().address.toLowerCase();
    addresses.push(randomAddress);
  }

  return addresses;
}

export function generateKeysAndValues(_elementObject) {
  let keys = [];
  let values = [];
  for (const [_key, _value] of Object.entries(_elementObject)) {
    let key = ethers.utils.toUtf8Bytes(_key);
    let value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(_value));

    keys.push(ethers.utils.keccak256(key));
    values.push(value);
  }

  return [keys, values];
}

export function getRandomString() {
  const value =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randoms = [];
  for (let i = 0; i < 32; i++) {
    randoms.push(value[Math.floor(Math.random() * value.length)]);
  }
  return randoms.join("");
}

// LSP6 - KeyManager

const customRevertErrorMessage =
  "VM Exception while processing transaction: reverted with custom error";

export const NoPermissionsSetError = (_from) => {
  return `${customRevertErrorMessage} 'NoPermissionsSet("${_from}")'`;
};

export const NotAuthorisedError = (_from, _permission) => {
  return `${customRevertErrorMessage} 'NotAuthorised("${_from}", "${_permission}")'`;
};

export const NotAllowedAddressError = (_from, _to) => {
  return `${customRevertErrorMessage} 'NotAllowedAddress("${_from}", "${_to}")'`;
};

export const NotAllowedFunctionError = (_from, _functionSelector) => {
  return `${customRevertErrorMessage} 'NotAllowedFunction("${_from}", "${_functionSelector}")'`;
};

export const NotAllowedERC725YKeyError = (_from, _erc725YKey) => {
  return `${customRevertErrorMessage} 'NotAllowedERC725YKey("${_from}", "${_erc725YKey}")'`;
};

export async function getMapAndArrayKeyValues(
  account,
  vaultMapKey: string,
  arrayKey: string,
  elementInArray: string
) {
  // prettier-ignore
  let [mapValue, arrayLength, elementAddress] = await account["getData(bytes32[])"](
        [
            vaultMapKey, 
            arrayKey, 
            elementInArray
        ]
    );

  return [mapValue, arrayLength, elementAddress];
}
