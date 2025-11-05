import { expect } from 'chai';

import {
  type UniversalProfile,
  UniversalProfile__factory,
} from '../../../universalprofile-contracts/types/ethers-contracts/index.js';
import { LSP6KeyManager__factory } from '../../../lsp6-contracts/types/ethers-contracts/index.js';

import { ERC725YDataKeys, INTERFACE_IDS } from '../../constants.js';
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';
import { ALL_PERMISSIONS, PERMISSIONS, CALLTYPE } from '@lukso/lsp6-contracts';

import { type LSP6TestContext } from '../utils/context.js';
import { combinePermissions, combineAllowedCalls, combineCallTypes } from '../utils/helpers.js';

import { setupKeyManager } from '../utils/fixtures.js';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import { parseEther, toNumber } from 'ethers';

describe('Key Manager gas cost interactions', () => {
  describe('when using LSP6KeyManager with constructor', () => {
    const buildLSP6TestContext = async (): Promise<LSP6TestContext> => {
      const { network } = await import('hardhat');
      const { ethers, networkHelpers } = await network.connect();
      const accounts = await ethers.getSigners();
      const mainController = accounts[0];

      const universalProfile = await new UniversalProfile__factory(mainController).deploy(
        mainController.address,
      );
      const keyManager = await new LSP6KeyManager__factory(mainController).deploy(
        await universalProfile.getAddress(),
      );

      return { ethers, networkHelpers, accounts, mainController, universalProfile, keyManager };
    };

    describe('after deploying the contract', () => {
      let context: LSP6TestContext;

      let restrictedToOneAddress: HardhatEthersSigner,
        restrictedToOneAddressAndStandard: HardhatEthersSigner;

      let contractImplementsERC1271: UniversalProfile;

      before(async () => {
        context = await buildLSP6TestContext();

        restrictedToOneAddress = context.accounts[1];
        restrictedToOneAddressAndStandard = context.accounts[2];

        contractImplementsERC1271 = await new UniversalProfile__factory(context.accounts[3]).deploy(
          context.accounts[3].address,
        );

        const permissionKeys = [
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            context.mainController.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            restrictedToOneAddress.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            restrictedToOneAddressAndStandard.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            restrictedToOneAddress.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            restrictedToOneAddressAndStandard.address.substring(2),
        ];

        const permissionValues = [
          ALL_PERMISSIONS,
          combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
          combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
          combineAllowedCalls(
            [combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL)],
            [await contractImplementsERC1271.getAddress()],
            [INTERFACE_IDS.ERC1271],
            ['0xffffffff'],
          ),
          combineAllowedCalls(
            [combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL)],
            [await contractImplementsERC1271.getAddress()],
            ['0xffffffff'],
            ['0xffffffff'],
          ),
        ];

        await setupKeyManager(context, permissionKeys, permissionValues);

        await context.mainController.sendTransaction({
          to: await context.universalProfile.getAddress(),
          value: parseEther('10'),
        });
      });

      describe('display gas cost', () => {
        it('when caller has any allowed address and standard allowed', async () => {
          const initialAccountBalance = await context.ethers.provider.getBalance(
            await contractImplementsERC1271.getAddress(),
          );

          const transferLyxPayload = context.universalProfile.interface.encodeFunctionData(
            'execute',
            [
              OPERATION_TYPES.CALL,
              await contractImplementsERC1271.getAddress(),
              parseEther('1'),
              '0x',
            ],
          );

          const tx = await context.keyManager
            .connect(context.mainController)
            .execute(transferLyxPayload);

          const receipt = await tx.wait();

          console.log('gas cost LYX transfer - everything allowed: ', toNumber(receipt!.gasUsed));

          const newAccountBalance = await context.ethers.provider.getBalance(
            await contractImplementsERC1271.getAddress(),
          );
          expect(newAccountBalance).to.be.greaterThan(initialAccountBalance);
        });
      });

      it('when caller has only 1 x allowed address allowed', async () => {
        const initialAccountBalance = await context.ethers.provider.getBalance(
          await contractImplementsERC1271.getAddress(),
        );

        const transferLyxPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [
            OPERATION_TYPES.CALL,
            await contractImplementsERC1271.getAddress(),
            parseEther('1'),
            '0x',
          ],
        );

        const tx = await context.keyManager
          .connect(restrictedToOneAddress)
          .execute(transferLyxPayload);

        const receipt = await tx.wait();

        console.log(
          'gas cost LYX transfer - with 1 x allowed address: ',
          toNumber(receipt!.gasUsed),
        );

        const newAccountBalance = await context.ethers.provider.getBalance(
          await contractImplementsERC1271.getAddress(),
        );
        expect(newAccountBalance).to.be.greaterThan(initialAccountBalance);
      });

      it('when caller has only 1 x allowed address + 1 x allowed standard allowed', async () => {
        const initialAccountBalance = await context.ethers.provider.getBalance(
          await contractImplementsERC1271.getAddress(),
        );

        const transferLyxPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [
            OPERATION_TYPES.CALL,
            await contractImplementsERC1271.getAddress(),
            parseEther('1'),
            '0x',
          ],
        );

        const tx = await context.keyManager
          .connect(restrictedToOneAddressAndStandard)
          .execute(transferLyxPayload);

        const receipt = await tx.wait();

        console.log(
          'gas cost LYX transfer - with 1 x allowed address + 1 x allowed standard: ',
          toNumber(receipt!.gasUsed),
        );

        const newAccountBalance = await context.ethers.provider.getBalance(
          await contractImplementsERC1271.getAddress(),
        );
        expect(newAccountBalance).to.be.greaterThan(initialAccountBalance);
      });
    });
  });
});
