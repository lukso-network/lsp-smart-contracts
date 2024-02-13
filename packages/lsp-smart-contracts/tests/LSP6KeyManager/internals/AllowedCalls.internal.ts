import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { TargetContract, TargetContract__factory } from '../../../types';

// constants
import {
  ALL_PERMISSIONS,
  ERC725YDataKeys,
  OPERATION_TYPES,
  PERMISSIONS,
  CALLTYPE,
} from '../../../constants';

// setup
import { LSP6InternalsTestContext } from '../../utils/context';
import { setupKeyManagerHelper } from '../../utils/fixtures';

// helpers
import { combinePermissions, combineAllowedCalls, combineCallTypes } from '../../utils/helpers';

async function teardownKeyManagerHelper(
  context: LSP6InternalsTestContext,
  permissionsKeys: string[],
) {
  const teardownPayload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
    permissionsKeys,
    Array(permissionsKeys.length).fill('0x'),
  ]);

  await context.keyManagerInternalTester.connect(context.mainController).execute(teardownPayload);
}

export const testAllowedCallsInternals = (
  buildContext: () => Promise<LSP6InternalsTestContext>,
) => {
  let context: LSP6InternalsTestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('`isCompactBytesArrayOfAllowedCalls`', () => {
    describe('when passing a compact bytes array with 1 element', () => {
      it('should return `true` if element is 32 bytes long', async () => {
        const allowedCalls = combineAllowedCalls(
          [CALLTYPE.VALUE],
          [context.accounts[5].address],
          ['0xffffffff'],
          ['0xffffffff'],
        );

        const result = await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedCalls(
          allowedCalls,
        );

        expect(result).to.be.true;
      });

      it('should return `false` if element is not 28 bytes long', async () => {
        const allowedCalls = ethers.utils.hexlify(ethers.utils.randomBytes(27));
        const result = await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedCalls(
          allowedCalls,
        );
        expect(result).to.be.false;
      });

      it('should return `false` if element is 0x0000 (zero length elements not allowed)', async () => {
        const allowedCalls = '0x0000';
        const result = await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedCalls(
          allowedCalls,
        );
        expect(result).to.be.false;
      });

      it('should return `false` if there are just 2 x length bytes but not followed by the value (the allowed calls)', async () => {
        const allowedCalls = '0x0020';
        const result = await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedCalls(
          allowedCalls,
        );
        expect(result).to.be.false;
      });

      it('should return `false` if there are just 2 x length bytes equal to `0x0002`', async () => {
        const allowedCalls = '0x0002';
        const result = await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedCalls(
          allowedCalls,
        );
        expect(result).to.be.false;
      });
    });

    describe('when passing a compact bytes array with 3 x elements', () => {
      it('should pass if all elements are 28 bytes long', async () => {
        const allowedCalls = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE, CALLTYPE.VALUE],
          [context.accounts[5].address, context.accounts[6].address, context.accounts[7].address],
          ['0xffffffff', '0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff', '0xffffffff'],
        );

        const result = await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedCalls(
          allowedCalls,
        );

        expect(result).to.be.true;
      });

      it('should fail if one of the element is not 28 bytes long', async () => {
        const allowedCalls = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            context.accounts[5].address,
            ethers.utils.hexlify(ethers.utils.randomBytes(27)),
            context.accounts[7].address,
          ],
          ['0xffffffff', '0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff', '0xffffffff', '0xffffffff'],
        );

        const result = await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedCalls(
          allowedCalls,
        );
        expect(result).to.be.false;
      });
    });
  });

  describe('testing 2 x addresses encoded as LSP2 CompactBytesArray under `AllowedCalls`', () => {
    let canCallOnlyTwoAddresses: SignerWithAddress, canCallNoAllowedCalls: SignerWithAddress;

    let allowedEOA: SignerWithAddress, allowedTargetContract: TargetContract;

    let encodedAllowedCalls: string;

    before(async () => {
      context = await buildContext();

      canCallOnlyTwoAddresses = context.accounts[1];
      canCallNoAllowedCalls = context.accounts[2];
      allowedEOA = context.accounts[3];

      allowedTargetContract = await new TargetContract__factory(context.accounts[0]).deploy();

      // addresses need to be put in lower case for the encoding otherwise:
      //  - the encoding will return them checksummed
      //  - reading the AllowedCalls from storage will return them lowercase
      encodedAllowedCalls = combineAllowedCalls(
        [
          combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
          combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
        ],
        [allowedEOA.address.toLowerCase(), allowedTargetContract.address.toLowerCase()],
        ['0xffffffff', '0xffffffff'],
        ['0xffffffff', '0xffffffff'],
      );

      const permissionsKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canCallOnlyTwoAddresses.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          canCallOnlyTwoAddresses.address.substring(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS,
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
        encodedAllowedCalls,
      ];

      await setupKeyManagerHelper(context, permissionsKeys, permissionsValues);
    });

    describe('`getAllowedCallsFor(...)`', () => {
      it('should return the list of allowed calls', async () => {
        const bytesResult = await context.keyManagerInternalTester.getAllowedCallsFor(
          canCallOnlyTwoAddresses.address,
        );

        expect(bytesResult).to.equal(encodedAllowedCalls);
      });

      it('should return no bytes when no allowed calls were set', async () => {
        const bytesResult = await context.keyManagerInternalTester.getAllowedCallsFor(
          context.mainController.address,
        );
        expect(bytesResult).to.equal('0x');

        const resultFromAccount = await context.universalProfile['getData(bytes32)'](
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            context.mainController.address.substring(2),
        );
        expect(resultFromAccount).to.equal('0x');
      });
    });

    describe('`verifyAllowedCall(...)`', () => {
      describe('when the ERC725X payload (transfer 1 LYX) is for an address listed in the allowed calls', () => {
        it('should pass', async () => {
          const executeParams = {
            operationType: OPERATION_TYPES.CALL,
            to: allowedEOA.address,
            value: ethers.utils.parseEther('1'),
            data: '0x',
          };

          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              canCallOnlyTwoAddresses.address,
              executeParams.operationType,
              executeParams.to,
              executeParams.value,
              executeParams.data,
            ),
          ).to.not.be.reverted;
        });
      });

      describe('when the ERC725X payload (transfer 1 LYX)  is for an address not listed in the allowed calls', () => {
        it('should revert', async () => {
          const disallowedAddress = ethers.utils.getAddress(
            '0xdeadbeefdeadbeefdeaddeadbeefdeadbeefdead',
          );

          const executeParams = {
            operationType: OPERATION_TYPES.CALL,
            to: disallowedAddress,
            value: ethers.utils.parseEther('1'),
            data: '0x',
          };

          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              canCallOnlyTwoAddresses.address,
              executeParams.operationType,
              executeParams.to,
              executeParams.value,
              executeParams.data,
            ),
          )
            .to.be.revertedWithCustomError(context.keyManagerInternalTester, 'NotAllowedCall')
            .withArgs(canCallOnlyTwoAddresses.address, disallowedAddress, '0x00000000');
        });
      });

      describe('when there is nothing stored under `AllowedCalls` for a controller', () => {
        it('should revert', async () => {
          const randomAddress = ethers.Wallet.createRandom().address;

          const executeParams = {
            operationType: OPERATION_TYPES.CALL,
            to: randomAddress,
            value: ethers.utils.parseEther('1'),
            data: '0x',
          };

          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              canCallNoAllowedCalls.address,
              executeParams.operationType,
              executeParams.to,
              executeParams.value,
              executeParams.data,
            ),
          )
            .to.be.revertedWithCustomError(context.keyManagerInternalTester, 'NoCallsAllowed')
            .withArgs(canCallNoAllowedCalls.address);
        });
      });
    });
  });

  describe('`verifyAllowedCall(...)` with `vcsd` permissions per Allowed Call', () => {
    // for testing purpose, we use a random payload
    // we are not doing integration tests to tests the effects on the TargetContract
    // we are just testing that the `verifyAllowedCall(...)` function works as expected
    const randomPayload = '0xcafecafe';

    let targetContractValue: TargetContract,
      targetContractCall: TargetContract,
      targetContractStaticCall: TargetContract,
      targetContractDelegateCall: TargetContract;

    let allowedCalls: string;

    before('setup AllowedCalls', async () => {
      context = await buildContext();

      targetContractValue = await new TargetContract__factory(context.accounts[0]).deploy();

      targetContractCall = await new TargetContract__factory(context.accounts[0]).deploy();

      targetContractStaticCall = await new TargetContract__factory(context.accounts[0]).deploy();

      targetContractDelegateCall = await new TargetContract__factory(context.accounts[0]).deploy();

      allowedCalls = combineAllowedCalls(
        [CALLTYPE.VALUE, CALLTYPE.CALL, CALLTYPE.STATICCALL, CALLTYPE.DELEGATECALL],
        [
          targetContractValue.address,
          targetContractCall.address,
          targetContractStaticCall.address,
          targetContractDelegateCall.address,
        ],
        ['0xffffffff', '0xffffffff', '0xffffffff', '0xffffffff'],
        ['0xffffffff', '0xffffffff', '0xffffffff', '0xffffffff'],
      );

      // setup empty allowed calls
      await setupKeyManagerHelper(context, [], []);
    });

    describe('when controller has permission CALL + some AllowedCalls + does `ERC725X.execute(...)` with `operationType == CALL`', () => {
      let controller: SignerWithAddress;

      let permissionKeys: string[];
      let permissionValues: string[];

      before('setup permissions', async () => {
        controller = context.accounts[1];

        permissionKeys = [
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + controller.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + controller.address.substring(2),
        ];

        permissionValues = [combinePermissions(PERMISSIONS.CALL), allowedCalls];

        const setup = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
          permissionKeys,
          permissionValues,
        ]);

        await context.keyManagerInternalTester.connect(context.mainController).execute(setup);
      });

      after('reset permissions', async () => {
        await teardownKeyManagerHelper(context, permissionKeys);
      });

      it('should fail with `NotAllowedCall` error when the allowed address has `v` permission only (`v` = VALUE)', async () => {
        const executeParams = {
          operationType: OPERATION_TYPES.CALL,
          to: targetContractValue.address,
          value: 0,
          data: randomPayload,
        };

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            executeParams.operationType,
            executeParams.to,
            executeParams.value,
            executeParams.data,
          ),
        )
          .to.be.revertedWithCustomError(context.keyManagerInternalTester, 'NotAllowedCall')
          .withArgs(controller.address, targetContractValue.address, randomPayload);
      });

      it('should pass when the allowed address has `c` permission only (`c` = CALL)', async () => {
        const executeParams = {
          operationType: OPERATION_TYPES.CALL,
          to: targetContractCall.address,
          value: 0,
          data: randomPayload,
        };

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            executeParams.operationType,
            executeParams.to,
            executeParams.value,
            executeParams.data,
          ),
        ).to.not.be.reverted;
      });

      it('should fail with `NotAllowedCall` error when the allowed address has `s` permission only (`s` = STATICCALL)', async () => {
        const executeParams = {
          operationType: OPERATION_TYPES.CALL,
          to: targetContractStaticCall.address,
          value: 0,
          data: randomPayload,
        };

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            executeParams.operationType,
            executeParams.to,
            executeParams.value,
            executeParams.data,
          ),
        )
          .to.be.revertedWithCustomError(context.keyManagerInternalTester, 'NotAllowedCall')
          .withArgs(controller.address, targetContractStaticCall.address, randomPayload);
      });

      it('should fail with `NotAllowedCall` error when the allowed address has `d` permission only (`d` = DELEGATECALL)', async () => {
        const executeParams = {
          operationType: OPERATION_TYPES.CALL,
          to: targetContractDelegateCall.address,
          value: 0,
          data: randomPayload,
        };

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            executeParams.operationType,
            executeParams.to,
            executeParams.value,
            executeParams.data,
          ),
        )
          .to.be.revertedWithCustomError(context.keyManagerInternalTester, 'NotAllowedCall')
          .withArgs(controller.address, targetContractDelegateCall.address, randomPayload);
      });
    });

    describe('when controller has permission STATICCALL + some AllowedCalls + does `ERC725X.execute(...)` with `operationType == STATICCALL`', () => {
      let controller: SignerWithAddress;

      let permissionKeys: string[];
      let permissionValues: string[];

      before('setup permissions', async () => {
        controller = context.accounts[1];

        permissionKeys = [
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + controller.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + controller.address.substring(2),
        ];

        permissionValues = [combinePermissions(PERMISSIONS.STATICCALL), allowedCalls];

        const setup = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
          permissionKeys,
          permissionValues,
        ]);

        await context.keyManagerInternalTester.connect(context.mainController).execute(setup);
      });

      after('reset permissions', async () => {
        await teardownKeyManagerHelper(context, permissionKeys);
      });

      it('should fail with `NotAllowedCall` error when the allowed address has `v` permission only (`v` = VALUE)', async () => {
        const executeParams = {
          operationType: OPERATION_TYPES.STATICCALL,
          to: targetContractValue.address,
          value: 0,
          data: randomPayload,
        };

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            executeParams.operationType,
            executeParams.to,
            executeParams.value,
            executeParams.data,
          ),
        )
          .to.be.revertedWithCustomError(context.keyManagerInternalTester, 'NotAllowedCall')
          .withArgs(controller.address, targetContractValue.address, randomPayload);
      });

      it('should fail with `NotAllowedCall` error when the allowed address has `c` permission only (`c` = CALL)', async () => {
        const executeParams = {
          operationType: OPERATION_TYPES.STATICCALL,
          to: targetContractCall.address,
          value: 0,
          data: randomPayload,
        };

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            executeParams.operationType,
            executeParams.to,
            executeParams.value,
            executeParams.data,
          ),
        )
          .to.be.revertedWithCustomError(context.keyManagerInternalTester, 'NotAllowedCall')
          .withArgs(controller.address, targetContractCall.address, randomPayload);
      });

      it('should pass when the allowed address has `s` permission only (`s` = STATICCALL)', async () => {
        const executeParams = {
          operationType: OPERATION_TYPES.STATICCALL,
          to: targetContractStaticCall.address,
          value: 0,
          data: randomPayload,
        };

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            executeParams.operationType,
            executeParams.to,
            executeParams.value,
            executeParams.data,
          ),
        ).to.not.be.reverted;
      });

      it('should fail with `NotAllowedCall` error when the allowed address has `d` permission only (`d` = DELEGATECALL)', async () => {
        const executeParams = {
          operationType: OPERATION_TYPES.STATICCALL,
          to: targetContractDelegateCall.address,
          value: 0,
          data: randomPayload,
        };

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            executeParams.operationType,
            executeParams.to,
            executeParams.value,
            executeParams.data,
          ),
        )
          .to.be.revertedWithCustomError(context.keyManagerInternalTester, 'NotAllowedCall')
          .withArgs(controller.address, targetContractDelegateCall.address, randomPayload);
      });
    });

    describe('when controller has permission DELEGATECALL + some AllowedCalls + does `ERC725X.execute(...)` with `operationType == DELEGATECALL`', () => {
      let controller: SignerWithAddress;

      let permissionKeys: string[];
      let permissionValues: string[];

      before('setup permissions', async () => {
        controller = context.accounts[1];

        permissionKeys = [
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + controller.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + controller.address.substring(2),
        ];

        permissionValues = [combinePermissions(PERMISSIONS.DELEGATECALL), allowedCalls];

        const setup = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
          permissionKeys,
          permissionValues,
        ]);

        await context.keyManagerInternalTester.connect(context.mainController).execute(setup);
      });

      after('reset permissions', async () => {
        await teardownKeyManagerHelper(context, permissionKeys);
      });

      it('should fail with `NotAllowedCall` error when the allowed address has `v` permission only (`v` = VALUE)', async () => {
        const executeParams = {
          operationType: OPERATION_TYPES.DELEGATECALL,
          to: targetContractValue.address,
          value: 0,
          data: randomPayload,
        };

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            executeParams.operationType,
            executeParams.to,
            executeParams.value,
            executeParams.data,
          ),
        )
          .to.be.revertedWithCustomError(context.keyManagerInternalTester, 'NotAllowedCall')
          .withArgs(controller.address, targetContractValue.address, randomPayload);
      });

      it('should fail with `NotAllowedCall` error when the allowed address has `c` permission only (`c` = CALL)', async () => {
        const executeParams = {
          operationType: OPERATION_TYPES.DELEGATECALL,
          to: targetContractCall.address,
          value: 0,
          data: randomPayload,
        };

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            executeParams.operationType,
            executeParams.to,
            executeParams.value,
            executeParams.data,
          ),
        )
          .to.be.revertedWithCustomError(context.keyManagerInternalTester, 'NotAllowedCall')
          .withArgs(controller.address, targetContractCall.address, randomPayload);
      });

      it('should fail with `NotAllowedCall` error when the allowed address has `s` permission only (`s` = STATICCALL)', async () => {
        const executeParams = {
          operationType: OPERATION_TYPES.DELEGATECALL,
          to: targetContractStaticCall.address,
          value: 0,
          data: randomPayload,
        };

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            executeParams.operationType,
            executeParams.to,
            executeParams.value,
            executeParams.data,
          ),
        )
          .to.be.revertedWithCustomError(context.keyManagerInternalTester, 'NotAllowedCall')
          .withArgs(controller.address, targetContractStaticCall.address, randomPayload);
      });

      it('should pass when the allowed address has `d` permission only (`d` = DELEGATECALL)', async () => {
        const executeParams = {
          operationType: OPERATION_TYPES.DELEGATECALL,
          to: targetContractDelegateCall.address,
          value: 0,
          data: randomPayload, // random payload
        };

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            executeParams.operationType,
            executeParams.to,
            executeParams.value,
            executeParams.data,
          ),
        ).to.not.be.reverted;
      });
    });
  });

  describe("testing 'zero bytes' stored under AddressPermission:AllowedCalls:<address>", () => {
    const zeroBytesValues = [
      '0x' + '00'.repeat(1),
      '0x' + '00'.repeat(10),
      '0x' + '00'.repeat(20),
      '0x' + '00'.repeat(32),
      '0x' + '00'.repeat(40),
      '0x' + '00'.repeat(64),
      '0x' + '00'.repeat(100),
    ];

    let controllers: { description: string; account: SignerWithAddress }[];

    before(async () => {
      context = await buildContext();

      controllers = [
        { description: 'noBytes', account: context.accounts[1] },
        { description: 'oneZeroByte', account: context.accounts[2] },
        { description: 'tenZeroBytes', account: context.accounts[3] },
        { description: 'twentyZeroBytes', account: context.accounts[4] },
        { description: 'thirtyTwoZeroBytes', account: context.accounts[5] },
        { description: 'fourtyZeroBytes', account: context.accounts[6] },
        { description: 'sixtyFourZeroBytes', account: context.accounts[7] },
        { description: 'hundredZeroBytes', account: context.accounts[8] },
      ];

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ...Object.values(controllers).map(
          (controller) =>
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            controller.account.address.substring(2),
        ),
        ...Object.values(controllers).map(
          (controller) =>
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            controller.account.address.substring(2),
        ),
      ];

      let permissionValues = [ALL_PERMISSIONS];

      for (let ii = 0; ii < Object.values(controllers).length; ii++) {
        permissionValues.push(combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE));
      }

      // set the AllowedCalls to zero bytes for the first test to test for `NoCallsAllowed` error
      permissionValues.push('0x');

      permissionValues = permissionValues.concat(zeroBytesValues);

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    describe('`verifyAllowedCall(...)`', () => {
      const randomAddress = ethers.Wallet.createRandom().address.toLowerCase();
      const randomData = '0xaabbccdd';

      const executeParams = {
        operationType: OPERATION_TYPES.CALL,
        to: randomAddress,
        value: ethers.utils.parseEther('1'),
        data: randomData,
      };

      describe('should revert with `NoCallsAllowed` error', () => {
        it(`when AllowedCalls contain noBytes -> 0x`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controllers[0].account.address,
              executeParams.operationType,
              executeParams.to,
              executeParams.value,
              executeParams.data,
            ),
          ).to.be.revertedWithCustomError(context.keyManagerInternalTester, 'NoCallsAllowed');
        });
      });

      describe('should revert with `InvalidEncodedAllowedCalls` error', () => {
        zeroBytesValues.forEach((testCase, index) => {
          // count number of bytes (without the `0x` prefix)
          const numberOfZeroBytes = testCase.substring(2).length / 2;

          it(`when AllowedCalls contain ${numberOfZeroBytes} x 0x00 bytes -> ${testCase}`, async () => {
            await expect(
              context.keyManagerInternalTester.verifyAllowedCall(
                controllers[index + 1].account.address,
                executeParams.operationType,
                executeParams.to,
                executeParams.value,
                executeParams.data,
              ),
            )
              .to.be.revertedWithCustomError(
                context.keyManagerInternalTester,
                'InvalidEncodedAllowedCalls',
              )
              .withArgs(testCase);
          });
        });
      });
    });
  });

  describe('testing multiple of 34 x `0x00` bytes values set under the CompactBytesArray of `AddressPermissions:AllowedCalls:<address>`', () => {
    let context: LSP6InternalsTestContext;

    const allowedCallsValues = [
      '0x00200000000000000000000000000000000000000000000000000000000000000000',
      '0x0020000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
      '0x002000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
    ];

    const randomAddress = ethers.Wallet.createRandom().address.toLowerCase();
    const randomData = '0xaabbccdd';

    const executeParams = {
      operationType: OPERATION_TYPES.CALL,
      to: randomAddress,
      value: ethers.utils.parseEther('1'),
      data: randomData,
    };

    before(async () => {
      context = await buildContext();

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.accounts[1].address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.accounts[2].address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.accounts[3].address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          context.accounts[1].address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          context.accounts[2].address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          context.accounts[3].address.substring(2),
      ];

      let permissionValues = [
        ALL_PERMISSIONS,
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
      ];

      permissionValues = permissionValues.concat(allowedCallsValues);

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    describe('`verifyAllowedCall(...)`', () => {
      describe('should revert with NotAllowedCall(...) error for:', () => {
        allowedCallsValues.forEach((testCase, index) => {
          it(`multiple of 34 bytes -> ${testCase}`, async () => {
            await expect(
              context.keyManagerInternalTester.verifyAllowedCall(
                // `index + 1` because `accounts[0]` has all permissions
                context.accounts[index + 1].address,
                executeParams.operationType,
                executeParams.to,
                executeParams.value,
                executeParams.data,
              ),
            )
              .to.be.revertedWithCustomError(context.keyManagerInternalTester, 'NotAllowedCall')
              .withArgs(
                context.accounts[index + 1].address,
                ethers.utils.getAddress(randomAddress),
                randomData,
              );
          });
        });
      });
    });
  });

  describe('when caller as `0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff` in its allowed calls', () => {
    let anyAllowedCalls: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      anyAllowedCalls = context.accounts[1];

      const permissionsKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          anyAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          anyAllowedCalls.address.substring(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS,
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
        combineAllowedCalls(
          // We do not consider the first 4 bytes (32 bits) of the allowed calls as they are for the call types
          // The expected behaviour for this test below is to always revert regardless of the call type
          // if we have 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff as an Allowed Call
          ['0x00000000'],
          ['0xffffffffffffffffffffffffffffffffffffffff'],
          ['0xffffffff'],
          ['0xffffffff'],
        ),
      ];

      await setupKeyManagerHelper(context, permissionsKeys, permissionsValues);
    });

    it('should revert', async () => {
      const randomData = '0xaabbccdd';
      const randomAddress = ethers.Wallet.createRandom().address.toLowerCase();

      const executeParams = {
        operationType: OPERATION_TYPES.CALL,
        to: randomAddress,
        value: ethers.utils.parseEther('1'),
        data: randomData,
      };

      await expect(
        context.keyManagerInternalTester.verifyAllowedCall(
          anyAllowedCalls.address,
          executeParams.operationType,
          executeParams.to,
          executeParams.value,
          executeParams.data,
        ),
      )
        .to.be.revertedWithCustomError(context.keyManagerInternalTester, 'InvalidWhitelistedCall')
        .withArgs(anyAllowedCalls.address);
    });
  });
};
