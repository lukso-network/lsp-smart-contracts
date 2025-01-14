import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { EntryPoint__factory, EntryPoint } from '@account-abstraction/contracts';

import { BytesLike, Signer, parseEther } from 'ethers';
import { expect } from 'chai';
import {
  LSP6KeyManager,
  LSP6KeyManager__factory,
  UniversalProfile,
  UniversalProfile__factory,
  Extension4337__factory,
} from '../../../typechain';
import { deployEntryPoint, getBalance, isDeployed } from '../helpers/utils';
import { ERC725YDataKeys } from '../../../constants';
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';
import { ALL_PERMISSIONS } from '@lukso/lsp6-contracts';
import { combinePermissions } from '../../utils/helpers';
import { fillAndSign } from '../helpers/UserOp';

// Deploying NickFactory currently fails with latest Hardhat version. Commenting out temporarily until resolved
// See following issue: https://github.com/NomicFoundation/hardhat/issues/4939
describe.skip('4337', function () {
  let bundler: SignerWithAddress;
  let deployer: Signer;
  let universalProfile: UniversalProfile;
  let universalProfileAddress: string;
  let keyManager: LSP6KeyManager;
  let keyManagerAddress: string;
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
    deployer = await provider.getSigner();
    const deployerAddress = await deployer.getAddress();

    [
      bundler,
      controllerWith4337Permission,
      controllerWithout4337Permission,
      controllerWithOnly4337Permission,
    ] = await ethers.getSigners();

    universalProfile = await new UniversalProfile__factory(deployer).deploy(
      await deployer.getAddress(),
      { value: parseEther('1') },
    );
    universalProfileAddress = await universalProfile.getAddress();

    keyManager = await new LSP6KeyManager__factory(deployer).deploy(universalProfileAddress);
    keyManagerAddress = await keyManager.getAddress();

    // transfer ownership to keyManager
    await universalProfile.transferOwnership(keyManagerAddress);

    const dataKey =
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + deployerAddress.slice(2);

    await universalProfile.setData(dataKey, ALL_PERMISSIONS);

    const acceptOwnershipBytes = universalProfile.interface.encodeFunctionData('acceptOwnership');
    await keyManager.execute(acceptOwnershipBytes);
    expect(await universalProfile.owner()).to.eq(keyManagerAddress);

    // deploy entrypoint
    entryPoint = await deployEntryPoint();
    expect(await isDeployed(await entryPoint.getAddress())).to.eq(true);

    // give all permissions to entrypoint
    const dataKeyEntryPointPermissions =
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
      (await entryPoint.getAddress()).slice(2);
    await universalProfile.setData(dataKeyEntryPointPermissions, ALL_PERMISSIONS);

    // deploy extension and attach it to universalProfile
    const extension4337 = await new Extension4337__factory(deployer).deploy(
      await entryPoint.getAddress(),
    );
    const validateUserOpSigHash = extension4337.interface.getFunction('validateUserOp').selector;

    const extensionDataKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      validateUserOpSigHash.slice(2) +
      '00000000000000000000000000000000';

    await universalProfile.setData(extensionDataKey, extension4337.target as string);

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

    // execute calldata
    transferCallData = universalProfile.interface.encodeFunctionData('execute', [
      OPERATION_TYPES.CALL,
      ethers.ZeroAddress,
      amountToTransfer,
      '0x1234',
    ]);

    // stake on entrypoint
    const stakeAmount = parseEther('1');
    await entryPoint.depositTo(universalProfileAddress, { value: stakeAmount });
  });

  it('should pass', async function () {
    const addressZeroBalanceBefore = await getBalance(ethers.ZeroAddress);
    const userOperation = await fillAndSign(
      {
        sender: universalProfileAddress,
        callData: transferCallData,
      },
      controllerWith4337Permission,
      entryPoint,
    );
    await entryPoint.handleOps([userOperation], bundler.address);
    const addressZeroBalanceAfter = await getBalance(ethers.ZeroAddress);
    expect(addressZeroBalanceAfter - addressZeroBalanceBefore).to.eq(amountToTransfer);
  });

  it('should fail when calling from wrong entrypoint', async function () {
    const anotherEntryPoint = await new EntryPoint__factory(deployer).deploy();

    const userOperation = await fillAndSign(
      {
        sender: universalProfileAddress,
        callData: transferCallData,
      },
      controllerWith4337Permission,
      entryPoint,
    );

    const opIndex = 0; //index into the array of ops to the failed one (in simulateValidation, this is always zero).

    await expect(anotherEntryPoint.handleOps([userOperation], bundler.address))
      .to.be.revertedWithCustomError(entryPoint, 'FailedOp')
      .withArgs(opIndex, 'AA23 reverted: Only EntryPoint contract can call this');
  });

  it('should fail when controller does not have 4337 permission', async function () {
    const anotherEntryPoint = await new EntryPoint__factory(deployer).deploy();

    const userOperation = await fillAndSign(
      {
        sender: universalProfileAddress,
        callData: transferCallData,
      },
      controllerWithout4337Permission,
      entryPoint,
    );

    await expect(
      anotherEntryPoint.handleOps([userOperation], bundler.address),
    ).to.be.revertedWithCustomError(entryPoint, 'FailedOp');
  });

  it('should fail when controller only has 4337 permission', async function () {
    const userOperation = await fillAndSign(
      {
        sender: universalProfileAddress,
        callData: transferCallData,
      },
      controllerWithOnly4337Permission,
      entryPoint,
    );
    await expect(
      entryPoint.handleOps([userOperation], bundler.address),
    ).to.be.revertedWithCustomError(entryPoint, 'FailedOp');
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
