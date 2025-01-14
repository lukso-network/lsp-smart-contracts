import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { calculateCreate2 } from 'eth-create2-calculator';

import { TargetContract__factory } from '../../../../typechain';

// constants
import { ERC725YDataKeys } from '../../../../constants';
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';
import { ALL_PERMISSIONS, PERMISSIONS } from '@lukso/lsp6-contracts';

// setup
import { LSP6TestContext } from '../../../utils/context';
import { setupKeyManager } from '../../../utils/fixtures';

export const shouldBehaveLikePermissionDeploy = (buildContext: () => Promise<LSP6TestContext>) => {
  let context: LSP6TestContext;

  let addressCanDeploy: SignerWithAddress, addressCannotDeploy: SignerWithAddress;

  before(async () => {
    context = await buildContext();

    addressCanDeploy = context.accounts[1];
    addressCannotDeploy = context.accounts[2];

    const permissionKeys = [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        context.mainController.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCanDeploy.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCannotDeploy.address.substring(2),
    ];

    const permissionsValues = [ALL_PERMISSIONS, PERMISSIONS.DEPLOY, PERMISSIONS.CALL];

    await setupKeyManager(context, permissionKeys, permissionsValues);
  });

  describe('when caller has ALL PERMISSIONS', () => {
    it('should be allowed to deploy a contract TargetContract via CREATE', async () => {
      const contractBytecodeToDeploy = TargetContract__factory.bytecode;

      const expectedContractAddress = await context.universalProfile.execute.staticCall(
        OPERATION_TYPES.CREATE, // operation type
        ethers.ZeroAddress, // recipient
        0, // value
        contractBytecodeToDeploy,
      );

      await expect(
        context.universalProfile.connect(context.mainController).execute(
          OPERATION_TYPES.CREATE, // operation type
          ethers.ZeroAddress, // recipient
          0, // value
          contractBytecodeToDeploy,
        ),
      )
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(
          OPERATION_TYPES.CREATE,
          ethers.getAddress(expectedContractAddress),
          0,
          ethers.zeroPadValue('0x00', 32),
        );
    });

    it('should be allowed to deploy a contract TargetContract via CREATE2', async () => {
      const contractBytecodeToDeploy = TargetContract__factory.bytecode;
      const salt = ethers.hexlify(ethers.randomBytes(32));

      const preComputedAddress = calculateCreate2(
        await context.universalProfile.getAddress(),
        salt,
        contractBytecodeToDeploy,
      ).toLowerCase();

      await expect(
        context.universalProfile
          .connect(context.mainController)
          .execute(
            OPERATION_TYPES.CREATE2,
            ethers.ZeroAddress,
            0,
            contractBytecodeToDeploy + salt.substring(2),
          ),
      )
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(OPERATION_TYPES.CREATE2, ethers.getAddress(preComputedAddress), 0, salt);
    });
  });

  describe('when caller is an address with permission DEPLOY', () => {
    it('should be allowed to deploy a contract TargetContract via CREATE', async () => {
      const contractBytecodeToDeploy = TargetContract__factory.bytecode;

      const expectedContractAddress = await context.universalProfile
        .connect(addressCanDeploy)
        .execute.staticCall(
          OPERATION_TYPES.CREATE,
          ethers.ZeroAddress,
          0,
          contractBytecodeToDeploy,
        );

      await expect(
        context.universalProfile
          .connect(addressCanDeploy)
          .execute(OPERATION_TYPES.CREATE, ethers.ZeroAddress, 0, contractBytecodeToDeploy),
      )
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(
          OPERATION_TYPES.CREATE,
          ethers.getAddress(expectedContractAddress),
          0,
          ethers.zeroPadValue('0x00', 32),
        );
    });

    it('should be allowed to deploy a contract TargetContract via CREATE2', async () => {
      const contractBytecodeToDeploy = TargetContract__factory.bytecode;
      const salt = '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe';

      const preComputedAddress = calculateCreate2(
        await context.universalProfile.getAddress(),
        salt,
        contractBytecodeToDeploy,
      ).toLowerCase();

      await expect(
        context.universalProfile
          .connect(addressCanDeploy)
          .execute(
            OPERATION_TYPES.CREATE2,
            ethers.ZeroAddress,
            0,
            contractBytecodeToDeploy + salt.substring(2),
          ),
      )
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(OPERATION_TYPES.CREATE2, ethers.getAddress(preComputedAddress), 0, salt);
    });
  });

  describe('when caller is an address that does not have the permission DEPLOY', () => {
    describe('-> interacting via execute(...)', () => {
      it('should revert when trying to deploy a contract via CREATE', async () => {
        const contractBytecodeToDeploy = TargetContract__factory.bytecode;

        await expect(
          context.universalProfile
            .connect(addressCannotDeploy)
            .execute(OPERATION_TYPES.CREATE, ethers.ZeroAddress, 0, contractBytecodeToDeploy),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(addressCannotDeploy.address, 'DEPLOY');
      });

      it('should revert when trying to deploy a contract via CREATE2', async () => {
        const contractBytecodeToDeploy = TargetContract__factory.bytecode;
        const salt = '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe';

        await expect(
          context.universalProfile
            .connect(addressCannotDeploy)
            .execute(
              OPERATION_TYPES.CREATE2,
              ethers.ZeroAddress,
              0,
              contractBytecodeToDeploy + salt.substring(2),
            ),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(addressCannotDeploy.address, 'DEPLOY');
      });
    });
  });
};
