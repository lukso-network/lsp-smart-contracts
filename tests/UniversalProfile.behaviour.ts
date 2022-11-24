import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// types
import { UniversalProfile, TargetContract__factory } from "../types";

// helpers
import { getRandomAddresses } from "./utils/helpers";

// constants
import {
  ERC1271_VALUES,
  ERC725YKeys,
  INTERFACE_IDS,
  SupportedStandards,
} from "../constants";

export type LSP3TestContext = {
  accounts: SignerWithAddress[];
  universalProfile: UniversalProfile;
  deployParams: { owner: SignerWithAddress; initialFunding?: number };
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
      expect(result).to.equal(ERC1271_VALUES.MAGIC_VALUE);
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
      expect(result).to.equal(ERC1271_VALUES.FAIL_VALUE);
    });

    /** @todo update this test for acceptOwnership(...) */
    it("should return failValue when the owner doesn't support ERC1271", async () => {
      const signer = context.accounts[1];

      const targetContract = await new TargetContract__factory(
        context.accounts[0]
      ).deploy();

      await context.universalProfile
        .connect(context.accounts[0])
        .transferOwnership(targetContract.address);

      const dataToSign = "0xcafecafe";
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await context.universalProfile.isValidSignature(
        messageHash,
        signature
      );
      expect(result).to.equal(ERC1271_VALUES.FAIL_VALUE);
    });
  });

  describe("when interacting with the ERC725Y storage", () => {
    let lsp12IssuedAssetsKeys = [
      ERC725YKeys.LSP12["LSP12IssuedAssets[]"].index +
        "00000000000000000000000000000000",
      ERC725YKeys.LSP12["LSP12IssuedAssets[]"].index +
        "00000000000000000000000000000001",
    ];
    let lsp12IssuedAssetsValues = [
      "0xd94353d9b005b3c0a9da169b768a31c57844e490",
      "0xdaea594e385fc724449e3118b2db7e86dfba1826",
    ];

    it("should set the 3 x keys for a basic UP setup => `LSP3Profile`, `LSP12IssuedAssets[]` and `LSP1UniversalReceiverDelegate`", async () => {
      let keys = [
        ERC725YKeys.LSP3.LSP3Profile,
        ERC725YKeys.LSP12["LSP12IssuedAssets[]"].length,
        ...lsp12IssuedAssetsKeys,
        ERC725YKeys.LSP1.LSP1UniversalReceiverDelegate,
      ];
      let values = [
        "0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178",
        "0x0000000000000000000000000000000000000000000000000000000000000002",
        ...lsp12IssuedAssetsValues,
        "0x1183790f29be3cdfd0a102862fea1a4a30b3adab",
      ];

      await context.universalProfile["setData(bytes32[],bytes[])"](
        keys,
        values
      );

      const result = await context.universalProfile["getData(bytes32[])"](keys);
      expect(result).to.eql(values);
    });

    it("should add +10 more LSP12IssuedAssets[]", async () => {
      let newIssuedAssets = getRandomAddresses(10);

      const expectedKeysLength =
        lsp12IssuedAssetsKeys.length + newIssuedAssets.length;
      const expectedValuesLength =
        lsp12IssuedAssetsValues.length + newIssuedAssets.length;

      for (let ii = 0; ii < newIssuedAssets.length; ii++) {
        let hexIndex = ethers.utils.hexlify(lsp12IssuedAssetsKeys.length);

        lsp12IssuedAssetsKeys.push(
          ERC725YKeys.LSP12["LSP12IssuedAssets[]"].index +
            ethers.utils.hexZeroPad(hexIndex, 16).substring(2)
        );

        lsp12IssuedAssetsValues.push(newIssuedAssets[ii]);
      }
      expect(lsp12IssuedAssetsKeys.length).to.equal(expectedKeysLength);
      expect(lsp12IssuedAssetsValues.length).to.equal(expectedValuesLength);

      let keys = [
        ...lsp12IssuedAssetsKeys,
        ERC725YKeys.LSP12["LSP12IssuedAssets[]"].length, // update array length
      ];

      let values = [
        ...lsp12IssuedAssetsValues,
        ethers.utils.hexZeroPad(
          ethers.utils.hexlify(lsp12IssuedAssetsValues.length),
          32
        ),
      ];

      await context.universalProfile["setData(bytes32[],bytes[])"](
        keys,
        values
      );

      const result = await context.universalProfile["getData(bytes32[])"](keys);
      expect(result).to.eql(values);
    });

    for (let ii = 1; ii <= 8; ii++) {
      it("should add +1 LSP12IssuedAssets", async () => {
        let hexIndex = ethers.utils.hexlify(lsp12IssuedAssetsKeys.length + 1);

        lsp12IssuedAssetsKeys.push(
          ERC725YKeys.LSP12["LSP12IssuedAssets[]"].index +
            ethers.utils.hexZeroPad(hexIndex, 16).substring(2)
        );

        lsp12IssuedAssetsValues.push(
          ethers.Wallet.createRandom().address.toLowerCase()
        );

        let keys = [
          ...lsp12IssuedAssetsKeys,
          ERC725YKeys.LSP12["LSP12IssuedAssets[]"].length, // update array length
        ];

        let values = [
          ...lsp12IssuedAssetsValues,
          ethers.utils.hexZeroPad(
            ethers.utils.hexlify(lsp12IssuedAssetsValues.length),
            32
          ),
        ];

        await context.universalProfile["setData(bytes32[],bytes[])"](
          keys,
          values
        );

        const result = await context.universalProfile["getData(bytes32[])"](
          keys
        );
        expect(result).to.eql(values);
      });
    }

    describe("when setting a data key with a value less than 256 bytes", () => {
      it("should emit DataChanged event with the whole data value", async () => {
        let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
        let value = ethers.utils.hexlify(ethers.utils.randomBytes(200));

        await expect(
          context.universalProfile["setData(bytes32,bytes)"](key, value)
        )
          .to.emit(context.universalProfile, "DataChanged")
          .withArgs(key, value);

        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });
    });

    describe("when setting a data key with a value more than 256 bytes", () => {
      it("should emit DataChanged event with only the first 256 bytes of the value", async () => {
        let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
        let value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

        await expect(
          context.universalProfile["setData(bytes32,bytes)"](key, value)
        )
          .to.emit(context.universalProfile, "DataChanged")
          .withArgs(key, ethers.utils.hexDataSlice(value, 0, 256));

        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });
    });

    describe("when setting a data key with a value exactly 256 bytes long", () => {
      it("should emit DataChanged event with the whole data value", async () => {
        let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
        let value = ethers.utils.hexlify(ethers.utils.randomBytes(256));

        await expect(
          context.universalProfile["setData(bytes32,bytes)"](key, value)
        )
          .to.emit(context.universalProfile, "DataChanged")
          .withArgs(key, value);

        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });
    });
  });

  describe("when calling the contract without any value or data", () => {
    it("should pass and not emit the ValueReceived event", async () => {
      const sender = context.accounts[0];
      const amount = 0;

      // prettier-ignore
      await expect(
          sender.sendTransaction({
            to: context.universalProfile.address,
            value: amount,
          })
        ).to.not.be.reverted
         .to.not.emit(context.universalProfile, "ValueReceived");
    });
  });

  describe("when sending native tokens to the contract", () => {
    it("should emit the right ValueReceived event", async () => {
      const sender = context.accounts[0];
      const amount = ethers.utils.parseEther("5");

      await expect(
        sender.sendTransaction({
          to: context.universalProfile.address,
          value: amount,
        })
      )
        .to.emit(context.universalProfile, "ValueReceived")
        .withArgs(sender.address, amount);
    });

    it("should allow to send a random payload as well, and emit the ValueReceived event", async () => {
      const sender = context.accounts[0];
      const amount = ethers.utils.parseEther("5");

      await expect(
        sender.sendTransaction({
          to: context.universalProfile.address,
          value: amount,
          data: "0xaabbccdd",
        })
      )
        .to.emit(context.universalProfile, "ValueReceived")
        .withArgs(sender.address, amount);
    });
  });

  describe("when sending a random payload, without any value", () => {
    it("should execute the fallback function, but not emit the ValueReceived event", async () => {
      let tx = await context.accounts[0].sendTransaction({
        to: context.universalProfile.address,
        value: 0,
        data: "0xaabbccdd",
      });

      // check that no event was emitted
      await expect(tx).to.not.emit(context.universalProfile, "ValueReceived");
    });
  });
};

export const shouldInitializeLikeLSP3 = (
  buildContext: () => Promise<LSP3TestContext>
) => {
  let context: LSP3TestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when the contract was initialized", () => {
    it("should support ERC165 interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC165
      );
      expect(result).to.be.true;
    });

    it("should support ERC1271 interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC1271
      );
      expect(result).to.be.true;
    });

    it("should support ERC725X interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC725X
      );
      expect(result).to.be.true;
    });

    it("should support ERC725Y interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC725Y
      );
      expect(result).to.be.true;
    });

    it("should support LSP0 (ERC725Account) interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.LSP0ERC725Account
      );
      expect(result).to.be.true;
    });

    it("should support LSP1 interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.LSP1UniversalReceiver
      );
      expect(result).to.be.true;
    });

    it("should support LSP14Ownable2Step interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.LSP14Ownable2Step
      );
      expect(result).to.be.true;
    });

    it("should support LSP17Extendable interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.LSP17Extendable
      );
      expect(result).to.be.true;
    });

    it("should have set key 'SupportedStandards:LSP3UniversalProfile'", async () => {
      const result = await context.universalProfile["getData(bytes32)"](
        SupportedStandards.LSP3UniversalProfile.key
      );

      expect(result).to.equal(SupportedStandards.LSP3UniversalProfile.value);
    });
  });
};
