import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  Reentrancy,
  Reentrancy__factory,
  TargetContract,
  TargetContract__factory,
} from "../../../types";

// constants
import {
  ALL_PERMISSIONS,
  ERC725YKeys,
  OPERATION_TYPES,
  PERMISSIONS,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// helpers
import {
  provider,
  EMPTY_PAYLOAD,
  NoPermissionsSetError,
  ONE_ETH,
} from "../../utils/helpers";

export const testSecurityScenarios = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let signer: SignerWithAddress,
    relayer: SignerWithAddress,
    addressWithNoPermissions: SignerWithAddress;

  let attacker: SignerWithAddress;

  let targetContract: TargetContract, maliciousContract: Reentrancy;

  beforeEach(async () => {
    context = await buildContext();

    signer = context.accounts[1];
    relayer = context.accounts[2];
    addressWithNoPermissions = context.accounts[3];

    attacker = context.accounts[4];

    targetContract = await new TargetContract__factory(
      context.accounts[0]
    ).deploy();

    maliciousContract = await new Reentrancy__factory(attacker).deploy(
      context.keyManager.address
    );

    const permissionKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        signer.address.substring(2),
    ];

    const permissionValues = [
      ALL_PERMISSIONS,
      ethers.utils.hexZeroPad(
        parseInt(Number(PERMISSIONS.CALL)) +
          parseInt(Number(PERMISSIONS.TRANSFERVALUE)),
        32
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

    let executePayload = context.universalProfile.interface.encodeFunctionData(
      "execute",
      [OPERATION_TYPES.CALL, targetContract.address, 0, targetContractPayload]
    );

    await expect(
      context.keyManager
        .connect(addressWithNoPermissions)
        .execute(executePayload)
    ).toBeRevertedWith(NoPermissionsSetError(addressWithNoPermissions.address));
  });

  describe("should revert when admin with ALL PERMISSIONS try to call `renounceOwnership(...)`", () => {
    it("via `execute(...)`", async () => {
      let payload =
        context.universalProfile.interface.encodeFunctionData(
          "renounceOwnership"
        );

      await expect(
        context.keyManager.connect(context.owner).execute(payload)
      ).toBeRevertedWith("_verifyPermissions: invalid ERC725 selector'");
    });

    it("via `executeRelayCall()`", async () => {
      let nonce = await context.keyManager.getNonce(context.owner.address, 0);

      let payload =
        context.universalProfile.interface.encodeFunctionData(
          "renounceOwnership"
        );

      let hash = ethers.utils.solidityKeccak256(
        ["address", "uint256", "bytes"],
        [context.keyManager.address, nonce, payload]
      );

      let signature = await context.owner.signMessage(
        ethers.utils.arrayify(hash)
      );

      await expect(
        context.keyManager
          .connect(context.owner)
          .executeRelayCall(
            context.keyManager.address,
            nonce,
            payload,
            signature
          )
      ).toBeRevertedWith("_verifyPermissions: invalid ERC725 selector'");
    });
  });

  describe("when sending LYX to a contract", () => {
    it("Permissions should prevent ReEntrancy and stop malicious contract with a re-entrant fallback() function.", async () => {
      // the Universal Profile wants to send 1 x LYX from its UP to another smart contract
      // we assume the UP owner is not aware that some malicious code is present
      // in the fallback function of the target (= recipient) contract
      let transferPayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATION_TYPES.CALL,
          maliciousContract.address,
          ONE_ETH,
          EMPTY_PAYLOAD,
        ]);

      let executePayload = context.keyManager.interface.encodeFunctionData(
        "execute",
        [transferPayload]
      );
      // load the malicious payload, that will be executed in the fallback function
      // every time the contract receives LYX
      await maliciousContract.loadPayload(executePayload);

      let initialAccountBalance = await provider.getBalance(
        context.universalProfile.address
      );
      let initialAttackerContractBalance = await provider.getBalance(
        maliciousContract.address
      );

      // send LYX to malicious contract
      await context.keyManager.connect(context.owner).execute(transferPayload);
      // at this point, the malicious contract fallback function
      // try to drain funds by re-entering the call

      let newAccountBalance = await provider.getBalance(
        context.universalProfile.address
      );
      let newAttackerContractBalance = await provider.getBalance(
        maliciousContract.address
      );

      expect(parseInt(newAccountBalance.toString())).toEqual(
        initialAccountBalance.toString() - ONE_ETH.toString()
      );
      expect(parseInt(newAttackerContractBalance.toString())).toEqual(
        parseInt(ONE_ETH.toString())
      );
    });
  });

  describe("when calling via `executeRelayCall(...)`", () => {
    const channelId = 0;

    it("Replay Attack should fail because of invalid nonce", async () => {
      let nonce = await context.keyManager.callStatic.getNonce(
        signer.address,
        channelId
      );

      let executeRelayCallPayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATION_TYPES.CALL,
          signer.address,
          ONE_ETH,
          EMPTY_PAYLOAD,
        ]);

      const HARDHAT_CHAINID = 31337;

      let hash = ethers.utils.solidityKeccak256(
        ["uint256", "address", "uint256", "bytes"],
        [
          HARDHAT_CHAINID,
          context.keyManager.address,
          nonce,
          executeRelayCallPayload,
        ]
      );

      let signature = await signer.signMessage(ethers.utils.arrayify(hash));

      // first call
      await context.keyManager
        .connect(relayer)
        .executeRelayCall(signature, nonce, executeRelayCallPayload);

      // 2nd call = replay attack
      await expect(
        context.keyManager
          .connect(relayer)
          .executeRelayCall(
            context.keyManager.address,
            nonce,
            executeRelayCallPayload,
            signature
          )
      ).toBeRevertedWith("executeRelayCall: Invalid nonce");
    });
  });
};
