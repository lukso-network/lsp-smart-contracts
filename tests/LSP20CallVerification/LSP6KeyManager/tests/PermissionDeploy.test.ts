import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { calculateCreate2 } from "eth-create2-calculator";
import { EIP191Signer } from "@lukso/eip191-signer.js";

import { TargetContract__factory } from "../../../../types";

// constants
import {
  ERC725YDataKeys,
  ALL_PERMISSIONS,
  LSP6_VERSION,
  PERMISSIONS,
  OPERATION_TYPES,
} from "../../../../constants";

// setup
import { LSP6TestContext } from "../../../utils/context";
import { setupKeyManager } from "../../../utils/fixtures";

import { LOCAL_PRIVATE_KEYS } from "../../../utils/helpers";

export const shouldBehaveLikePermissionDeploy = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let addressCanDeploy: SignerWithAddress,
    addressCannotDeploy: SignerWithAddress;

  beforeEach(async () => {
    context = await buildContext();

    addressCanDeploy = context.accounts[1];
    addressCannotDeploy = context.accounts[2];

    const permissionKeys = [
      ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanDeploy.address.substring(2),
      ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
        addressCannotDeploy.address.substring(2),
    ];

    const permissionsValues = [
      ALL_PERMISSIONS,
      PERMISSIONS.DEPLOY,
      PERMISSIONS.CALL,
    ];

    await setupKeyManager(context, permissionKeys, permissionsValues);
  });

  describe("when caller has ALL PERMISSIONS", () => {
    it("should be allowed to deploy a contract TargetContract via CREATE", async () => {
      let contractBytecodeToDeploy = TargetContract__factory.bytecode;

      const expectedContractAddress = await context.universalProfile.callStatic[
        "execute(uint256,address,uint256,bytes)"
      ](
        OPERATION_TYPES.CREATE, // operation type
        ethers.constants.AddressZero, // recipient
        0, // value
        contractBytecodeToDeploy
      );

      await expect(
        context.universalProfile
          .connect(context.owner)
          ["execute(uint256,address,uint256,bytes)"](
            OPERATION_TYPES.CREATE, // operation type
            ethers.constants.AddressZero, // recipient
            0, // value
            contractBytecodeToDeploy
          )
      )
        .to.emit(context.universalProfile, "ContractCreated")
        .withArgs(
          OPERATION_TYPES.CREATE,
          ethers.utils.getAddress(expectedContractAddress),
          0,
          ethers.utils.hexZeroPad("0x00", 32)
        );
    });

    it("should be allowed to deploy a contract TargetContract via CREATE2", async () => {
      let contractBytecodeToDeploy = TargetContract__factory.bytecode;
      let salt =
        "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";

      let preComputedAddress = calculateCreate2(
        context.universalProfile.address,
        salt,
        contractBytecodeToDeploy
      ).toLowerCase();

      await expect(
        context.universalProfile
          .connect(context.owner)
          ["execute(uint256,address,uint256,bytes)"](
            OPERATION_TYPES.CREATE2,
            ethers.constants.AddressZero,
            0,
            contractBytecodeToDeploy + salt.substring(2)
          )
      )
        .to.emit(context.universalProfile, "ContractCreated")
        .withArgs(
          OPERATION_TYPES.CREATE2,
          ethers.utils.getAddress(preComputedAddress),
          0,
          salt
        );
    });
  });

  describe("when caller is an address with permission DEPLOY", () => {
    it("should be allowed to deploy a contract TargetContract via CREATE", async () => {
      let contractBytecodeToDeploy = TargetContract__factory.bytecode;

      const expectedContractAddress = await context.universalProfile
        .connect(addressCanDeploy)
        .callStatic["execute(uint256,address,uint256,bytes)"](
          OPERATION_TYPES.CREATE,
          ethers.constants.AddressZero,
          0,
          contractBytecodeToDeploy
        );

      await expect(
        context.universalProfile
          .connect(addressCanDeploy)
          ["execute(uint256,address,uint256,bytes)"](
            OPERATION_TYPES.CREATE,
            ethers.constants.AddressZero,
            0,
            contractBytecodeToDeploy
          )
      )
        .to.emit(context.universalProfile, "ContractCreated")
        .withArgs(
          OPERATION_TYPES.CREATE,
          ethers.utils.getAddress(expectedContractAddress),
          0,
          ethers.utils.hexZeroPad("0x00", 32)
        );
    });

    it("should be allowed to deploy a contract TargetContract via CREATE2", async () => {
      let contractBytecodeToDeploy = TargetContract__factory.bytecode;
      let salt =
        "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";

      let preComputedAddress = calculateCreate2(
        context.universalProfile.address,
        salt,
        contractBytecodeToDeploy
      ).toLowerCase();

      await expect(
        context.universalProfile
          .connect(addressCanDeploy)
          ["execute(uint256,address,uint256,bytes)"](
            OPERATION_TYPES.CREATE2,
            ethers.constants.AddressZero,
            0,
            contractBytecodeToDeploy + salt.substring(2)
          )
      )
        .to.emit(context.universalProfile, "ContractCreated")
        .withArgs(
          OPERATION_TYPES.CREATE2,
          ethers.utils.getAddress(preComputedAddress),
          0,
          salt
        );
    });
  });

  describe("when caller is an address that does not have the permission DEPLOY", () => {
    describe("-> interacting via execute(...)", () => {
      it("should revert when trying to deploy a contract via CREATE", async () => {
        let contractBytecodeToDeploy = TargetContract__factory.bytecode;

        await expect(
          context.universalProfile
            .connect(addressCannotDeploy)
            ["execute(uint256,address,uint256,bytes)"](
              OPERATION_TYPES.CREATE,
              ethers.constants.AddressZero,
              0,
              contractBytecodeToDeploy
            )
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(addressCannotDeploy.address, "DEPLOY");
      });

      it("should revert when trying to deploy a contract via CREATE2", async () => {
        let contractBytecodeToDeploy = TargetContract__factory.bytecode;
        let salt =
          "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";

        await expect(
          context.universalProfile
            .connect(addressCannotDeploy)
            ["execute(uint256,address,uint256,bytes)"](
              OPERATION_TYPES.CREATE2,
              ethers.constants.AddressZero,
              0,
              contractBytecodeToDeploy + salt.substring(2)
            )
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(addressCannotDeploy.address, "DEPLOY");
      });
    });

    describe("-> interacting via executeRelayCall(...)", () => {
      describe("when deploying a contract via CREATE", () => {
        describe("when signing with Ethereum Signed Message", () => {
          it("should recover the wrong signer address and revert with `NoPermissionsSet`", async () => {
            let contractBytecodeToDeploy = TargetContract__factory.bytecode;

            let nonce = await context.keyManager.callStatic.getNonce(
              addressCannotDeploy.address,
              0
            );

            let payload = context.universalProfile.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CREATE,
                ethers.constants.AddressZero,
                0,
                contractBytecodeToDeploy,
              ]
            );

            const HARDHAT_CHAINID = 31337;
            let valueToSend = 0;

            let encodedMessage = ethers.utils.solidityPack(
              ["uint256", "uint256", "uint256", "uint256", "bytes"],
              [LSP6_VERSION, HARDHAT_CHAINID, nonce, valueToSend, payload]
            );

            let ethereumSignature = await addressCannotDeploy.signMessage(
              encodedMessage
            );

            const eip191Signer = new EIP191Signer();

            const incorrectSignerAddress = eip191Signer.recover(
              eip191Signer.hashDataWithIntendedValidator(
                context.keyManager.address,
                encodedMessage
              ),
              ethereumSignature
            );

            await expect(
              context.keyManager
                .connect(addressCannotDeploy)
                ["executeRelayCall(bytes,uint256,bytes)"](
                  ethereumSignature,
                  nonce,
                  payload,
                  {
                    value: valueToSend,
                  }
                )
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NoPermissionsSet"
              )
              .withArgs(incorrectSignerAddress);
          });
        });

        describe("when signing with EIP191Signer '\\x19\\x00'", () => {
          it("should revert with `NotAuthorised` with correct signer address but missing permission DEPLOY", async () => {
            let contractBytecodeToDeploy = TargetContract__factory.bytecode;

            let nonce = await context.keyManager.callStatic.getNonce(
              addressCannotDeploy.address,
              0
            );

            let payload = context.universalProfile.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CREATE,
                ethers.constants.AddressZero,
                0,
                contractBytecodeToDeploy,
              ]
            );

            const HARDHAT_CHAINID = 31337;
            let valueToSend = 0;

            let encodedMessage = ethers.utils.solidityPack(
              ["uint256", "uint256", "uint256", "uint256", "bytes"],
              [LSP6_VERSION, HARDHAT_CHAINID, nonce, valueToSend, payload]
            );

            const eip191Signer = new EIP191Signer();

            const { signature } = eip191Signer.signDataWithIntendedValidator(
              context.keyManager.address,
              encodedMessage,
              LOCAL_PRIVATE_KEYS.ACCOUNT2
            );

            await expect(
              context.keyManager
                .connect(addressCannotDeploy)
                ["executeRelayCall(bytes,uint256,bytes)"](
                  signature,
                  nonce,
                  payload,
                  {
                    value: valueToSend,
                  }
                )
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(addressCannotDeploy.address, "DEPLOY");
          });
        });
      });

      describe("when deploying a contract via CREATE2", () => {
        describe("when signing with Ethereum Signed Message", () => {
          it("should recover the wrong signer address and revert with `NoPermissionsSet`", async () => {
            let contractBytecodeToDeploy = TargetContract__factory.bytecode;
            let salt =
              "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";

            let nonce = await context.keyManager.callStatic.getNonce(
              addressCannotDeploy.address,
              0
            );

            let payload = context.universalProfile.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CREATE2,
                ethers.constants.AddressZero,
                0,
                contractBytecodeToDeploy + salt.substring(2),
              ]
            );

            const HARDHAT_CHAINID = 31337;
            let valueToSend = 0;

            let encodedMessage = ethers.utils.solidityPack(
              ["uint256", "uint256", "uint256", "uint256", "bytes"],
              [LSP6_VERSION, HARDHAT_CHAINID, nonce, valueToSend, payload]
            );

            let ethereumSignature = await addressCannotDeploy.signMessage(
              encodedMessage
            );

            const eip191Signer = new EIP191Signer();
            const incorrectSignerAddress = eip191Signer.recover(
              eip191Signer.hashDataWithIntendedValidator(
                context.keyManager.address,
                encodedMessage
              ),
              ethereumSignature
            );

            await expect(
              context.keyManager
                .connect(addressCannotDeploy)
                ["executeRelayCall(bytes,uint256,bytes)"](
                  ethereumSignature,
                  nonce,
                  payload,
                  {
                    value: valueToSend,
                  }
                )
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NoPermissionsSet"
              )
              .withArgs(incorrectSignerAddress);
          });
        });

        describe("when signing with EIP191Signer '\\x19\\x00'", () => {
          it("should revert with `NotAuthorised` with correct signer address but missing permission DEPLOY", async () => {
            let contractBytecodeToDeploy = TargetContract__factory.bytecode;
            let salt =
              "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";

            let nonce = await context.keyManager.callStatic.getNonce(
              addressCannotDeploy.address,
              0
            );

            let payload = context.universalProfile.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CREATE2,
                ethers.constants.AddressZero,
                0,
                contractBytecodeToDeploy + salt.substring(2),
              ]
            );

            const HARDHAT_CHAINID = 31337;
            let valueToSend = 0;

            let encodedMessage = ethers.utils.solidityPack(
              ["uint256", "uint256", "uint256", "uint256", "bytes"],
              [LSP6_VERSION, HARDHAT_CHAINID, nonce, valueToSend, payload]
            );

            const lsp6Signer = new EIP191Signer();

            const { signature } = lsp6Signer.signDataWithIntendedValidator(
              context.keyManager.address,
              encodedMessage,
              LOCAL_PRIVATE_KEYS.ACCOUNT2
            );

            await expect(
              context.keyManager
                .connect(addressCannotDeploy)
                ["executeRelayCall(bytes,uint256,bytes)"](
                  signature,
                  nonce,
                  payload,
                  {
                    value: valueToSend,
                  }
                )
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(addressCannotDeploy.address, "DEPLOY");
          });
        });
      });
    });
  });
};
