import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

import {
  LSP7Mintable,
  LSP7Mintable__factory,
  SignatureValidator,
  SignatureValidator__factory,
  TargetContract,
  TargetContract__factory,
  UniversalProfile__factory,
  UniversalProfile,
} from '../../../types';

// constants
import { ERC725YDataKeys, INTERFACE_IDS } from '../../../constants';
import { OPERATION_TYPES, ERC1271_VALUES } from '@lukso/lsp0-contracts';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';
import { ALL_PERMISSIONS, PERMISSIONS, CALLTYPE } from '@lukso/lsp6-contracts';

// setup
import { LSP6TestContext } from '../../utils/context';
import { setupKeyManager } from '../../utils/fixtures';

// helpers
import {
  abiCoder,
  provider,
  combinePermissions,
  combineAllowedCalls,
  combineCallTypes,
} from '../../utils/helpers';

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
      to: await context.universalProfile.getAddress(),
      value: ethers.parseEther('10'),
    });
  });

  describe('when caller has no value set for ALLOWEDSTANDARDS (= all interfaces whitelisted)', () => {
    it('should allow to interact with contract that does not implement any interface', async () => {
      const newName = 'Some Name';
      const targetPayload = targetContract.interface.encodeFunctionData('setName', [newName]);

      const upPayload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CALL,
        await targetContract.getAddress(),
        0,
        targetPayload,
      ]);

      await context.keyManager.connect(context.mainController).execute(upPayload);
      const result = await targetContract.getName();

      expect(result).to.equal(newName);
    });

    describe('should allow to interact with a contract that implement (+ register) any interface', () => {
      it('ERC1271', async () => {
        const sampleHash = ethers.keccak256(ethers.toUtf8Bytes('Sample Message'));
        const sampleSignature = await context.mainController.signMessage('Sample Message');

        const payload = signatureValidatorContract.interface.encodeFunctionData(
          'isValidSignature',
          [sampleHash, sampleSignature],
        );

        const upPayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          await signatureValidatorContract.getAddress(),
          0,
          payload,
        ]);

        const callResult = await context.keyManager
          .connect(context.mainController)
          .execute.staticCall(upPayload);

        const [decodedResult] = abiCoder.decode(['bytes'], callResult);

        const [decodedBytes4] = abiCoder.decode(['bytes4'], decodedResult);
        expect(decodedBytes4).to.equal(ERC1271_VALUES.SUCCESS_VALUE);
      });

      it('LSP0 (ERC725Account)', async () => {
        const key = ethers.keccak256(ethers.toUtf8Bytes('Key'));
        const value = '0xcafecafecafecafe';

        const setDataPayload = context.universalProfile.interface.encodeFunctionData('setData', [
          key,
          value,
        ]);

        await context.keyManager.connect(context.mainController).execute(setDataPayload);

        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });
    });
  });

  describe('when caller has only ERC1271 interface ID set for ALLOWED STANDARDS', () => {
    describe('when interacting with a contract that implements + register ERC1271 interface', () => {
      it('should pass', async () => {
        const sampleHash = ethers.keccak256(ethers.toUtf8Bytes('Sample Message'));
        const sampleSignature = await addressCanInteractOnlyWithERC1271.signMessage(
          'Sample Message',
        );

        const payload = signatureValidatorContract.interface.encodeFunctionData(
          'isValidSignature',
          [sampleHash, sampleSignature],
        );

        const upPayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          await signatureValidatorContract.getAddress(),
          0,
          payload,
        ]);

        const callResult = await context.keyManager
          .connect(addressCanInteractOnlyWithERC1271)
          .execute.staticCall(upPayload);

        const [decodedResult] = abiCoder.decode(['bytes'], callResult);

        const [decodedBytes4] = abiCoder.decode(['bytes4'], decodedResult);
        expect(decodedBytes4).to.equal(ERC1271_VALUES.SUCCESS_VALUE);
      });
    });

    describe('when trying to interact an ERC725Account (LSP0)', () => {
      it('should allow to transfer LYX', async () => {
        const initialAccountBalance = await provider.getBalance(otherUniversalProfile.target);

        const transferLyxPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, otherUniversalProfile.target, ethers.parseEther('1'), '0x'],
        );

        await context.keyManager
          .connect(addressCanInteractOnlyWithERC1271)
          .execute(transferLyxPayload);

        const newAccountBalance = await provider.getBalance(otherUniversalProfile.target);
        expect(newAccountBalance).to.be.gt(initialAccountBalance);
      });
    });

    describe('when interacting with contract that does not implement ERC1271', () => {
      it('should fail', async () => {
        const targetPayload = targetContract.interface.encodeFunctionData('setName', ['New Name']);

        const upPayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          await targetContract.getAddress(),
          0,
          targetPayload,
        ]);

        await expect(
          context.keyManager.connect(addressCanInteractOnlyWithERC1271).execute(upPayload),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
          .withArgs(
            addressCanInteractOnlyWithERC1271.address,
            await targetContract.getAddress(),
            targetContract.interface.getFunction('setName').selector,
          );
      });
    });
  });

  describe('when caller has only LSP7 interface ID set for ALLOWED STANDARDS', () => {
    describe('when interacting with a contract that implements + register ERC1271 interface', () => {
      it('should fail', async () => {
        const sampleHash = ethers.keccak256(ethers.toUtf8Bytes('Sample Message'));
        const sampleSignature = await addressCanInteractOnlyWithLSP7.signMessage('Sample Message');

        const payload = signatureValidatorContract.interface.encodeFunctionData(
          'isValidSignature',
          [sampleHash, sampleSignature],
        );

        const upPayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          await signatureValidatorContract.getAddress(),
          0,
          payload,
        ]);

        await expect(context.keyManager.connect(addressCanInteractOnlyWithLSP7).execute(upPayload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
          .withArgs(
            addressCanInteractOnlyWithLSP7.address,
            await signatureValidatorContract.getAddress(),
            signatureValidatorContract.interface.getFunction('isValidSignature').selector,
          );
      });
    });

    describe('when interacting with an ERC725Account (LSP0)', () => {
      it('should fail when trying to transfer LYX', async () => {
        const transferLyxPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, otherUniversalProfile.target, ethers.parseEther('1'), '0x'],
        );

        await expect(
          context.keyManager.connect(addressCanInteractOnlyWithLSP7).execute(transferLyxPayload),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
          .withArgs(
            addressCanInteractOnlyWithLSP7.address,
            otherUniversalProfile.target,
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
          LSP4_TOKEN_TYPES.TOKEN,
          false,
        );

        lsp7TokenB = await new LSP7Mintable__factory(context.accounts[0]).deploy(
          'LSP7 Token B',
          'TKNB',
          context.accounts[0].address,
          LSP4_TOKEN_TYPES.TOKEN,
          false,
        );

        lsp7TokenC = await new LSP7Mintable__factory(context.accounts[0]).deploy(
          'LSP7 Token C',
          'TKNC',
          context.accounts[0].address,
          LSP4_TOKEN_TYPES.TOKEN,
          false,
        );

        await lsp7TokenA
          .connect(context.accounts[0])
          .mint(await context.universalProfile.getAddress(), 100, false, '0x');

        await lsp7TokenB
          .connect(context.accounts[0])
          .mint(await context.universalProfile.getAddress(), 100, false, '0x');

        await lsp7TokenC
          .connect(context.accounts[0])
          .mint(await context.universalProfile.getAddress(), 100, false, '0x');
      });

      it('-> interacting with lsp7TokenA', async () => {
        const recipient = context.accounts[5].address;
        const amount = 10;

        const transferPayload = lsp7TokenA.interface.encodeFunctionData('transfer', [
          await context.universalProfile.getAddress(),
          recipient,
          amount,
          true,
          '0x',
        ]);

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          await lsp7TokenA.getAddress(),
          0,
          transferPayload,
        ]);

        await context.keyManager.connect(addressCanInteractOnlyWithLSP7).execute(executePayload);

        expect(await lsp7TokenA.balanceOf(recipient)).to.equal(amount);
        expect(await lsp7TokenA.balanceOf(await context.universalProfile.getAddress())).to.equal(
          90,
        );
      });

      it('-> interacting with lsp7TokenB', async () => {
        const recipient = context.accounts[5].address;
        const amount = 10;

        const transferPayload = lsp7TokenB.interface.encodeFunctionData('transfer', [
          await context.universalProfile.getAddress(),
          recipient,
          amount,
          true,
          '0x',
        ]);

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          lsp7TokenB.target,
          0,
          transferPayload,
        ]);

        await context.keyManager.connect(addressCanInteractOnlyWithLSP7).execute(executePayload);

        expect(await lsp7TokenB.balanceOf(recipient)).to.equal(amount);
        expect(await lsp7TokenB.balanceOf(await context.universalProfile.getAddress())).to.equal(
          90,
        );
      });

      it('-> interacting with lsp7TokenC', async () => {
        const recipient = context.accounts[5].address;
        const amount = 10;

        const transferPayload = lsp7TokenC.interface.encodeFunctionData('transfer', [
          await context.universalProfile.getAddress(),
          recipient,
          amount,
          true,
          '0x',
        ]);

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          lsp7TokenC.target,
          0,
          transferPayload,
        ]);

        await context.keyManager.connect(addressCanInteractOnlyWithLSP7).execute(executePayload);

        expect(await lsp7TokenC.balanceOf(recipient)).to.equal(amount);
        expect(await lsp7TokenC.balanceOf(await context.universalProfile.getAddress())).to.equal(
          90,
        );
      });
    });
  });
};
