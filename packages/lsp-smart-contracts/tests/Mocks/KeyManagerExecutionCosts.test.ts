import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

import { ERC725YDataKeys, INTERFACE_IDS } from '../../constants';
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';
import { ALL_PERMISSIONS, PERMISSIONS, CALLTYPE } from '@lukso/lsp6-contracts';

import { LSP6TestContext } from '../utils/context';
import {
  provider,
  combinePermissions,
  combineAllowedCalls,
  combineCallTypes,
} from '../utils/helpers';

import { setupKeyManager } from '../utils/fixtures';

describe('Key Manager gas cost interactions', () => {
  let UniversalProfile__factory;
  let LSP6KeyManager__factory;

  before(async () => {
    UniversalProfile__factory = await ethers.getContractFactory('UniversalProfile');
    LSP6KeyManager__factory = await ethers.getContractFactory('LSP6KeyManager');
  });

  describe('when using LSP6KeyManager with constructor', () => {
    const buildLSP6TestContext = async (): Promise<LSP6TestContext> => {
      const accounts = await ethers.getSigners();
      const mainController = accounts[0];

      const universalProfile = await UniversalProfile__factory.connect(mainController).deploy(
        mainController.address,
      );
      const keyManager = await LSP6KeyManager__factory.connect(mainController).deploy(
        await universalProfile.getAddress(),
      );

      return { accounts, mainController, universalProfile, keyManager };
    };

    describe('after deploying the contract', () => {
      let context: LSP6TestContext;

      let restrictedToOneAddress: SignerWithAddress,
        restrictedToOneAddressAndStandard: SignerWithAddress;

      let contractImplementsERC1271;

      before(async () => {
        context = await buildLSP6TestContext();

        restrictedToOneAddress = context.accounts[1];
        restrictedToOneAddressAndStandard = context.accounts[2];

        contractImplementsERC1271 = await UniversalProfile__factory.connect(
          context.accounts[3],
        ).deploy(context.accounts[3].address);

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
          value: ethers.parseEther('10'),
        });
      });

      describe('display gas cost', () => {
        it('when caller has any allowed address and standard allowed', async () => {
          const initialAccountBalance = await provider.getBalance(
            await contractImplementsERC1271.getAddress(),
          );

          const transferLyxPayload = context.universalProfile.interface.encodeFunctionData(
            'execute',
            [
              OPERATION_TYPES.CALL,
              await contractImplementsERC1271.getAddress(),
              ethers.parseEther('1'),
              '0x',
            ],
          );

          const tx = await context.keyManager
            .connect(context.mainController)
            .execute(transferLyxPayload);

          const receipt = await tx.wait();

          console.log(
            'gas cost LYX transfer - everything allowed: ',
            ethers.toNumber(receipt.gasUsed),
          );

          const newAccountBalance = await provider.getBalance(
            await contractImplementsERC1271.getAddress(),
          );
          expect(newAccountBalance).to.be.greaterThan(initialAccountBalance);
        });
      });

      it('when caller has only 1 x allowed address allowed', async () => {
        const initialAccountBalance = await provider.getBalance(
          await contractImplementsERC1271.getAddress(),
        );

        const transferLyxPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [
            OPERATION_TYPES.CALL,
            await contractImplementsERC1271.getAddress(),
            ethers.parseEther('1'),
            '0x',
          ],
        );

        const tx = await context.keyManager
          .connect(restrictedToOneAddress)
          .execute(transferLyxPayload);

        const receipt = await tx.wait();

        console.log(
          'gas cost LYX transfer - with 1 x allowed address: ',
          ethers.toNumber(receipt.gasUsed),
        );

        const newAccountBalance = await provider.getBalance(
          await contractImplementsERC1271.getAddress(),
        );
        expect(newAccountBalance).to.be.greaterThan(initialAccountBalance);
      });

      it('when caller has only 1 x allowed address + 1 x allowed standard allowed', async () => {
        const initialAccountBalance = await provider.getBalance(
          await contractImplementsERC1271.getAddress(),
        );

        const transferLyxPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [
            OPERATION_TYPES.CALL,
            await contractImplementsERC1271.getAddress(),
            ethers.parseEther('1'),
            '0x',
          ],
        );

        const tx = await context.keyManager
          .connect(restrictedToOneAddressAndStandard)
          .execute(transferLyxPayload);

        const receipt = await tx.wait();

        console.log(
          'gas cost LYX transfer - with 1 x allowed address + 1 x allowed standard: ',
          ethers.toNumber(receipt.gasUsed),
        );

        const newAccountBalance = await provider.getBalance(
          await contractImplementsERC1271.getAddress(),
        );
        expect(newAccountBalance).to.be.greaterThan(initialAccountBalance);
      });
    });
  });
});
