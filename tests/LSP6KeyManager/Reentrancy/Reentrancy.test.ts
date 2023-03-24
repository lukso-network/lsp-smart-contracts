import { expect } from "chai";
import { BigNumber, ethers } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { EIP191Signer } from "@lukso/eip191-signer.js";

// setup
import { LSP6TestContext } from "../../utils/context";
import { buildReentrancyContext } from "./reentrancyHelpers";

// tests
import { testSingleExecuteToSingleExecute } from "./SingleExecuteToSingleExecute.test";
import { testSingleExecuteRelayCallToSingleExecute } from "./SingleExecuteRelayCallToSingleExecute.test";
import { testSingleExecuteToSingleExecuteRelayCall } from "./SingleExecuteToSingleExecuteRelayCall.test";
import { testSingleExecuteRelayCallToSingleExecuteRelayCall } from "./SingleExecuteRelayCallToSingleExecuteRelayCall.test";
import { testSingleExecuteToBatchExecute } from "./SingleExecuteToBatchExecute.test";
import { testSingleExecuteToBatchExecuteRelayCall } from "./SingleExecuteToBatchExecuteRelayCall.test";

import {
  ALL_PERMISSIONS,
  CALLTYPE,
  ERC725YDataKeys,
  LSP1_TYPE_IDS,
  LSP6_VERSION,
  OPERATION_TYPES,
  PERMISSIONS,
} from "../../../constants";

import {
  combineAllowedCalls,
  combineCallTypes,
  combinePermissions,
  encodeCompactBytesArray,
  LOCAL_PRIVATE_KEYS,
  provider,
} from "../../utils/helpers";

import {
  Reentrancy,
  Reentrancy__factory,
  UniversalReceiverDelegateDataUpdater__factory,
} from "../../../types";

import { setupKeyManager } from "../../utils/fixtures";

export const testReentrancyScenarios = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>
) => {
  describe("Basic Reentrancy Scenarios", () => {
    let context: LSP6TestContext;

    let signer: SignerWithAddress,
      relayer: SignerWithAddress,
      attacker: SignerWithAddress;

    let maliciousContract: Reentrancy;

    before(async () => {
      context = await buildContext();

      signer = context.accounts[1];
      relayer = context.accounts[2];
      attacker = context.accounts[4];

      maliciousContract = await new Reentrancy__factory(attacker).deploy(
        context.keyManager.address
      );

      const permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          signer.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          signer.address.substring(2),
      ];

      const permissionValues = [
        ALL_PERMISSIONS,
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
        combineAllowedCalls(
          // TODO: test reentrancy against the bits for the allowed calls
          [
            combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
            combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
          ],
          [signer.address, ethers.constants.AddressZero],
          ["0xffffffff", "0xffffffff"],
          ["0xffffffff", "0xffffffff"]
        ),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);

      // Fund Universal Profile with some LYXe
      await context.owner.sendTransaction({
        to: context.universalProfile.address,
        value: ethers.utils.parseEther("10"),
      });
    });

    describe("when sending LYX to a contract", () => {
      it("Permissions should prevent ReEntrancy and stop malicious contract with a re-entrant receive() function.", async () => {
        // the Universal Profile wants to send 1 x LYX from its UP to another smart contract
        // we assume the UP owner is not aware that some malicious code is present
        // in the fallback function of the target (= recipient) contract
        let transferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [
              OPERATION_TYPES.CALL,
              maliciousContract.address,
              ethers.utils.parseEther("1"),
              "0x",
            ]
          );

        let executePayload = context.keyManager.interface.encodeFunctionData(
          "execute(bytes)",
          [transferPayload]
        );
        // load the malicious payload, that will be executed in the receive function
        // every time the contract receives LYX
        await maliciousContract.loadPayload(executePayload);

        let initialAccountBalance = await provider.getBalance(
          context.universalProfile.address
        );
        let initialAttackerContractBalance = await provider.getBalance(
          maliciousContract.address
        );

        // send LYX to malicious contract
        // at this point, the malicious contract receive function try to drain funds by re-entering the KeyManager
        // this should not be possible since it does not have the permission `REENTRANCY`
        await expect(
          context.keyManager
            .connect(context.owner)
            ["execute(bytes)"](transferPayload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(maliciousContract.address, "REENTRANCY");

        let newAccountBalance = await provider.getBalance(
          context.universalProfile.address
        );
        let newAttackerContractBalance = await provider.getBalance(
          maliciousContract.address
        );

        expect(newAccountBalance).to.equal(initialAccountBalance);
        expect(newAttackerContractBalance).to.equal(
          initialAttackerContractBalance
        );
      });

      describe("when calling via `executeRelayCall(...)`", () => {
        const channelId = 0;

        it("Replay Attack should fail because of invalid nonce", async () => {
          let nonce = await context.keyManager.callStatic.getNonce(
            signer.address,
            channelId
          );

          let executeRelayCallPayload =
            context.universalProfile.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CALL,
                signer.address,
                ethers.utils.parseEther("1"),
                "0x",
              ]
            );

          const HARDHAT_CHAINID = 31337;
          let valueToSend = 0;

          let encodedMessage = ethers.utils.solidityPack(
            ["uint256", "uint256", "uint256", "uint256", "bytes"],
            [
              LSP6_VERSION,
              HARDHAT_CHAINID,
              nonce,
              valueToSend,
              executeRelayCallPayload,
            ]
          );

          const eip191Signer = new EIP191Signer();

          const { signature } =
            await eip191Signer.signDataWithIntendedValidator(
              context.keyManager.address,
              encodedMessage,
              LOCAL_PRIVATE_KEYS.ACCOUNT1
            );

          // first call
          await context.keyManager
            .connect(relayer)
            ["executeRelayCall(bytes,uint256,bytes)"](
              signature,
              nonce,
              executeRelayCallPayload,
              {
                value: valueToSend,
              }
            );

          // 2nd call = replay attack
          await expect(
            context.keyManager
              .connect(relayer)
              ["executeRelayCall(bytes,uint256,bytes)"](
                signature,
                nonce,
                executeRelayCallPayload
              )
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidRelayNonce"
            )
            .withArgs(signer.address, nonce, signature);
        });
      });
    });

    describe("when reentering execute function", () => {
      it("should revert if reentered from a random address", async () => {
        let transferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [
              OPERATION_TYPES.CALL,
              maliciousContract.address,
              ethers.utils.parseEther("1"),
              "0x",
            ]
          );

        let executePayload = context.keyManager.interface.encodeFunctionData(
          "execute(bytes)",
          [transferPayload]
        );

        await maliciousContract.loadPayload(executePayload);

        await expect(
          context.keyManager
            .connect(context.owner)
            ["execute(bytes)"](transferPayload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(maliciousContract.address, "REENTRANCY");
      });

      it("should pass when reentered by URD and the URD has REENTRANCY permission", async () => {
        const URDDummy = await new Reentrancy__factory(context.owner).deploy(
          context.keyManager.address
        );

        const setDataPayload =
          context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [
              [
                ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
                ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
                  URDDummy.address.substring(2),
                ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
                  URDDummy.address.substring(2),
              ],
              [
                URDDummy.address,
                combinePermissions(
                  PERMISSIONS.TRANSFERVALUE,
                  PERMISSIONS.REENTRANCY
                ),
                combineAllowedCalls(
                  [combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL)],
                  [URDDummy.address],
                  ["0xffffffff"],
                  ["0xffffffff"]
                ),
              ],
            ]
          );

        await context.keyManager
          .connect(context.owner)
          ["execute(bytes)"](setDataPayload);

        let transferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [
              OPERATION_TYPES.CALL,
              URDDummy.address,
              ethers.utils.parseEther("1"),
              "0x",
            ]
          );

        let executePayload = context.keyManager.interface.encodeFunctionData(
          "execute(bytes)",
          [transferPayload]
        );

        await URDDummy.loadPayload(executePayload);

        let initialAccountBalance = await provider.getBalance(
          context.universalProfile.address
        );
        let initialAttackerContractBalance = await provider.getBalance(
          maliciousContract.address
        );

        await context.keyManager
          .connect(context.owner)
          ["execute(bytes)"](transferPayload);

        let newAccountBalance = await provider.getBalance(
          context.universalProfile.address
        );
        let newAttackerContractBalance = await provider.getBalance(
          URDDummy.address
        );

        expect(newAccountBalance).to.equal(
          initialAccountBalance.sub(ethers.utils.parseEther("2"))
        );
        expect(newAttackerContractBalance).to.equal(
          initialAttackerContractBalance.add(ethers.utils.parseEther("2"))
        );
      });

      it("should allow the URD to use `setData(..)` through the LSP6", async () => {
        const universalReceiverDelegateDataUpdater =
          await new UniversalReceiverDelegateDataUpdater__factory(
            context.owner
          ).deploy();

        const randomHardcodedKey = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("some random data key")
        );
        const randomHardcodedValue = ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes("some random text for the data value")
        );

        const setDataPayload =
          context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [
              [
                ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
                ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
                  universalReceiverDelegateDataUpdater.address.substring(2),
                ERC725YDataKeys.LSP6[
                  "AddressPermissions:AllowedERC725YDataKeys"
                ] + universalReceiverDelegateDataUpdater.address.substring(2),
              ],
              [
                universalReceiverDelegateDataUpdater.address,
                combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.REENTRANCY),
                encodeCompactBytesArray([randomHardcodedKey]),
              ],
            ]
          );

        await context.keyManager
          .connect(context.owner)
          ["execute(bytes)"](setDataPayload);

        const universalReceiverDelegatePayload =
          universalReceiverDelegateDataUpdater.interface.encodeFunctionData(
            "universalReceiver",
            [LSP1_TYPE_IDS.LSP7Tokens_SenderNotification, "0xcafecafecafecafe"]
          );

        const executePayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [
              OPERATION_TYPES.CALL,
              universalReceiverDelegateDataUpdater.address,
              ethers.utils.parseEther("0"),
              universalReceiverDelegatePayload,
            ]
          );

        await context.keyManager
          .connect(context.owner)
          ["execute(bytes)"](executePayload);

        expect(
          await context.universalProfile["getData(bytes32)"](randomHardcodedKey)
        ).to.equal(randomHardcodedValue);
      });
    });
  });

  describe("first call through `execute(bytes)`, second call through `execute(bytes)`", () => {
    testSingleExecuteToSingleExecute(buildContext, buildReentrancyContext);
  });

  describe("first call through `executeRelayCall(bytes,uint256,bytes)`, second call through `execute(bytes)`", () => {
    testSingleExecuteRelayCallToSingleExecute(
      buildContext,
      buildReentrancyContext
    );
  });

  describe("first call through `execute(bytes)`, second call through `executeRelayCall(bytes,uint256,bytes)`", () => {
    testSingleExecuteToSingleExecuteRelayCall(
      buildContext,
      buildReentrancyContext
    );
  });

  describe("first call through `executeRelayCall(bytes,uint256,bytes)`, second call through `executeRelayCall(bytes,uint256,bytes)`", () => {
    testSingleExecuteRelayCallToSingleExecuteRelayCall(
      buildContext,
      buildReentrancyContext
    );
  });

  describe("first call through `execute(bytes)`, second call through `execute(uint256[],bytes[])`", () => {
    testSingleExecuteToBatchExecute(buildContext, buildReentrancyContext);
  });

  describe("first call through `execute(bytes)`, second call through `executeRelayCall(bytes[],uint256[],uint256[],bytes[])`", () => {
    testSingleExecuteToBatchExecuteRelayCall(
      buildContext,
      buildReentrancyContext
    );
  });
};
