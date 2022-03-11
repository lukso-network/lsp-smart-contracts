import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// constants
import {
  ERC725YKeys,
  ALL_PERMISSIONS_SET,
  PERMISSIONS,
  ERC1271,
} from "../../../constants";

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
      ALL_PERMISSIONS_SET,
      ethers.utils.hexZeroPad(PERMISSIONS.SIGN, 32),
      ethers.utils.hexZeroPad(PERMISSIONS.CALL, 32),
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
    expect(result).toEqual(ERC1271.MAGIC_VALUE);
  });

  it("can verify signature from signer on KeyManager", async () => {
    const messageHash = ethers.utils.hashMessage(dataToSign);
    const signature = await signer.signMessage(dataToSign);

    const result = await context.keyManager.callStatic.isValidSignature(
      messageHash,
      signature
    );
    expect(result).toEqual(ERC1271.MAGIC_VALUE);
  });

  it("should fail when verifying signature from address with no SIGN permission", async () => {
    const messageHash = ethers.utils.hashMessage(dataToSign);
    const signature = await nonSigner.signMessage(dataToSign);

    const result = await context.keyManager.callStatic.isValidSignature(
      messageHash,
      signature
    );
    expect(result).toEqual(ERC1271.FAIL_VALUE);
  });

  it("should fail when verifying signature from address with no permissions set", async () => {
    const messageHash = ethers.utils.hashMessage(dataToSign);
    const signature = await noPermissionsSet.signMessage(dataToSign);

    const result = await context.keyManager.callStatic.isValidSignature(
      messageHash,
      signature
    );
    expect(result).toEqual(ERC1271.FAIL_VALUE);
  });
};
