import { encodeData, flattenEncodedData, KeyValuePair } from "@erc725/erc725.js";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { ERC725Account, ERC725Account__factory } from "../../build/types";
import { SCHEMA, getRandomAddresses, generateKeysAndValues } from "../utils/helpers";

describe("ERC725 Account", () => {
  let accounts: SignerWithAddress[];
  let owner: SignerWithAddress;

  let erc725Account: ERC725Account;

  let lsp3IssuedAssets = [];

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    owner = accounts[0];

    erc725Account = await new ERC725Account__factory(owner).deploy(owner.address);
  });

  describe("Display encoded abi for `setData`", () => {
    it("> one singleton key", async () => {
      // prettier-ignore
      let element = { "MyFirstKey": "Hello Lukso!" };

      let [keys, values] = generateKeysAndValues(element);

      let payload = erc725Account.interface.encodeFunctionData("setData", [keys, values]);
      console.log("1 singleton key:");
      console.log(payload);
    });

    it("> 5 x singleton keys(same length)", async () => {
      // prettier-ignore
      let elements = {
          "MyFirstKey":   "aaaaaaaaaa",
          "MySecondKey":  "bbbbbbbbbb",
          "MyThirdKey":   "cccccccccc",
          "MyFourthKey":  "dddddddddd",
          "MyFifthKey":   "eeeeeeeeee",
        };

      let [keys, values] = generateKeysAndValues(elements);

      let payload = erc725Account.interface.encodeFunctionData("setData", [keys, values]);
      console.log("5 singleton keys (same length):");
      console.log(payload);
    });

    //
    it("> adding 10 x LSP3IssuedAssets", async () => {
      lsp3IssuedAssets = getRandomAddresses(10);
      // prettier-ignore
      const data = { "LSP3IssuedAssets[]": lsp3IssuedAssets };

      const encodedData = encodeData(data, SCHEMA);
      const flattenedEncodedData = flattenEncodedData(encodedData);

      let keys = [];
      let values = [];

      flattenedEncodedData.map((data) => {
        keys.push(data.key);
        values.push(data.value);
      });

      let payload = erc725Account.interface.encodeFunctionData("setData", [keys, values]);
      console.log("20 x LSP3IssuedAssets:");
      console.log(payload);
    });

    it("> basic Universal Profile setup (3 keys) => set `LSP3Profile`, `LSP3IssuedAssets[]` and `LSP1UniversalReceiverDelegate`", async () => {
      const basicUPSetup = {
        LSP3Profile: {
          hashFunction: "keccak256(utf8)",
          hash: "0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361",
          url: "ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx",
        },
        "LSP3IssuedAssets[]": [
          "0xD94353D9B005B3c0A9Da169b768a31C57844e490",
          "0xDaea594E385Fc724449E3118B2Db7E86dFBa1826",
        ],
        LSP1UniversalReceiverDelegate: "0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb",
      };

      let encodedData = encodeData(basicUPSetup, SCHEMA);
      let flattenedEncodedData = flattenEncodedData(encodedData);

      let keys = [];
      let values = [];

      flattenedEncodedData.map((data) => {
        keys.push(data.key);
        values.push(data.value);
      });

      let payload = erc725Account.interface.encodeFunctionData("setData", [keys, values]);
      console.log("Basic UP Setup ==> 3 items (different length):");
      console.log(payload);
    });
  });

  describe("Adding LSP3IssuedAssets", () => {
    it("should add 50 LSP3IssuedAssets[]", async () => {
      lsp3IssuedAssets = getRandomAddresses(50);

      const data = { "LSP3IssuedAssets[]": lsp3IssuedAssets };

      const encodedData = encodeData(data, SCHEMA);
      const flattenedEncodedData = flattenEncodedData(encodedData);

      let keys = [];
      let values = [];

      flattenedEncodedData.map((data) => {
        keys.push(data.key);
        values.push(data.value);
      });

      await erc725Account.setData(keys, values);

      const [length] = await erc725Account.getData([SCHEMA[2].key]);
      expect(parseInt(length)).toEqual(50);
    });

    it("Add one more LSP3IssuedAssets[]", async () => {
      let newAsset = "0xa56039d89BD9451A1ac94a680a20302da2dE925A";
      lsp3IssuedAssets.push(newAsset);

      const data = {
        "LSP3IssuedAssets[]": lsp3IssuedAssets,
      };

      const encodedData = encodeData(data, SCHEMA);
      const flattenedEncodedData = flattenEncodedData(encodedData);

      let keys = [];
      let values = [];

      flattenedEncodedData.map((data) => {
        keys.push(data.key);
        values.push(data.value);
      });

      await erc725Account.setData(keys, values);

      const [length] = await erc725Account.getData([SCHEMA[2].key]);
      expect(parseInt(length)).toEqual(51);
    });
  });
});
