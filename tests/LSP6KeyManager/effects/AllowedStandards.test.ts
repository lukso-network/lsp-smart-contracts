import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  SignatureValidator,
  SignatureValidator__factory,
  TargetContract,
  TargetContract__factory,
  UniversalProfile,
  UniversalProfile__factory,
} from "../../../types";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// constants
import {
  ALL_PERMISSIONS_SET,
  ERC725YKeys,
  INTERFACE_IDS,
  OPERATIONS,
  PERMISSIONS,
} from "../../../constants";

const abiCoder = ethers.utils.defaultAbiCoder;

export const shouldBehaveLikeAllowedStandards = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let addressCanInteractOnlyWithERC1271: SignerWithAddress,
    addressCanInteractOnlyWithLSP7: SignerWithAddress;

  let targetContract: TargetContract,
    signatureValidatorContract: SignatureValidator,
    otherUniversalProfile: UniversalProfile;

  beforeEach(async () => {
    context = await buildContext();

    addressCanInteractOnlyWithERC1271 = context.accounts[0];
    addressCanInteractOnlyWithLSP7 = context.accounts[1];

    targetContract = await new TargetContract__factory(
      context.accounts[0]
    ).deploy();
    signatureValidatorContract = await new SignatureValidator__factory(
      context.accounts[0]
    ).deploy();

    // test to interact with an other UniversalProfile (e.g.: transfer LYX)
    otherUniversalProfile = await new UniversalProfile__factory(
      context.accounts[3]
    ).deploy(context.accounts[3].address);

    let permissionsKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanInteractOnlyWithERC1271.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanInteractOnlyWithLSP7.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
        addressCanInteractOnlyWithERC1271.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
        addressCanInteractOnlyWithLSP7.address.substring(2),
    ];

    let permissionsValues = [
      ALL_PERMISSIONS_SET,
      ethers.utils.hexZeroPad(PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE, 32),
      ethers.utils.hexZeroPad(PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE, 32),
      abiCoder.encode(["bytes4[]"], [[INTERFACE_IDS.ERC1271]]),
      abiCoder.encode(["bytes4[]"], [[INTERFACE_IDS.LSP7]]), // callerTwo
    ];

    await setupKeyManager(context, permissionsKeys, permissionsValues);
  });
};
