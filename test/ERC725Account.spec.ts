import { encodeData, ERC725JSONSchema, flattenEncodedData, KeyValuePair } from "@erc725/erc725.js";
import { Signer } from "@ethersproject/abstract-signer";
import { ethers } from "hardhat";
import { ERC725Account, ERC725Account__factory } from "../build/types";

const schema: ERC725JSONSchema[] = [
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

describe("ERC725 Account", () => {
  let erc725Account: ERC725Account;
  let lsp3IssuedAssets = [];
  let accounts: Signer[];
  let owner;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    owner = accounts[0];
    erc725Account = await new ERC725Account__factory(owner).deploy(await owner.getAddress());
  });

  it("should add 100 LSP3IssuedAssets[]", async () => {
    for (let ii = 0; ii < 50; ii++) {
      lsp3IssuedAssets.push("0xa56039d89BD9451A1ac94a680a20302da2dE925A");
    }

    const data = {
      "LSP3IssuedAssets[]": lsp3IssuedAssets,
    };

    const encodedData = encodeData(data, schema);
    const flattenedEncodedData = flattenEncodedData(encodedData);

    await Promise.all(
      flattenedEncodedData.map(async (a) => {
        return erc725Account.setData(a.key, a.value);
      })
    );

    const length = await erc725Account.getData(schema[0].key);
    expect(parseInt(length)).toEqual(50);
  });

  it("Add one more LSP3IssuedAssets[]", async () => {
    let newAsset = "0xa56039d89BD9451A1ac94a680a20302da2dE925A";
    lsp3IssuedAssets.push(newAsset);

    const data = {
      "LSP3IssuedAssets[]": lsp3IssuedAssets,
    };

    const encodedData = encodeData(data, schema);
    const flattenedEncodedData = flattenEncodedData(encodedData);

    await Promise.all(
      flattenedEncodedData.map(async (a) => {
        return erc725Account.setData(a.key, a.value);
      })
    );

    const length = await erc725Account.getData(schema[0].key);
    expect(parseInt(length)).toEqual(51);
  });
});
