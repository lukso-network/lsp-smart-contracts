import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  Reentrancy,
  Reentrancy__factory,
  TargetContract,
  TargetContract__factory,
  UniversalReceiverDelegateDataUpdater__factory,
} from "../../../../types";

// constants
import {
  ALL_PERMISSIONS,
  ERC725YDataKeys,
  LSP1_TYPE_IDS,
  OPERATION_TYPES,
  PERMISSIONS,
  CALLTYPE,
} from "../../../../constants";

// setup
import { LSP6TestContext } from "../../../utils/context";
import { setupKeyManager } from "../../../utils/fixtures";

// helpers
import {
  provider,
  combinePermissions,
  EMPTY_PAYLOAD,
  combineAllowedCalls,
  combineCallTypes,
  encodeCompactBytesArray,
} from "../../../utils/helpers";

export const testSecurityScenarios = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let signer: SignerWithAddress, addressWithNoPermissions: SignerWithAddress;

  let attacker: SignerWithAddress;

  let targetContract: TargetContract, maliciousContract: Reentrancy;

  before(async () => {
    context = await buildContext();

    signer = context.accounts[1];
    addressWithNoPermissions = context.accounts[3];

    attacker = context.accounts[4];

    targetContract = await new TargetContract__factory(
      context.accounts[0]
    ).deploy();

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

  it("Should revert when caller has no permissions set", async () => {
    let targetContractPayload = targetContract.interface.encodeFunctionData(
      "setName",
      ["New Contract Name"]
    );

    await expect(
      context.universalProfile
        .connect(addressWithNoPermissions)
        .execute(
          OPERATION_TYPES.CALL,
          targetContract.address,
          0,
          targetContractPayload
        )
    )
      .to.be.revertedWithCustomError(context.keyManager, "NoPermissionsSet")
      .withArgs(addressWithNoPermissions.address);
  });

  it("Should revert when caller calls the KeyManager through `ERC725X.execute`", async () => {
    let lsp20VerifyCallPayload =
      context.keyManager.interface.encodeFunctionData(
        "lsp20VerifyCall",
        [context.accounts[2].address, 0, "0xaabbccdd"] // random arguments
      );

    await expect(
      context.universalProfile
        .connect(context.owner)
        .execute(
          OPERATION_TYPES.CALL,
          context.keyManager.address,
          0,
          lsp20VerifyCallPayload
        )
    ).to.be.revertedWithCustomError(
      context.keyManager,
      "CallingKeyManagerNotAllowed"
    );
  });

  describe("when sending LYX to a contract", () => {
    it("Permissions should prevent ReEntrancy and stop malicious contract with a re-entrant receive() function.", async () => {
      // the Universal Profile wants to send 1 x LYX from its UP to another smart contract
      // we assume the UP owner is not aware that some malicious code is present
      // in the fallback function of the target (= recipient) contract
      let transferPayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CALL,
            maliciousContract.address,
            ethers.utils.parseEther("1"),
            EMPTY_PAYLOAD,
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
  });

  describe("when reentering execute function", () => {
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
          "setDataBatch",
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
          "execute",
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
        await context.universalProfile.getData(randomHardcodedKey)
      ).to.equal(randomHardcodedValue);
    });
  });
};
