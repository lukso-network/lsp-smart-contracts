import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { EIP191Signer } from "@lukso/eip191-signer.js";

import { TargetContract, TargetContract__factory } from "../../../types";

// constants
import {
  ALL_PERMISSIONS,
  ERC725YKeys,
  OPERATION_TYPES,
  LSP6_VERSION,
  PERMISSIONS,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";
import { LOCAL_PRIVATE_KEYS, combineAllowedCalls } from "../../utils/helpers";

export const shouldBehaveLikeMultiChannelNonce = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let signer: SignerWithAddress, relayer: SignerWithAddress;
  let targetContract: TargetContract;

  before(async () => {
    context = await buildContext();

    signer = context.accounts[1];
    relayer = context.accounts[2];

    targetContract = await new TargetContract__factory(
      context.accounts[0]
    ).deploy();

    const permissionKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        signer.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
        signer.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
        signer.address.substring(2),
    ];

    const permissionsValues = [
      ALL_PERMISSIONS,
      PERMISSIONS.CALL,
      combineAllowedCalls(
        ["0xffffffff"],
        [targetContract.address],
        ["0xffffffff"]
      ),
      combineAllowedCalls(
        ["0xffffffff"],
        [targetContract.address],
        ["0xffffffff"]
      ),
    ];

    await setupKeyManager(context, permissionKeys, permissionsValues);
  });

  describe("when calling `getNonce(...)` with a channel ID greater than 2 ** 128", () => {
    it("should revert", async () => {
      let channelId = ethers.BigNumber.from(2).pow(129);

      await expect(context.keyManager.getNonce(signer.address, channelId)).to.be
        .revertedWithPanic;
    });
  });

  describe("testing sequential nonces (channel = 0)", () => {
    let channelId = 0;
    let latestNonce;

    beforeEach(async () => {
      latestNonce = await context.keyManager.callStatic.getNonce(
        signer.address,
        channelId
      );
    });

    [
      { callNb: "First", newName: "Yamen", expectedNonce: latestNonce + 1 },
      { callNb: "Second", newName: "Nour", expectedNonce: latestNonce + 1 },
      { callNb: "Third", newName: "Huss", expectedNonce: latestNonce + 1 },
      { callNb: "Fourth", newName: "Moussa", expectedNonce: latestNonce + 1 },
    ].forEach(({ callNb, newName, expectedNonce }) => {
      it(`${callNb} call > nonce should increment from ${latestNonce} to ${expectedNonce}`, async () => {
        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]
        );

        const HARDHAT_CHAINID = 31337;
        let valueToSend = 0;

        let encodedMessage = ethers.utils.solidityPack(
          ["uint256", "uint256", "uint256", "uint256", "bytes"],
          [
            LSP6_VERSION,
            HARDHAT_CHAINID,
            latestNonce,
            valueToSend,
            executeRelayCallPayload,
          ]
        );

        let eip191Signer = new EIP191Signer();

        let { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1
        );

        await context.keyManager.executeRelayCall(
          signature,
          latestNonce,
          executeRelayCallPayload,
          { value: valueToSend }
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await context.keyManager.callStatic.getNonce(
          signer.address,
          0
        );

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(latestNonce.add(1)); // ensure the nonce incremented
      });
    });
  });

  describe("out of order execution (channel = n)", () => {
    let nonces = [0, 1];

    describe("channel 1", () => {
      let channelId = 1;
      let names = ["Fabian", "Yamen"];

      it(`First call > nonce should increment from ${nonces[0]} to ${
        nonces[0] + 1
      }`, async () => {
        let nonceBefore = await context.keyManager.callStatic.getNonce(
          signer.address,
          channelId
        );
        let newName = names[0];

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]
        );

        const HARDHAT_CHAINID = 31337;
        let valueToSend = 0;

        let encodedMessage = ethers.utils.solidityPack(
          ["uint256", "uint256", "uint256", "uint256", "bytes"],
          [
            LSP6_VERSION,
            HARDHAT_CHAINID,
            nonceBefore,
            valueToSend,
            executeRelayCallPayload,
          ]
        );

        let eip191Signer = new EIP191Signer();

        let { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1
        );

        await context.keyManager
          .connect(relayer)
          .executeRelayCall(signature, nonceBefore, executeRelayCallPayload, {
            value: valueToSend,
          });

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await context.keyManager.callStatic.getNonce(
          signer.address,
          channelId
        );

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(nonceBefore.add(1)); // ensure the nonce incremented
      });

      it(`Second call > nonce should increment from ${nonces[1]} to ${
        nonces[1] + 1
      }`, async () => {
        let nonceBefore = await context.keyManager.getNonce(
          signer.address,
          channelId
        );
        let newName = names[1];

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]
        );

        const HARDHAT_CHAINID = 31337;
        let valueToSend = 0;

        let encodedMessage = ethers.utils.solidityPack(
          ["uint256", "uint256", "uint256", "uint256", "bytes"],
          [
            LSP6_VERSION,
            HARDHAT_CHAINID,
            nonceBefore,
            valueToSend,
            executeRelayCallPayload,
          ]
        );

        let eip191Signer = new EIP191Signer();

        let { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1
        );

        await context.keyManager
          .connect(relayer)
          .executeRelayCall(signature, nonceBefore, executeRelayCallPayload, {
            value: valueToSend,
          });

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await context.keyManager.callStatic.getNonce(
          signer.address,
          channelId
        );

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    describe("channel 2", () => {
      let channelId = 2;
      let names = ["Hugo", "Reto"];

      it(`First call > nonce should increment from ${nonces[0]} to ${
        nonces[0] + 1
      }`, async () => {
        let nonceBefore = await context.keyManager.getNonce(
          signer.address,
          channelId
        );
        let newName = names[0];

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]
        );

        const HARDHAT_CHAINID = 31337;
        let valueToSend = 0;

        let encodedMessage = ethers.utils.solidityPack(
          ["uint256", "uint256", "uint256", "uint256", "bytes"],
          [
            LSP6_VERSION,
            HARDHAT_CHAINID,
            nonceBefore,
            valueToSend,
            executeRelayCallPayload,
          ]
        );

        let eip191Signer = new EIP191Signer();

        let { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1
        );

        await context.keyManager
          .connect(relayer)
          .executeRelayCall(signature, nonceBefore, executeRelayCallPayload, {
            value: valueToSend,
          });

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await context.keyManager.callStatic.getNonce(
          signer.address,
          channelId
        );

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(nonceBefore.add(1)); // ensure the nonce incremented
      });

      it(`Second call > nonce should increment from ${nonces[1]} to ${
        nonces[1] + 1
      }`, async () => {
        let nonceBefore = await context.keyManager.getNonce(
          signer.address,
          channelId
        );
        let newName = names[1];

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]
        );

        const HARDHAT_CHAINID = 31337;
        let valueToSend = 0;

        let encodedMessage = ethers.utils.solidityPack(
          ["uint256", "uint256", "uint256", "uint256", "bytes"],
          [
            LSP6_VERSION,
            HARDHAT_CHAINID,
            nonceBefore,
            valueToSend,
            executeRelayCallPayload,
          ]
        );

        let eip191Signer = new EIP191Signer();

        let { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1
        );

        await context.keyManager
          .connect(relayer)
          .executeRelayCall(signature, nonceBefore, executeRelayCallPayload, {
            value: valueToSend,
          });

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await context.keyManager.callStatic.getNonce(
          signer.address,
          channelId
        );

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    describe("channel 3", () => {
      let channelId = 3;
      let names = ["Jean", "Lenny"];

      it(`First call > nonce should increment from ${nonces[0]} to ${
        nonces[0] + 1
      }`, async () => {
        let nonceBefore = await context.keyManager.getNonce(
          signer.address,
          channelId
        );
        let newName = names[0];

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]
        );

        const HARDHAT_CHAINID = 31337;
        let valueToSend = 0;

        let encodedMessage = ethers.utils.solidityPack(
          ["uint256", "uint256", "uint256", "uint256", "bytes"],
          [
            LSP6_VERSION,
            HARDHAT_CHAINID,
            nonceBefore,
            valueToSend,
            executeRelayCallPayload,
          ]
        );

        let eip191Signer = new EIP191Signer();

        let { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1
        );

        await context.keyManager
          .connect(relayer)
          .executeRelayCall(signature, nonceBefore, executeRelayCallPayload, {
            value: valueToSend,
          });

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await context.keyManager.callStatic.getNonce(
          signer.address,
          channelId
        );

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(nonceBefore.add(1)); // ensure the nonce incremented
      });

      it(`Second call > nonce should increment from ${nonces[1]} to ${
        nonces[1] + 1
      }`, async () => {
        let nonceBefore = await context.keyManager.getNonce(
          signer.address,
          channelId
        );
        let newName = names[1];

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]
        );

        const HARDHAT_CHAINID = 31337;
        let valueToSend = 0;

        let encodedMessage = ethers.utils.solidityPack(
          ["uint256", "uint256", "uint256", "uint256", "bytes"],
          [
            LSP6_VERSION,
            HARDHAT_CHAINID,
            nonceBefore,
            valueToSend,
            executeRelayCallPayload,
          ]
        );

        let eip191Signer = new EIP191Signer();

        let { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1
        );

        await context.keyManager
          .connect(relayer)
          .executeRelayCall(signature, nonceBefore, executeRelayCallPayload, {
            value: valueToSend,
          });

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await context.keyManager.callStatic.getNonce(
          signer.address,
          channelId
        );

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    describe("channel 15", () => {
      let channelId = 15;
      it("First call > nonce should increment from 0 to 1", async () => {
        let nonceBefore = await context.keyManager.getNonce(
          signer.address,
          channelId
        );
        let newName = "Lukasz";

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]
        );

        const HARDHAT_CHAINID = 31337;
        let valueToSend = 0;

        let encodedMessage = ethers.utils.solidityPack(
          ["uint256", "uint256", "uint256", "uint256", "bytes"],
          [
            LSP6_VERSION,
            HARDHAT_CHAINID,
            nonceBefore,
            valueToSend,
            executeRelayCallPayload,
          ]
        );

        let eip191Signer = new EIP191Signer();

        let { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1
        );

        await context.keyManager
          .connect(relayer)
          .executeRelayCall(signature, nonceBefore, executeRelayCallPayload, {
            value: valueToSend,
          });

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await context.keyManager.callStatic.getNonce(
          signer.address,
          channelId
        );

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });
  });
};
