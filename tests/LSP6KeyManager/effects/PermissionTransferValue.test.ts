import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// constants
import {
  ERC725YKeys,
  ALL_PERMISSIONS_SET,
  PERMISSIONS,
  OPERATIONS,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";
const provider = ethers.provider;

// helpers
import { EMPTY_PAYLOAD, NotAuthorisedError } from "../../utils/helpers";

export const shouldBehaveLikePermissionTransferValue = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let canTransferValue: SignerWithAddress,
    cannotTransferValue: SignerWithAddress;

  beforeAll(async () => {
    context = await buildContext();

    canTransferValue = context.accounts[1];
    cannotTransferValue = context.accounts[2];

    const permissionsKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        canTransferValue.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        cannotTransferValue.address.substring(2),
    ];

    const permissionsValues = [
      ALL_PERMISSIONS_SET,
      ethers.utils.hexZeroPad(PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE, 32),
      ethers.utils.hexZeroPad(PERMISSIONS.CALL, 32),
    ];

    await setupKeyManager(context, permissionsKeys, permissionsValues);

    await context.owner.sendTransaction({
      to: context.universalProfile.address,
      value: ethers.utils.parseEther("10"),
    });
  });

  it("address with ALL PERMISSIONS should be allowed to transfer value", async () => {
    let initialBalanceUP = await provider.getBalance(
      context.universalProfile.address
    );
    let recipient = context.accounts[3].address;
    let initialBalanceRecipient = await provider.getBalance(recipient);

    let transferPayload = context.universalProfile.interface.encodeFunctionData(
      "execute",
      [OPERATIONS.CALL, recipient, ethers.utils.parseEther("3"), EMPTY_PAYLOAD]
    );

    await context.keyManager.connect(context.owner).execute(transferPayload);

    let newBalanceUP = await provider.getBalance(
      context.universalProfile.address
    );
    expect(parseInt(newBalanceUP)).toBeLessThan(parseInt(initialBalanceUP));

    let newBalanceRecipient = await provider.getBalance(recipient);
    expect(parseInt(newBalanceRecipient)).toBeGreaterThan(
      parseInt(initialBalanceRecipient)
    );
  });

  it("address with permission TRANSFER VALUE should be allowed to transfer value", async () => {
    let initialBalanceUP = await provider.getBalance(
      context.universalProfile.address
    );
    let recipient = context.accounts[3].address;
    let initialBalanceRecipient = await provider.getBalance(recipient);

    let transferPayload = context.universalProfile.interface.encodeFunctionData(
      "execute",
      [OPERATIONS.CALL, recipient, ethers.utils.parseEther("3"), EMPTY_PAYLOAD]
    );

    await context.keyManager.connect(canTransferValue).execute(transferPayload);

    let newBalanceUP = await provider.getBalance(
      context.universalProfile.address
    );
    expect(parseInt(newBalanceUP)).toBeLessThan(parseInt(initialBalanceUP));

    let newBalanceRecipient = await provider.getBalance(recipient);
    expect(parseInt(newBalanceRecipient)).toBeGreaterThan(
      parseInt(initialBalanceRecipient)
    );
  });

  it("address with no permission TRANSFERVALUE should revert", async () => {
    let initialBalanceUP = await provider.getBalance(
      context.universalProfile.address
    );
    let recipient = context.accounts[3].address;
    let initialBalanceRecipient = await provider.getBalance(recipient);

    let transferPayload = context.universalProfile.interface.encodeFunctionData(
      "execute",
      [OPERATIONS.CALL, recipient, ethers.utils.parseEther("3"), EMPTY_PAYLOAD]
    );

    try {
      await context.keyManager
        .connect(cannotTransferValue)
        .execute(transferPayload);
    } catch (error) {
      expect(error.message).toMatch(
        NotAuthorisedError(cannotTransferValue.address, "TRANSFERVALUE")
      );
    }

    let newBalanceUP = await provider.getBalance(
      context.universalProfile.address
    );
    let newBalanceRecipient = await provider.getBalance(recipient);

    expect(parseInt(newBalanceUP)).toBe(parseInt(initialBalanceUP));
    expect(parseInt(initialBalanceRecipient)).toBe(
      parseInt(newBalanceRecipient)
    );
  });
};
