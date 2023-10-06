import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Signer } from 'ethers';
import { EntryPoint__factory, EntryPoint } from '@account-abstraction/contracts';

import { BytesLike, parseEther } from 'ethers/lib/utils';
import { expect } from 'chai';
import {
  Extension4337__factory,
  LSP6KeyManager,
  LSP6KeyManager__factory,
  UniversalProfile,
  UniversalProfile__factory,
} from '../../../types';
import { deployEntryPoint, getBalance, isDeployed } from '../helpers/utils';
import { ALL_PERMISSIONS, ERC725YDataKeys } from '../../../constants';
import { combinePermissions } from '../../utils/helpers';
import { fillAndSign } from '../helpers/UserOp';

describe('4337', function () {
  let bundler: SignerWithAddress;
  let deployer: Signer;
  let universalProfile: UniversalProfile;
  let universalProfileAddress: string;
  let keyManager: LSP6KeyManager;
  let entryPoint: EntryPoint;
  let controllerWith4337Permission: SignerWithAddress;
  let controllerWithout4337Permission: SignerWithAddress;
  let controllerWithOnly4337Permission: SignerWithAddress;
  let transferCallData: string;
  const Permission4337: BytesLike =
    '0x0000000000000000000000000000000000000000000000000000000000800000';
  const amountToTransfer = 1;

  before('setup', async function () {
    const provider = ethers.provider;
    deployer = provider.getSigner();
    const deployerAddress = await deployer.getAddress();

    [
      bundler,
      controllerWith4337Permission,
      controllerWithout4337Permission,
      controllerWithOnly4337Permission,
    ] = await ethers.getSigners();

    universalProfile = await new UniversalProfile__factory(deployer).deploy(
      await deployer.getAddress(),
    );
    universalProfileAddress = universalProfile.address;

    keyManager = await new LSP6KeyManager__factory(deployer).deploy(universalProfile.address);

    // transfer ownership to keyManager
    await universalProfile.transferOwnership(keyManager.address);

    const dataKey =
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + deployerAddress.slice(2);

    await universalProfile.setData(dataKey, ALL_PERMISSIONS);

    const acceptOwnershipBytes = universalProfile.interface.encodeFunctionData('acceptOwnership');
    await keyManager.execute(acceptOwnershipBytes);
    expect(await universalProfile.owner()).to.eq(keyManager.address);

    // deploy entrypoint
    entryPoint = await deployEntryPoint();
    expect(await isDeployed(entryPoint.address)).to.eq(true);

    // give all permissions to entrypoint
    const dataKeyEntryPointPermissions =
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + entryPoint.address.slice(2);
    await universalProfile.setData(dataKeyEntryPointPermissions, ALL_PERMISSIONS);

    // deploy extension and attach it to universalProfile
    const extension4337 = await new Extension4337__factory(deployer).deploy(entryPoint.address);
    const validateUserOpSigHash = extension4337.interface.getSighash('validateUserOp');

    const extensionDataKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      validateUserOpSigHash.slice(2) +
      '00000000000000000000000000000000';

    await universalProfile.setData(extensionDataKey, extension4337.address);

    // give permissions to controllers
    const dataKeyWithPermission4337 =
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
      controllerWith4337Permission.address.slice(2);
    await universalProfile.setData(
      dataKeyWithPermission4337,
      combinePermissions(ALL_PERMISSIONS, Permission4337),
    );

    const dataKeyWithoutPermission4337 =
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
      controllerWithout4337Permission.address.slice(2);
    await universalProfile.setData(dataKeyWithoutPermission4337, ALL_PERMISSIONS);

    const dataKeyWithOnlyPermission4337 =
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
      controllerWithOnly4337Permission.address.slice(2);

    await universalProfile.setData(dataKeyWithOnlyPermission4337, Permission4337);

    // execute call data
    transferCallData = universalProfile.interface.encodeFunctionData('execute', [
      0,
      ethers.constants.AddressZero,
      amountToTransfer,
      '0x1234',
    ]);

    // send 1 ethers to universalProfile
    await deployer.sendTransaction({
      to: universalProfile.address,
      value: parseEther('1'),
    });

    // stake on entrypoint
    const stakeAmount = parseEther('1');
    await entryPoint.depositTo(universalProfileAddress, { value: stakeAmount });
  });

  it('should pass', async function () {
    const address0BalanceBefore = await getBalance(ethers.constants.AddressZero);

    const op = await fillAndSign(
      {
        sender: universalProfileAddress,
        callData: transferCallData,
      },
      controllerWith4337Permission,
      entryPoint,
    );

    await entryPoint.handleOps([op], bundler.address);

    const address0BalanceAfter = await getBalance(ethers.constants.AddressZero);

    expect(address0BalanceAfter - address0BalanceBefore).to.eq(amountToTransfer);
  });

  it('should fail when calling from wrong entrypoint', async function () {
    const anotherEntryPoint = await new EntryPoint__factory(deployer).deploy();

    const op = await fillAndSign(
      {
        sender: universalProfileAddress,
        callData: transferCallData,
      },
      controllerWith4337Permission,
      entryPoint,
    );

    await expect(anotherEntryPoint.handleOps([op], bundler.address))
      .to.be.revertedWithCustomError(entryPoint, 'FailedOp')
      .withArgs(0, 'AA23 reverted: Only EntryPoint contract can call this');
  });

  it('should fail when controller does not have 4337 permission', async function () {
    const anotherEntryPoint = await new EntryPoint__factory(deployer).deploy();

    const op = await fillAndSign(
      {
        sender: universalProfileAddress,
        callData: transferCallData,
      },
      controllerWithout4337Permission,
      entryPoint,
    );

    await expect(anotherEntryPoint.handleOps([op], bundler.address)).to.be.revertedWithCustomError(
      entryPoint,
      'FailedOp',
    );
  });

  it('should fail when controller only has 4337 permission', async function () {
    const op = await fillAndSign(
      {
        sender: universalProfileAddress,
        callData: transferCallData,
      },
      controllerWithOnly4337Permission,
      entryPoint,
    );
    await expect(entryPoint.handleOps([op], bundler.address)).to.be.revertedWithCustomError(
      entryPoint,
      'FailedOp',
    );
  });

  it('should fail on invalid userop', async function () {
    let op = await fillAndSign(
      {
        sender: universalProfileAddress,
        callData: transferCallData,
        nonce: 1234,
      },
      controllerWith4337Permission,
      entryPoint,
    );

    await expect(entryPoint.handleOps([op], bundler.address))
      .to.revertedWithCustomError(entryPoint, 'FailedOp')
      .withArgs(0, 'AA25 invalid account nonce');

    op = await fillAndSign(
      {
        sender: universalProfileAddress,
        callData: transferCallData,
      },
      controllerWith4337Permission,
      entryPoint,
    );

    // invalidate the signature
    op.callGasLimit = 1;
    await expect(entryPoint.handleOps([op], bundler.address))
      .to.revertedWithCustomError(entryPoint, 'FailedOp')
      .withArgs(0, 'AA24 signature error');
  });
});
