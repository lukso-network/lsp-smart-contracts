import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { calculateCreate2 } from "eth-create2-calculator";

import { TargetContract__factory } from "../../../types";

// constants
import {
  ERC725YKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
  OPERATION_TYPES,
  EventSignatures,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

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
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanDeploy.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
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

      let payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [
          OPERATION_TYPES.CREATE, // operation type
          ethers.constants.AddressZero, // recipient
          0, // value
          contractBytecodeToDeploy, // data
        ]
      );

      const expectedContractAddress = await context.keyManager
        .connect(context.owner)
        .callStatic.execute(payload);

      await expect(context.keyManager.connect(context.owner).execute(payload))
        .to.emit(context.universalProfile, "ContractCreated")
        .withArgs(
          OPERATION_TYPES.CREATE,
          ethers.utils.getAddress(expectedContractAddress),
          0
        );
    });

    it("should be allowed to deploy a contract TargetContract via CREATE2", async () => {
      let contractBytecodeToDeploy = TargetContract__factory.bytecode;
      let salt =
        "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";

      let payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [
          OPERATION_TYPES.CREATE2,
          ethers.constants.AddressZero,
          0,
          contractBytecodeToDeploy + salt.substring(2),
        ]
      );

      let preComputedAddress = calculateCreate2(
        context.universalProfile.address,
        salt,
        contractBytecodeToDeploy
      ).toLowerCase();

      await expect(context.keyManager.connect(context.owner).execute(payload))
        .to.emit(context.universalProfile, "ContractCreated")
        .withArgs(
          OPERATION_TYPES.CREATE2,
          ethers.utils.getAddress(preComputedAddress),
          0
        );
    });
  });

  describe("when caller is an address with permission DEPLOY", () => {
    it("should be allowed to deploy a contract TargetContract via CREATE", async () => {
      let contractBytecodeToDeploy = TargetContract__factory.bytecode;

      let payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [
          OPERATION_TYPES.CREATE,
          ethers.constants.AddressZero,
          0,
          contractBytecodeToDeploy,
        ]
      );

      const expectedContractAddress = await context.keyManager
        .connect(addressCanDeploy)
        .callStatic.execute(payload);

      await expect(context.keyManager.connect(context.owner).execute(payload))
        .to.emit(context.universalProfile, "ContractCreated")
        .withArgs(
          OPERATION_TYPES.CREATE,
          ethers.utils.getAddress(expectedContractAddress),
          0
        );
    });

    it("should be allowed to deploy a contract TargetContract via CREATE2", async () => {
      let contractBytecodeToDeploy = TargetContract__factory.bytecode;
      let salt =
        "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";

      let payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [
          OPERATION_TYPES.CREATE2,
          ethers.constants.AddressZero,
          0,
          contractBytecodeToDeploy + salt.substring(2),
        ]
      );

      let preComputedAddress = calculateCreate2(
        context.universalProfile.address,
        salt,
        contractBytecodeToDeploy
      ).toLowerCase();

      await expect(
        context.keyManager.connect(addressCanDeploy).execute(payload)
      )
        .to.emit(context.universalProfile, "ContractCreated")
        .withArgs(
          OPERATION_TYPES.CREATE2,
          ethers.utils.getAddress(preComputedAddress),
          0
        );
    });
  });

  describe("when caller is an address that does not have the permission DEPLOY", () => {
    describe("when calling via execute(...)", () => {
      it("should revert when trying to deploy a contract via CREATE", async () => {
        let contractBytecodeToDeploy = TargetContract__factory.bytecode;

        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CREATE,
            ethers.constants.AddressZero,
            0,
            contractBytecodeToDeploy,
          ]
        );

        await expect(
          context.keyManager.connect(addressCannotDeploy).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(addressCannotDeploy.address, "DEPLOY");
      });

      it("should revert when trying to deploy a contract via CREATE2", async () => {
        let contractBytecodeToDeploy = TargetContract__factory.bytecode;
        let salt =
          "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";

        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CREATE2,
            ethers.constants.AddressZero,
            0,
            contractBytecodeToDeploy + salt.substring(2),
          ]
        );

        await expect(
          context.keyManager.connect(addressCannotDeploy).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(addressCannotDeploy.address, "DEPLOY");
      });
    });

    describe("when calling via executeRelayCall(...)", () => {
      it("should revert when trying to deploy a contract via CREATE", async () => {
        let contractBytecodeToDeploy = TargetContract__factory.bytecode;

        let nonce = await context.keyManager.callStatic.getNonce(
          addressCannotDeploy.address,
          0
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CREATE,
            ethers.constants.AddressZero,
            0,
            contractBytecodeToDeploy,
          ]
        );

        const HARDHAT_CHAINID = 31337;
        let valueToSend = 0;

        let hash = ethers.utils.solidityKeccak256(
          ["uint256", "address", "uint256", "uint256", "bytes"],
          [
            HARDHAT_CHAINID,
            context.keyManager.address,
            nonce,
            valueToSend,
            payload,
          ]
        );

        let signature = await addressCannotDeploy.signMessage(
          ethers.utils.arrayify(hash)
        );

        await expect(
          context.keyManager
            .connect(addressCannotDeploy)
            .executeRelayCall(signature, nonce, payload, { value: valueToSend })
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(addressCannotDeploy.address, "DEPLOY");
      });

      it("should revert when trying to deploy a contract via CREATE2", async () => {
        let contractBytecodeToDeploy = TargetContract__factory.bytecode;

        let nonce = await context.keyManager.callStatic.getNonce(
          addressCannotDeploy.address,
          0
        );

        let salt =
          "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";

        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CREATE2,
            ethers.constants.AddressZero,
            0,
            contractBytecodeToDeploy + salt.substring(2),
          ]
        );

        const HARDHAT_CHAINID = 31337;
        let valueToSend = 0;

        let hash = ethers.utils.solidityKeccak256(
          ["uint256", "address", "uint256", "uint256", "bytes"],
          [
            HARDHAT_CHAINID,
            context.keyManager.address,
            nonce,
            valueToSend,
            payload,
          ]
        );

        let signature = await addressCannotDeploy.signMessage(
          ethers.utils.arrayify(hash)
        );

        await expect(
          context.keyManager
            .connect(addressCannotDeploy)
            .executeRelayCall(signature, nonce, payload, { value: valueToSend })
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(addressCannotDeploy.address, "DEPLOY");
      });
    });
  });
};
