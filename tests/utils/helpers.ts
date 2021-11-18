import { ethers } from "hardhat";

export const EMPTY_PAYLOAD = "0x";
export const DUMMY_PAYLOAD = "0xaabbccdd123456780000000000";
export const ONE_ETH = ethers.utils.parseEther("1");
export const DUMMY_PRIVATEKEY =
  "0xcafecafe7D0F0EBcafeC2D7cafe84cafe3248DDcafe8B80C421CE4C55A26cafe";
export const DUMMY_RECIPIENT = ethers.utils.getAddress(
  "0xcafecafecafecafecafecafecafecafecafecafe"
);

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
