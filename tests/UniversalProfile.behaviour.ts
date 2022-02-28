import { ethers } from "hardhat";
import { ERC725, encodeData, flattenEncodedData } from "@erc725/erc725.js";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  UniversalProfile,
  UniversalReceiverTester,
  UniversalReceiverTester__factory,
} from "../types";

import { getRandomAddresses } from "./utils/helpers";

// constants
import {
  ERC1271,
  ERC725YKeys,
  EventSignatures,
  INTERFACE_IDS,
  SupportedStandards,
} from "../constants";

// helpers
import { RANDOM_BYTES32 } from "./utils/helpers";

export type LSP3TestContext = {
  accounts: SignerWithAddress[];
  universalProfile: UniversalProfile;
  deployParams: { owner: SignerWithAddress };
};

export const shouldBehaveLikeLSP3 = (
  buildContext: () => Promise<LSP3TestContext>
) => {
  let context: LSP3TestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when using `isValidSignature()` from ERC1271", () => {
    it("should verify signature from owner", async () => {
      const signer = context.deployParams.owner;

      const dataToSign = "0xcafecafe";
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await context.universalProfile.isValidSignature(
        messageHash,
        signature
      );
      expect(result).toEqual(ERC1271.MAGIC_VALUE);
    });

    it("should fail when verifying signature from non-owner", async () => {
      const signer = context.accounts[1];

      const dataToSign = "0xcafecafe";
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await context.universalProfile.isValidSignature(
        messageHash,
        signature
      );
      expect(result).toEqual(ERC1271.FAIL_VALUE);
    });
  });

  describe("when interacting with the ERC725Y storage", () => {
    let lsp3IssuedAssetsKeys = [
      ERC725YKeys.LSP3["LSP3IssuedAssets[]"].substring(0, 34) +
        "00000000000000000000000000000000",
      ERC725YKeys.LSP3["LSP3IssuedAssets[]"].substring(0, 34) +
        "00000000000000000000000000000001",
    ];
    let lsp3IssuedAssetsValues = [
      "0xd94353d9b005b3c0a9da169b768a31c57844e490",
      "0xdaea594e385fc724449e3118b2db7e86dfba1826",
    ];

    it("should set the 3 x keys for a basic UP setup => `LSP3Profile`, `LSP3IssuedAssets[]` and `LSP1UniversalReceiverDelegate`", async () => {
      let keys = [
        ERC725YKeys.LSP3.LSP3Profile,
        ERC725YKeys.LSP3["LSP3IssuedAssets[]"],
        ...lsp3IssuedAssetsKeys,
        ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate,
      ];
      let values = [
        "0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178",
        "0x0000000000000000000000000000000000000000000000000000000000000002",
        ...lsp3IssuedAssetsValues,
        "0x1183790f29be3cdfd0a102862fea1a4a30b3adab",
      ];

      await context.universalProfile.setData(keys, values);

      const result = await context.universalProfile.getData(keys);
      expect(result).toEqual(values);
    });

    it("should add +10 more LSP3IssuedAssets[]", async () => {
      let newIssuedAssets = getRandomAddresses(10);

      const expectedKeysLength =
        lsp3IssuedAssetsKeys.length + newIssuedAssets.length;
      const expectedValuesLength =
        lsp3IssuedAssetsValues.length + newIssuedAssets.length;

      for (let ii = 0; ii < newIssuedAssets.length; ii++) {
        let hexIndex = ethers.utils.hexlify(lsp3IssuedAssetsKeys.length);

        lsp3IssuedAssetsKeys.push(
          ERC725YKeys.LSP3["LSP3IssuedAssets[]"].substring(0, 34) +
            ethers.utils.hexZeroPad(hexIndex, 16).substring(2)
        );

        lsp3IssuedAssetsValues.push(newIssuedAssets[ii]);
      }
      expect(lsp3IssuedAssetsKeys.length).toEqual(expectedKeysLength);
      expect(lsp3IssuedAssetsValues.length).toEqual(expectedValuesLength);

      let keys = [
        ...lsp3IssuedAssetsKeys,
        ERC725YKeys.LSP3["LSP3IssuedAssets[]"], // update array length
      ];

      let values = [
        ...lsp3IssuedAssetsValues,
        ethers.utils.hexZeroPad(lsp3IssuedAssetsValues.length, 32),
      ];

      await context.universalProfile.setData(keys, values);

      const result = await context.universalProfile.getData(keys);
      expect(result).toEqual(values);
    });

    for (let ii = 1; ii <= 8; ii++) {
      it("should add +1 LSP3IssuedAssets", async () => {
        let hexIndex = ethers.utils.hexlify(lsp3IssuedAssetsKeys.length + 1);

        lsp3IssuedAssetsKeys.push(
          ERC725YKeys.LSP3["LSP3IssuedAssets[]"].substring(0, 34) +
            ethers.utils.hexZeroPad(hexIndex, 16).substring(2)
        );

        lsp3IssuedAssetsValues.push(
          ethers.Wallet.createRandom().address.toLowerCase()
        );

        let keys = [
          ...lsp3IssuedAssetsKeys,
          ERC725YKeys.LSP3["LSP3IssuedAssets[]"], // update array length
        ];

        let values = [
          ...lsp3IssuedAssetsValues,
          ethers.utils.hexZeroPad(lsp3IssuedAssetsValues.length, 32),
        ];

        await context.universalProfile.setData(keys, values);

        const result = await context.universalProfile.getData(keys);
        expect(result).toEqual(values);
      });
    }
  });

  describe("when using with Universal Receiver", () => {
    it("call the Universal Profile and check for UniversalReceiver event", async () => {
      const owner = context.accounts[0];

      const checker: UniversalReceiverTester =
        await new UniversalReceiverTester__factory(owner).deploy();

      let transaction = await checker
        .connect(owner)
        .callImplementationAndReturn(
          context.universalProfile.address,
          RANDOM_BYTES32
        );

      let receipt = await transaction.wait();

      // event should come from account
      expect(receipt.logs[0].address).toEqual(context.universalProfile.address);
      // event signature
      expect(receipt.logs[0].topics[0]).toEqual(
        EventSignatures.LSP1["UniversalReceiver"]
      );
      // from
      expect(receipt.logs[0].topics[1]).toEqual(
        ethers.utils.hexZeroPad(checker.address.toLowerCase(), 32)
      );
      // typeId
      expect(receipt.logs[0].topics[2]).toEqual(RANDOM_BYTES32);
      // receivedData
      expect(receipt.logs[0].data).toEqual(
        "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"
      );
    });
  });
};

export type LSP3InitializeTestContext = {
  universalProfile: UniversalProfile;
};

export const shouldInitializeLikeLSP3 = (
  buildContext: () => Promise<LSP3InitializeTestContext>
) => {
  let context: LSP3InitializeTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when the contract was initialized", () => {
    it("should support ERC165 interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC165
      );
      expect(result).toBeTruthy();
    });

    it("should support ERC1271 interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC1271
      );
      expect(result).toBeTruthy();
    });

    it("should support ERC725X interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC725X
      );
      expect(result).toBeTruthy();
    });

    it("should support ERC725Y interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC725Y
      );
      expect(result).toBeTruthy();
    });

    it("should support LSP0 (ERC725Account) interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC725Account
      );
      expect(result).toBeTruthy();
    });

    it("should support LSP1 interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.LSP1
      );
      expect(result).toBeTruthy();
    });

    it("should have set key 'SupportedStandards:LSP3UniversalProfile'", async () => {
      const [result] = await context.universalProfile.getData([
        SupportedStandards.LSP3UniversalProfile.key,
      ]);

      expect(result).toEqual(SupportedStandards.LSP3UniversalProfile.value);
    });
  });
};
