import { ethers } from 'hardhat';
import { expect } from 'chai';

import { UniversalProfile__factory, LSP6KeyManager__factory } from '../types';
import {
  ERC725YDataKeys,
  ALL_PERMISSIONS,
  CALLTYPE,
  PERMISSIONS,
  OPERATION_TYPES,
} from '../constants';
import { combineAllowedCalls, combinePermissions } from './utils/helpers';

const buildContext = async () => {
  const accounts = await ethers.getSigners();
  const owner = accounts[0];

  const universalProfile = await new UniversalProfile__factory(owner).deploy(owner.address, {
    value: ethers.utils.parseEther('1'),
  });
  const recipientUniversalProfile = await new UniversalProfile__factory(owner).deploy(
    owner.address,
  );
  const keyManager = await new LSP6KeyManager__factory(owner).deploy(universalProfile.address);

  await universalProfile
    .connect(owner)
    .setData(
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + owner.address.substring(2),
      ALL_PERMISSIONS,
    );
  await universalProfile.connect(owner).transferOwnership(keyManager.address);
  await keyManager.connect(owner).execute(universalProfile.interface.getSighash('acceptOwnership'));

  return {
    accounts,
    owner,
    universalProfile,
    recipientUniversalProfile,
    keyManager,
  };
};

describe('Testing TRANFERVALUE bug', () => {
  let context;
  let transferValue_0x00000000;
  let transferValue_0xffffffff;

  before(async () => {
    context = await buildContext();

    transferValue_0x00000000 = context.accounts[1];
    transferValue_0xffffffff = context.accounts[2];

    const allowedCall_0x00000000 = combineAllowedCalls(
      [CALLTYPE.VALUE],
      [context.recipientUniversalProfile.address],
      ['0xffffffff'],
      ['0x00000000'],
    );
    const allowedCall_0xffffffff = combineAllowedCalls(
      [CALLTYPE.VALUE],
      [context.recipientUniversalProfile.address],
      ['0xffffffff'],
      ['0xffffffff'],
    );

    await context.universalProfile
      .connect(context.owner)
      .setDataBatch(
        [
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            transferValue_0x00000000.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            transferValue_0x00000000.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            transferValue_0xffffffff.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            transferValue_0xffffffff.address.substring(2),
        ],
        [
          combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
          allowedCall_0x00000000,
          combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
          allowedCall_0xffffffff,
        ],
      );
  });

  it('should pass: Permissions: CALL & TRANSFERVALUE; AllowedCalls: CALLTYPE.VALUE + `0xffffffff` + <Recipient Address> + `0xffffffff` + empty call', async () => {
    await context.universalProfile
      .connect(transferValue_0xffffffff)
      .execute(OPERATION_TYPES.CALL, context.recipientUniversalProfile.address, 1, '0x');
  });

  it('should revert: Permissions: CALL & TRANSFERVALUE; AllowedCalls: CALLTYPE.VALUE + `0xffffffff` + <Recipient Address> + `0xffffffff` + `setData(..)`', async () => {
    const setDataCalldata = context.universalProfile.interface.encodeFunctionData('setData', [
      '0x' + 'cafe'.repeat(16),
      '0x' + 'beef'.repeat(16),
    ]);

    await expect(
      context.universalProfile
        .connect(transferValue_0xffffffff)
        .execute(
          OPERATION_TYPES.CALL,
          context.recipientUniversalProfile.address,
          1,
          setDataCalldata,
        ),
    )
      .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
      .withArgs(
        transferValue_0xffffffff.address,
        context.recipientUniversalProfile.address,
        '0x7f23690c',
      );
  });

  it('should revert: Permissions: CALL & TRANSFERVALUE; AllowedCalls: CALLTYPE.VALUE + `0x00000000` + <Recipient Address> + `0xffffffff` + empty call', async () => {
    await expect(
      context.universalProfile
        .connect(transferValue_0x00000000)
        .execute(OPERATION_TYPES.CALL, context.recipientUniversalProfile.address, 1, '0x'),
    )
      .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
      .withArgs(
        transferValue_0x00000000.address,
        context.recipientUniversalProfile.address,
        '0x00000000',
      );
  });
});
