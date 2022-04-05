import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  LSP6KeyManager__factory,
  UniversalProfile__factory,
  LSP1UniversalReceiverDelegateUP__factory,
} from "../../types";

import { PERMISSIONS, ERC725YKeys, ALL_PERMISSIONS_SET } from "../../constants";

// helpers
import { ARRAY_LENGTH } from "../utils/helpers";
import { LSP6TestContext, LSP6InternalsTestContext } from "./context";

/**
 * Deploy a proxy contract, referencing to baseContractAddress via delegateCall
 *
 * @param baseContractAddress
 * @param deployer
 * @returns
 */
export async function deployProxy(
  baseContractAddress: string,
  deployer: SignerWithAddress
): Promise<string> {
  /**
   * @see https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/
   * The first 10 x hex opcodes copy the runtime code into memory and return it.
   */
  const eip1167RuntimeCodeTemplate =
    "0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3";

  // deploy proxy contract
  let proxyBytecode = eip1167RuntimeCodeTemplate.replace(
    "bebebebebebebebebebebebebebebebebebebebe",
    baseContractAddress.substr(2)
  );
  let tx = await deployer.sendTransaction({
    data: proxyBytecode,
  });
  let receipt = await tx.wait();

  return receipt.contractAddress;
}

export async function setupKeyManager(
  _context: LSP6TestContext,
  _permissionsKeys: string[],
  _permissionsValues: string[]
) {
  await _context.universalProfile
    .connect(_context.owner)
    ["setData(bytes32[],bytes[])"](_permissionsKeys, _permissionsValues);

  await _context.universalProfile
    .connect(_context.owner)
    .transferOwnership(_context.keyManager.address);
}

export async function setupKeyManagerHelper(
  _context: LSP6InternalsTestContext,
  _permissionsKeys: string[],
  _permissionsValues: string[]
) {
  await _context.universalProfile
    .connect(_context.owner)
    ["setData(bytes32[],bytes[])"](_permissionsKeys, _permissionsValues);

  await _context.universalProfile
    .connect(_context.owner)
    .transferOwnership(_context.keyManagerHelper.address);
}

/**
 * Deploy 1 Profile + 1 KeyManager + 1 URD and set all needed permissions
 */
export async function setupProfileWithKeyManagerWithURD(
  EOA: SignerWithAddress
) {
  const universalProfile = await new UniversalProfile__factory(EOA).deploy(
    EOA.address
  );
  const lsp6KeyManager = await new LSP6KeyManager__factory(EOA).deploy(
    universalProfile.address
  );

  const lsp1universalReceiverDelegateUP =
    await new LSP1UniversalReceiverDelegateUP__factory(EOA).deploy();

  await universalProfile
    .connect(EOA)
    ["setData(bytes32[],bytes[])"](
      [
        ERC725YKeys.LSP6["AddressPermissions[]"],
        ERC725YKeys.LSP6["AddressPermissions[]"].substring(0, 34) +
          "00000000000000000000000000000000",
        ERC725YKeys.LSP6["AddressPermissions[]"].substring(0, 34) +
          "00000000000000000000000000000001",
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          EOA.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          lsp1universalReceiverDelegateUP.address.substr(2),
        ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate,
      ],
      [
        ARRAY_LENGTH.TWO,
        EOA.address,
        lsp1universalReceiverDelegateUP.address,
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
        lsp1universalReceiverDelegateUP.address,
      ]
    );

  await universalProfile.connect(EOA).transferOwnership(lsp6KeyManager.address);
  await EOA.sendTransaction({
    to: universalProfile.address,
    value: ethers.utils.parseEther("10"),
  });
  return [universalProfile, lsp6KeyManager, lsp1universalReceiverDelegateUP];
}

/**
 * Returns the payload of Call operation with 0 value
 */
export function callPayload(from: any, to: string, abi: string) {
  let payload = from.interface.encodeFunctionData("execute", [0, to, 0, abi]);
  return payload;
}

/**
 * Returns the LSP5 arraylength, elementAddress, index and interfaceId of the token provided
 * for the account provided.
 */
export async function getLSP5MapAndArrayKeysValue(account, token) {
  let mapKey = ERC725YKeys.LSP5.LSP5ReceivedAssetsMap + token.address.substr(2);
  const mapValue = await account["getData(bytes32)"](mapKey);
  const indexInHex = mapValue.substr(0, 18);
  const interfaceId = "0x" + mapValue.substr(18);
  const indexInNumber = ethers.BigNumber.from(indexInHex).toNumber();
  const rawIndexInArray = ethers.utils.hexZeroPad(
    ethers.utils.hexValue(indexInNumber),
    32
  );
  const elementInArrayKey =
    ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].substr(0, 34) +
    rawIndexInArray.substr(34);
  let arrayKey = ERC725YKeys.LSP5["LSP5ReceivedAssets[]"];
  let [arrayLength, elementAddress] = await account["getData(bytes32[])"]([
    arrayKey,
    elementInArrayKey,
  ]);
  if (elementAddress != "0x") {
    elementAddress = ethers.utils.getAddress(elementAddress);
  }
  return [indexInNumber, interfaceId, arrayLength, elementAddress];
}

/**
 * Returns the LSP10 arraylength, elementAddress, index and interfaceId of the vault provided
 * for the account provided.
 */
export async function getLSP10MapAndArrayKeysValue(account, lsp9Vault) {
  let mapKey = ERC725YKeys.LSP10.LSP10VaultsMap + lsp9Vault.address.substr(2);
  const mapValue = await account["getData(bytes32)"](mapKey);
  const indexInHex = mapValue.substr(0, 18);
  const interfaceId = "0x" + mapValue.substr(18);
  const indexInNumber = ethers.BigNumber.from(indexInHex).toNumber();
  const rawIndexInArray = ethers.utils.hexZeroPad(
    ethers.utils.hexValue(indexInNumber),
    32
  );
  const elementInArrayKey =
    ERC725YKeys.LSP10["LSP10Vaults[]"].substr(0, 34) +
    rawIndexInArray.substr(34);
  let arrayKey = ERC725YKeys.LSP10["LSP10Vaults[]"];
  let [arrayLength, elementAddress] = await account["getData(bytes32[])"]([
    arrayKey,
    elementInArrayKey,
  ]);
  if (elementAddress != "0x") {
    elementAddress = ethers.utils.getAddress(elementAddress);
  }
  return [indexInNumber, interfaceId, arrayLength, elementAddress];
}
