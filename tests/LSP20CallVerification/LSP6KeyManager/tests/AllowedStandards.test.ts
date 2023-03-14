import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  SignatureValidator,
  SignatureValidator__factory,
  TargetContract,
  TargetContract__factory,
  UniversalProfile,
  UniversalProfile__factory,
  LSP7Mintable,
  LSP7Mintable__factory,
} from "../../../types";

// constants
import {
  ALL_PERMISSIONS,
  ERC1271_VALUES,
  ERC725YDataKeys,
  INTERFACE_IDS,
  OPERATION_TYPES,
  PERMISSIONS,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// helpers
import {
  abiCoder,
  provider,
  combinePermissions,
  combineAllowedCalls,
} from "../../utils/helpers";

export const shouldBehaveLikeAllowedStandards = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let addressCanInteractOnlyWithERC1271: SignerWithAddress,
    addressCanInteractOnlyWithLSP7: SignerWithAddress;

  let targetContract: TargetContract,
    signatureValidatorContract: SignatureValidator,
    otherUniversalProfile: UniversalProfile;

  before(async () => {
    context = await buildContext();

    addressCanInteractOnlyWithERC1271 = context.accounts[1];
    addressCanInteractOnlyWithLSP7 = context.accounts[2];

    targetContract = await new TargetContract__factory(
      context.accounts[0]
    ).deploy();
    signatureValidatorContract = await new SignatureValidator__factory(
      context.accounts[0]
    ).deploy();

    // test to interact with an other UniversalProfile (e.g.: transfer LYX)
    otherUniversalProfile = await new UniversalProfile__factory(
      context.accounts[3]
    ).deploy(context.accounts[3].address);

    let permissionsKeys = [
      ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanInteractOnlyWithERC1271.address.substring(2),
      ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanInteractOnlyWithLSP7.address.substring(2),
      ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
        addressCanInteractOnlyWithERC1271.address.substring(2),
      ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
        addressCanInteractOnlyWithLSP7.address.substring(2),
    ];

    let permissionsValues = [
      ALL_PERMISSIONS,
      combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
      combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
      combineAllowedCalls(
        [INTERFACE_IDS.ERC1271],
        ["0xffffffffffffffffffffffffffffffffffffffff"],
        ["0xffffffff"]
      ),
      combineAllowedCalls(
        [INTERFACE_IDS.LSP7DigitalAsset],
        ["0xffffffffffffffffffffffffffffffffffffffff"],
        ["0xffffffff"]
      ),
    ];

    await setupKeyManager(context, permissionsKeys, permissionsValues);

    await context.owner.sendTransaction({
      to: context.universalProfile.address,
      value: ethers.utils.parseEther("10"),
    });
  });

  describe("when caller has no value set for ALLOWEDSTANDARDS (= all interfaces whitelisted)", () => {
    it("should allow to interact with contract that does not implement any interface", async () => {
      let newName = "Some Name";
      let targetPayload = targetContract.interface.encodeFunctionData(
        "setName",
        [newName]
      );

      let upPayload = context.universalProfile.interface.encodeFunctionData(
        "execute(uint256,address,uint256,bytes)",
        [OPERATION_TYPES.CALL, targetContract.address, 0, targetPayload]
      );

      await context.keyManager
        .connect(context.owner)
        ["execute(bytes)"](upPayload);
      let result = await targetContract.callStatic.getName();

      expect(result).to.equal(newName);
    });

    describe("should allow to interact with a contract that implement (+ register) any interface", () => {
      it("ERC1271", async () => {
        let sampleHash = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("Sample Message")
        );
        let sampleSignature = await context.owner.signMessage("Sample Message");

        let payload = signatureValidatorContract.interface.encodeFunctionData(
          "isValidSignature",
          [sampleHash, sampleSignature]
        );

        let upPayload = context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, signatureValidatorContract.address, 0, payload]
        );

        let data = await context.keyManager
          .connect(context.owner)
          .callStatic["execute(bytes)"](upPayload);
        let [result] = abiCoder.decode(["bytes4"], data);
        expect(result).to.equal(ERC1271_VALUES.MAGIC_VALUE);
      });

      it("LSP0 (ERC725Account)", async () => {
        let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Key"));
        let value = "0xcafecafecafecafe";

        let setDataPayload =
          context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

        await context.keyManager
          .connect(context.owner)
          ["execute(bytes)"](setDataPayload);

        const result = await context.universalProfile.callStatic[
          "getData(bytes32)"
        ](key);
        expect(result).to.equal(value);
      });
    });
  });

  describe("when caller has only ERC1271 interface ID set for ALLOWED STANDARDS", () => {
    describe("when interacting with a contract that implements + register ERC1271 interface", () => {
      it("should pass", async () => {
        let sampleHash = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("Sample Message")
        );
        let sampleSignature =
          await addressCanInteractOnlyWithERC1271.signMessage("Sample Message");

        let payload = signatureValidatorContract.interface.encodeFunctionData(
          "isValidSignature",
          [sampleHash, sampleSignature]
        );

        let upPayload = context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, signatureValidatorContract.address, 0, payload]
        );

        let data = await context.keyManager
          .connect(addressCanInteractOnlyWithERC1271)
          .callStatic["execute(bytes)"](upPayload);
        let [result] = abiCoder.decode(["bytes4"], data);
        expect(result).to.equal(ERC1271_VALUES.MAGIC_VALUE);
      });
    });

    describe("when trying to interact an ERC725Account (LSP0)", () => {
      it("should allow to transfer LYX", async () => {
        let initialAccountBalance = await provider.getBalance(
          otherUniversalProfile.address
        );

        let transferLyxPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [
              OPERATION_TYPES.CALL,
              otherUniversalProfile.address,
              ethers.utils.parseEther("1"),
              "0x",
            ]
          );

        await context.keyManager
          .connect(addressCanInteractOnlyWithERC1271)
          ["execute(bytes)"](transferLyxPayload);

        let newAccountBalance = await provider.getBalance(
          otherUniversalProfile.address
        );
        expect(newAccountBalance).to.be.gt(initialAccountBalance);
      });
    });

    describe("when interacting with contract that does not implement ERC1271", () => {
      it("should fail", async () => {
        let targetPayload = targetContract.interface.encodeFunctionData(
          "setName",
          ["New Name"]
        );

        let upPayload = context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, targetContract.address, 0, targetPayload]
        );

        await expect(
          context.keyManager
            .connect(addressCanInteractOnlyWithERC1271)
            ["execute(bytes)"](upPayload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAllowedCall")
          .withArgs(
            addressCanInteractOnlyWithERC1271.address,
            targetContract.address,
            targetContract.interface.getSighash("setName")
          );
      });
    });
  });

  describe("when caller has only LSP7 interface ID set for ALLOWED STANDARDS", () => {
    describe("when interacting with a contract that implements + register ERC1271 interface", () => {
      it("should fail", async () => {
        let sampleHash = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("Sample Message")
        );
        let sampleSignature = await addressCanInteractOnlyWithLSP7.signMessage(
          "Sample Message"
        );

        let payload = signatureValidatorContract.interface.encodeFunctionData(
          "isValidSignature",
          [sampleHash, sampleSignature]
        );

        let upPayload = context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, signatureValidatorContract.address, 0, payload]
        );

        await expect(
          context.keyManager
            .connect(addressCanInteractOnlyWithLSP7)
            ["execute(bytes)"](upPayload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAllowedCall")
          .withArgs(
            addressCanInteractOnlyWithLSP7.address,
            signatureValidatorContract.address,
            signatureValidatorContract.interface.getSighash("isValidSignature")
          );
      });
    });

    describe("when interacting with an ERC725Account (LSP0)", () => {
      it("should fail when trying to transfer LYX", async () => {
        let transferLyxPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [
              OPERATION_TYPES.CALL,
              otherUniversalProfile.address,
              ethers.utils.parseEther("1"),
              "0x",
            ]
          );

        await expect(
          context.keyManager
            .connect(addressCanInteractOnlyWithLSP7)
            ["execute(bytes)"](transferLyxPayload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAllowedCall")
          .withArgs(
            addressCanInteractOnlyWithLSP7.address,
            otherUniversalProfile.address,
            "0x00000000"
          );
      });
    });

    describe("should be allowed to interact with any LSP7 token contracts", () => {
      let lsp7TokenA: LSP7Mintable;
      let lsp7TokenB: LSP7Mintable;
      let lsp7TokenC: LSP7Mintable;

      beforeEach(async () => {
        lsp7TokenA = await new LSP7Mintable__factory(
          context.accounts[0]
        ).deploy("LSP7 Token A", "TKNA", context.accounts[0].address, false);

        lsp7TokenB = await new LSP7Mintable__factory(
          context.accounts[0]
        ).deploy("LSP7 Token B", "TKNB", context.accounts[0].address, false);

        lsp7TokenC = await new LSP7Mintable__factory(
          context.accounts[0]
        ).deploy("LSP7 Token C", "TKNC", context.accounts[0].address, false);

        await lsp7TokenA
          .connect(context.accounts[0])
          .mint(context.universalProfile.address, 100, false, "0x");

        await lsp7TokenB
          .connect(context.accounts[0])
          .mint(context.universalProfile.address, 100, false, "0x");

        await lsp7TokenC
          .connect(context.accounts[0])
          .mint(context.universalProfile.address, 100, false, "0x");
      });

      it("-> interacting with lsp7TokenA", async () => {
        const recipient = context.accounts[5].address;
        const amount = 10;

        const transferPayload = lsp7TokenA.interface.encodeFunctionData(
          "transfer",
          [context.universalProfile.address, recipient, amount, true, "0x"]
        );

        const executePayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, lsp7TokenA.address, 0, transferPayload]
          );

        await context.keyManager
          .connect(addressCanInteractOnlyWithLSP7)
          ["execute(bytes)"](executePayload);

        expect(await lsp7TokenA.balanceOf(recipient)).to.equal(amount);
        expect(
          await lsp7TokenA.balanceOf(context.universalProfile.address)
        ).to.equal(90);
      });

      it("-> interacting with lsp7TokenB", async () => {
        const recipient = context.accounts[5].address;
        const amount = 10;

        const transferPayload = lsp7TokenB.interface.encodeFunctionData(
          "transfer",
          [context.universalProfile.address, recipient, amount, true, "0x"]
        );

        const executePayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, lsp7TokenB.address, 0, transferPayload]
          );

        await context.keyManager
          .connect(addressCanInteractOnlyWithLSP7)
          ["execute(bytes)"](executePayload);

        expect(await lsp7TokenB.balanceOf(recipient)).to.equal(amount);
        expect(
          await lsp7TokenB.balanceOf(context.universalProfile.address)
        ).to.equal(90);
      });

      it("-> interacting with lsp7TokenC", async () => {
        const recipient = context.accounts[5].address;
        const amount = 10;

        const transferPayload = lsp7TokenC.interface.encodeFunctionData(
          "transfer",
          [context.universalProfile.address, recipient, amount, true, "0x"]
        );

        const executePayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, lsp7TokenC.address, 0, transferPayload]
          );

        await context.keyManager
          .connect(addressCanInteractOnlyWithLSP7)
          ["execute(bytes)"](executePayload);

        expect(await lsp7TokenC.balanceOf(recipient)).to.equal(amount);
        expect(
          await lsp7TokenC.balanceOf(context.universalProfile.address)
        ).to.equal(90);
      });
    });
  });
};
