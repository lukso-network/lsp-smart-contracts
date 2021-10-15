import { ethers } from "hardhat";
import { ERC725JSONSchema } from "@erc725/erc725.js";

export const EMPTY_PAYLOAD = "0x";
export const DUMMY_PAYLOAD = "0xaabbccdd123456780000000000";
export const ONE_ETH = ethers.utils.parseEther("1");
export const DUMMY_PRIVATEKEY =
  "0xcafecafe7D0F0EBcafeC2D7cafe84cafe3248DDcafe8B80C421CE4C55A26cafe";
export const DUMMY_RECIPIENT = ethers.utils.getAddress(
  "0xcafecafecafecafecafecafecafecafecafecafe"
);

export const SCHEMA: ERC725JSONSchema[] = [
  {
    name: "LSP3Profile",
    key: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
    keyType: "Singleton",
    valueContent: "JSONURL",
    valueType: "bytes",
  },
  {
    name: "LSP1UniversalReceiverDelegate",
    key: "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47",
    keyType: "Singleton",
    valueContent: "Address",
    valueType: "address",
  },
  {
    name: "LSP3IssuedAssets[]",
    key: "0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0",
    keyType: "Array",
    valueContent: "Number",
    valueType: "uint256",
    elementValueContent: "Address",
    elementValueType: "address",
  },
];

export function getRandomAddresses(count) {
  let base = "0xa56039d89BD9451A1ac94a680a20302da2dE92";

  let addresses = [];
  for (let ii = 10; ii < count + 10; ii++) {
    let randomAddress = "0x" + parseInt(base + ii).toString(16);
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
