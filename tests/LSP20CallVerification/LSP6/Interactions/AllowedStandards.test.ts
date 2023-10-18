import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import {
  SignatureValidator,
  SignatureValidator__factory,
  TargetContract,
  TargetContract__factory,
  UniversalProfile,
  UniversalProfile__factory,
  LSP7Mintable,
  LSP7Mintable__factory,
} from '../../../../types';

// constants
import {
  ALL_PERMISSIONS,
  ERC1271_VALUES,
  ERC725YDataKeys,
  INTERFACE_IDS,
  OPERATION_TYPES,
  PERMISSIONS,
  CALLTYPE,
} from '../../../../constants';

// setup
import { LSP6TestContext } from '../../../utils/context';
import { setupKeyManager } from '../../../utils/fixtures';

// helpers
import {
  abiCoder,
  provider,
  combinePermissions,
  combineAllowedCalls,
  combineCallTypes,
} from '../../../utils/helpers';

export const shouldBehaveLikeAllowedStandards = (buildContext: () => Promise<LSP6TestContext>) => {
  let context: LSP6TestContext;

  let addressCanInteractOnlyWithERC1271: SignerWithAddress,
    addressCanInteractOnlyWithLSP7: SignerWithAddress;

  let targetContract: TargetContract,
    signatureValidatorContract: SignatureValidator,
    otherUniversalProfile: UniversalProfile;

  before(async () => {
    context = await buildContext();

    addressCanInteractOnlyWithERC1271 = context.accounts[1];
    addressCanInteractOnlyWithLSP7 = context.accounts[2];

    targetContract = await new TargetContract__factory(context.accounts[0]).deploy();
    signatureValidatorContract = await new SignatureValidator__factory(
      context.accounts[0],
    ).deploy();

    // test to interact with an other UniversalProfile (e.g.: transfer LYX)
    otherUniversalProfile = await new UniversalProfile__factory(context.accounts[3]).deploy(
      context.accounts[3].address,
    );

    const permissionsKeys = [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        context.mainController.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCanInteractOnlyWithERC1271.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCanInteractOnlyWithLSP7.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
        addressCanInteractOnlyWithERC1271.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
        addressCanInteractOnlyWithLSP7.address.substring(2),
    ];

    const permissionsValues = [
      ALL_PERMISSIONS,
      combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
      combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
      combineAllowedCalls(
        [combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL)],
        ['0xffffffffffffffffffffffffffffffffffffffff'],
        [INTERFACE_IDS.ERC1271],
        ['0xffffffff'],
      ),
      combineAllowedCalls(
        [combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL)],
        ['0xffffffffffffffffffffffffffffffffffffffff'],
        [INTERFACE_IDS.LSP7DigitalAsset],
        ['0xffffffff'],
      ),
    ];

    await setupKeyManager(context, permissionsKeys, permissionsValues);

    await context.mainController.sendTransaction({
      to: context.universalProfile.address,
      value: ethers.utils.parseEther('10'),
    });
  });

  describe('when caller has no value set for ALLOWEDSTANDARDS (= all interfaces whitelisted)', () => {
    it('should allow to interact with contract that does not implement any interface', async () => {
      const newName = 'Some Name';
      const targetPayload = targetContract.interface.encodeFunctionData('setName', [newName]);

      await context.universalProfile
        .connect(context.mainController)
        .execute(OPERATION_TYPES.CALL, targetContract.address, 0, targetPayload);
      const result = await targetContract.callStatic.getName();

      expect(result).to.equal(newName);
    });

    describe('should allow to interact with a contract that implement (+ register) any interface', () => {
      it('ERC1271', async () => {
        const sampleHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Sample Message'));
        const sampleSignature = await context.mainController.signMessage('Sample Message');

        const payload = signatureValidatorContract.interface.encodeFunctionData(
          'isValidSignature',
          [sampleHash, sampleSignature],
        );

        const data = await context.universalProfile
          .connect(context.mainController)
          .callStatic.execute(OPERATION_TYPES.CALL, signatureValidatorContract.address, 0, payload);

        const [result] = abiCoder.decode(['bytes4'], data);
        expect(result).to.equal(ERC1271_VALUES.SUCCESS_VALUE);
      });

      it('LSP0 (ERC725Account)', async () => {
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Key'));
        const value = '0xcafecafecafecafe';

        await context.universalProfile.connect(context.mainController).setData(key, value);

        const result = await context.universalProfile.callStatic['getData(bytes32)'](key);
        expect(result).to.equal(value);
      });
    });
  });

  describe('when caller has only ERC1271 interface ID set for ALLOWED STANDARDS', () => {
    describe('when interacting with a contract that implements + register ERC1271 interface', () => {
      it('should pass', async () => {
        const sampleHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Sample Message'));
        const sampleSignature = await addressCanInteractOnlyWithERC1271.signMessage(
          'Sample Message',
        );

        const payload = signatureValidatorContract.interface.encodeFunctionData(
          'isValidSignature',
          [sampleHash, sampleSignature],
        );

        const data = await context.universalProfile
          .connect(addressCanInteractOnlyWithERC1271)
          .callStatic.execute(OPERATION_TYPES.CALL, signatureValidatorContract.address, 0, payload);

        const [result] = abiCoder.decode(['bytes4'], data);
        expect(result).to.equal(ERC1271_VALUES.SUCCESS_VALUE);
      });
    });

    describe('when trying to interact an ERC725Account (LSP0)', () => {
      it('should allow to transfer LYX', async () => {
        const initialAccountBalance = await provider.getBalance(otherUniversalProfile.address);

        await context.universalProfile
          .connect(addressCanInteractOnlyWithERC1271)
          .execute(
            OPERATION_TYPES.CALL,
            otherUniversalProfile.address,
            ethers.utils.parseEther('1'),
            '0x',
          );

        const newAccountBalance = await provider.getBalance(otherUniversalProfile.address);
        expect(newAccountBalance).to.be.gt(initialAccountBalance);
      });
    });

    describe('when interacting with contract that does not implement ERC1271', () => {
      it('should fail', async () => {
        const targetPayload = targetContract.interface.encodeFunctionData('setName', ['New Name']);

        await expect(
          context.universalProfile
            .connect(addressCanInteractOnlyWithERC1271)
            .execute(OPERATION_TYPES.CALL, targetContract.address, 0, targetPayload),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
          .withArgs(
            addressCanInteractOnlyWithERC1271.address,
            targetContract.address,
            targetContract.interface.getSighash('setName'),
          );
      });
    });
  });

  describe('when caller has only LSP7 interface ID set for ALLOWED STANDARDS', () => {
    describe('when interacting with a contract that implements + register ERC1271 interface', () => {
      it('should fail', async () => {
        const sampleHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Sample Message'));
        const sampleSignature = await addressCanInteractOnlyWithLSP7.signMessage('Sample Message');

        const payload = signatureValidatorContract.interface.encodeFunctionData(
          'isValidSignature',
          [sampleHash, sampleSignature],
        );

        await expect(
          context.universalProfile
            .connect(addressCanInteractOnlyWithLSP7)
            .execute(OPERATION_TYPES.CALL, signatureValidatorContract.address, 0, payload),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
          .withArgs(
            addressCanInteractOnlyWithLSP7.address,
            signatureValidatorContract.address,
            signatureValidatorContract.interface.getSighash('isValidSignature'),
          );
      });
    });

    describe('when interacting with an ERC725Account (LSP0)', () => {
      it('should fail when trying to transfer LYX', async () => {
        await expect(
          context.universalProfile
            .connect(addressCanInteractOnlyWithLSP7)
            .execute(
              OPERATION_TYPES.CALL,
              otherUniversalProfile.address,
              ethers.utils.parseEther('1'),
              '0x',
            ),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
          .withArgs(
            addressCanInteractOnlyWithLSP7.address,
            otherUniversalProfile.address,
            '0x00000000',
          );
      });
    });

    describe('should be allowed to interact with any LSP7 token contracts', () => {
      let lsp7TokenA: LSP7Mintable;
      let lsp7TokenB: LSP7Mintable;
      let lsp7TokenC: LSP7Mintable;

      before(async () => {
        lsp7TokenA = await new LSP7Mintable__factory(context.accounts[0]).deploy(
          'LSP7 Token A',
          'TKNA',
          context.accounts[0].address,
          false,
        );

        lsp7TokenB = await new LSP7Mintable__factory(context.accounts[0]).deploy(
          'LSP7 Token B',
          'TKNB',
          context.accounts[0].address,
          false,
        );

        lsp7TokenC = await new LSP7Mintable__factory(context.accounts[0]).deploy(
          'LSP7 Token C',
          'TKNC',
          context.accounts[0].address,
          false,
        );

        await lsp7TokenA
          .connect(context.accounts[0])
          .mint(context.universalProfile.address, 100, false, '0x');

        await lsp7TokenB
          .connect(context.accounts[0])
          .mint(context.universalProfile.address, 100, false, '0x');

        await lsp7TokenC
          .connect(context.accounts[0])
          .mint(context.universalProfile.address, 100, false, '0x');
      });

      it('-> interacting with lsp7TokenA', async () => {
        const recipient = context.accounts[5].address;
        const amount = 10;

        const transferPayload = lsp7TokenA.interface.encodeFunctionData('transfer', [
          context.universalProfile.address,
          recipient,
          amount,
          true,
          '0x',
        ]);

        await context.universalProfile
          .connect(addressCanInteractOnlyWithLSP7)
          .execute(OPERATION_TYPES.CALL, lsp7TokenA.address, 0, transferPayload);

        expect(await lsp7TokenA.balanceOf(recipient)).to.equal(amount);
        expect(await lsp7TokenA.balanceOf(context.universalProfile.address)).to.equal(90);
      });

      it('-> interacting with lsp7TokenB', async () => {
        const recipient = context.accounts[5].address;
        const amount = 10;

        const transferPayload = lsp7TokenB.interface.encodeFunctionData('transfer', [
          context.universalProfile.address,
          recipient,
          amount,
          true,
          '0x',
        ]);

        await context.universalProfile
          .connect(addressCanInteractOnlyWithLSP7)
          .execute(OPERATION_TYPES.CALL, lsp7TokenB.address, 0, transferPayload);

        expect(await lsp7TokenB.balanceOf(recipient)).to.equal(amount);
        expect(await lsp7TokenB.balanceOf(context.universalProfile.address)).to.equal(90);
      });

      it('-> interacting with lsp7TokenC', async () => {
        const recipient = context.accounts[5].address;
        const amount = 10;

        const transferPayload = lsp7TokenC.interface.encodeFunctionData('transfer', [
          context.universalProfile.address,
          recipient,
          amount,
          true,
          '0x',
        ]);

        await context.universalProfile
          .connect(addressCanInteractOnlyWithLSP7)
          .execute(OPERATION_TYPES.CALL, lsp7TokenC.address, 0, transferPayload);

        expect(await lsp7TokenC.balanceOf(recipient)).to.equal(amount);
        expect(await lsp7TokenC.balanceOf(context.universalProfile.address)).to.equal(90);
      });
    });
  });
};
