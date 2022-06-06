import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// constants
import {
  ERC725YKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
  ERC1271_VALUES,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

export const shouldBehaveLikePermissionSign = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let signer: SignerWithAddress,
    nonSigner: SignerWithAddress,
    noPermissionsSet: SignerWithAddress;

  const dataToSign = "0xcafecafe";

  beforeAll(async () => {
    context = await buildContext();

    signer = context.accounts[1];
    nonSigner = context.accounts[2];
    noPermissionsSet = context.accounts[3];

    const permissionsKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        signer.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        nonSigner.address.substring(2),
    ];

    const permissionsValues = [
      ALL_PERMISSIONS,
      PERMISSIONS.SIGN,
      PERMISSIONS.CALL,
    ];

    await setupKeyManager(context, permissionsKeys, permissionsValues);
  });

  it("can verify signature from address with ALL PERMISSIONS on KeyManager", async () => {
    const messageHash = ethers.utils.hashMessage(dataToSign);
    const signature = await context.owner.signMessage(dataToSign);

    const result = await context.keyManager.callStatic.isValidSignature(
      messageHash,
      signature
    );
    expect(result).toEqual(ERC1271_VALUES.MAGIC_VALUE);
  });

  it("can verify signature from signer on KeyManager", async () => {
    const messageHash = ethers.utils.hashMessage(dataToSign);
    const signature = await signer.signMessage(dataToSign);

    const result = await context.keyManager.callStatic.isValidSignature(
      messageHash,
      signature
    );
    expect(result).toEqual(ERC1271_VALUES.MAGIC_VALUE);
  });

  it("should fail when verifying signature from address with no SIGN permission", async () => {
    const messageHash = ethers.utils.hashMessage(dataToSign);
    const signature = await nonSigner.signMessage(dataToSign);

    const result = await context.keyManager.callStatic.isValidSignature(
      messageHash,
      signature
    );
    expect(result).toEqual(ERC1271_VALUES.FAIL_VALUE);
  });

  it("should fail when verifying signature from address with no permissions set", async () => {
    const messageHash = ethers.utils.hashMessage(dataToSign);
    const signature = await noPermissionsSet.signMessage(dataToSign);

    const result = await context.keyManager.callStatic.isValidSignature(
      messageHash,
      signature
    );
    expect(result).toEqual(ERC1271_VALUES.FAIL_VALUE);
  });
};
