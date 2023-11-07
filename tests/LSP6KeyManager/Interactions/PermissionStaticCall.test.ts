import { expect } from 'chai';
import { ethers } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import {
  TargetContract,
  TargetContract__factory,
  SignatureValidator,
  OnERC721ReceivedExtension,
  SignatureValidator__factory,
  OnERC721ReceivedExtension__factory,
} from '../../../types';

// constants
import {
  ERC725YDataKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
  OPERATION_TYPES,
  ERC1271_VALUES,
  CALLTYPE,
} from '../../../constants';

// setup
import { LSP6TestContext } from '../../utils/context';
import { setupKeyManager } from '../../utils/fixtures';

// helpers
import {
  abiCoder,
  combineAllowedCalls,
  combineCallTypes,
  combinePermissions,
} from '../../utils/helpers';

export const shouldBehaveLikePermissionStaticCall = (
  buildContext: () => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  let addressCanMakeStaticCall: SignerWithAddress,
    addressCannotMakeStaticCall: SignerWithAddress,
    addressCanMakeStaticCallNoAllowedCalls: SignerWithAddress;

  let targetContract: TargetContract,
    signatureValidator: SignatureValidator,
    onERC721ReceivedContract: OnERC721ReceivedExtension;

  before(async () => {
    context = await buildContext();

    addressCanMakeStaticCall = context.accounts[1];
    addressCannotMakeStaticCall = context.accounts[2];
    addressCanMakeStaticCallNoAllowedCalls = context.accounts[3];

    targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

    signatureValidator = await new SignatureValidator__factory(context.accounts[0]).deploy();

    onERC721ReceivedContract = await new OnERC721ReceivedExtension__factory(
      context.accounts[0],
    ).deploy();

    const permissionKeys = [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        context.mainController.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCanMakeStaticCall.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
        addressCanMakeStaticCall.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCannotMakeStaticCall.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCanMakeStaticCallNoAllowedCalls.address.substring(2),
    ];

    const permissionsValues = [
      ALL_PERMISSIONS,
      PERMISSIONS.STATICCALL,
      combineAllowedCalls(
        [
          combineCallTypes(CALLTYPE.STATICCALL, CALLTYPE.VALUE),
          combineCallTypes(CALLTYPE.STATICCALL, CALLTYPE.VALUE),
          combineCallTypes(CALLTYPE.STATICCALL, CALLTYPE.VALUE),
        ],
        [targetContract.address, signatureValidator.address, onERC721ReceivedContract.address],
        ['0xffffffff', '0xffffffff', '0xffffffff'],
        ['0xffffffff', '0xffffffff', '0xffffffff'],
      ),
      PERMISSIONS.SETDATA,
      PERMISSIONS.STATICCALL,
    ];

    await setupKeyManager(context, permissionKeys, permissionsValues);
  });

  describe('when caller has ALL PERMISSIONS', () => {
    it('should pass and return a `string`', async () => {
      const expectedName = await targetContract.callStatic.getName();

      const targetContractPayload = targetContract.interface.encodeFunctionData('getName');

      const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.STATICCALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      const result = await context.keyManager
        .connect(context.mainController)
        .callStatic.execute(executePayload);

      const [decodedBytes] = abiCoder.decode(['bytes'], result);

      const [decodedResult] = abiCoder.decode(['string'], decodedBytes);
      expect(decodedResult).to.equal(expectedName);
    });

    it('should pass and return an array of number `uint256[]`', async () => {
      const expectedNumbers = await targetContract.callStatic.getDynamicArrayOf2Numbers();

      const targetContractPayload = targetContract.interface.encodeFunctionData(
        'getDynamicArrayOf2Numbers',
      );

      const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.STATICCALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      const result = await context.keyManager
        .connect(context.mainController)
        .callStatic.execute(executePayload);

      const [decodedBytes] = abiCoder.decode(['bytes'], result);

      const [decodedResult] = abiCoder.decode(['uint256[]'], decodedBytes);
      expect(decodedResult).to.deep.equal(expectedNumbers);
    });
  });

  describe('when caller has permission STATICCALL + some allowed calls', () => {
    describe('when calling a `view` function on a target contract', () => {
      it('should pass and return data when `value` param is 0 ', async () => {
        const targetContractPayload = targetContract.interface.encodeFunctionData('getName');

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

        const result = await context.keyManager
          .connect(addressCanMakeStaticCall)
          .callStatic.execute(executePayload);

        const [decodedBytes] = abiCoder.decode(['bytes'], result);

        const expectedName = await targetContract.callStatic.getName();

        const [decodedResult] = abiCoder.decode(['string'], decodedBytes);
        expect(decodedResult).to.equal(expectedName);
      });

      it('should revert with error `ERC725X_MsgValueDisallowedInStaticCall` if `value` param is not 0', async () => {
        const LyxAmount = ethers.utils.parseEther('3');

        const targetContractPayload = targetContract.interface.encodeFunctionData('getName');

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          targetContract.address,
          LyxAmount,
          targetContractPayload,
        ]);

        await expect(
          context.keyManager.connect(addressCanMakeStaticCall).callStatic.execute(executePayload),
        ).to.be.revertedWithCustomError(
          context.universalProfile,
          'ERC725X_MsgValueDisallowedInStaticCall',
        );
      });
    });

    describe('when calling a `pure` function on a target contract', () => {
      describe('when calling `isValidSignature(bytes32,bytes)` on a contract', () => {
        it('should pass and return data when `value` param is 0', async () => {
          const message = 'some message to sign';
          const signature = await context.mainController.signMessage(message);
          const messageHash = ethers.utils.hashMessage(message);

          const erc1271ContractPayload = signatureValidator.interface.encodeFunctionData(
            'isValidSignature',
            [messageHash, signature],
          );

          const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.STATICCALL,
            signatureValidator.address,
            0,
            erc1271ContractPayload,
          ]);

          const result = await context.keyManager
            .connect(addressCanMakeStaticCall)
            .callStatic.execute(executePayload);

          const [decodedBytes] = abiCoder.decode(['bytes'], result);

          const [decodedBytes4] = abiCoder.decode(['bytes4'], decodedBytes);
          expect(decodedBytes4).to.equal(ERC1271_VALUES.SUCCESS_VALUE);
        });

        it('should revert with error `ERC725X_MsgValueDisallowedInStaticCall` if `value` param is not 0', async () => {
          const lyxAmount = ethers.utils.parseEther('3');

          const message = 'some message to sign';
          const signature = await context.mainController.signMessage(message);
          const messageHash = ethers.utils.hashMessage(message);

          const erc1271ContractPayload = signatureValidator.interface.encodeFunctionData(
            'isValidSignature',
            [messageHash, signature],
          );

          const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.STATICCALL,
            signatureValidator.address,
            lyxAmount,
            erc1271ContractPayload,
          ]);

          await expect(
            context.keyManager.connect(addressCanMakeStaticCall).execute(executePayload),
          ).to.be.revertedWithCustomError(
            context.universalProfile,
            'ERC725X_MsgValueDisallowedInStaticCall',
          );
        });
      });

      describe('when calling `onERC721Received(address,address,uint256,bytes)` on a contract', () => {
        it('should pass and return data when `value` param is 0', async () => {
          // the params are not relevant for this test and just used as placeholders.
          const onERC721Payload = onERC721ReceivedContract.interface.encodeFunctionData(
            'onERC721Received',
            [
              context.mainController.address,
              context.mainController.address,
              1,
              ethers.utils.toUtf8Bytes('some data'),
            ],
          );

          // the important part is that the function is `view` and return the correct value
          const expectedReturnValue =
            onERC721ReceivedContract.interface.getSighash('onERC721Received');

          const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.STATICCALL,
            onERC721ReceivedContract.address,
            0,
            onERC721Payload,
          ]);

          const result = await context.keyManager
            .connect(addressCanMakeStaticCall)
            .callStatic.execute(executePayload);

          const [decodedBytes] = abiCoder.decode(['bytes'], result);

          const [decodedBytes4] = abiCoder.decode(['bytes4'], decodedBytes);
          expect(decodedBytes4).to.equal(expectedReturnValue);
        });
      });

      it('should revert with error `ERC725X_MsgValueDisallowedInStaticCall` if `value` param is not 0', async () => {
        const lyxAmount = ethers.utils.parseEther('3');

        // the params are not relevant for this test and just used as placeholders.
        const onERC721Payload = onERC721ReceivedContract.interface.encodeFunctionData(
          'onERC721Received',
          [
            context.mainController.address,
            context.mainController.address,
            1,
            ethers.utils.toUtf8Bytes('some data'),
          ],
        );

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          onERC721ReceivedContract.address,
          lyxAmount,
          onERC721Payload,
        ]);

        await expect(
          context.keyManager.connect(addressCanMakeStaticCall).execute(executePayload),
        ).to.be.revertedWithCustomError(
          context.universalProfile,
          'ERC725X_MsgValueDisallowedInStaticCall',
        );
      });
    });

    describe('when calling a state changing function at the target contract', () => {
      it('should revert (silently) if `value` parameter is 0', async () => {
        const initialValue = await targetContract.callStatic.getName();

        const targetContractPayload = targetContract.interface.encodeFunctionData('setName', [
          'modified name',
        ]);

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

        await expect(context.keyManager.connect(addressCanMakeStaticCall).execute(executePayload))
          .to.be.reverted;

        // ensure state hasn't changed.
        const newValue = await targetContract.callStatic.getName();
        expect(initialValue).to.equal(newValue);
      });

      it('should revert with error `ERC725X_MsgValueDisallowedInStaticCall` if `value` parameter is not 0', async () => {
        const lyxAmount = ethers.utils.parseEther('3');

        const targetContractPayload = targetContract.interface.encodeFunctionData('setName', [
          'modified name',
        ]);

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          targetContract.address,
          lyxAmount,
          targetContractPayload,
        ]);

        await expect(
          context.keyManager.connect(addressCanMakeStaticCall).execute(executePayload),
        ).to.be.revertedWithCustomError(
          context.universalProfile,
          'ERC725X_MsgValueDisallowedInStaticCall',
        );
      });
    });
  });

  describe('when caller has permission STATICCALL + no allowed calls', () => {
    it('should revert with `NotAllowedCall` error', async () => {
      const targetContractPayload = targetContract.interface.encodeFunctionData('getName');

      const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.STATICCALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      await expect(
        context.keyManager
          .connect(addressCanMakeStaticCallNoAllowedCalls)
          .callStatic.execute(executePayload),
      )
        .to.be.revertedWithCustomError(context.keyManager, 'NoCallsAllowed')
        .withArgs(addressCanMakeStaticCallNoAllowedCalls.address);
    });
  });

  describe('when caller does not have permission STATICCALL', () => {
    it('should revert with `NotAuthorised` error', async () => {
      const targetContractPayload = targetContract.interface.encodeFunctionData('getName');

      const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.STATICCALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      await expect(context.keyManager.connect(addressCannotMakeStaticCall).execute(executePayload))
        .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
        .withArgs(addressCannotMakeStaticCall.address, 'STATICCALL');
    });
  });

  describe('when caller has permission STATICCALL + 2 x allowed addresses', () => {
    let caller: SignerWithAddress;
    let allowedTargetContracts: [TargetContract, TargetContract];

    before(async () => {
      context = await buildContext();

      caller = context.accounts[1];

      allowedTargetContracts = [
        await new TargetContract__factory(context.accounts[0]).deploy(),
        await new TargetContract__factory(context.accounts[0]).deploy(),
      ];

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + caller.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + caller.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.STATICCALL,
        combineAllowedCalls(
          [CALLTYPE.STATICCALL, CALLTYPE.STATICCALL],
          [allowedTargetContracts[0].address, allowedTargetContracts[1].address],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    it('should revert when trying to interact with a non-allowed address', async () => {
      const targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.STATICCALL,
        targetContract.address,
        0,
        targetContract.interface.getSighash('getName'),
      ]);

      await expect(context.keyManager.connect(caller).execute(payload))
        .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
        .withArgs(
          caller.address,
          targetContract.address,
          targetContract.interface.getSighash('getName'),
        );
    });

    describe('when interacting with 1st allowed contract', () => {
      it('should allow to call view function -> getName()', async () => {
        const targetContract = allowedTargetContracts[0];

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          targetContract.address,
          0,
          targetContract.interface.getSighash('getName'),
        ]);

        const result = await context.keyManager.connect(caller).callStatic.execute(payload);

        const [decodedResult] = abiCoder.decode(['bytes'], result);

        const expectedName = await targetContract.getName();

        const [decodedString] = abiCoder.decode(['string'], decodedResult);
        expect(decodedString).to.equal(expectedName);
      });

      it('should allow to call view function -> getNumber()', async () => {
        const targetContract = allowedTargetContracts[0];

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          targetContract.address,
          0,
          targetContract.interface.getSighash('getNumber'),
        ]);

        const result = await context.keyManager.connect(caller).callStatic.execute(payload);

        const [decodedResult] = abiCoder.decode(['bytes'], result);

        const expectedNumber = await targetContract.getNumber();

        const [decodedNumber] = abiCoder.decode(['uint256'], decodedResult);
        expect(decodedNumber).to.equal(expectedNumber);
      });

      it('should revert when calling state changing function -> setName(string)', async () => {
        const targetContract = allowedTargetContracts[0];

        const targetPayload = targetContract.interface.encodeFunctionData('setName', ['new name']);

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          targetContract.address,
          0,
          targetPayload,
        ]);

        await expect(context.keyManager.connect(caller).callStatic.execute(payload)).to.be.reverted;
      });

      it('should revert when calling state changing function -> setNumber(uint256)', async () => {
        const targetContract = allowedTargetContracts[0];

        const targetPayload = targetContract.interface.encodeFunctionData('setNumber', [12345]);

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          targetContract.address,
          0,
          targetPayload,
        ]);

        await expect(context.keyManager.connect(caller).callStatic.execute(payload)).to.be.reverted;
      });
    });

    describe('when interacting with 2nd allowed contract', () => {
      it('should allow to interact with 2nd allowed contract - getName()', async () => {
        const targetContract = allowedTargetContracts[1];

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          targetContract.address,
          0,
          targetContract.interface.getSighash('getName'),
        ]);

        const result = await context.keyManager.connect(caller).callStatic.execute(payload);

        const [decodedResult] = abiCoder.decode(['bytes'], result);

        const expectedName = await targetContract.getName();

        const [decodedString] = abiCoder.decode(['string'], decodedResult);
        expect(decodedString).to.equal(expectedName);
      });

      it('should allow to interact with 2nd allowed contract - getNumber()', async () => {
        const targetContract = allowedTargetContracts[1];

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          targetContract.address,
          0,
          targetContract.interface.getSighash('getNumber'),
        ]);

        const result = await context.keyManager.connect(caller).callStatic.execute(payload);

        const [decodedResult] = abiCoder.decode(['bytes'], result);

        const expectedNumber = await targetContract.getNumber();

        const [decodedNumber] = abiCoder.decode(['uint256'], decodedResult);
        expect(decodedNumber).to.equal(expectedNumber);
      });

      it('should revert when calling state changing function -> setName(string)', async () => {
        const targetContract = allowedTargetContracts[1];

        const targetPayload = targetContract.interface.encodeFunctionData('setName', ['new name']);

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          targetContract.address,
          0,
          targetPayload,
        ]);

        await expect(context.keyManager.connect(caller).callStatic.execute(payload)).to.be.reverted;
      });

      it('should revert when calling state changing function -> setNumber(uint256)', async () => {
        const targetContract = allowedTargetContracts[1];

        const targetPayload = targetContract.interface.encodeFunctionData('setNumber', [12345]);

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          targetContract.address,
          0,
          targetPayload,
        ]);

        await expect(context.keyManager.connect(caller).callStatic.execute(payload)).to.be.reverted;
      });
    });
  });

  describe('when caller has permission SUPER_STATICCALL + 2 allowed addresses', () => {
    let addressWithSuperStaticCall: SignerWithAddress;
    let allowedTargetContracts: [TargetContract, TargetContract];

    before(async () => {
      context = await buildContext();

      addressWithSuperStaticCall = context.accounts[1];

      allowedTargetContracts = [
        await new TargetContract__factory(context.accounts[0]).deploy(),
        await new TargetContract__factory(context.accounts[0]).deploy(),
      ];

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressWithSuperStaticCall.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          addressWithSuperStaticCall.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.SUPER_STATICCALL,
        combineAllowedCalls(
          ['00000004', '00000004'],
          [allowedTargetContracts[0].address, allowedTargetContracts[1].address],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('when interacting with random contracts', () => {
      it('should bypass allowed calls check + allow ton interact with a random contract', async () => {
        const randomContract = await new TargetContract__factory(context.accounts[0]).deploy();

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          randomContract.address,
          0,
          randomContract.interface.getSighash('getName'),
        ]);

        const result = await context.keyManager
          .connect(addressWithSuperStaticCall)
          .callStatic.execute(payload);

        const [decodedBytes] = abiCoder.decode(['bytes'], result);

        const name = await randomContract.getName();

        const [decodedString] = abiCoder.decode(['string'], decodedBytes);
        expect(decodedString).to.equal(name);
      });

      it('should revert with error `ERC725X_MsgValueDisallowedInStaticCall` when `value` param is not 0', async () => {
        const randomContract = await new TargetContract__factory(context.accounts[0]).deploy();

        const lyxAmount = ethers.utils.parseEther('3');

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          randomContract.address,
          lyxAmount,
          randomContract.interface.getSighash('getName'),
        ]);

        await expect(
          context.keyManager.connect(addressWithSuperStaticCall).execute(payload),
        ).to.be.revertedWithCustomError(
          context.universalProfile,
          'ERC725X_MsgValueDisallowedInStaticCall',
        );
      });
    });
  });

  describe('when caller has permission SUPER_CALL + 2 allowed addresses', () => {
    let addressWithSuperCall: SignerWithAddress;
    let allowedTargetContracts: [TargetContract, TargetContract];

    before(async () => {
      context = await buildContext();

      addressWithSuperCall = context.accounts[1];

      allowedTargetContracts = [
        await new TargetContract__factory(context.accounts[0]).deploy(),
        await new TargetContract__factory(context.accounts[0]).deploy(),
      ];

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressWithSuperCall.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          addressWithSuperCall.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.SUPER_CALL,
        combineAllowedCalls(
          [CALLTYPE.STATICCALL, CALLTYPE.STATICCALL],
          [allowedTargetContracts[0].address, allowedTargetContracts[1].address],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('when interacting with 1st allowed contract', () => {
      it('should revert with `NotAuthorised` when using operation type `STATICCALL`', async () => {
        const targetPayload = allowedTargetContracts[0].interface.getSighash('getName');

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          allowedTargetContracts[0].address,
          0,
          targetPayload,
        ]);

        await expect(context.keyManager.connect(addressWithSuperCall).execute(payload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(addressWithSuperCall.address, 'STATICCALL');
      });
    });

    describe('when interacting with 2nd allowed contract', () => {
      it('should revert with `NotAuthorised` when using operation type `STATICCALL`', async () => {
        const targetPayload = allowedTargetContracts[1].interface.getSighash('getName');

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          allowedTargetContracts[1].address,
          0,
          targetPayload,
        ]);

        await expect(context.keyManager.connect(addressWithSuperCall).execute(payload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(addressWithSuperCall.address, 'STATICCALL');
      });
    });
  });

  describe('when caller has permission SUPER_CALL + STATICCALL + 2 allowed addresses', () => {
    let addressWithSuperCallAndStaticCall: SignerWithAddress;
    let allowedTargetContracts: [TargetContract, TargetContract];

    before(async () => {
      context = await buildContext();

      addressWithSuperCallAndStaticCall = context.accounts[1];

      allowedTargetContracts = [
        await new TargetContract__factory(context.accounts[0]).deploy(),
        await new TargetContract__factory(context.accounts[0]).deploy(),
      ];

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressWithSuperCallAndStaticCall.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          addressWithSuperCallAndStaticCall.address.substring(2),
      ];

      const permissionValues = [
        combinePermissions(PERMISSIONS.SUPER_CALL, PERMISSIONS.STATICCALL),
        combineAllowedCalls(
          [
            combineCallTypes(CALLTYPE.STATICCALL, CALLTYPE.VALUE),
            combineCallTypes(CALLTYPE.STATICCALL, CALLTYPE.VALUE),
          ],
          [allowedTargetContracts[0].address, allowedTargetContracts[1].address],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('when interacting with `view` function of 1st allowed contract', () => {
      it('should pass and return data when `value` param is 0', async () => {
        const targetPayload = allowedTargetContracts[0].interface.getSighash('getName');

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          allowedTargetContracts[0].address,
          0,
          targetPayload,
        ]);

        const result = await context.keyManager
          .connect(addressCanMakeStaticCall)
          .callStatic.execute(executePayload);

        const [decodedBytes] = abiCoder.decode(['bytes'], result);

        const expectedName = await targetContract.getName();

        const [decodedString] = abiCoder.decode(['string'], decodedBytes);
        expect(decodedString).to.equal(expectedName);
      });

      it('should revert with error `ERC725X_MsgValueDisallowedInStaticCall` when `value` param is not 0', async () => {
        const targetPayload = allowedTargetContracts[0].interface.getSighash('getName');

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          allowedTargetContracts[0].address,
          ethers.utils.parseEther('3'),
          targetPayload,
        ]);

        await expect(
          context.keyManager.connect(addressWithSuperCallAndStaticCall).execute(executePayload),
        ).to.be.revertedWithCustomError(
          context.universalProfile,
          'ERC725X_MsgValueDisallowedInStaticCall',
        );
      });
    });

    describe('when interacting with `view` function of 2nd allowed contract', () => {
      it('should pass and return data when `value` param is 0', async () => {
        const targetPayload = allowedTargetContracts[1].interface.getSighash('getName');

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          allowedTargetContracts[1].address,
          0,
          targetPayload,
        ]);

        const result = await context.keyManager
          .connect(addressCanMakeStaticCall)
          .callStatic.execute(executePayload);

        const [decodedResult] = abiCoder.decode(['bytes'], result);

        const expectedName = await targetContract.getName();

        const [decodedString] = abiCoder.decode(['string'], decodedResult);
        expect(decodedString).to.equal(expectedName);
      });

      it('should revert with error `ERC725X_MsgValueDisallowedInStaticCall` when `value` param is not 0', async () => {
        const targetPayload = allowedTargetContracts[1].interface.getSighash('getName');

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.STATICCALL,
          allowedTargetContracts[1].address,
          ethers.utils.parseEther('3'),
          targetPayload,
        ]);

        await expect(
          context.keyManager.connect(addressWithSuperCallAndStaticCall).execute(executePayload),
        ).to.be.revertedWithCustomError(
          context.universalProfile,
          'ERC725X_MsgValueDisallowedInStaticCall',
        );
      });
    });
  });
};
