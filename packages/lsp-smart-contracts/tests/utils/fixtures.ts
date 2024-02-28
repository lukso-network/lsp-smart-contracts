import hre from 'hardhat';
const { ethers } = hre;
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

import {
  LSP1UniversalReceiverDelegateUP__factory,
  LSP6KeyManager__factory,
  UniversalProfile__factory,
} from '../../types';

import { ERC725YDataKeys } from '../../constants';
import { PERMISSIONS, ALL_PERMISSIONS } from '@lukso/lsp6-contracts';

// helpers
import { combinePermissions } from './helpers';
import { LSP6TestContext, LSP6InternalsTestContext } from './context';

/**
 * Deploy a proxy contract, referencing to baseContractAddress via delegateCall
 *
 * @param baseContractAddress
 * @param deployer
 * @returns
 */
export async function deployProxy(
  baseContractAddress: string,
  deployer: SignerWithAddress,
): Promise<string> {
  /**
   * @see https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/
   * The first 10 x hex opcodes copy the runtime code into memory and return it.
   */
  const eip1167RuntimeCodeTemplate =
    '0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3';

  // deploy proxy contract
  const proxyBytecode = eip1167RuntimeCodeTemplate.replace(
    'bebebebebebebebebebebebebebebebebebebebe',
    baseContractAddress.substring(2),
  );
  const tx = await deployer.sendTransaction({
    data: proxyBytecode,
  });
  const receipt = await tx.wait();

  return receipt.contractAddress;
}

export async function setupKeyManager(
  _context: LSP6TestContext,
  _dataKeys: string[],
  _dataValues: string[],
) {
  await _context.universalProfile.connect(_context.mainController).setDataBatch(
    [
      // required to set main controller permission so that it can acceptOwnership(...) via the KeyManager
      // otherwise, the KeyManager will flag the calling main controller as not having the permission CHANGEOWNER
      // when trying to setup the KeyManager
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        _context.mainController.address.substring(2),
      ..._dataKeys,
    ],
    [ALL_PERMISSIONS, ..._dataValues],
  );

  const keyManagerAddress = await _context.keyManager.getAddress();

  await _context.universalProfile
    .connect(_context.mainController)
    .transferOwnership(keyManagerAddress);

  const payload = _context.universalProfile.interface.getFunction('acceptOwnership').selector;

  await _context.keyManager.connect(_context.mainController).execute(payload);
}

export async function setupKeyManagerHelper(
  _context: LSP6InternalsTestContext,
  _permissionsKeys: string[],
  _permissionsValues: string[],
) {
  await _context.universalProfile
    .connect(_context.mainController)
    .setDataBatch(
      [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          _context.mainController.address.substring(2),
        ..._permissionsKeys,
      ],
      [ALL_PERMISSIONS, ..._permissionsValues],
    );

  await _context.universalProfile
    .connect(_context.mainController)
    .transferOwnership(await _context.keyManagerInternalTester.getAddress());

  const payload = _context.universalProfile.interface.getFunction('acceptOwnership').selector;

  await _context.keyManagerInternalTester.connect(_context.mainController).execute(payload);
}

/**
 * Deploy 1 Profile + 1 KeyManager + 1 URD and set all needed permissions
 */
export async function setupProfileWithKeyManagerWithURD(EOA: SignerWithAddress) {
  const universalProfile = await new UniversalProfile__factory(EOA).deploy(EOA.address, {
    value: ethers.parseEther('10'),
  });

  const lsp6KeyManager = await new LSP6KeyManager__factory(EOA).deploy(
    await universalProfile.getAddress(),
  );

  const lsp6KeyManagerAddress = await lsp6KeyManager.getAddress();

  const lsp1universalReceiverDelegateUP = await new LSP1UniversalReceiverDelegateUP__factory(
    EOA,
  ).deploy();

  await universalProfile
    .connect(EOA)
    .setDataBatch(
      [
        ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000000',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000001',
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + EOA.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          (await lsp1universalReceiverDelegateUP.getAddress()).substring(2),
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
      ],
      [
        ethers.zeroPadValue(ethers.toBeHex(2), 16),
        EOA.address,
        await lsp1universalReceiverDelegateUP.getAddress(),
        ALL_PERMISSIONS,
        combinePermissions(PERMISSIONS.SUPER_SETDATA, PERMISSIONS.REENTRANCY),
        await lsp1universalReceiverDelegateUP.getAddress(),
      ],
    );

  await universalProfile.connect(EOA).transferOwnership(lsp6KeyManagerAddress);

  const claimOwnershipPayload = universalProfile.interface.getFunction('acceptOwnership').selector;

  await lsp6KeyManager.connect(EOA).execute(claimOwnershipPayload);

  return [universalProfile, lsp6KeyManager, lsp1universalReceiverDelegateUP];
}

/**
 * Sets the permissions for a LSP11 Social Recovery contract
 * on a `universalProfile` via `lsp6KeyManager`
 */
export async function grantLSP11PermissionViaKeyManager(
  EOA: SignerWithAddress,
  universalProfile,
  lsp6KeyManager,
  addressToGrant,
) {
  const rawPermissionArrayLength = await universalProfile.getData(
    ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
  );

  const permissionArrayLength = ethers.toNumber(ethers.toBigInt(rawPermissionArrayLength));

  const newPermissionArrayLength = permissionArrayLength + 1;
  const newRawPermissionArrayLength = ethers.zeroPadValue(
    ethers.toBeHex(newPermissionArrayLength),
    16,
  );

  // if the main controller lost access to its UP and don't have any new permission
  // the social recovery contract only needs the permission ADDCONTROLLER
  // to add a new controller key with some new permissions
  const lsp11SocialRecoveryPermissions = PERMISSIONS.ADDCONTROLLER;

  const payload = universalProfile.interface.encodeFunctionData('setDataBatch', [
    [
      ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
      ERC725YDataKeys.LSP6['AddressPermissions[]'].index + rawPermissionArrayLength.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + addressToGrant.substring(2),
    ],
    [newRawPermissionArrayLength, addressToGrant, lsp11SocialRecoveryPermissions],
  ]);
  await lsp6KeyManager.connect(EOA).execute(payload);
}

/**
 * Returns the payload of Call operation with 0 value
 */
export function callPayload(from: any, to: string, abi: string) {
  const payload = from.interface.encodeFunctionData('execute', [0, to, 0, abi]);
  return payload;
}

/**
 * Returns the LSP5 arraylength, elementAddress, index and interfaceId of the token provided
 * for the account provided.
 */
export async function getLSP5MapAndArrayKeysValue(account, token) {
  const mapValue = await account.getData(
    ethers.concat([ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap, await token.getAddress()]),
  );

  const indexInHex = '0x' + mapValue.substring(10, mapValue.length);
  const interfaceId = mapValue.substring(0, 10);

  const indexInNumber = ethers.toNumber(ethers.toBigInt(indexInHex === '0x' ? 0 : indexInHex));
  const rawIndexInArray = ethers.zeroPadValue(ethers.toBeHex(indexInNumber), 16);

  const elementInArrayKey = ethers.concat([
    ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index,
    rawIndexInArray,
  ]);

  const arrayKey = ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length;
  const [arrayLength, _elementAddress] = await account.getDataBatch([arrayKey, elementInArrayKey]);

  let elementAddress = _elementAddress;

  if (elementAddress != '0x') {
    elementAddress = ethers.getAddress(elementAddress);
  }
  return [indexInNumber, interfaceId, arrayLength, elementAddress];
}
