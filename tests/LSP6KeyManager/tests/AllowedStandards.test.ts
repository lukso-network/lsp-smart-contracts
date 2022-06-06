import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  SignatureValidator,
  SignatureValidator__factory,
  TargetContract,
  TargetContract__factory,
  UniversalProfile,
  UniversalProfile__factory,
} from "../../../types";

// constants
import {
  ALL_PERMISSIONS,
  ERC1271_VALUES,
  ERC725YKeys,
  INTERFACE_IDS,
  OPERATION_TYPES,
  PERMISSIONS,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// helpers
import { abiCoder, provider } from "../../utils/helpers";

export const shouldBehaveLikeAllowedStandards = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let addressCanInteractOnlyWithERC1271: SignerWithAddress,
    addressCanInteractOnlyWithLSP7: SignerWithAddress;

  let targetContract: TargetContract,
    signatureValidatorContract: SignatureValidator,
    otherUniversalProfile: UniversalProfile;

  beforeEach(async () => {
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
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanInteractOnlyWithERC1271.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanInteractOnlyWithLSP7.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
        addressCanInteractOnlyWithERC1271.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
        addressCanInteractOnlyWithLSP7.address.substring(2),
    ];

    let permissionsValues = [
      ALL_PERMISSIONS,
      ethers.utils.hexZeroPad(
        parseInt(Number(PERMISSIONS.CALL)) +
          parseInt(Number(PERMISSIONS.TRANSFERVALUE)),
        32
      ),
      ethers.utils.hexZeroPad(
        parseInt(Number(PERMISSIONS.CALL)) +
          parseInt(Number(PERMISSIONS.TRANSFERVALUE)),
        32
      ),
      abiCoder.encode(["bytes4[]"], [[INTERFACE_IDS.ERC1271]]),
      abiCoder.encode(["bytes4[]"], [[INTERFACE_IDS.LSP7DigitalAsset]]), // callerTwo
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
        "execute",
        [OPERATION_TYPES.CALL, targetContract.address, 0, targetPayload]
      );

      await context.keyManager.connect(context.owner).execute(upPayload);
      let result = await targetContract.callStatic.getName();

      expect(result).toEqual(newName);
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
          "execute",
          [OPERATION_TYPES.CALL, signatureValidatorContract.address, 0, payload]
        );

        let data = await context.keyManager
          .connect(context.owner)
          .callStatic.execute(upPayload);
        let [result] = abiCoder.decode(["bytes4"], data);
        expect(result).toEqual(ERC1271_VALUES.MAGIC_VALUE);
      });

      it("LSP0 (ERC725Account)", async () => {
        let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Key"));
        let value = "0xcafecafecafecafe";

        let setDataPayload =
          context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

        await context.keyManager.connect(context.owner).execute(setDataPayload);

        const result = await context.universalProfile.callStatic[
          "getData(bytes32)"
        ](key);
        expect(result).toEqual(value);
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
          "execute",
          [OPERATION_TYPES.CALL, signatureValidatorContract.address, 0, payload]
        );

        let data = await context.keyManager
          .connect(addressCanInteractOnlyWithERC1271)
          .callStatic.execute(upPayload);
        let [result] = abiCoder.decode(["bytes4"], data);
        expect(result).toEqual(ERC1271_VALUES.MAGIC_VALUE);
      });
    });

    describe("when trying to interact an ERC725Account (LSP0)", () => {
      it("should allow to transfer LYX", async () => {
        let initialAccountBalance = await provider.getBalance(
          otherUniversalProfile.address
        );

        let transferLyxPayload =
          context.universalProfile.interface.encodeFunctionData("execute", [
            OPERATION_TYPES.CALL,
            otherUniversalProfile.address,
            ethers.utils.parseEther("1"),
            "0x",
          ]);

        await context.keyManager
          .connect(addressCanInteractOnlyWithERC1271)
          .execute(transferLyxPayload);

        let newAccountBalance = await provider.getBalance(
          otherUniversalProfile.address
        );
        expect(parseInt(newAccountBalance)).toBeGreaterThan(
          parseInt(initialAccountBalance)
        );
      });
    });

    describe("when interacting with contract that does not implement ERC1271", () => {
      it("should fail", async () => {
        let targetPayload = targetContract.interface.encodeFunctionData(
          "setName",
          ["New Name"]
        );

        let upPayload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [OPERATION_TYPES.CALL, targetContract.address, 0, targetPayload]
        );

        await expect(
          context.keyManager
            .connect(addressCanInteractOnlyWithERC1271)
            .execute(upPayload)
        ).toBeRevertedWith("Not Allowed Standards");
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
          "execute",
          [OPERATION_TYPES.CALL, signatureValidatorContract.address, 0, payload]
        );

        await expect(
          context.keyManager
            .connect(addressCanInteractOnlyWithLSP7)
            .execute(upPayload)
        ).toBeRevertedWith("Not Allowed Standards");
      });
    });

    describe("when interacting with an ERC725Account (LSP0)", () => {
      it("should fail when trying to transfer LYX", async () => {
        let transferLyxPayload =
          context.universalProfile.interface.encodeFunctionData("execute", [
            OPERATION_TYPES.CALL,
            otherUniversalProfile.address,
            ethers.utils.parseEther("1"),
            "0x",
          ]);

        await expect(
          context.keyManager
            .connect(addressCanInteractOnlyWithLSP7)
            .execute(transferLyxPayload)
        ).toBeRevertedWith("Not Allowed Standard");
      });
    });
  });
};
