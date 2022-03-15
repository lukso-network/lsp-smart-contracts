import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  Reentrancy,
  Reentrancy__factory,
  TargetContract,
  TargetContract__factory,
} from "../../../types";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// constants
import {
  ALL_PERMISSIONS_SET,
  ERC725YKeys,
  OPERATIONS,
  PERMISSIONS,
} from "../../../constants";

// helpers
import {
  EMPTY_PAYLOAD,
  NoPermissionsSetError,
  ONE_ETH,
} from "../../utils/helpers";

const provider = ethers.provider;

export const testSecurityScenarios = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let signer: SignerWithAddress,
    relayer: SignerWithAddress,
    addressWithNoPermissions: SignerWithAddress;

  let targetContract: TargetContract, maliciousContract: Reentrancy;

  beforeEach(async () => {
    context = await buildContext();

    signer = context.accounts[1];
    relayer = context.accounts[2];
    addressWithNoPermissions = context.accounts[3];

    targetContract = await new TargetContract__factory(
      context.accounts[0]
    ).deploy();

    maliciousContract = await new Reentrancy__factory(
      context.accounts[6]
    ).deploy(context.keyManager.address);

    const permissionKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        signer.address.substring(2),
    ];

    const permissionValues = [
      ALL_PERMISSIONS_SET,
      ethers.utils.hexZeroPad(PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE, 32),
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
      [OPERATIONS.CALL, targetContract.address, 0, targetContractPayload]
    );

    try {
      await context.keyManager
        .connect(addressWithNoPermissions)
        .execute(executePayload);
    } catch (error) {
      expect(error.message).toMatch(
        NoPermissionsSetError(addressWithNoPermissions.address)
      );
    }
  });

  describe("when sending LYX to a contract", () => {
    it("Permissions should prevent ReEntrancy and stop malicious contract with a re-entrant fallback() function.", async () => {
      // the Universal Profile wants to send 1 x LYX from its UP to another smart contract
      // we assume the UP owner is not aware that some malicious code is present
      // in the fallback function of the target (= recipient) contract
      let transferPayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
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

      console.log("maliciousContract: ", maliciousContract);

      let initialAccountBalance = await provider.getBalance(
        context.universalProfile.address
      );
      let initialAttackerBalance = await provider.getBalance(
        maliciousContract.address
      );

      // send LYX to malicious contract
      await context.keyManager.connect(context.owner).execute(transferPayload);
      // at this point, the malicious contract fallback function
      // try to drain funds by re-entering the call

      let newAccountBalance = await provider.getBalance(
        context.universalProfile.address
      );
      let newAttackerBalance = await provider.getBalance(
        maliciousContract.address
      );

      expect(parseInt(newAccountBalance.toString())).toEqual(
        initialAccountBalance.toString() - ONE_ETH.toString()
      );
      expect(parseInt(newAttackerBalance.toString())).toEqual(
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
          OPERATIONS.CALL,
          signer.address,
          ONE_ETH,
          EMPTY_PAYLOAD,
        ]);

      let hash = ethers.utils.solidityKeccak256(
        ["address", "uint256", "bytes"],
        [context.keyManager.address, nonce, executeRelayCallPayload]
      );

      let signature = await signer.signMessage(ethers.utils.arrayify(hash));

      // first call
      await context.keyManager
        .connect(relayer)
        .executeRelayCall(
          context.keyManager.address,
          nonce,
          executeRelayCallPayload,
          signature
        );

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
